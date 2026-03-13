---
permalink: /
title: "About Me - Ruiyu Zhang 张瑞瑜"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---


<style>
/* Clear simple layout */
.main-content-wrapper {
  display: flex;
  width: 100%;
  gap: 20px;
  align-items: flex-start;
}

.main-text-content {
  flex: 1 1 auto;
  min-width: 0;
  padding-right: 0;
}

.publications-sidebar {
  flex: 0 0 280px;
  width: 280px;
  padding: 16px 16px 14px;
  background: linear-gradient(180deg, #f5f9ff 0%, #ffffff 100%);
  border: 1px solid #d8e4f3;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(24, 58, 106, 0.08);
  font-size: 0.82em;
  position: sticky;
  top: 70px;
  align-self: flex-start;
  height: fit-content;
}

.publications-sidebar h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.05em;
  color: #1f4f8f;
  border-bottom: 1px solid #cfe0f4;
  padding-bottom: 6px;
  letter-spacing: 0.2px;
}

.publications-sidebar ul {
  margin: 0;
  padding-left: 16px;
  list-style-type: disc;
}

.publications-sidebar li {
  margin-bottom: 7px;
  line-height: 1.45;
}

.publications-sidebar a {
  color: #1f5fa8;
  text-decoration: none;
}

.publications-sidebar a:hover {
  color: #143f73;
  text-decoration: underline;
}

