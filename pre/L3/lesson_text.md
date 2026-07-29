# Lesson 03 · Four Theories of an Agent

## Course position

Lesson 01 mapped the AI stack. Lesson 02 expanded machine learning from a fixed model-training pipeline into a living learning system. Lesson 03 asks a product question: when current AI tools look similar from the outside, what engineering philosophy makes them different?

## Central thesis

> An agent product is a theory of work: it decides what persists, what can run in parallel, and where control lives.

## Four design philosophies

## Shared infrastructure concepts

### Skill

A skill is reusable procedural memory: instructions, sequence, tools, examples, and checks that load when relevant. It is different from memory (facts), tools (callable actions), and model weights (broad learned capability).

### MCP

Model Context Protocol is a Host–Client–Server protocol for connecting AI applications to external servers. MCP servers can expose tools, resources, and prompts. MCP standardizes connection and capability discovery; it does not decide whether a capability is trustworthy or should be allowed.

### Skill, MCP, plugin

Skill answers “how should the agent work?” MCP answers “what external capability can it reach?” A plugin or package answers “how do we distribute this workflow with its apps, configuration, and permissions?”

### Hermes: experience becomes procedure

Hermes distinguishes persistent memory (facts about a person, project, or environment) from skills (reusable procedures). Its Skill Workshop turns experience into a proposal, keeps it pending for review, and applies it only through an explicit lifecycle. This is self-improvement around the model, not silent weight training.

### OpenClaw: the agent becomes personal infrastructure

OpenClaw uses a Gateway to connect many channels and nodes to a stable agent core. Its self-learning path can turn evidence from conversations into pending Skill Workshop proposals, but it does not silently write active skills. This makes routing, identity, state, and skill governance central engineering problems.

### Codex: work becomes parallel tasks

Codex treats software work as reviewable work packages. Local and cloud environments, sandboxes, worktrees, parallel agents, skills, diffs, and test evidence make throughput and integration explicit. The product’s trust unit is an isolated run with evidence, not an unexamined generated answer.

### Claude Code: the agent inhabits the codebase

Claude Code loads hierarchical project context through `CLAUDE.md` and rules, then extends runtime control through hooks, permissions, and subagents. The agent is embedded in the repository’s development lifecycle rather than placed beside it as a generic assistant.

## Key distinction

Agent evolution is usually a system update around the model: memory, skills, rules, hooks, tools, or tests. It is not necessarily a weight update.

## Classroom lab

Choose one product. Draw its persistence path, action boundary, and failure-recovery path. Then state one trade-off in the form: “This product is optimized for X, because mechanism Y makes Z persistent—but that creates risk W.”
