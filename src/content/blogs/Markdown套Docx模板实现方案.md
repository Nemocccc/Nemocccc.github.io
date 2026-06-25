---
title: "将 Markdown 套入 DOCX 模板的实现方案调研"
date: 2026-06-10
tags: ["tools", "productivity"]
category: tech
description: "> 背景：报告生成引擎项目需要将 Markdown 内容渲染为 DOCX，要求模板是**唯一样式权威**（template washes all styles），内容中的格式标记（粗体/斜体/代码）通过 StyleMapping 表映射为模..."
---

# 将 Markdown 套入 DOCX 模板的实现方案调研

> 背景：报告生成引擎项目需要将 Markdown 内容渲染为 DOCX，要求模板是**唯一样式权威**（template washes all styles），内容中的格式标记（粗体/斜体/代码）通过 StyleMapping 表映射为模板字符样式，而非直接设置 Run 属性。

---

## 一、现有生态盘点

### 1.1 Pandoc + reference-doc — 最成熟的现有方案

```
pandoc input.md -o output.docx --reference-doc=template.docx
```

**原理**：pandoc 从 `reference.docx` 复制样式定义（段落样式、字符样式、表格样式、页面设置），应用到生成的 DOCX 上。

**能力矩阵：**

| 特性 | 支持度 | 说明 |
|------|--------|------|
| 段落样式继承 | ✅ | Heading 1~6, Normal, Quote 等按名称匹配 |
| 页面设置继承 | ✅ | 纸张大小、边距、页眉页脚等 |
| 表格样式 | ⚠️ 有限 | 默认只认 `Table` 样式名；2025年后有改进但仍有坑 |
| **字符样式映射** | ❌ | `**粗体**` 默认转 `run.bold=True`，**不**使用字符样式 |
| **自定义样式名** | ❌ | 硬编码映射（Heading→Heading 1，Bold→run.bold），无法配置 |
| **章节槽位/占位符** | ❌ | 没有内容到模板特定位置注入的能力 |

**关键限制**：pandoc 的 inline 格式渲染是**属性级别的**（`run.bold=True`），不走字符样式。要让 `**text**` → `run.style = 'Strong Char'`，需要 Lua filter 拦截 AST，手动写 OpenXML。而且不支持模板中的自定义段落样式名映射。

**Lua filter 拐杖方案：**
```lua
-- 拦截 Strong 元素，强制转为带有字符样式的 Span
function Strong(elems)
  -- 需要注入 OpenXML 的 run properties，极其复杂
  return pandoc.Span(elems, {custom_style = "Strong Char"})
end
```
不推荐——pandoc 的 Lua API 对 docx 字符样式的控制非常有限，且不同版本行为不一致。

### 1.2 docxtpl（python-docx-template）— 模板引擎方案

```
docxtpl 的思路：DOCX 里有 {{ variable }}，渲染时填入数据
```

**适合场景**：数据驱动的报告（如：{{ customer_name }}，{% for row in table %}），**不是 Markdown→DOCX**。

**与需求差距**：
- 需要人手工在 Word 里插入 Jinja2 标签
- 不能直接吃 Markdown 文件
- 格式标记需要预处理为 RichText 对象
- 不解决"模板是唯一样式权威"问题

### 1.3 python-docx + mistune — 纯手工方案（PRD 现状）

```
Markdown → mistune(解析) → ReportModel → python-docx(渲染) → DOCX
```

**优势**：完全可控，StyleMapping 随心定义
**劣势**：要处理所有边缘情况（嵌套列表、表格内格式、图片、公式等）

---

## 二、核心架构选择（三种路线）

### 路线 A：Pandoc-centric（薄封装）

```
Markdown → pandoc(解析+基础DOCX) → python-docx(后处理: 重写样式) → 最终DOCX
```

**流程：**
1. `pandoc input.md -o temp.docx --reference-doc=template.docx`（先用模板出初稿）
2. python-docx 打开 temp.docx，遍历所有段落和 run
3. 对每个元素：查 StyleMapping 表，重新应用模板样式

**优点：**
- 利用 pandoc 的鲁棒解析能力（表格、代码块、公式、图片等）
- 自己只需写"样式后处理"层，代码量最小
- pandoc 处理了 95% 的 content→layout 转换

**缺点：**
- 两遍扫描，速度慢
- pandoc 可能在输出中用了内联格式（run.bold=true），后处理要反过来"还原"成字符样式
- 依赖 pandoc 二进制（版本兼容性）
- pandoc 对一些 Markdown 方言的处理可能不符合预期

**适用规模**：Phase 1 MVP 快速验证、不需要高度定制的场景

### 路线 B：纯 python-docx（全控制 — PRD 推荐路线）

```
Markdown → mistune/markdown-it → ReportModel → python-docx(渲染器+样式映射器) → DOCX
```

