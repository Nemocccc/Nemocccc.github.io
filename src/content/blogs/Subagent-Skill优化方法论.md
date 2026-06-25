---
title: "Subagent 化 Skill 优化方法论"
date: 2026-06-24
tags: ["ai-agents", "llm"]
category: ai
description: "当 Skill 的步骤链变长时，单 Agent 架构会遇到一个根本性问题：上下文污染（context pollution）。"
---

# Subagent 化 Skill 优化方法论

## 为什么要用 Subagent 优化 Skill

当 Skill 的步骤链变长时，单 Agent 架构会遇到一个根本性问题：**上下文污染（context pollution）**。

每一步的 tool output、中间推理、临时文件内容都会积累到同一个上下文窗口。当模型需要做最后一步推理时，它要穿过前面 N 步产生的噪音。

```
单 Agent 的问题：
┌─────────────────────────────────────────────┐
│ Step 1: 读取文件 → +5000 token               │
│ Step 2: 分析结构 → +2000 token               │
│ Step 3: 运行测试 → +3000 token               │
│ Step 4: 生成报告 → 要在 10000+ token 噪音    │
│               中推理，性能急剧下降            │
└─────────────────────────────────────────────┘
```

在小模型上（如 Qwen-35b-AWQ-int4、内网部署的量化模型），有效上下文窗口更小，问题更严重，模型直接崩坏或丢弃细节。

**Subagent 的核心解决思路**：把信息利用率低（产生大量数据但后续只需要摘要）的步骤隔离到独立的上下文窗口中执行，主线只拿压缩后的摘要继续。每个 subagent 的上下文在完成时回收。

## 第一步：诊断 —— 上下文账单

画出 Skill 的完整流程，逐步骤填写上下文账单。这是整个优化工作的起点。

### 上下文账单模板

| # | 步骤名 | 操作 | 产生数据量 | 后续真正需要 | 信息利用率 |
|---|--------|------|-----------|-------------|-----------|
| 1 | 步骤 A | read_file / LLM / tool | ~N token | 用了哪些字段 | % |

**信息利用率** = 该步骤产生的信息中，后续步骤实际需要引用的比例。

- **> 80%** → 保留在主线（如：用户的原始输入、核心推理决策）
- **40-80%** → 可拆分也可不拆，取决于数据绝对量
- **< 40%** → **必须拆分为 subagent**

### 案例：reportDoc

reportDoc 的功能：接受 markdown（内容）+ docx 模板（样式），输出符合模板样式的 docx 文档。模板可以是文件，也可以是描述性文本。

| # | 步骤 | 操作 | 产生量 | 后续需要 | 利用率 | 决策 |
|---|------|------|--------|---------|-------|------|
| 1 | 读 markdown | read_file | 全文 | 全文 | ~100% | 主线 |
| 2 | 解析 docx 模板 | python-docx | ~5000+ token | 只需样式定义(名称/字体/字号/对齐)、表格结构、页眉页脚、占位符、说明行 | ~15% | **Subagent** |
| 3 | 理解描述性模板 | LLM 解析 | ~500 token | 整段指令 | ~100% | 主线 |
| 4 | markdown→docx 转换 | LLM 生成 + python-docx | ~2000+ token | 需要完整输出 | ~100% | 主线 |
| 5 | 验证输出 docx | 检查样式/表格/页眉 | ~2000+ token | 只需 pass/fail + 缺失列表 | ~10% | **Subagent** |

**结论**：步骤 2（模板解析）和步骤 5（结果验证）是优先改造目标。

## 第二步：拆解 —— 确定 Subagent 边界

### 核心原则

**按上下文边界拆分，不按流程角色拆分。**

错误示范（电话游戏）：
```
Planner Agent → Implementer Agent → Tester Agent
每次手都丢失信息，协调成本高，产出失真
```

正确做法：如果你读一个文件产生 5000 token 但后续只需要 200 token 的摘要，就这个读操作本身做成 subagent。

### 决策树

```
某一步数据量 > 1000 token 且利用率 < 40%？
  ├── 是 → 拆成 subagent
  │     ├── 只依赖主线已有信息 → 可并行
  │     └── 依赖另一个 subagent → 串行 chain
  │
  └── 否 → 保留在主线
```

### 常用模式

