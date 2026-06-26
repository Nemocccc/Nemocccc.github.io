---
title: "ModelScope 权重分片 → 内网 vLLM 部署完整流程"
slug: modelscope-vllm-deploy
date: 2026-06-15
tags: ["llm", "deployment", "modelscope"]
category: ai
description: "从 ModelScope 下载的权重分片，到最后能在内网用 vLLM 提供服务，中间需要经过的环节："
---

# ModelScope 权重分片 → 内网 vLLM 部署完整流程

## 一、核心链路

从 ModelScope 下载的权重分片，到最后能在内网用 vLLM 提供服务，中间需要经过的环节：

```
阶段一：有网环境（开发/构建机）
───────────────────────────────────────────
 ① 下载模型分片（ModelScope）
         ↓
 ② 量化模型（AWQ）—— 可选，但建议做
         ↓
 ③ 准备 vLLM Docker 镜像
         ↓
 ④ 打包导出（镜像 + 模型文件）
         ↓
  ┌──────────────────┐
  │ 物理搬运到内网    │  ← 刻盘 / scp / 硬盘拷贝
  └──────────────────┘

阶段二：内网环境（生产服务器）
───────────────────────────────────────────
 ⑤ Docker 导入镜像
         ↓
 ⑥ 挂载模型文件 + 启动容器
         ↓
 ⑦ API 服务可用
```

---

## 二、阶段一：有网环境——把所有东西准备好

### ① 下载模型分片

用 ModelScope 的 Python SDK：

```bash
pip install modelscope

python3 -c "
from modelscope import snapshot_download
# 这会下载到当前目录下的 Qwen2.5-72B/ 文件夹
snapshot_download('Qwen/Qwen2.5-72B-Instruct', local_dir='./Qwen2.5-72B')
"
```

下载后的目录结构：

```
Qwen2.5-72B/
├── config.json                 ← 模型配置
├── tokenizer.json              ← 分词器
├── model-00001-of-00060.safetensors
├── model-00002-of-00060.safetensors
├── ...                    ← 60 个分片文件
├── model-00060-of-00060.safetensors
└── model.safetensors.index.json  ← 索引：记录每个张量在哪个分片里
```

这就是你从 ModelScope 拿到的东西——**多个权重分片 + 索引文件**。vLLM 可以直接读这种目录。

### ② 量化模型（AWQ）

**为什么要量化？**

70B 模型用 FP16（原始精度）需要约 140GB 显存——至少 2 张 A100（80GB）才能跑。量化到 INT4 后只需要约 40GB，**一张卡就够了**，推理速度还更快。

```
量化原理（一句话）：
  每个权重本来用 16-bit 浮点数存（-65504 ~ 65504 范围）
  量化后只用 4-bit 整数存（0 ~ 15 范围）
  用一个 scale 系数来映射：float_val = int_val × scale
  体积从 2 字节/参数 → 0.5 字节/参数，缩到 1/4
```

**实际操作**（用 AutoAWQ）：

```bash
# 安装
pip install autoawq

# 量化
python3 << 'EOF'
from awq import AutoAWQForCausalLM
from transformers import AutoTokenizer

model_dir = './Qwen2.5-72B'
output_dir = './Qwen2.5-72B-AWQ'

model = AutoAWQForCausalLM.from_pretrained(
    model_dir, device_map='auto'
)
tokenizer = AutoTokenizer.from_pretrained(model_dir)

quant_config = {
    'zero_point': True,
    'q_group_size': 128,
    'w_bit': 4,         # 4-bit 量化
    'version': 'GEMM'
}

model.quantize(tokenizer, quant_config=quant_config)
model.save_quantized(output_dir)
tokenizer.save_pretrained(output_dir)
EOF
```

量化后的目录结构和原来一样——仍然是多个 `.safetensors` 分片文件 + `index.json`。区别是每个分片文件的大小只有原来的约 1/4。**vLLM 加载时加上 `--quantization awq` 参数即可。**

**什么时候可以跳过量化？**
- 你的 GPU 显存总和 > 模型大小 × 2（比如 70B 模型用 4 × A100 80GB，总显存 320GB >> 140GB）
- 或只是做小模型（7B/14B 以下）

### ③ 准备 vLLM Docker 镜像

内网没有外网，所以需要先在能联网的机器上把 vLLM 的 Docker 镜像拉下来，打包带走。

```bash
# 拉取官方镜像（带 OpenAI 兼容 API）
docker pull vllm/vllm-openai:latest

# 查看确认
docker images | grep vllm

# 导出为 tar 包
docker save vllm/vllm-openai:latest -o vllm-openai.tar
```

镜像大约 10-20GB（包含 CUDA、PyTorch、vLLM 等完整环境）。

**进阶：如果想把模型也打到镜像里**（相当于一个包含了环境和模型的完整部署包）：

```dockerfile
# Dockerfile
FROM vllm/vllm-openai:latest

# 把量化后的模型整个目录复制进去
COPY ./Qwen2.5-72B-AWQ /models/Qwen2.5-72B

# 默认启动命令（运行时可以覆盖）
CMD ["--model", "/models/Qwen2.5-72B", "--port", "8000"]
```

```bash
docker build -t vllm-full-package .
docker save vllm-full-package -o vllm-full-package.tar
```

**注意**：模型打包进镜像后 tar 文件会很大（40-150GB），传起来慢。更常见的做法是**模型单独传**，Docker run 时用 `-v` 挂载进去。