**渲染器核心逻辑：**
```python
class DocxRenderer:
    def __init__(self, template_path: str, style_mapping: StyleMapping):
        self.doc = Document(template_path)  # 以模板为基础
        self.style_mapping = style_mapping

    def render_paragraph(self, block: ParagraphBlock):
        p = self.doc.add_paragraph()
        # 段落样式：由模板决定
        p.style = self.doc.styles[block.type]  # Heading1, Normal, ListBullet...
        for span in block.spans:
            run = p.add_run(span.text)
            # 字符样式：查 StyleMapping 表
            char_style = self.style_mapping.get(span.format)
            if char_style:
                run.style = self.doc.styles[char_style]  # 关键：用样式名，不设属性
```

**关键设计点：**
- **不在 Run 上设 bold/italic/font 属性**，统一用 `run.style = doc.styles[name]`
- 模板的样式定义是唯一来源
- StyleMapping 表是 Markdown 格式标记 → 模板字符样式名称的映射

**优点：**
- 一次遍历，架构简洁
- 完全控制样式映射逻辑
- 不依赖外部二进制
- StyleMapping 可以动态配置（YAML）

**缺点：**
- 需要自己处理 Markdown 的所有边缘情况
- markdown-it/mistune 的 AST 到 DOCX 的映射成本较高

### 路线 C：混合（pandoc 的嘴 + python-docx 的胃）

```
Markdown → pandoc(解析为JSON AST) → Python(AST→ReportModel) → python-docx(渲染) → DOCX
```

```bash
pandoc input.md -t json | python3 render.py --template template.docx > output.docx
```

**优点：**
- 得到 pandoc 级别的解析质量（表格、公式、脚注、交叉引用全处理）
- 渲染部分自己控制
- `-t json` 是 pandoc 的标准输出，格式稳定

**缺点：**
- 仍然依赖 pandoc 二进制
- AST→ReportModel 的转换有一定复杂度
- pandoc AST 的结构和 python-docx 的段落模型差异较大

---

## 三、StyleMapping 表的设计

这是项目核心创新点。建议设计为 YAML 配置文件，与模板分离。

```yaml
# style-mapping.yaml
paragraph:
  heading1: "Heading 1"           # Markdown # → 模板中的 "Heading 1" 样式
  heading2: "Heading 2"
  heading3: "Heading 3"
  paragraph: "Normal"             # 普通段落
  blockquote: "Quote"             # 引用块
  code_block: "Code"              # 代码块
  bullet_list: "List Bullet"      # 无序列表
  ordered_list: "List Number"     # 有序列表
  table_header: "Table Header"
  table_cell: "Table Cell"

inline:
  bold: "Strong Char"             # **粗体** → 字符样式
  italic: "Emphasis Char"         # *斜体* → 字符样式
  code: "Code Char"               # `行内代码` → 字符样式
  strikethrough: "Strikethrough Char"
  underline: "Underline Char"
  link: "Hyperlink Char"
  subscript: "Subscript Char"
  superscript: "Superscript Char"

fallback:
  paragraph: "Normal"             # 找不到映射时用的默认样式
  inline: "Default Paragraph Font"
```

**渲染器行为：**
```
输入: "这是**粗体**和*斜体*"
    ↓ mistune 解析
AST: [文本("这是"), Strong("粗体"), 文本("和"), Emph("斜体")]
    ↓ 查 StyleMapping
    ↓ 
输出段落: 段落样式 "Normal"
  run1: 文本 "这是"       → 无字符样式（继承段落样式）
  run2: 文本 "粗体"       → run.style = doc.styles["Strong Char"]
  run3: 文本 "和"         → 无字符样式
  run4: 文本 "斜体"       → run.style = doc.styles["Emphasis Char"]
```

**优点**：用户换模板只需改 `style-mapping.yaml`，不需要改代码。不同模板可以有不同的样式名。

---

## 四、CLI 友好化设计

### 4.1 Unix 哲学风格

```bash
# 基本用法
md2docx report.md --template company-template.docx -o report.docx

# 管道模式
cat report.md | md2docx --template company-template.docx > report.docx

# 指定样式映射
md2docx report.md --template t.docx -m style-mapping.yaml -o report.docx

# 验证模式（不生成，只检查模板兼容性）
md2docx report.md --template t.docx --validate

# 列出模板中可用的样式
md2docx --template t.docx --list-styles

# 生成默认 style-mapping.yaml（基于模板自动推断）
md2docx --template t.docx --init-mapping
```

### 4.2 TUI 补全友好

- `--bash-completion` 输出 shell 补全脚本
- `md2docx <Tab>` 自动补全 `.md` 文件
- `--template <Tab>` 扫描 `~/.config/md2docx/templates/` 目录

### 4.3 退出码和 stderr 协议

```
退出码: 0=成功, 1=解析错误, 2=模板错误, 3=映射缺失
stderr: 纯文本状态（适合终端查看）
stdout: 二进制 DOCX（适合管道）
```

---

## 五、GUI 友好化设计

### 5.1 Web UI（Phase 3 方向）

```
FastAPI + Jinja2/React 前端
```

