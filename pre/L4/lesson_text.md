# Lesson 04 · Prompt Design for Research

## Course position

This lesson teaches prompt design through a concrete research workflow. At each of eight stages — clarify, operationalize, analyze, interpret, refuse, evidence, critique, and claim ceiling — students see an ineffective prompt and an effective prompt, and learn why the effective one produces better research.

The lesson does not teach theory. It teaches practice.

## Central thesis

> The quality of AI-assisted research is determined by the quality of the prompts. A good prompt declares the question, constrains the agent's role, and asks for structured judgment rather than open-ended output.

## Slide 01 · Cover

### Audience-facing copy

**Prompt design for research collaboration.**

`Pre/L4`

At each stage of the research workflow: what works, what doesn't, and why.

### Speaker direction

This lesson has one objective: at every stage of a research collaboration, students can identify what makes a prompt effective and what makes it wasteful. By the end, they have eight concrete prompts they can copy and use.

---

## Slide 02 · Overview

### Audience-facing copy

**Eight stages. Eight prompt principles.**

The research workflow:

```
Clarify → Operationalize → Analyze → Interpret → Refuse → Evidence → Critique → Ceiling
```

Rule: At each stage, the agent proposes; the researcher accepts, rejects, or reframes. The prompt determines the quality of the proposal.

### Speaker direction

Research collaboration is not one big prompt. It is a sequence of small, inspectable moves. Each move has its own prompt principle. Show the full map first, then unfold each stage one by one.

---

## Slide 03 · Clarify the question

### Stage 01 · Prompt Design

**Clarify the question**

❌ Ineffective:
"帮我分析一下公共服务的数据"

✅ Effective:
"我有一份2020–2023年北京市街道级面板数据。outcome 是居民满意度评分（1–5），unit 是街道–年度。我想理解为什么相似行政级别的街道，居民满意度差异很大。请先帮我 clarify：(1) 这个 outcome 有没有其他合理的 measurement，(2) 列出3个可能的 mechanism 和对应的 observable implications，(3) 指出哪个 mechanism 最容易被反驳。"

**Why it works:** 好的 prompt 声明了 outcome、unit、和你想要 agent 做什么。坏的 prompt 只给了一个主题，agent 不知道你在问什么。

### Speaker direction

这一步的目标不是让 agent 做分析，而是让 agent 帮你想清楚问题。坏的 prompt 只给了一个主题，agent 不知道你的 outcome、unit 和关心的 mechanism 是什么。好的 prompt 声明了这些，然后让 agent 做三件事：检查 measurement、列 mechanism、指出最容易被反驳的。

---

## Slide 04 · Operationalize variables

### Stage 02 · Prompt Design

**Operationalize variables**

❌ Ineffective:
"帮我处理一下数据，看看哪些变量重要"

✅ Effective:
"我有以下变量：X1 eco-efficiency, X2 budget per capita, X3 staff count, X4 digitalization index。请帮我检查：(1) 每个变量是否真的 operationalize 了我的 mechanism（eco-efficiency → citizen co-production），(2) X3 和 X4 是不是只是 proxy 而不是 mechanism 本身，(3) 建议一个 train/test split 策略，注意面板数据的时间结构。"

**Why it works:** 好的 prompt 带着具体变量名和 mechanism，让 agent 帮你做 measurement 检查，而不是自己跑分析。

### Speaker direction

这一步是把 mechanism 变成可以测量的变量。坏的 prompt 说"帮我处理数据"，agent 会自己选变量、自己决定分割策略。好的 prompt 带着具体变量名和 mechanism 过来，让 agent 做 measurement validity 检查：这些变量真的在测我说的东西吗？还是只是 proxy？

---

## Slide 05 · Run analysis

### Stage 03 · Prompt Design

**Run analysis**

❌ Ineffective:
"跑个 random forest 看看"

✅ Effective:
"请用三种方法分析：(1) OLS 作为 baseline，(2) Decision Tree 看有没有 threshold effect，(3) Random Forest 看复杂结构能否泛化。对于每种方法，请回答：它在问什么问题？它能看到什么？它看不到什么？不要给我模型排名，给我一个对比表格。"

**Why it works:** 好的 prompt 告诉 agent 用多个模型问不同的问题，而不是只追求最高准确率。

### Speaker direction

这一步的关键是"多个模型问不同的问题"。OLS 问平均关系，Tree 问 threshold，RF 问复杂结构能否泛化。坏的 prompt 只说"跑 RF"，agent 会给你一个模型排名。好的 prompt 要求 agent 对每个模型回答三个问题，而不是给你一个"最佳模型"。

---

## Slide 06 · Interpret results

### Stage 04 · Prompt Design

**Interpret results**

❌ Ineffective:
"RF 准确率最高，说明模型很好"

✅ Effective:
"三种模型的结果如下。请帮我分析：(1) 哪些变量在三种模型中都显著（robust），(2) 哪些只在某个模型中出现（unstable），(3) 哪些结果支持我的 mechanism，哪些不支持。最后，我们现在的证据最多能支持哪一层 claim？prediction？association？causality？"

**Why it works:** 好的 prompt 要求 agent 区分 robust 和 unstable 的结果，而不是只看最好的那个模型。

### Speaker direction

这一步是把"模型输出"变成"研究判断"。坏的 prompt 只看最好的模型，好的 prompt 要求区分 robust（三种模型都出现）和 unstable（只有某个模型出现）的结果，然后判断证据支持哪一层 claim。

---

## Slide 07 · Refuse bad claims

### Stage 05 · Prompt Design

