# Lesson 02 · From Learning Algorithms to Learning Systems

## Course position

Lesson 01 separated the layers of the AI stack: model, product, agent loop, tool, orchestration, and workflow. Lesson 02 asks a different question:

> What does it mean for a machine-learning system to learn, and what has changed in the engineering practice around that idea?

The lesson keeps the classical textbook vocabulary, but refuses to stop at the toy pipeline of **data → model → prediction**. In contemporary systems, learning is also shaped by representations, pretrained models, preference signals, evaluation suites, deployment constraints, production traces, and controlled feedback.

The recurring comparison is:

| Classical textbook view | 2026 engineering view |
| --- | --- |
| Fit a model to a fixed dataset | Build a system whose data, model, evaluation, and feedback loops evolve together |
| Optimize a single loss | Optimize several competing objectives under operational and governance constraints |
| Measure accuracy on a held-out test set | Combine offline benchmarks, adversarial cases, human review, traces, cost, latency, and safety |
| Deploy a frozen model | Monitor a living system and decide when, how, and whether to update it |

## Learning objective

By the end of the lesson, students should be able to explain why a strong model is not automatically a strong learning system. They should be able to identify the assumptions embedded in a representation, objective, dataset, evaluation procedure, and deployment loop—and compare a classical machine-learning workflow with a modern foundation-model workflow.

---

## Part 01 · What does it mean to learn?

### Classical textbook starting point

In supervised learning, a model receives examples `(x, y)` and learns a function that maps an input `x` to a target `y`. Learning means using observed examples to choose parameters that reduce prediction error.

That definition is useful, but incomplete. It hides the hardest question: **what counts as a useful prediction, and for whom?**

### Frontier engineering extension

Modern foundation-model systems often begin with a pretrained model rather than an empty parameter space. The engineering problem may be to adapt, prompt, retrieve, route, or evaluate an existing model rather than train a new model from scratch. The “learning” may therefore happen in several places:

- in the base model during pretraining;
- in adapters or post-training updates;
- in retrieved context and tool results at inference time;
- in the evaluation and feedback loop around the deployed application.

### Teaching point

Learning is not simply “the model changes its weights.” It is the broader process through which a system becomes better at a defined task while remaining useful outside the examples that shaped it.

### Engineering contrast

| Textbook exercise | Contemporary engineering question |
| --- | --- |
| Can the classifier predict the label? | Which combination of base model, data, adapter, retrieval, tools, and review produces reliable task performance? |

### Bridge

Before discussing algorithms, we need to define the learning problem precisely.

---

## Part 02 · The learning problem is a design problem

### Classical textbook starting point

A textbook problem usually specifies the input variables, target variable, training set, metric, and model family in advance. The student is asked to estimate parameters under those conditions.

### Frontier engineering extension

In practice, the problem specification is often the main source of difficulty. Teams must decide:

- what the system is allowed to observe;
- what outcome is being optimized;
- what should happen when the answer is uncertain;
- which errors are tolerable or catastrophic;
- whether the task should be solved by a model, retrieval, a tool, or a human escalation;
- how to define success for open-ended outputs.

For generative AI, the target is rarely one exact string. The system may need to satisfy a set of requirements: factual grounding, format, relevance, latency, cost, privacy, and refusal behavior.

### Teaching point

The target variable is not a neutral fact waiting in the world. It is a design choice that turns a social or organizational goal into a measurable learning problem.

### Engineering contrast

| Textbook framing | Frontier practice |
| --- | --- |
| “Predict house price.” | Define the decision, prediction horizon, acceptable error, data access, retraining policy, and human response to uncertainty. |
| “Answer the question.” | Define groundedness, completeness, citation behavior, refusal boundaries, tool-use policy, latency, and cost. |

### Bridge

Once the task is specified, the next bottleneck is how the system represents the world.

---

## Part 03 · Representation is the first bottleneck

### Classical textbook starting point

Classical machine learning often begins with engineered features: age, income, word counts, image pixels, or domain-specific indicators. The model learns using the information made available by those features.

### Frontier engineering extension

Contemporary systems commonly use learned representations: embeddings, token sequences, vision patches, audio features, graph representations, or multimodal latent spaces. A pretrained model supplies a general representation that can be reused across tasks.

This changes the engineering choice. Instead of asking only “Which algorithm should we fit?”, teams ask:

- Should the representation be engineered, learned, retrieved, or generated?
- Is the representation stable across domains and languages?
- Does it preserve the distinctions required by the task?
- Can we inspect or test what information it encodes?