核心页面：
1. **上传模板**：上传 .docx，自动分析样式目录+预览
2. **编辑映射**：下拉选择 Markdown 格式→模板样式，可视化
3. **上传/粘贴 Markdown**：实时预览渲染效果（docx→PDF or HTML 预览）
4. **下载**：一键下载最终 DOCX

### 5.2 更轻量的 GUI 方案

| 方案 | 适合场景 | 技术栈 |
|------|---------|--------|
| **Gradio** | 内部工具、快速原型 | Python 纯 |
| **Textual** | 终端内 TUI（无需浏览器） | Python 纯 |
| **Streamlit** | 数据工作者快速展示 | Python 纯 |
| **Electron** | 独立桌面应用 | 太重，不推荐 |
| **Typora 插件** | 如果用户用 Typora 写 MD | 与编辑器集成 |

**Gradio 最快：**
```python
import gradio as gr

def render(md_text, template_file):
    with tempfile.NamedTemporaryFile() as f:
        result = engine.render(md_text, template_file.name)
        return result.path

gr.Interface(
    fn=render,
    inputs=[gr.Textbox(label="Markdown"), gr.File(label="模板 .docx")],
    outputs=gr.File(label="输出 .docx"),
).launch()
```

### 5.3 CLI + GUI 复用同一核心

```python
# core/engine.py — 纯逻辑，无 IO 依赖
class ReportEngine:
    def render(self, md: str, template: TemplateProfile, mapping: StyleMapping) -> DocxOutput: ...

# cli/main.py — 终端入口
# web/app.py — Web 入口
# skill/skill.py — Hermes Agent 入口
```

---

## 六、Hermes Agent Skill 集成

### 6.1 作为终端命令技能

```yaml
# SKILL.md
name: report-engine
description: 将 Markdown 渲染为带模板样式的 DOCX 文档
commands:
  - md2docx report.md -t template.docx -o output.docx
```

Agent 调用方式：
```
用户: "把这份 report.md 套用公司模板生成 DOCX"
→ Agent 执行: md2docx report.md --template ~/templates/company.docx -o report.docx
→ 返回文件路径给用户
```

### 6.2 作为 Agent 内部函数

Skill 里提供 Python API，Agent 在 execute_code 中直接调用：
```python
from report_engine import render_docx
path = render_docx("report.md", template="company.docx", mapping="style-mapping.yaml")
```

---

## 七、实现路线建议

### Phase 1（验证概念）：路线 A（Pandoc-centric）

```bash
pandoc input.md -o temp.docx --reference-doc=template.docx
python3 -c "
from docx import Document
doc = Document('temp.docx')
# 遍历所有段落，对每个 run 应用模板的字符样式
for p in doc.paragraphs:
    for run in p.runs:
        if run.bold:
            run.bold = None  # 清除属性
            run.style = doc.styles['Strong Char']
doc.save('output.docx')
"
```

优点：半天就能跑通完整链路，验证"模板洗掉所有样式"的概念。

### Phase 2（完整实现）：路线 B（纯 python-docx）

转向纯 python-docx 路线，原因：
- 不依赖 pandoc 版本
- 真正的单次遍历
- StyleMapping 表成为一等公民
- 可以精细控制渲染质量

### Phase 3（生态）: CLI + GUI + Skill 三件套

复用同一 `core/engine.py`，封装三个入口：
- `cli/main.py` — click/argparse CLI
- `web/app.py` — FastAPI + Gradio
- `skill/SKILL.md` — Hermes Agent 技能描述

---

## 八、需要避免的坑

1. **不要同时设 run.style 和 run.bold** — python-docx 会合并行为不可预测，务必二选一
2. **模板分析器必须提取完整样式目录** — 包括 numbering definitions（列表编号）、character styles（字符样式）、table styles（表格样式）
3. **No-template 路径不需要** — 内置一个默认模板（如 pandoc 的 reference.docx）
4. **链接和公式可能是例外** — OpenXML 的 hyperlink 需要特殊处理，公式（OMML）不支持样式覆盖
5. **嵌套格式**（`***粗斜体***`）— 需要定义复合映射，或者直接叠加字符样式（python-docx 不支持 run 上叠加多个字符样式，需要创建复合字符样式）
6. **跨平台** — python-docx 在 macOS/Linux/Windows 行为一致，但字体渲染不同

---

## 九、参考项目

| 项目 | 地址 | 借鉴点 |
|------|------|--------|
| **pandoc** | pandoc.org | 解析器质量和参考文档系统 |
| **python-docx-template** | github.com/elapouya/python-docx-template | DOCX 模板的 Subdoc 机制 |
| **mistune** | github.com/lepture/mistune | Python Markdown 解析器（速度最快） |
| **markdown-it-py** | github.com/executablebooks/markdown-it-py | 插件化 Markdown 解析（兼容 JS 生态） |
| **WeasyPrint** | weasyprint.org | HTML→PDF 的样式继承模型值得借鉴 |
| **Typst** | typst.app | 新一代排版系统，可以作为长期对标 |
