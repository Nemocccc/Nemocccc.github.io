---
title: "vLLM Prefix Caching (`--enable-prefix-caching`) 原理与 LMCache 调研报告"
date: 2026-06-16
tags: ["llm", "deployment", "vllm"]
category: ai
description: "把整个 prompt（system prompt + user query）一次性并行算完，生成每个 token 位置对应的 K 矩阵 和 V 矩阵。计算量 = prompt token 数 × 模型参数量。prompt 越..."
---

# vLLM Prefix Caching (`--enable-prefix-caching`) 原理与 LMCache 调研报告

## 一、基础：Transformer 推理的两个阶段

每个 token 生成分为两步：

### Prefill（预填充）
把整个 prompt（system prompt + user query）一次性并行算完，生成每个 token 位置对应的 **K 矩阵** 和 **V 矩阵**。计算量 = prompt token 数 × 模型参数量。prompt 越长，prefill 越慢。

### Decode（逐 token 生成）
每生成一个新 token，只算这一个 token 的 Q，然后跟所有之前位置的 K、V 做 attention。

## 二、KV Cache 是什么

Decode 阶段如果每次都要重新计算所有历史位置的 K、V，复杂度会从 O(n) 退化成 O(n²)，根本跑不动。

**KV Cache** 的思路就是存下来复用：

```
首次推理:
  Prefill: 计算 token_1~5 的 K1~5, V1~5 → 缓存
  第1次 Decode: 算 token_6 的 K6,V6 → 跟缓存的 K1~5,V1~5 做 attention → 产出 token_6
  第2次 Decode: 算 token_7 的 K7,V7 → 跟缓存的 K1~6,V1~6 做 attention → 产出 token_7
```

**KV Cache 的量级**：
- 单 token 的 KV cache 大小 = 2（K+V）× layer_num × hidden_dim × precision_bytes
  - Qwen2.5-72B（80层, 8192 hidden, FP16）≈ 2 × 80 × 8192 × 2 = ~2.6 MB / token
  - 32K 上下文 ≈ 32K × 2.6 MB ≈ 83 GB —— 一块 A100 都不够
- 所以才有 PagedAttention（vLLM 的核心创新）—— 像操作系统分页一样管理 KV cache

## 三、vLLM Prefix Caching（APC, Automatic Prefix Caching）

### 3.1 解决了什么问题

KV Cache 是同一个请求内优化它的复用。但多个请求之间，如果 prompt 开头部分相同（称为 prefix），那 prefix 部分的 KV 是一样的——不需要每个请求都重新计算。

### 3.2 工作原理

vLLM 对每个 KV block 按内容计算 hash，把 hash 存入全局缓存表：

```
请求1: [金融系统prompt(800 token)][user_query_1(200 token)]
请求2: [金融系统prompt(800 token)][user_query_2(200 token)]
                    ↑
         公共前缀 —— KV 完全一样，hash 命中后直接复用
```

具体流程：

1. **Block 划分**：vLLM 将 KV cache 按固定大小（默认 16 token/block）分块
2. **Hash 计算**：每个 block 的 KV 数据内容做 hash（基于 block 内所有 token 的 K、V 值）
3. **全局缓存表**：hash → KV block 的映射，存储在 GPU 内存或 CPU 内存
4. **新请求到达**：
   - 前 16 个 token 的 block → 查 hash → 命中 → 从缓存取 KV block
   - 第 17-32 token 的 block → 查 hash → 命中 → 从缓存取 KV block
   - ...直到第一个 prefix 结束的 block（hash miss）
   - 从 miss 位置开始正常 prefill
5. **缓存淘汰**：LRU 策略，当 GPU 内存不够时淘汰最久未使用的 KV block

### 3.3 效果

| 配置 | Prefill 算力需求 | TTFT |
|------|-----------------|------|
| 不开 | 1000 token × 72B | ~3-8s |
| 开（800 token 共享） | 200 token × 72B | ~0.5-2s |
| **节省** | **80% prefill** | **~1-3s** |

### 3.4 什么时候效果好

- **System prompt 很长且跨请求大量重复**：如多 Agent 系统（5个agent共享prompt），或 Chatbot 系统 prompt
- **多轮对话**：第一轮生成的 KV cache 在第二轮可以被 prefix 复用
- **模型越大效果越明显**：prefill 计算量 = token × 参数量，72B 的 1 token ≈ 4B 的 18 个 token