### Teaching point

Representation determines what patterns are easy to learn. A powerful optimizer cannot recover information that the input representation has discarded, and a rich representation can also preserve misleading or sensitive signals.

### Engineering contrast

| Classical textbook | Frontier practice |
| --- | --- |
| Engineer a feature matrix once | Reuse a pretrained representation, add domain data, retrieve relevant context, and test representation behavior on slices and edge cases. |
| Feature importance explains the model | Embeddings require probing, nearest-neighbor inspection, counterfactual tests, and task-level evaluation. |

### Concrete model toolkit: AE and VAE

To make “representation” concrete, introduce two model families before moving on to the broader systems discussion.

An **autoencoder (AE)** learns an encoder and decoder:

```text
x  ──encoder──>  z  ──decoder──>  x̂
                 latent code
```

The training signal is reconstruction. The model tries to make `x̂` resemble `x`, usually with mean squared error for continuous values or binary cross-entropy for binary inputs. The bottleneck forces the encoder to preserve information that helps the decoder reconstruct the input.

A **variational autoencoder (VAE)** adds a probabilistic constraint. Instead of mapping each input to one fixed latent point, the encoder predicts a distribution with mean `μ` and variance `σ²`. The model samples a latent vector and learns a smooth latent space:

```text
x → encoder → (μ, σ) → sample z → decoder → x̂
                         ↘ KL regularization ↗
```

The VAE objective combines reconstruction quality with a KL-divergence term that keeps the learned latent distribution close to a prior. This makes the latent space useful for interpolation and generation, but introduces a trade-off: stronger regularization can produce smoother structure while weakening reconstruction detail.

### Do not confuse activation functions with loss functions

This distinction is essential:

| Component | Role | Examples |
| --- | --- | --- |
| Activation function | Adds a nonlinear transformation inside the network | ReLU, tanh, sigmoid, GELU |
| Loss function | Scores the model’s output against a target or preference | MSE, cross-entropy, KL divergence, contrastive loss |
| Regularizer | Adds a preference or constraint to the objective | weight decay, sparsity penalty, VAE KL term |

**ReLU** computes `max(0, x)`. It is simple and keeps positive gradients alive, but it can create inactive units when inputs stay negative. **tanh** maps values into `[-1, 1]`, which can be useful for bounded hidden states but may saturate and produce small gradients. **GELU** and related smooth activations are common in transformer-style architectures.

The engineering question is not “Which function is newest?” It is “Where does this function sit, what signal does it transform, and what behavior does it make easier or harder to learn?”

### Bridge

These concrete models show how architecture, representation, activation, objective, and regularization fit together. Now we can discuss inductive bias without leaving the mechanism abstract.

### Bridge

Representations do not determine one answer by themselves. They make some hypotheses easier to express than others. That is the role of inductive bias.

---

## Part 04 · Inductive bias: what the system assumes

### Classical textbook starting point

Inductive bias is the set of assumptions that allows a learner to generalize from finite observations. A linear model assumes a particular functional form. A decision tree prefers hierarchical partitions. A convolutional network encodes locality and translation structure.

Without some bias, many functions can fit the same finite dataset, and generalization is underdetermined.

### Frontier engineering extension

Modern systems combine several forms of bias:

- architectural bias from transformers, convolutions, or mixture-of-experts routing;
- data bias from the pretraining corpus and curation pipeline;
- instruction and preference bias from post-training;
- retrieval and tool bias from the context supplied at inference time;
- product and policy bias from system prompts, filters, and escalation rules.

The bias is no longer located only in the model architecture. It is distributed across the entire system.

### Teaching point

Pretraining does not remove inductive bias. It moves much of the bias into the model’s data, architecture, objective, and interface with the world.

### Engineering contrast

| Classical textbook | Frontier practice |
| --- | --- |
| Choose a model family with a known prior | Compose priors across base-model weights, data mixture, adapters, retrieval, tool permissions, and evaluation criteria. |
| Ask whether the model is expressive enough | Ask whether the system’s assumptions match the deployment environment. |

### Bridge

These assumptions become operational through the objective. The loss function determines which improvements the training process can see.

---

## Part 05 · Loss functions encode priorities

### Classical textbook starting point

Training minimizes a loss function such as mean squared error, cross-entropy, or hinge loss. The loss gives the optimizer a numerical direction: errors that matter more should contribute more to the objective.

### Frontier engineering extension

