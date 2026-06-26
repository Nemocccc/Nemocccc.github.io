---
title: "macOS 内置大模型与本地 AI 训练"
slug: macos-local-llm-training
date: 2026-06-10
tags: ["llm", "macos", "local-training"]
category: ai
description: "> 关键词：apfel、Apple Intelligence、FoundationModels、MLX、本地微调、蒸馏"
---

# macOS 内置大模型与本地 AI 训练

> 关键词：apfel、Apple Intelligence、FoundationModels、MLX、本地微调、蒸馏
> 最后更新：2026-06-10

---

## 一、macOS 内置大模型

从 macOS 26 Tahoe 开始，每台 Apple Silicon Mac **都自带一个 LLM**，约 **3B 参数**，4096 token 上下文，混合 2/4-bit 量化，运行在 Neural Engine 上。

### 基础信息

| 项目 | 值 |
|------|-----|
| 参数规模 | ~3B |
| 上下文窗口 | 4096 tokens |
| 精度 | 混合 2/4-bit 量化 |
| 运行位置 | Neural Engine + GPU |
| 语言 | en, de, es, fr, it, ja, ko, pt, zh |
| 底层框架 | FoundationModels.framework（Swift API） |
| 隐私 | 不上传云端，Apple 不用于训练 |

---

## 二、apfel——内置模型的 CLI/HTTP 包装

**apfel** 是 GitHub 上的开源项目（Arthur-Ficial/apfel），把 Apple 的 FoundationModels 框架包装成了 CLI 和 HTTP 服务器。

### 安装

```bash
brew install apfel
```

### CLI 用法

```bash
# 直接问
apfel "什么是注意力机制？"

# 管道
cat 财报.txt | apfel "总结这段"

# 交互式聊天
apfel --chat

# 带 system prompt
apfel --chat -s "你是一个金融分析师"
```

### HTTP 服务器（OpenAI 兼容）

```bash
apfel server --port 8080
```

启动后提供一个 OpenAI 兼容的 API：

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "apple-intelligence",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### 优点
- 零配置，不需要下载模型、不需要 API key
- 完全本地运行，不联网
- OpenAI 兼容接口，可直接替换代码中的 GPT-4
- 免费无限量使用

### 局限

| 局限 | 说明 |
|------|------|
| 模型不可选 | 只能用 Apple 内置的 ~3B 模型 |
| 不可微调 | apfel 只做推理包装，不支持 LoRA 微调 |
| 上下文小 | 4096 tokens，长文档需要分片 |
| 能力有限 | 3B 模型 + 强量化，能力远不如 GPT-4/Qwen3 |
| 只跑在 Mac 上 | 不能部署到服务器 |

---

## 三、能不能用来练习蒸馏和微调？

### 蒸馏——✅ 可以

apfel 的 HTTP API 可以当 **Teacher 模型**：

```
流程：
1. 用 apfel 的 API 批量生成问答数据
2. 用这些数据训练一个小模型（Student）——用 MLX 或 Unsloth
3. 对比 Student 和 Teacher 的输出差异

这就是蒸馏的标准做法。
```

**具体操作**：

```python
import requests

# 用内置模型生成训练数据
resp = requests.post("http://localhost:8080/v1/chat/completions", json={
    "model": "apple-intelligence",
    "messages": [{"role": "user", "content": "请解释什么是RAG？"}]
})
teacher_answer = resp.json()["choices"][0]["message"]["content"]

# 然后用 teacher_answer 作为训练数据，训练小模型
```

### 微调——❌ 不能直接微调内置模型

Apple 的内置模型本身 **不能** 通过 apfel 微调。但是：

| 方案 | 能做什么 | 难度 |
|------|---------|------|
| **MLX + mlx-tune** | 在 Mac 上用 MLX 框架微调开源模型（Qwen/LLaMA），利用 GPU/ANE | ★★★ |
| **Unsloth** | Mac MPS 后端，LoRA 微调 | ★★ |
| **pmetal** | Rust 写的 Metal 高性能微调框架 | ★★★★ |
| **LoRA-MPS-FineTuning** | GitHub 上专门针对 Apple Silicon 的微调项目 | ★★ |

**最佳实践**：

```bash
# 1. 用 MLX 微调 Qwen3-0.6B（你 Mac 跑得动）
pip install mlx-lm

# 2. 准备数据（JSONL 格式）
# {"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}

# 3. LoRA 微调
mlx_lm.lora --model Qwen/Qwen3-0.6B \
  --data ./train_data.jsonl \
  --lora-layers 8 \
  --batch-size 1 \
  --iters 200

# 4. 合并 + 推理
mlx_lm.fuse --model Qwen/Qwen3-0.6B --adapter-path ./adapters
```

### 蒸馏 + 微调完整练习方案

**这是你在 Mac 上就能完成的标准实验**：

```
Step 1: 用 apfel（Teacher）批量生成 500 条 QA 数据
         apfel server → 你的 Python 脚本调 API → 存 JSONL

Step 2: 用 MLX 微调一个开源小模型（Student）
         mlx_lm.lora --model Qwen3-0.6B --data ./data.jsonl

Step 3: 对比 Teacher vs Student
         同样的问题，分别问 apfel 和你的微调模型
         评估回答质量、推理速度、模型大小
```

---

## 四、Apple Silicon 本地训练工具对比

| 工具 | 支持训练？ | 支持推理？ | 语言 | 难度 |
|------|-----------|-----------|------|------|
| **apfel** | ❌ | ✅（内置模型） | Swift/CLI | ★ |
| **MLX** | ✅ | ✅ | Python | ★★★ |
| **mlx-tune** | ✅ | ✅ | Python/CLI | ★★ |
| **Unsloth** | ✅（MPS） | ✅ | Python | ★★ |
| **pmetal** | ✅ | ✅ | Rust | ★★★★ |
| **llama.cpp** | ❌ | ✅（Metal） | C++/CLI | ★★ |
| **Ollama** | ❌ | ✅ | CLI | ★ |
| **LM Studio** | ❌ | ✅ | GUI | ★ |

### 推荐学习路径

```
入门：Ollama + apfel（只推理，不训练）
  ↓
进阶：MLX + mlx-tune（在 Mac 上微调小模型）
  ↓
高阶：apfel server 当 Teacher → MLX 训练 Student（完整蒸馏实验）
  ↓
实战：用蒸馏后的模型替换你 RAG 系统中的 LLM，对比效果
```