```
扇出-扇入（并行探索）：
  Orchestrator → SubAgent A (并行) → 聚合
               → SubAgent B (并行) → 聚合
               → SubAgent C (并行) → 聚合

流水线（生成→验证→修正）：
  SubAgent: 生成 → [Revision Gate] → SubAgent: 修正 → ...

上下文隔离（单一数据密集步骤）：
  主线只拿摘要，subagent 读原始数据
```

### 案例：reportDoc 的拆分结构

```
主线 (Orchestrator) — 持有 markdown 全文 + 模版摘要(~150t) + 生成说明
  │
  ├── (并行) SubAgent: docx 模板解析器
  │   输入: 模版文件路径
  │   输出: 结构化样式摘要
  │   压缩比: ~5000t → ~150t
  │
  ├── (串行) 主线: 理解模版结构 + 识别说明行
  │
  ├── (串行) 主线: 生成 python-docx 转换代码并执行
  │
  └── (串行) SubAgent: 结果验证器（Revision Gate 循环）
       输入: 生成 docx 路径 + 预期检查项
       输出: {pass, missing_items}
```

## 第三步：契约 —— Subagent 的输入输出协议

每个 subagent 必须有明确的**结构化输入/输出契约**。输出必须是确定的 JSON 结构，主线直接拿来用，不需要额外推理。

### 契约设计原则

1. **输出必须有固定的 JSON schema** — 不写"返回摘要摘要"，写"返回 `{styles: [{name, font, size, bold}]}`"
2. **主线不依赖 subagent 的中间推理** — 只依赖输出结构
3. **单个 subagent 输出去重后 ≤ 300 token** — 超过说明压缩不够
4. **在派发时给出输出格式示例** — subagent 执行时可直接参考

### 案例：reportDoc 的契约设计

#### SubAgent: docx-template-parser

```python
# 在 Skill 中用 delegate_task 调用
delegate_task(
    goal="解析 docx 模板，抽取样式、表格结构、页眉页脚、占位符、说明行",
    context=f"""
    模板文件路径: {template_path}
    模式: file

    输出必须严格按照以下 JSON 结构返回:
    {{
        "styles": [
            {{"name": str, "font": str, "size": int, "bold": bool, "color": str, "alignment": str}}
        ],
        "sections": [
            {{"type": "header"|"footer", "content": str}}
        ],
        "tables": [
            {{"rows": int, "cols": int, "header_style": str, "body_style": str}}
        ],
        "placeholders": [str],
        "instruction_lines": [int],
        "mode": "file"
    }}

    使用 python-docx 读取模板文件，用 lxml 解析样式。
    只返回 JSON，不要额外解释。
    """,
    toolsets=['terminal', 'file']
)
```

#### SubAgent: docx-validator

```python
delegate_task(
    goal="验证生成的 docx 是否符合模板要求",
    context=f"""
    生成的文件路径: {output_path}
    预期检查项:
    - 页眉内容是否正确应用
    - 页脚内容是否正确应用
    - 表格样式是否正确
    - 说明行是否已删除
    - 段落样式是否正确匹配

    输出格式:
    {{
        "pass": true|false,
        "missing": [str],
        "details": {{"header": "ok"|"missing", "footer": "ok"|"missing", ...}}
    }}
    """,
    toolsets=['terminal', 'file']
)
```

## 第四步：门禁 —— 嵌入 Gate 质量控制

在每个关键切换点插入 Gate 检查。共四种类型（源自 Gates Taxonomy）：

| 类型 | 作用 | 失败时行为 |
|------|------|-----------|
| **Pre-flight** | 执行前检查前置条件 | 报错终止 |
| **Revision** | 验证产出质量，最多 3 轮 | 循环修正或升级 |
| **Escalation** | 超出能力范围，需要人决策 | 暂停等待用户 |
| **Abort** | 紧急终止保护现场 | 保存当前产出，终止 |

### Revision Gate 循环规则

```
轮次 1: 验证 → 发现问题 → 修正
轮次 2: 验证 → 问题减少？ → 是→继续；否（未减少）→ 提前升级
轮次 3: 验证 → 全部通过？ → 是→完成；否→升级给用户
```

核心优化：对比轮次 N-1 的问题数，如果没有减少则判定为停滞，直接 Escalation，不做无意义的反复重试。

### 案例：reportDoc 的门禁