Modern systems rarely have one uncontested objective. A production system may balance quality, factuality, helpfulness, safety, latency, compute cost, privacy, and user satisfaction. For language models, next-token prediction is only one stage. Post-training may add supervised demonstrations, preference optimization, reward signals, or task-specific objectives.

Parameter-efficient fine-tuning is one current engineering response to this complexity. With LoRA or QLoRA, teams can adapt a frozen base model by training a small set of additional parameters rather than updating the whole model. Hugging Face documents this pattern through PEFT and TRL, including quantized base models and adapter training.

### Teaching point

The system optimizes the signals it receives, not the intention we had in mind. If an important quality is absent from the objective or evaluation, the system has little reason to improve it.

### Engineering contrast

| Classical textbook | Frontier practice |
| --- | --- |
| Minimize one explicit loss | Combine pretraining, supervised fine-tuning, preference or reward signals, policy constraints, and application-level evaluators. |
| Better loss means better model | Better objective alignment must be checked against independent tests and human judgment. |

### Bridge

An objective tells us what to improve. Optimization determines how the system actually moves toward it.

---

## Part 06 · Optimization is not understanding

### Classical textbook starting point

Gradient descent updates parameters in the direction that reduces the loss. Learning rate, batch size, regularization, and optimization schedule influence whether training converges and how well the final model performs.

### Frontier engineering extension

At modern scale, optimization is also a systems problem. Engineering teams manage:

- mixed-precision and quantized computation;
- distributed data, tensor, and pipeline parallelism;
- memory-efficient attention and optimizer states;
- checkpointing, resumption, and fault tolerance;
- parameter-efficient adaptation;
- inference-time computation and routing.

A lower training loss can coexist with worse generalization, higher latency, higher serving cost, or unsafe behavior. A technically successful run is not automatically a successful product.

### Teaching point

Optimization finds a solution to the objective we supplied. It does not prove that the objective represents the real-world task, nor that the resulting behavior is understood.

### Engineering contrast

| Classical textbook | Frontier practice |
| --- | --- |
| Tune hyperparameters to reduce validation loss | Tune the entire training and serving stack while tracking quality, cost, throughput, reproducibility, and failure modes. |
| Training is the main computation | Inference optimization—batching, quantization, caching, routing, and speculative decoding—can determine whether the system is usable. |

### Bridge

The central test is not whether the model fits its training objective. It is whether the learned behavior survives beyond the conditions of training.

---

## Part 07 · Generalization, shift, and the problem of new conditions

### Classical textbook starting point

Generalization means performing well on unseen samples drawn from the same distribution as the training data. Train/test splits and cross-validation estimate how well the model may transfer to new examples.

### Frontier engineering extension

Deployed systems face changing users, languages, policies, interfaces, tools, documents, and adversaries. The most important shift may not be a statistical change in raw features; it may be a change in the task, incentives, or environment.

Current practice therefore combines:

- carefully designed holdouts;
- temporal and geographic splits;
- challenge sets and adversarial tests;
- contamination checks;
- robustness and calibration tests;
- shadow deployments and canary releases;
- continuous monitoring after deployment.

### Teaching point

“Unseen data” is not one condition. A random test split measures one kind of novelty. It does not guarantee performance under domain shift, policy change, rare events, or strategic behavior.

### Engineering contrast

| Classical textbook | Frontier practice |
| --- | --- |
| Randomly hold out 20% of the data | Hold out by time, source, user, geography, task family, and adversarial condition. |
| Report one test score | Report a performance profile over slices, stress cases, uncertainty, latency, and cost. |

### Bridge

Shift is difficult to measure when the data itself contains shortcuts. We therefore need to inspect how the model obtains its apparent success.

---

## Part 08 · Spurious correlations and data failure

### Classical textbook starting point

Overfitting is often introduced as a model fitting noise rather than signal. Regularization, feature selection, early stopping, and more data are standard remedies.

### Frontier engineering extension

Modern failures often arise before the optimizer runs. Data can contain:

- leakage between training and evaluation;
- duplicated or near-duplicated examples;
- hidden source or author identifiers;
- artifacts that correlate with the label;
- synthetic data that repeats the generator’s errors;
- unsafe, private, or unlicensed content;
- benchmark contamination.

Frontier data work increasingly treats datasets as engineered artifacts with provenance, filtering, deduplication, mixture design, quality audits, and targeted edge-case collection. Production traces can also become a source of new evaluation examples, provided privacy and governance are handled correctly.

### Teaching point

The model can be “right for the wrong reason.” Improving the architecture may do less than removing a shortcut from the data or redesigning the evaluation.

