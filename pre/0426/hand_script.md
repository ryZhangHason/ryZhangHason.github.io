# AI in Government-Citizen Communication

Full speaking script for an 8-minute presentation.

## Slide 1

Good morning everyone. Today in our discipline, we hear a lot of claims like AI this, AI that. AI will improve service, AI will transform government, AI will change public administration.

But I think the more important question is not simply whether we use AI. The real question is: how does AI actually work in public service interaction, and how can we improve AI so it is useful for public administration?

There are two papers in this presentation. The first paper asks a public administration question: when AI is used in government service interaction, does it improve the quality of service communication? The second paper moves to the technical layer. If we want these systems to work in practice, they also need reliable retrieval and classification, especially when labeled data are limited.

So the whole talk moves from interaction quality to deployment infrastructure.

## Slide 2

The starting point is simple. Many public services now happen through digital platforms. Citizens submit requests, complaints, inquiries, or emergency messages, and government staff need to respond in a timely and appropriate way.

AI may support this service process. It can make responses clearer, make the tone more polite, and reduce the burden on both citizens and frontline staff.

But there is also a concern. Service quality is not only about giving correct information. It also includes whether citizens feel respected, heard, and taken seriously. If AI makes service language too standardized, it may weaken emotion, urgency, or relational signals.

So the core question is: does AI only make service communication look smoother, or does it improve the deeper quality of the interaction?

## Slide 3

In the first paper, I separate communication quality into two layers.

The first layer is informational-cognitive. This is about clarity, satisfaction, and whether the message is easy to understand or easy to reply to.

The second layer is expressive-constitutive. This is about politeness, respect, feeling heard, empathy, trust, urgency, and relational recognition.

This distinction is important because AI may work differently across the two layers. We may expect AI to improve clarity. But it is less obvious whether AI improves empathy and trust, or whether it weakens emotional and urgency signals.

## Slide 4

The study uses a vignette-based survey in China.

It includes 220 citizens and 214 civil servants.

The key comparison is simple: original messages versus AI-modified messages.

The analysis uses paired t-tests and mixed-effects regressions to estimate how AI modification changes evaluations.

## Slide 5

On the citizen side, the results are quite clear.

AI-modified government responses are evaluated more positively across all six dimensions: information clarity, response satisfaction, expressed politeness, feeling heard, empathic satisfaction, and trust toward government.

The important point is that the effect is not only technical or instrumental. It is not only that the answer becomes clearer. Citizens also report stronger relational perceptions, such as feeling heard, empathy, and trust.

So from the citizen perspective, AI language modification appears to improve both the informational side and the relational side of communication.

## Slide 6

On the civil servant side, the finding is also positive, but slightly different.

AI-modified citizen messages are clearer, easier to reply to, more polite, and more respectful. This suggests that AI can reduce communication friction for frontline officials.

A key concern was whether AI would erase urgency or needed empathy. In this study, there is no clear evidence that urgency or needed empathy is significantly reduced.

So the strongest concern about emotional flattening is not supported here. But I would still treat this as context-dependent. In some sensitive cases, the way AI rewrites emotion may still matter.

## Slide 7

This brings us to the bridge between the two papers.

The first paper focuses on the interaction level: clarity, politeness, empathy, trust, and response burden.

But if we imagine deploying AI in a real government communication system, better wording is only the front-end layer. Behind the interface, the system also needs to retrieve similar cases, route messages, classify topics, and recommend relevant responses.

These tasks depend heavily on embeddings. If nearest neighbors in embedding space are wrong, the system retrieves the wrong cases. So the next question becomes technical: how can we improve retrieval quality when we only have a small number of labels?

## Slide 8

This is where my previous work, SE-VAE, becomes the technical foundation.

SE-VAE tries to learn structured latent representations. Instead of putting everything into one mixed embedding, it separates useful construct-level information from shared or nuisance factors.

This matters because PEARL inherits the same motivation: representation space should be organized in a way that helps the task. The difference is that PEARL is lighter and more deployment-oriented. It reshapes fixed embeddings for retrieval, rather than training a full generative model.

## Slide 9

Now I introduce PEARL.

PEARL starts with fixed embeddings. Here, `z_i` is the vector for one text. For each class, PEARL computes a prototype, `p_c`, which is the average vector of labeled examples in that class.

Then it compares each text vector with each prototype and estimates which class the text is closest to. The loss has two goals: fit the label, but avoid moving the embedding too far from its original position.

The output is `z'_i`, a refined vector used for retrieval. So PEARL does not replace the embedding model. It lightly reshapes the geometry so nearest neighbors become more label-consistent.

## Slide 10

The results show that PEARL is most useful in the low-label setting.

Compared with raw embeddings, PEARL improves neighborhood quality. It also performs better than unsupervised post-processing because it uses limited labels as anchors.

For example, with 300 labels, Purity@1 increases from 0.3824 to 0.5370. With 600 labels, Hit@1 increases from 0.4386 to 0.6054.

The practical meaning is simple: when labels are scarce and users only inspect the first few retrieved cases, PEARL helps the system return more relevant neighbors.

## Slide 11

To conclude, the two papers together form one research agenda.

At the interaction level, we need to evaluate how AI affects clarity, politeness, empathy, trust, and frontline burden.

At the system level, we need to evaluate retrieval quality, label efficiency, drift monitoring, and auditability.

My main takeaway is that good AI governance communication is not only better wording. It also requires a technical system that retrieves the right cases, adapts with limited supervision, and remains auditable in public-sector settings.

Thank you.
