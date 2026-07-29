# Lesson 03 · 四种 Agent 设计哲学

中文逐字稿 · 对应 `index.html` 的 17 页

---

## 01｜封面：四种 Agent 理论

大家好，今天我们来认识四个现在比较有代表性的 Agent 产品：OpenClaw、Hermes、Codex 和 Claude Code。它们表面上都可以聊天、读文件、调用工具，甚至都可以完成一些比较复杂的任务。所以如果我们只看功能列表，很容易觉得它们差不多。今天我们不做产品排行榜，也不讨论谁的模型更聪明。我们要问一个更有意思的问题：每个产品到底把什么东西看成工作的核心？Hermes 认为核心是经验积累，OpenClaw 认为核心是个人基础设施，Codex 认为核心是可并行的工程任务，而 Claude Code 认为核心是代码库里的规则和工作现场。

## 02｜主张：Agent 是一种工作理论

我们先建立一个总的判断。一个 Agent 产品，其实就是一种关于“工作应该怎样被组织”的理论。它会决定三件事：第一，什么状态可以保留下来；第二，什么任务可以同时运行；第三，人在什么地方可以介入和控制。Hermes 会把一次成功的工作提炼成以后可以复用的程序。OpenClaw 会把不同聊天渠道和设备连接到一个个人 Gateway。Codex 会把软件工作拆成隔离的任务和 review packet。Claude Code 则把项目规则、权限和生命周期直接放进代码现场。所以，我们后面看产品时，不要只问“它能做什么”，还要问“它把什么东西变成了稳定的系统对象”。

## 03｜Hermes：经验变成程序

先看 Hermes。Hermes 最值得展开的地方，是它所谓的“自进化”。这里的自进化不是模型自己重新训练，也不是每次对话之后悄悄修改参数。它更像是一个会写工作手册的长期同事。一次任务中，用户的纠正、解决问题的方法、最后成功的步骤，都可能被整理成一个 skill proposal。这个 proposal 不是马上生效的 live skill，而是先进入待审查状态。我们可以查看内容、修改它、批准它、拒绝它，必要时还可以回滚。于是，Agent 的成长就变成了一个可以观察和治理的程序积累过程。

## 04｜Hermes：学习其实是文件系统协议

从工程实现上看，Hermes 把长期连续性拆成了几个可以看见的目录和对象。memory 里放的是事实，比如用户的偏好、项目使用什么工具、以前做过哪些决定。skills 里放的是程序，也就是遇到类似任务时应该按什么步骤执行。cron 里放定时任务，sessions 里保留过去的会话。这个设计很重要，因为它没有把所有“记忆”都藏在模型里面，而是把状态放到了一个可以检查、迁移和管理的 workspace 里。这样做的好处是连续性很强，也可以更换模型和渠道；代价是系统需要处理旧技能、技能冲突、审批和生命周期管理。

## 04A｜Skill：可复用的工作方法

现在把 Skill 这个概念单独拿出来。Skill 不是一个新的模型，也不只是一个很长的 prompt。它更像一份可以被 Agent 按需加载的工作程序，里面可以写什么时候使用、应该先做什么、调用哪些工具、如何检查结果，以及一些例子。Skill 通常采用 progressive disclosure：系统先只知道它的名字和简介，真正遇到相关任务时，才读取完整内容。我们可以这样区分：memory 保存事实，skill 保存程序，model 保存更广泛的语言和推理能力。Skill 的价值，是让一次成功的方法不必每次都从零开始。

## 05｜OpenClaw：个人基础设施

接下来是 OpenClaw。OpenClaw 的重点不是某一个聊天窗口，而是 Gateway。你可以从 WhatsApp、Telegram、Slack、iMessage 等不同渠道进入同一个 Agent 核心。Gateway 负责路由、会话、身份和策略，然后再把 browser、设备节点、skills 和 workspace 接到这个核心上。这里的设计哲学是：聊天渠道只是适配器，真正稳定的身份应该在 Gateway 和个人状态里。这样，用户不需要因为换了一个聊天软件，就重新建立一套完全不同的助手。它更像一个属于个人的控制平面，而不是一个孤立的聊天机器人。

## 06｜OpenClaw：学习不等于获得授权

OpenClaw 的 self-learning 也很有意思。它可以从对话、文件、URL 或用户纠正中提炼出一个可复用的 skill，但这个 skill 首先只是 proposal。系统会记录来源、目标、扫描结果和版本信息，只有在 apply 之后才会进入 active skill。它还可以把长期不用的 skill 标记为 stale，之后归档，但不会直接删除。这说明 OpenClaw 把“学习”和“授权”明确分开了。Agent 可以提出“我学会了一个新方法”，但不代表它自动获得了永久修改自己行为的权力。对于个人基础设施来说，这个边界非常重要，因为一次错误经验可能会被未来的很多渠道重复使用。