@media (max-width: 1100px) {
  .main-content-wrapper {
    display: block;
    gap: 0;
  }

  .main-text-content {
    display: block;
    width: 100%;
    padding-right: 0;
  }

  .publications-sidebar {
    display: block;
    width: 100%;
    margin-top: 20px;
    position: static;
  }
  .author__sidebar {
  margin-left: -30rem !important;
  padding-left: 0;
  }
</style>

<div class="main-content-wrapper">

  <!-- LEFT CELL: main text -->
  <div class="main-text-content" markdown="1">

I am a graduate student in the Department of Politics and Public Administration, The University of Hong Kong, researching the fields of Public Management, Organization Studies, and Computational Methods in Social Science.

Works
------
<a name="ai-communication"></a>

 - "**Enhancing Communication Quality between Government and Citizens: The Role of AI Modification
**" (with [Lin Nie](https://scholar.google.com/citations?user=u38DnlUAAAAJ&hl=en&inst=17644838422235682599)). *Information Polity*. 2026. [https://doi.org/10.1177/15701255261427986](https://doi.org/10.1177/15701255261427986)

In our investigation of AI-assisted interactions, we sought to understand how artificial intelligence might elevate the quality of communication between citizens and civil servants.  We  compared traditional and AI-enhanced communication across diverse scenarios—from routine service requests to emergency concerns. Our analyses demonstrated that AI modifications can significantly improve key dimensions such as satisfaction, responsiveness, clarity, and trust. 

<figure style="text-align: center; display: inline-block;">
  <img src="/images/Paired T-Test Results of Comparison of Civil Servant Perceptions.png" 
       alt="SE-VAE Architecture" 
       style="display: block; margin: 0 auto; width: 70%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> Paired T-Test Results of Comparison of Civil Servant Perceptions
  </figcaption>
</figure>

---
<a name="pearl"></a>

 - "**PEARL: Prototype-Enhanced Alignment for Label-Efficient Representation Learning with Deployment-Driven Insights from Digital Governance Communication Systems**" (with [Lin Nie](https://scholar.google.com/citations?user=u38DnlUAAAAJ&hl=en&inst=17644838422235682599), [Wai-Fung Lam](https://scholar.google.com/citations?user=QtW4fMoAAAAJ&hl=en&inst=17644838422235682599), Qihao Wang, Xin Zhao). *Preprint*. 2026. Available at [arXiv](https://arxiv.org/abs/2601.17495)/[SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6130326)

We study deployed systems where new text inputs are routed by retrieving similar past cases—such as citizen messages in digital governance platforms. When this fails, the issue is often poorly aligned embedding neighborhoods rather than the language model itself. We propose PEARL (Prototype-Enhanced Aligned Representation Learning), a label-efficient method that softly aligns embeddings toward class prototypes to improve local neighborhood structure without changing dimensionality or requiring heavy retraining. Our approach bridges the gap between unsupervised post-processing and fully supervised projection, and yields strong gains precisely in the label-scarce settings where similarity-based systems are most brittle.

You can apply PEARL directly from PyPI:
```bash
pip install pearl-h
```
For full documentation and tutorials, visit the [PEARL project page](https://pypi.org/project/pearl-H/).

<figure style="text-align: center; display: inline-block;">
  <img src="/images/Figure_PEARL.png" 
       alt="PEARL Overview" 
       style="display: block; margin: 0 auto; width: 80%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> Neighborhood Geometry Illustration.
  </figcaption>
</figure>

---

<a name="heas"></a>

 - "**HEAS: Hierarchical Evolutionary Agent Simulation Framework for Cross-Scale Modeling and Multi-Objective Search**" (with [Lin Nie](https://scholar.google.com/citations?user=u38DnlUAAAAJ&hl=en&inst=17644838422235682599) and Xin Zhao). *Preprint*. 2025. Available at [arXiv](https://arxiv.org/abs/2508.15555)/[SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5400479)

We developed HEAS (Hierarchical Evolutionary Agent Simulation) as a framework to combine layered agent-based modeling with evolutionary optimization. In HEAS, models are expressed as modular “streams” scheduled in layers that read and write to a shared context, making cross-scale feedbacks—from environment to groups, agents, and aggregators—explicit and transparent. With a simple API (simulate, optimize, evaluate), HEAS supports multi-objective search (e.g., NSGA-II), reproducible tournament evaluation, and PyTorch integration for policy learning, enabling researchers to build, compare, and extend simulations across ecological, organizational, and policy domains. 

You can apply HEAS directly from PyPI:
```bash
pip install heas
```
For full documentation and tutorials, visit the [HEAS project page](https://pypi.org/project/heas/).
We also developed a lightweight web app to explore HEAS with an interactive tool, available at [https://ryzhanghason.github.io/heas/](https://ryzhanghason.github.io/heas/).

<figure style="text-align: center; display: inline-block;">
  <img src="/images/HEAS_Plot1.png" 
       alt="SE-VAE Architecture" 
       style="display: block; margin: 0 auto; width: 80%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> Abstract Stream–layer Architecture in HEAS
  </figcaption>
</figure>

---


<a name="se-vae"></a>

 - "**Structural Equation-VAE: Disentangled Latent Representations for Tabular Data**" (with Ce Zhao, Xin Zhao, [Lin Nie](https://scholar.google.com/citations?user=u38DnlUAAAAJ&hl=en&inst=17644838422235682599), [Wai-Fung Lam](https://scholar.google.com/citations?user=QtW4fMoAAAAJ&hl=en&inst=17644838422235682599)). *Preprint*. 2025. Available at [arXiv](https://arxiv.org/abs/2508.06347)/[SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5384208)

In our work on representation learning for structured data, we tackle the persistent challenge of aligning latent variables with theory-driven constructs. Drawing inspiration from structural equation modeling, we designed SE-VAE (Structural Equation-Variational Autoencoder) to embed measurement structure directly into a variational autoencoder, separating construct-specific signals from global nuisance variation. Evaluated on simulated tabular datasets, SE-VAE consistently recovered underlying factors more accurately and robustly than leading baselines, offering a principled framework for interpretable generative modeling in scientific and social research. 

You can apply SE-VAE directly from PyPI:
```bash
pip install sevae
```
For full documentation and tutorials, visit the [SE-VAE project page](https://pypi.org/project/sevae/).

<figure style="text-align: center; display: inline-block;">
  <img src="/images/SE-VAE_Architecture_F1.png" 
       alt="SE-VAE Architecture" 
       style="display: block; margin: 0 auto; width: 80%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> SE-VAE Architecture
  </figcaption>
</figure>

---

<a name="sme-sustainability"></a>

 - "**Sustainability of Small and Medium-Sized Enterprises in Hong Kong: Drivers and the Moderating Role of Social Network**" (with [Lin Nie](https://scholar.google.com/citations?user=u38DnlUAAAAJ&hl=en&inst=17644838422235682599) and [Wai-Fung Lam](https://scholar.google.com/citations?user=QtW4fMoAAAAJ&hl=en&inst=17644838422235682599)). *Corporate Social Responsibility and Environmental Management*. 2025. [https://doi.org/10.1002/csr.3207](https://doi.org/10.1002/csr.3207)

Our study examines what drives small and medium-sized enterprises (SMEs) to adopt sustainability practices, and how social networks shape these dynamics. Using survey data from 1,400 SMEs in Hong Kong, we find that internal drivers—such as responsibility, commitment, and a clear sustainability mission—and external pressures like regulation and customer demand significantly influence sustainability efforts. Crucially, our study shows that SMEs with stronger social network engagement benefit more from external drivers, especially in areas like environmental management, innovation, and social contribution. These findings highlight the need for policy approaches that not only provide support but also strengthen SME networks to enhance sustainability outcomes.

<figure style="text-align: center; display: inline-block;">
  <img src="/images/Moderating Effects of SME Social Network on Government Support, Industry Benchmark, and Customer Pressure.png" 
       alt="SE-VAE Architecture" 
       style="display: block; margin: 0 auto; width: 80%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> Moderating Effects of SME Social Network on Government Support, Industry Benchmark, and Customer Pressure
  </figcaption>
</figure>

---

<a name="eco-efficiency"></a>

 - "**Eco-efficiency as a Catalyst for Citizen Co-production: Evidence from Chinese Cities**" (with [Lin Nie](https://scholar.google.com/citations?user=u38DnlUAAAAJ&hl=en&inst=17644838422235682599), Ce Zhao, Xin Zhao). *Preprint*. 2025. Available at [arXiv](https://arxiv.org/abs/2504.13290)/[SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5220860)

In our study, we explored the relationship between eco-efficiency and the local governments' engagement in collaborative environmental governance with citizens. By analyzing provincial-level data from China and employing advanced textual analysis methods, our findings reveal that localities with higher eco-efficiency are significantly more likely to adopt co-productive responses to environmental complaints.

<figure style="text-align: center; display: inline-block;">
  <img src="/images/Catalyst for Citizen Co-production_F2.jpg" 
       alt="SE-VAE Architecture" 
       style="display: block; margin: 0 auto; width: 50%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> SHAP Analysis of Co-Production Prediction
  </figcaption>
</figure>

---


<a name="cadres-managers"></a>

 - "**From Cadres to Managers: The Double-hundred Action Programme and China's State-owned Enterprise Reform**" (with [Chengpang Lee](https://scholar.google.com/citations?user=3Gjd09kAAAAJ&hl=en&inst=17644838422235682599)). *The China Quarterly*. 2024. [https://doi.org/10.1017/S0305741024000481](https://doi.org/10.1017/S0305741024000481)

Our study delved into the transformative ambitions of the double-hundred action programme, a reform designed to modernize China’s state-owned enterprises by expanding the pool of top executive talent beyond traditional cadres. Through extensive fieldwork and detailed ethnography at a selected enterprise, we explored how this policy is reshaping recruitment, performance evaluation, and remuneration practices. While our findings highlight strong support for the initiative and notable shifts in organizational dynamics, they also reveal that traditional influences endure, particularly in key board appointments. This work deepens our understanding of the delicate balance between progressive reform and longstanding institutional practices.

<figure style="text-align: center; display: inline-block;">
  <img src="/images/The Bifurcated Corporate Leadership under the DHA.jpg" 
       alt="SE-VAE Architecture" 
       style="display: block; margin: 0 auto; width: 50%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> The Bifurcated Corporate Leadership under the Double-hundred Action
  </figcaption>
</figure>

---

<a name="semantic-consistency"></a>

 - "**Achieving Semantic Consistency: Contextualized Word Representations for Political Text Analysis**" (with [Lin Nie](https://scholar.google.com/citations?user=u38DnlUAAAAJ&hl=en&inst=17644838422235682599), Ce Zhao, Qingyang Chen). *Preprint*. 2024. Available at [arXiv](https://arxiv.org/abs/2412.04505)/[SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5043698)

In our exploration of political text analysis, we set out to address the challenge of maintaining semantic stability over time. By comparing traditional static embeddings with contextual models using two decades of People’s Daily articles, our research evaluated how well each approach captures both enduring meanings and subtle semantic shifts. The results indicate that contextual models not only provide greater semantic consistency but also detect nuanced variations that static methods often miss.   

<figure style="text-align: center; display: inline-block;">
  <img src="/images/Comparison of Key Metrics Between BERT and Word2Vec Over Different Time Spans.png" 
       alt="SE-VAE Architecture" 
       style="display: block; margin: 0 auto; width: 90%; height: auto;">
  <figcaption style="margin-top: 0.5em;">
    <em>Figure.</em> Comparison of Key Metrics Between BERT and Word2Vec Over Different Time Spans
  </figcaption>
</figure>

---

Contact
------
Feel free to reach out via email: ruiyuzh@connect.hku.hk
  </div> <!-- end of main-text-content -->
  
  <div class="publications-sidebar">
    <h3>Publications</h3>
    <ul>
      <li><a href="#ai-communication">Enhancing Communication Quality between Government and Citizens</a> (2026). <em>Information Polity</em></li>
      <li><a href="#pearl">PEARL: Prototype-Enhanced Alignment for Label-Efficient Representation Learning</a> (2026)</li>
      <li><a href="#heas">HEAS: Hierarchical Evolutionary Agent Simulation Framework</a> (2025)</li>
      <li><a href="#se-vae">Structural Equation-VAE</a> (2025)</li>
      <li><a href="#sme-sustainability">Sustainability of Small and Medium-Sized Enterprises in Hong Kong: Drivers and the Moderating Role of Social Network</a> (2025). <em>Corporate Social Responsibility and Environmental Management</em></li>
      <li><a href="#eco-efficiency">Eco-efficiency as a Catalyst for Citizen Co-production</a> (2025)</li>
      <li><a href="#cadres-managers">From Cadres to Managers: The Double-hundred Action Programme and China's State-owned Enterprise Reform</a> (2024). <em>The China Quarterly</em></li>
      <li><a href="#semantic-consistency">Contextualized Word Representations for Political Text Analysis</a> (2024)</li>
    </ul>
  </div> <!-- end of publications-sidebar -->

</div> <!-- end of main-content-wrapper -->