**Refuse bad claims**

❌ Ineffective:
"写一段总结，强调我们的发现很重要"

✅ Effective:
"请不要写总结。请先帮我攻击自己的解释：(1) X1 的 eco-efficiency 是不是只是 GDP 的 proxy，(2) 有没有 leakage（outcome 和某个变量因果倒置），(3) 如果我换个 model specification 去掉 X4，结果还成立吗？"

**Why it works:** 好的 prompt 让 agent 先攻击自己的解释，而不是先写结论。拒绝是研究的关键环节。

### Speaker direction

这是全课最重要的一页。研究合作变得有价值，当研究者拒绝了 agent 的"容易故事"。坏的 prompt 让 agent 先写总结，好的 prompt 让 agent 先攻击自己的解释：变量是不是 proxy？有没有 leakage？换个 specification 还成立吗？写作应该是最后一步，不是第一步。

---

## Slide 08 · Build evidence packet

### Stage 06 · Prompt Design

**Build evidence packet**

❌ Ineffective:
"把结果整理成报告"

✅ Effective:
"请构建一个 evidence packet：(1) 数据质量——missingness、outliers、leakage 检查，(2) 模型——每种方法的 test error 和 subgroup error，(3) 解释——分成 supported / uncertain / prohibited 三类。对于 prohibited 的，请说明为什么不能这么说。"

**Why it works:** 好的 prompt 要求 agent 把证据分层，而不是笼统地说"结果很好"。

### Speaker direction

agent 不应该只返回"RF 表现最好"。好的 prompt 要求生成 evidence packet：数据质量检查、模型对比、解释分层（supported / uncertain / prohibited）。这个 packet 让你把 prediction、association 和 causal interpretation 分开。

---

## Slide 09 · Adversarial critique

### Stage 07 · Prompt Design

**Adversarial critique**

❌ Ineffective:
"帮我写一个 limitations 部分"

✅ Effective:
"请站在 reviewer 的角度，用最严格的标准攻击这个研究：(1) measurement validity——我的变量真的在测我说的东西吗？(2) endogeneity——有没有因果倒置或遗漏变量？(3) external validity——这个结论能推广到其他城市吗？(4) 最强的替代解释是什么？"

**Why it works:** 好的 prompt 给 agent 一个具体的攻击角色和四个攻击维度，而不是泛泛地说"写 limitations"。

### Speaker direction

agent 不应该只帮你把结果写得更像论文，而应该攻击解释。好的 prompt 给 agent 一个具体角色（reviewer）和四个攻击维度（measurement validity、endogeneity、external validity、替代解释）。这比泛泛地说"写 limitations"有效得多。

---

## Slide 10 · Set claim ceiling

### Stage 08 · Prompt Design

**Set claim ceiling**

❌ Ineffective:
"结论：eco-efficiency 显著影响公民参与"

✅ Effective:
"根据我们的证据，请帮我判断：我们的 claim ceiling 在哪？(A) 这个模型能预测新数据（prediction），(B) 变量之间有稳定的共变关系（association），(C) 存在一个 plausible 的 mechanism，(D) 我们识别了一个 causal effect。请对每个层级打勾或打叉，并说明需要什么额外证据才能升级。"

**Why it works:** 好的 prompt 让 agent 帮你做 claim 分层，而不是直接下结论。大多数 AI-assisted analysis 在这里失控。

### Speaker direction

很多 AI-assisted analysis 在这里失控：把 model importance 写成 mechanism，把 prediction 写成 causality。好的 prompt 让 agent 帮你做 claim 分层——prediction、association、mechanism、causality——然后对每个层级打勾或打叉，并说明需要什么额外证据才能升级。

---

## Slide 11 · Takeaway

### Audience-facing copy

**Three rules for research prompts.**

1. **Declare before you run** — state outcome, unit, mechanism, and what you want the agent to do
2. **Critique before you conclude** — ask the agent to attack your explanation before writing the summary
3. **Bound before you claim** — separate prediction, association, mechanism, and causality

> The agent proposes. You judge. The prompt determines the quality of the proposal.

### Speaker direction

三条规则总结全课。第一，先声明再运行——不要让 agent 猜你在问什么。第二，先批评再结论——让 agent 攻击你的解释，而不是先写总结。第三，先分层再下 claim——区分 prediction、association、mechanism 和 causality。这三条规则适用于所有和 agent 的研究合作。

---

## PPT preparation notes

### Deck structure

- `index.html` as a single static deck;
- one `<section class="slide">` per logical page;
- `data-title` for every slide;
- short audience-facing text on the slide;
- full spoken development inside `<aside class="notes">`;
- `assets/base.css`, `assets/fonts.css`, `assets/runtime.js`, theme CSS, and `style.css` copied from L3;
- keyboard navigation, overview, fullscreen, and presenter mode inherited from L3.

### Prompt slide layout

Each prompt stage slide uses one of two layouts:

1. **Sidebar + main** (stages 1, 2, 4, 6, 8): sidebar shows stage number and title, main shows the bad/good prompt pair.
2. **Full-width** (stages 3, 5, 7): prompt pair displayed as a two-column split.

Both layouts end with a callout explaining why the effective prompt works.

### Visual language

- **Red accent** for ineffective prompts (`.prompt-bad`)
- **Teal accent** for effective prompts (`.prompt-good`)
- **Mono font** for stage labels and "INEFFECTIVE"/"EFFECTIVE" tags
- **Serif font** for prompt text (matching the academic-paper theme)
- **One callout per slide** with the "why it works" explanation