## 06A｜MCP：把外部能力接进来

另一个需要掌握的概念是 MCP，也就是 Model Context Protocol。MCP 不是一个新的 Agent，而是一套连接标准。官方架构里有 Host、Client 和 Server：Host 是 Hermes、Claude Code 或其他 AI 应用；Client 负责和某个 Server 建立连接；Server 则提供外部系统的能力。Server 可以暴露 Tools，也就是可以被调用的动作；Resources，也就是文件、记录和其他上下文；Prompts，也就是面向用户的模板。MCP 解决的是“怎样标准化连接”，但不自动解决“这个工具是否值得信任、是否应该允许调用”。所以接入 MCP 后，权限和工具过滤反而更加重要。

## 07｜Codex：工作变成并行任务

现在看 Codex。Codex 的核心设计，不只是“帮我写一段代码”，而是把软件工作变成一个可以排队、隔离、并行和审查的任务系统。比如我们可以让一个 Agent 修复登录问题，另一个 Agent 添加测试，第三个 Agent 检查依赖风险。每一个任务都在自己的 workspace、sandbox 或 worktree 里运行，不应该直接污染主分支。完成以后，它们带回来的不是一句“我改好了”，而是 diff、测试结果、执行记录和需要审查的文件。于是，Codex 的重点从单次生成转向工程吞吐：多个 Agent 可以同时推进，但最后必须通过 review 和 merge 回到主线。

## 08｜Codex：真正的输出是证据

我们可以把 Codex 的工作分成三个阶段。第一阶段是输入：任务描述、代码仓库、项目说明和必要的 skill。第二阶段是运行：Agent 在隔离环境里读文件、编辑代码、执行命令和测试。第三阶段是输出：它交付一个 review packet，里面包括改动了什么、测试是否通过、哪些命令执行过，以及还有什么风险。这个过程体现出 Codex 的信任哲学：我们不要求 Agent 永远不犯错，而是要求每一次行动都尽量留下可以检查的证据。这样，人类不必盯着每一个字符，但仍然可以审查结果、要求修改，或者拒绝合并。

## 09｜Claude Code：Agent 住进代码库

Claude Code 的思路又不一样。它不是把 Agent 放在代码库旁边，而是让 Agent 住进代码库的工作现场。这个现场包括分层的 CLAUDE.md、项目 rules、当前目录、代码文件、命令和团队约定。组织可以有组织级规则，个人可以有用户级规则，项目可以有共享的 CLAUDE.md，开发者还可以有本地规则。越接近当前文件的规则，通常越具体。这样，Agent 的行为就不只是由当下的 prompt 决定，也受到项目制度和本地开发流程的影响。它更像一个知道“这个团队怎样写代码、怎样测试、怎样发布”的现场协作者。

## 10｜Claude Code：生命周期可以被编程

Claude Code 还把 Agent 的生命周期暴露出来。CLAUDE.md 告诉 Agent 应该知道什么；hooks 告诉它在什么时刻执行检查；permissions 告诉它哪些事情可以直接做、哪些事情必须询问；subagents 则可以把探索、规划、测试或安全审查交给不同角色。比如，在 Agent 执行 Bash 命令之前，我们可以用 PreToolUse hook 检查命令内容；文件修改之后，可以自动运行 formatter 和测试。换句话说，Claude Code 不只是让 Agent 生成代码，还让团队能够把自己的开发流程写成 Agent 可以执行的规则和生命周期。

## 11｜机制比较：中心在哪里

现在我们把四个产品放到一张表里。Hermes 主要让事实和程序持续存在，OpenClaw 主要让个人状态、渠道和设备持续存在，Codex 主要让工程任务和工作流持续存在，Claude Code 主要让项目规则和开发实践持续存在。它们的并行方式也不同：Hermes 偏向 subagent delegation，OpenClaw 偏向渠道、节点和多个入口，Codex 偏向 worktrees 和 cloud tasks，Claude Code 偏向 subagents、teams 和 hooks。最后，控制的位置也不同：Hermes 有 memory 和 skill approval，OpenClaw 有 Gateway 和 Workshop，Codex 有 sandbox 和 review，Claude Code 有 permissions 和 runtime hooks。

## 11A｜Skill、MCP 和 Plugin 的区别