```
┌─ Pre-flight Gate ──────────────────────────
│ 模版文件存在且可读？ → 否 → 报错
│ markdown 非空？       → 否 → 报错
│ python-docx 可用？     → 否 → 报错
│
├─ SubAgent: 模板解析
│
├─ 主线: 生成转换代码 + 执行
│
├─ Revision Gate ────────────────────────────
│ SubAgent: 验证器检查输出
│   通过 → ✅ 交付
│   不通过 → 第 2 轮修正（最多 3 次）
│     连续两次问题数不减少 → 提前升级
│
├─ Escalation Gate ──────────────────────────
│ "3 轮修正后问题未解决，请人工介入"
│
└─ 完成
```

## 第五步：监控 —— 上下文预算管理

对量化小模型最重要的是主动监控上下文使用率，在崩溃前降级。

### 四级预算阈值（按模型窗口调整）

建议 Qwen-35b-AWQ-int4 这类模型使用更严格的标准（假设有效窗口 ~8K-16K）：

| 等级 | 使用率 | 行为 |
|------|--------|------|
| PEAK | 0-20% | 正常操作 |
| GOOD | 20-30% | 优先读摘要，开始预判式派发 |
| DEGRADING | 30-50% | 只读摘要，禁止新工具调用，完成当前即止 |
| POOR | >50% | 紧急 checkpoint，保存中间文件，终止 |

### 估算方法

每完成一步后，用 `字符数 / 4` 粗略估算 token 数（中文更密，可改为字符数 / 2）。如果连续两步都处于 DEGRADING 以上，将后续所有未执行的步骤强制 subagent 化。

### 实现思路

在主流程中增加一个工具函数：

```python
def check_context_budget(step_name: str) -> str:
    """
    返回当前等级: "PEAK" | "GOOD" | "DEGRADING" | "POOR"
    如果返回 POOR，调用方应立即 checkpoint 并终止。
    """
    # 用当前对话的总 token 数（从前几步累计估算）除以模型的有效窗口
    pass
```

## 改造后的 Skill 文件组织

```
skill-name/
├── SKILL.md              # 顶层流程（Orchestrator 视角，只写调度逻辑）
├── scripts/
│   ├── parse_template.py  # SubAgent: 模板解析的独立脚本
│   └── validate_output.py # SubAgent: 结果验证的独立脚本
└── references/
    └── subagent-contracts.md  # 所有 subagent 的契约文档
```

SKILL.md 顶层只写：

```
1. [Pre-flight] 检查前置条件
2. 派发 SubAgent: 模板解析器，等待摘要
3. 主线: 理解模版结构 + 识别说明行
4. 主线: 生成 python-docx 转换代码
5. [Revision Gate] 派发 SubAgent: 验证器
   └── 最多 3 轮
6. 交付
```

## 避坑

| 陷阱 | 说明 |
|------|------|
| **过度拆分** | 短步骤（< 3 步、数据量小）拆 subagent 只会增加 token 开销和延迟。Anthropic 实测 subagent 架构比单 agent 多 3-10x token。 |
| **按角色拆** | Planner→Implementer→Tester 每次手丢失信息。应按上下文边界（信息能否压缩为摘要）拆。 |
| **摘要幻觉** | Subagent 可能返回"已完成"但实际上什么也没做。验证方法：在契约中要求返回具体证据（文件名、具体值、行号）。 |
| **契约不稳定** | 输出格式频繁改动 → 主线的解析逻辑要同步改。先定好 schema 再编码。 |
| **忽略验证** | 没有 Revision Gate 的话，subagent 的错误会直接进入最终产出。每个 subagent 的输出必须有验证环节。 |

## 速查卡

```
执行以下步骤改造任意 Skill：

□ 1. 画上下文账单
   标注每一步的数据量和信息利用率
   标记利用率 < 40% 的候选步骤

□ 2. 确定拆分边界
   决策树判断：可隔离？可并行？可串行？
   画拆分结构图

□ 3. 设计契约
   每个 subagent 写 JSON 输入输出 schema
   schema 定好后再编码

□ 4. 嵌入 Gate
   Pre-flight → Revision (≤3轮) → Escalation

□ 5. 设定预算
   按模型实际窗口设定四档阈值
   超出时自动 subagent 化或 checkpoint
```