### Engineering contrast

| Classical textbook | Frontier practice |
| --- | --- |
| Add regularization when the model overfits | Audit data lineage, deduplicate, test for leakage, inspect slices, and create counterexamples that break shortcuts. |
| Treat the dataset as given | Treat data composition and provenance as core model-development decisions. |

### Bridge

Once we suspect shortcuts and hidden failure modes, evaluation must become more than a single metric.

---

## Part 09 · Evaluation is measurement design

### Classical textbook starting point

Evaluation uses a metric suited to the task: accuracy, precision, recall, F1, mean squared error, or area under a curve. A test set provides a common basis for comparing models.

### Frontier engineering extension

Modern AI engineering increasingly uses evaluation-driven development: define representative cases, run them repeatedly, inspect failures, and treat evaluation results as a development signal. For open-ended systems, teams combine:

- exact or reference-based metrics where appropriate;
- rubric-based human review;
- model-based judges calibrated against human judgments;
- retrieval and tool-use checks;
- adversarial and safety tests;
- latency, cost, and reliability metrics;
- trace-level analysis of intermediate steps.

MLflow’s current evaluation and tracing documentation illustrates this shift: production traces can be collected, scored with custom or built-in scorers, annotated with human feedback, and reused to build evaluation datasets.

### Teaching point

Evaluation is not the final exam after development. It is part of the learning system. The test design determines which failures become visible and which remain invisible.

### Engineering contrast

| Classical textbook | Frontier practice |
| --- | --- |
| Choose a metric after training | Design an evaluation suite before iteration and use it to compare prompts, models, data, tools, and releases. |
| Evaluate only the final prediction | Evaluate the full trajectory: retrieval, tool calls, intermediate decisions, final answer, cost, latency, and user outcome. |

### Bridge

The final question is how to operate a learning system after the test set is gone.

---

## Part 10 · From model to learning system

### Classical textbook starting point

The textbook lifecycle often ends with deployment: train the model, evaluate it, save the artifact, and call it from an application.

### Frontier engineering extension

A production AI system is a continuing loop:

```text
task definition
    ↓
data and context
    ↓
model or model ensemble
    ↓
evaluation and release gate
    ↓
deployment
    ↓
traces, feedback, incidents, and cost signals
    ↓
new data, new tests, and controlled updates
```

The update may change the prompt, retrieval index, tool policy, adapter, model version, serving configuration, or human-review rule. The system should be able to show what changed, why it changed, and whether the change improved the intended outcome without creating unacceptable regressions.

Contemporary observability practice makes intermediate execution visible. Tracing systems can record inputs, outputs, tool calls, latency, token usage, and other spans, allowing engineers to debug a multi-step AI application rather than treating the final answer as an opaque event.

### Teaching point

The mature unit of engineering is not the frozen model. It is the versioned, evaluated, observable, and governable learning system.

### Engineering contrast

| Classical textbook | Frontier practice |
| --- | --- |
| Deploy a model artifact | Release a model-plus-data-plus-evaluation-plus-serving configuration. |
| Retrain when performance drops | Diagnose whether the cause is data shift, retrieval, prompt, tool, model, policy, latency, or user behavior before updating. |

### Final synthesis

The classical textbook gives us the core grammar of machine learning: representation, hypothesis, objective, optimization, and generalization. Frontier engineering does not replace that grammar. It expands the unit of analysis.

> A modern AI system learns through a stack of representations, objectives, data processes, model updates, evaluations, and feedback loops. Reliability depends on the design of the whole stack.

---

## Suggested classroom exercise

Give students one task: **answer questions about a changing internal policy manual**.

Ask them to design two systems:

1. a classical supervised classifier trained on labeled question-answer pairs;
2. a modern retrieval-augmented system built around a pretrained model.

Then compare them on:

- representation;
- inductive bias;
- objective;
- data requirements;
- update path when the policy changes;
- evaluation design;
- observability;
- failure response.

The exercise should end with the realization that the second system may require less task-specific weight training but more engineering around retrieval, evaluation, provenance, monitoring, and governance.

## Selected current engineering references