这三个词经常被放在一起，但它们解决的问题不同。Skill 回答的是“应该怎样做”，所以它是方法、步骤、例子和检查规则。MCP 回答的是“可以连接什么”，所以它把外部系统的 tools、resources 和 prompts 以标准方式接入 Agent。Plugin 或 package 回答的是“怎样把一套能力分发出去”，它可以把 skill、MCP server、app、配置和权限要求打包在一起。比如做一个研究助手，literature review 的流程可以是 skill，图书馆搜索和 Zotero 可以通过 MCP 接入，最后再把它们和安装配置包装成一个 plugin。这样看，三者是方法、连接和分发三个不同层次。

## 12｜同一个任务：四种理解

假设我们给四个产品同一个任务：“每周五，根据我的研究笔记，整理一份 briefing 并发布。”Hermes 会更关注怎样记住 briefing 的格式、步骤和时间，然后用 skill 加 cron 重复执行。OpenClaw 会更关注我们从哪个渠道发起任务、结果应该送到哪里，以及不同设备如何共享状态。Codex 可能会把 briefing 做成一个仓库里的 Markdown artifact，先生成改动，再让我们 review。Claude Code 则会先读取项目规则、发布规范和 hooks，确保内容按照这个代码库的方式生成和检查。四个产品都能帮忙，但它们让不同的东西变得稳定。

## 13｜不要混淆：系统进化不等于模型学习

这里要特别区分两种“学习”。第一种是模型权重更新，也就是训练或微调，它改变模型参数，通常成本更高、影响范围更广，也更难逐条审计。第二种是系统层更新，比如写入 memory、生成 skill、增加规则、修改 hook、保存 workflow 或加入测试。Hermes 和 OpenClaw 的自进化主要发生在 memory 和 skill 层；Codex 可以把重复工作保存成 skill；Claude Code 可以把经验写进规则和 hooks。这些更新都发生在模型周围。它们更局部、更容易回滚，也更适合产品快速迭代，但并不意味着不需要治理。

## 14｜选择：什么应该保持稳定

如果我们要选择一个产品，最好不要先问哪个品牌最热门，而要先问任务中什么东西必须保持稳定。如果是个人偏好、长期历史和重复流程，Hermes 的 memory 和 skills 更匹配。如果是多个聊天渠道、设备和个人工作入口，OpenClaw 的 Gateway 更匹配。如果是多个工程任务并行推进，并且最后需要统一 review，Codex 更匹配。如果最重要的是项目规则、权限和开发生命周期，Claude Code 更匹配。当然，真实系统可以把这些机制组合起来，但组合前必须先理解每个机制到底解决什么问题，以及它会带来什么新的风险。

## 15｜课堂实验：反向拆解一个产品

接下来做一个小实验。每组选择 Hermes、OpenClaw、Codex 或 Claude Code 中的一个。你们不要画一个抽象的“模型加工具”图，而要回答四个具体问题：第一，什么状态可以跨越当前 turn 保留下来？第二，一次成功经验怎样变成下一次可以复用的东西？第三，哪些任务可以同时运行？第四，人类在哪个位置可以停止、审批或回滚？最后请写出一个 trade-off，格式是：“这个产品最适合 X，因为机制 Y 让 Z 稳定下来，但这也带来了风险 W。”这个答案比“它很强”更接近真正的工程分析。

## 16｜总结：不同 Agent 稳定不同东西

我们今天的结论可以压缩成四句话。Hermes 让经验稳定下来，把事实变成记忆，把方法变成 skill。OpenClaw 让个人基础设施稳定下来，把很多渠道和设备接到一个 Gateway。Codex 让工程吞吐稳定下来，把任务放进隔离环境，并通过证据回到 review。Claude Code 让代码实践稳定下来，把规则、权限和生命周期写进 repository context。所以下次再看到一个新的 Agent 产品，我们可以问：它把什么东西保存下来？它让什么可以并行？它把控制放在哪里？这三个问题，通常比产品宣传页上的功能数量更能解释它的设计。

## 17｜资料：从协议细节理解产品

最后给大家留下几组官方资料。Hermes 可以重点看 Skill Workshop，理解 proposal、review 和 apply 的生命周期。OpenClaw 可以看 Self-learning，理解为什么它把学习结果停在 pending proposal，而不是直接修改 active skill。Codex 可以看 worktrees、cloud environments、parallel agents 和 skills。Claude Code 可以看 memory 和 hooks，理解规则如何分层加载，以及工具调用前后如何被控制。产品会不断更新，所以我们今天学习的不是一张永久不变的功能清单，而是一种读产品的方法：从协议、状态和控制机制，反推出它真正的工程哲学。
