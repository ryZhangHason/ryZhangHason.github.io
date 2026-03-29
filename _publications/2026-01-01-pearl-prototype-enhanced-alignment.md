---
title: "PEARL: Prototype-Enhanced Alignment for Label-Efficient Representation Learning with Deployment-Driven Insights from Digital Governance Communication Systems"
collection: publications
permalink: /publication/2026-01-01-pearl-prototype-enhanced-alignment
excerpt: 'We propose PEARL, a label-efficient method that softly aligns embeddings toward class prototypes to improve local neighborhood structure without changing dimensionality or requiring heavy retraining.'
date: 2026-01-01
authors:
  - "Ruiyu ZHANG"
  - "Lin Nie"
  - "Wai-Fung Lam"
  - "Qihao Wang"
  - "Xin Zhao"
venue: 'Preprint'
journal: 'Preprint'
arxiv: 'https://arxiv.org/abs/2601.17495'
paperurl: 'https://arxiv.org/abs/2601.17495'
citation_key: 'zhang2026pearl'
citation: 'Ruiyu ZHANG, Lin Nie, Wai-Fung Lam, Qihao Wang, and Xin Zhao. (2026). &quot;PEARL: Prototype-Enhanced Alignment for Label-Efficient Representation Learning with Deployment-Driven Insights from Digital Governance Communication Systems.&quot; <i>Preprint</i>. arXiv:2601.17495.'
---

We study deployed systems where new text inputs are routed by retrieving similar past cases, such as citizen messages in digital governance platforms. When this fails, the issue is often poorly aligned embedding neighborhoods rather than the language model itself. We propose PEARL (Prototype-Enhanced Aligned Representation Learning), a label-efficient method that softly aligns embeddings toward class prototypes to improve local neighborhood structure without changing dimensionality or requiring heavy retraining. Our approach bridges the gap between unsupervised post-processing and fully supervised projection, and yields strong gains precisely in the label-scarce settings where similarity-based systems are most brittle.

You can apply PEARL directly from PyPI:

```bash
pip install pearl-h
```

For full documentation and tutorials, visit the [PEARL project page](https://pypi.org/project/pearl-H/). The SSRN version is available [here](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6130326).

<figure style="text-align: center; display: inline-block;">
  <img src="/images/Figure_PEARL.png"
       alt="PEARL Overview"
       style="display: block; margin: 0 auto; width: 80%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> Neighborhood Geometry Illustration.
  </figcaption>
</figure>