- [Hugging Face Transformers: parameter-efficient fine-tuning](https://huggingface.co/docs/transformers/peft)
- [Hugging Face TRL: PEFT integration and QLoRA](https://huggingface.co/docs/trl/main/peft_integration)
- [MLflow: classic model evaluation](https://mlflow.org/docs/latest/ml/evaluation)
- [MLflow: tracing for LLM and agent observability](https://mlflow.org/docs/latest/genai/tracing)
- [MLflow: evaluating production traces](https://mlflow.org/docs/latest/genai/eval-monitor/running-evaluation/traces/)
- [MLflow: automatic online evaluation](https://mlflow.org/docs/latest/genai/eval-monitor/automatic-evaluations/)
- [vLLM documentation](https://docs.vllm.ai/)

## Draft status

This is the text-first teaching manuscript. It is intentionally more detailed than the eventual slides. The next pass should compress each part into a small sequence of audience-facing slides, retain the comparison tables as visual structures, and move explanatory prose into speaker notes.

## Visual plan for the slide deck

The deck should use figures that explain a mechanism, not decorative AI imagery. The strongest visual language for this lesson is a mixture of simple reconstructed diagrams, interactive demonstrations, and a few first-party screenshots.

| Lesson part | Recommended visual | Why it helps | Candidate source |
| --- | --- | --- | --- |
| 01 · What does it mean to learn? | Split-screen: frozen model artifact versus living learning system | Makes the change in unit of analysis visible immediately | Recreate in the deck using the lifecycle diagram below |
| 02 · Learning problem | Decision specification canvas: task, signal, constraints, failure response | Shows that problem formulation precedes model selection | Recreate from the lesson’s own comparison table |
| 03 · Representation | Embedding cloud with nearest neighbors and labels | Gives students an intuitive picture of learned representations | [TensorFlow Embedding Projector](https://projector.tensorflow.org/) |
| 04 · Inductive bias | Same data solved by different model assumptions | Shows why architecture and data make some patterns easier to learn | Recreate with two small synthetic datasets |
| 05 · Loss functions | Competing objective dials: quality, safety, cost, latency | Makes multi-objective optimization concrete | Recreate as a clean systems diagram; avoid a generic “AI brain” image |
| 06 · Optimization | Animated loss curve plus parameter updates | Connects the textbook gradient-descent picture to real training diagnostics | [Google ML Crash Course: interpreting loss curves](https://developers.google.com/machine-learning/crash-course/overfitting/interpreting-loss-curves) |
| 07 · Generalization and shift | Train distribution → test distribution → deployment distribution | Makes random holdout versus real-world shift easy to compare | [Google ML Crash Course: dividing datasets](https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets) |
| 08 · Data failure | Shortcut example: model attends to background instead of object | Makes “right answer for wrong reason” memorable | Recreate with a controlled classroom example and counterfactual pair |
| 09 · Evaluation | Evaluation matrix plus trace-level inspection | Shows why one score is not enough for an open-ended system | [MLflow trace viewer](https://mlflow.org/docs/latest/genai/tracing/observe-with-traces/ui) |
| 10 · Learning system | Closed loop: deploy → trace → evaluate → update → release gate | Gives students a durable mental model for modern AI engineering | Recreate using the lifecycle diagram below |

### Interactive references worth showing live

- [TensorFlow Playground](https://playground.tensorflow.org/) lets students change the dataset, network, learning rate, and features while watching the decision boundary and loss change.
- [Google’s Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course/) provides interactive explanations for linear models, loss, gradient descent, dataset quality, and evaluation.
- [Hugging Face’s LoRA guide](https://huggingface.co/docs/peft/main/conceptual_guides/lora) provides a useful visual explanation of a frozen base weight plus a low-rank trainable update.
- [MLflow tracing](https://mlflow.org/docs/latest/genai/tracing/) provides a concrete production view of intermediate model calls, tools, latency, token usage, and feedback.

### Visual production rule

Use external figures as teaching references, but prefer redrawing the core idea in the deck’s own visual system. This keeps the lesson coherent and avoids casually embedding assets with unclear reuse rights. First-party screenshots can be used sparingly with source attribution; interactive sites should be linked or demonstrated live rather than copied wholesale.

### Added concrete-model visual sequence

The deck now includes a native visual sequence before Part 04:

1. **AE compression:** input grid → bottleneck `z` → reconstruction `x̂`.
2. **AE in practice:** denoising and anomaly detection as two different uses of reconstruction error.
3. **VAE latent map:** learned distributions, sampled points, and interpolation between regions.
4. **VAE generation:** sample from a prior, then decode a family of related outputs.
5. **Model family map:** AE, VAE, CNN, Transformer, and diffusion as different structural preferences.

These are intentionally schematic rather than claims about one benchmark or dataset. Their job is to make the mechanism visible before students encounter the broader engineering comparison.