### ④ 打包传输

需要传到内网的材料：

| 材料 | 大小（70B 模型为例） | 说明 |
|------|-------------------|------|
| `vllm-openai.tar` | ~15GB | Docker 镜像 |
| `Qwen2.5-72B-AWQ/` 目录 | ~40GB | 量化后模型分片 |
| 启动脚本 | 几 KB | 参数写好在文件里，免得出错 |

**传输方式**：
- 内网 scp / rsync（如果内网有入口机）
- 硬盘/U 盘物理拷贝（物理隔离场景）
- 刻录光盘（极端场景）

---

## 三、阶段二：内网环境——部署启动

### ⑤ 导入 Docker 镜像

```bash
# 确认服务器有 NVIDIA 驱动 + Docker
nvidia-smi
docker info

# 导入 vLLM 镜像
docker load < vllm-openai.tar

# 确认
docker images
# 应该看到 vllm/vllm-openai
```

### ⑥ 启动 vLLM 容器

```bash
docker run -d \
  --gpus all \
  --network host \
  --shm-size 32g \
  -v /data/models/Qwen2.5-72B-AWQ:/model \
  --name vllm-service \
  vllm/vllm-openai:latest \
  --model /model \
  --served-model-name my-qwen \
  --tensor-parallel-size 4 \
  --quantization awq \
  --dtype auto \
  --max-model-len 8192 \
  --gpu-memory-utilization 0.9 \
  --port 8000 \
  --trust-remote-code
```

**参数详解（内网部署必调）：**

| 参数 | 含义 | 你在内网怎么设 |
|------|------|---------------|
| `--tensor-parallel-size` | 用几张 GPU 并行处理一层 | = 这台机器上的 GPU 数量 |
| `--quantization awq` | 告诉 vLLM 加载的是 AWQ 量化权重 | 如果你量化了就加，没量化不加 |
| `--gpu-memory-utilization` | 显存用到多少百分比 | 0.9 留 10% 给其他开销 |
| `--max-model-len` | 最大上下文长度 | 根据你的显存量调，越长越吃显存 |
| `--shm-size` | 容器共享内存 | 大模型推荐 32GB 以上 |

### ⑦ 验证

```bash
# 查看启动日志
docker logs -f vllm-service
# 看到 "Uvicorn running on http://0.0.0.0:8000" 表示 OK

# 测试 API
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "my-qwen",
    "messages": [{"role": "user", "content": "你好"}],
    "max_tokens": 100
  }'

# 应该返回带 choices 的 JSON
```

---

## 四、如果一台机器放不下——多机分布式

当单机显存总量不够跑完整模型时，用多台服务器拼起来。

```
服务器 A (head)       服务器 B (worker)      服务器 C (worker)
   ├── GPU 0-3           ├── GPU 0-3           ├── GPU 0-3
   │                     │                     │
   └─────────── 内网互联（NCCL/RoCE）───────────┘
                        │
                    vLLM 把模型层切到所有 GPU 上
```

每台机器都需要：vLLM 镜像 + 模型文件。

```bash
# 所有机器启动 Ray 集群通信
# head 节点（假设 IP 192.168.1.1）：
docker run --gpus all --network host --shm-size 32g \
  -v /data/models/Qwen2.5-72B:/model \
  vllm/vllm-openai:latest \
  ray start --head --port=6379

# 其他 worker 节点：
docker run --gpus all --network host --shm-size 32g \
  -v /data/models/Qwen2.5-72B:/model \
  vllm/vllm-openai:latest \
  ray start --address=192.168.1.1:6379

# 进入 head 容器，启动 vLLM：
docker exec -it <head容器ID> /bin/bash
vllm serve /model \
  --tensor-parallel-size 4 \      # 每台机器 4 张卡
  --pipeline-parallel-size 3 \    # 3 台机器流水线并行
  --dtype auto
```

---

## 五、各步骤的时间预估

| 步骤 | 耗时 | 说明 |
|------|------|------|
| 下载模型（70B） | 30-60 分钟 | 取决于带宽，ModelScope 国内较快 |
| AWQ 量化（70B） | 1-3 小时 | 需要 GPU，最耗时的步骤 |
| docker pull vLLM | 5-10 分钟 | 镜像 ~10GB |
| docker save + 传输 | 20-60 分钟 | 取决于传输方式 |
| docker load | 5-10 分钟 | |
| 首次启动 vLLM | 2-10 分钟 | 需要编译 CUDA kernel 缓存 |

---

## 六、常见问题

**Q：内网机器没有网络，pip install 怎么办？**
A：不需要 pip。用 Docker 镜像，所有依赖都在镜像里。你只需要 `docker load < tar`。

**Q：模型文件一定要量化吗？**
A：不一定。看你的 GPU 总显存够不够。70B 模型 FP16 需要 ~140GB，INT4 需要 ~40GB。显存够就不用量化。

**Q：量化会损失多少质量？**
A：AWQ 4-bit 量化在 MMLU 等基准测试上通常损失 < 1-2%，对于大多数对话/生成场景几乎不可感知。

**Q：多个分片文件怎么给 vLLM？**
A：直接把分片文件所在目录路径传给 `--model` 参数，vLLM 会自动读 `index.json` 找到所有分片。不需要任何额外操作。

**Q：为什么 shm-size 设 32GB？**
A：vLLM 的多进程通信（tokenizer、调度器、GPU worker 之间）需要共享内存。不够会报 `bus error`。
