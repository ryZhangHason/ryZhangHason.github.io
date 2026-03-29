---
title: "HEAS: Hierarchical Evolutionary Agent Simulation Framework for Cross-Scale Modeling and Multi-Objective Search"
collection: publications
permalink: /publication/2025-01-01-heas-hierarchical-evolutionary-agent-simulation-framework
excerpt: 'We developed HEAS as a framework to combine layered agent-based modeling with evolutionary optimization.'
date: 2025-01-01
authors:
  - "Ruiyu ZHANG"
  - "Lin Nie"
  - "Xin Zhao"
venue: 'Preprint'
journal: 'Preprint'
arxiv: 'https://arxiv.org/abs/2508.15555'
paperurl: 'https://arxiv.org/abs/2508.15555'
citation_key: 'zhang2025heas'
citation: 'Ruiyu ZHANG, Lin Nie, and Xin Zhao. (2025). &quot;HEAS: Hierarchical Evolutionary Agent Simulation Framework for Cross-Scale Modeling and Multi-Objective Search.&quot; <i>Preprint</i>. arXiv:2508.15555.'
---

We developed HEAS (Hierarchical Evolutionary Agent Simulation) as a framework to combine layered agent-based modeling with evolutionary optimization. In HEAS, models are expressed as modular streams scheduled in layers that read and write to a shared context, making cross-scale feedbacks from environment to groups, agents, and aggregators explicit and transparent. With a simple API (`simulate`, `optimize`, `evaluate`), HEAS supports multi-objective search such as NSGA-II, reproducible tournament evaluation, and PyTorch integration for policy learning, enabling researchers to build, compare, and extend simulations across ecological, organizational, and policy domains.

You can apply HEAS directly from PyPI:

```bash
pip install heas
```

For full documentation and tutorials, visit the [HEAS project page](https://pypi.org/project/heas/). The SSRN version is available [here](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5400479), and the interactive demo is available at [https://ryzhanghason.github.io/heas/](https://ryzhanghason.github.io/heas/).

<figure style="text-align: center; display: inline-block;">
  <img src="/images/HEAS_Plot1.png"
       alt="HEAS architecture"
       style="display: block; margin: 0 auto; width: 80%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> Abstract Stream-layer Architecture in HEAS
  </figcaption>
</figure>