### 3.5 什么时候效果差/无效

- 每个请求 prompt 完全不同，无公共前缀
- 公共前缀极短（几个 token，vLLM block size 通常是 16）
- 小模型（4B/7B），prefill 本身就是几十毫秒量级，省了也感受不到

## 四、启用方式

```bash
# vLLM 启动时加一个参数即可
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-72B-Instruct-AWQ \
  --enable-prefix-caching            # ← 就这一行
```

应用层代码一行不用改。vLLM 自动做 block-level hash 匹配。

## 五、vLLM Prefix Caching vs LMCache 对比

### 5.1 LMCache 简介

LMCache（GitHub 9.1k stars, Apache 2.0, UChicago）是一个独立的 KV cache 管理层，作为 daemon 运行。它把 KV cache 从"临时中间产物"变成了持久化、跨请求可复用的资源。

### 5.2 核心能力

| 能力 | vLLM Prefix Caching | LMCache |
|------|-------------------|---------|
| **复用位置** | 仅前缀 prefix | 任意位置（CacheBlend 技术） |
| **存储层次** | GPU 显存 | GPU → CPU → SSD → Redis/S3 |
| **持久性** | 请求结束即丢 | 持久化，daemon 重启不丢 |
| **跨引擎** | 仅 vLLM 进程内 | vLLM / SGLang 之间共享 |
| **PD分离** | 不支持 | 支持 prefill→decode 跨节点 KV 传输 |
| **应用层改动** | 一行参数 | 装 daemon + 配存储后端 |
| **观测能力** | 有限（vLLM metrics） | Prometheus + 命中率/生命周期追踪 |

### 5.3 LMCache 的独特优势：CacheBlend（非前缀复用）

vLLM 的 prefix caching 只能复用 prompt 开头的公共前缀。但实际场景中，相同的内容块可能出现在 prompt 的不同位置：

```
请求1: [sys_prompt][chunk_A][chunk_B][question]
请求2: [sys_prompt][chunk_C][chunk_A][question]
                                  ↑
                   chunk_A 位置不同，vLLP prefix caching 必 miss
                   LMCache CacheBlend 可以复用，只重算少量 token
```

这对 **RAG 场景** 尤其关键——不同用户问不同问题，但 retrieved chunks 大量重叠。

### 5.4 选择建议

| 场景 | 推荐方案 |
|------|---------|
| 共享 system prompt 的多 Agent 系统 | vLLM prefix caching ✅ 够用 |
| 多轮长对话（跨轮复用） | LMCache（CPU offload + 持久化） |
| RAG 场景，chunk 在不同 prompt 位置出现 | LMCache CacheBlend |
| 单机单卡，简单场景 | vLLM prefix caching（零运维） |
| 多节点 / PD 分离部署 | LMCache |

### 5.5 显存优化补充

**显存不够时的解决方案**（按推荐顺序）：

1. **`--gpu-memory-utilization 0.9`**：控制 vLLM 占用多少显存
2. **`--swap-space 64`**：vLLM 内置的 CPU swap，KV cache 不够时自动换出到 CPU 内存
3. **`--max-num-seqs`**：限制并发请求数
4. **LMCache**：更复杂的 tiered offload，但提供持久化和跨实例能力

## 六、总结

- KV Cache 是 Transformer decode 阶段的必然产物，解决"不重复计算历史 token"的问题
- **vLLM Prefix Caching** 跨请求复用公共前缀的 KV cache，一行参数开启，省 30-80% prefill
- **LMCache** 是更通用的 KV cache 管理层，解决非前缀复用、持久化和跨实例共享，但运维成本高
- 选择建议：先开 `--enable-prefix-caching`，等到真正遇到"显存不够"或"多轮对话 TTFT 太长"的痛点时再考虑 LMCache

## 参考

- vLLM Automatic Prefix Caching 文档：https://docs.vllm.ai/en/stable/design/prefix_caching.html
- LMCache GitHub：https://github.com/LMCache/LMCache
- LMCache 论文：Yihua Cheng et al. "LMCache: An Efficient KV Cache Layer for Enterprise-Scale LLM Inference", arXiv:2510.09665
- CacheBlend 论文：Jiayi Yao et al. "CacheBlend: Fast Large Language Model Serving for RAG with Cached Knowledge Fusion", EuroSys 2025
