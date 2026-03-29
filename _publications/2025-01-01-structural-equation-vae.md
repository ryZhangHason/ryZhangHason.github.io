---
title: "Structural Equation-VAE: Disentangled Latent Representations for Tabular Data"
collection: publications
permalink: /publication/2025-01-01-structural-equation-vae
excerpt: 'We designed SE-VAE to embed measurement structure directly into a variational autoencoder, separating construct-specific signals from global nuisance variation.'
date: 2025-01-01
authors:
  - "Ruiyu ZHANG"
  - "Ce Zhao"
  - "Xin Zhao"
  - "Lin Nie"
  - "Wai-Fung Lam"
venue: 'Preprint'
journal: 'Preprint'
arxiv: 'https://arxiv.org/abs/2508.06347'
paperurl: 'https://arxiv.org/abs/2508.06347'
citation_key: 'zhang2025sevae'
citation: 'Ruiyu ZHANG, Ce Zhao, Xin Zhao, Lin Nie, and Wai-Fung Lam. (2025). &quot;Structural Equation-VAE: Disentangled Latent Representations for Tabular Data.&quot; <i>Preprint</i>. arXiv:2508.06347.'
---

In our work on representation learning for structured data, we tackle the persistent challenge of aligning latent variables with theory-driven constructs. Drawing inspiration from structural equation modeling, we designed SE-VAE (Structural Equation-Variational Autoencoder) to embed measurement structure directly into a variational autoencoder, separating construct-specific signals from global nuisance variation. Evaluated on simulated tabular datasets, SE-VAE consistently recovered underlying factors more accurately and robustly than leading baselines, offering a principled framework for interpretable generative modeling in scientific and social research.

You can apply SE-VAE directly from PyPI:

```bash
pip install sevae
```

For full documentation and tutorials, visit the [SE-VAE project page](https://pypi.org/project/sevae/). The SSRN version is available [here](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5384208).

<figure style="text-align: center; display: inline-block;">
  <img src="/images/SE-VAE_Architecture_F1.png"
       alt="SE-VAE Architecture"
       style="display: block; margin: 0 auto; width: 80%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> SE-VAE Architecture
  </figcaption>
</figure>
