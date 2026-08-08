/**
 * topicResponses — provides varied, topic-aware responses for free-typed questions.
 *
 * When matchScenario returns 'plain' (the fallback), this module picks a more
 * relevant response based on keyword analysis of the user's question.
 *
 * Each topic response includes text and citations that map to actual lecture data.
 * This gives the impression of intelligent responses without any real AI backend.
 */

const TOPIC_RESPONSES = [
  {
    id: 'topic-linear-regression',
    keywords: [/linear\s*regression/i, /ordinary\s*least/i, /ols/i, /\bfit\s*a\s*line\b/i, /\bclosed[- ]form/i],
    text: "Linear regression finds the weight vector $w$ that minimises the mean squared error between predictions $Xw$ and targets $y$. Because the loss is quadratic the gradient is linear, which means there is a closed-form solution:\n\n$$w^* = (X^T X)^{-1} X^T y$$\n\nThis is elegant but rarely used in practice once datasets are large, because inverting $X^T X$ is $O(d^3)$ in the number of features. That is exactly why the course moves on to gradient descent in Week 2 — it trades the exact answer for an iterative one that scales.\n\nThe key insight is that linear regression is not just a model, it is a lens: every idea in the course (loss functions, optimisation, overfitting) can first be understood in the linear case before generalising.",
    citations: [
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 3 },
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 4 }
    ]
  },
  {
    id: 'topic-loss-functions',
    keywords: [/loss\s*function/i, /\bmse\b/i, /mean\s*squared/i, /cost\s*function/i, /objective\s*function/i, /\bcross[- ]entropy/i],
    text: "A loss function quantifies how wrong a prediction is. The course starts with **mean squared error** (MSE) because it has a clean gradient and a closed-form minimum for linear models:\n\n$$L(w) = \\frac{1}{n} \\sum_{i=1}^n (\\hat{y}_i - y_i)^2$$\n\nBut the choice of loss is a modelling decision, not a mathematical inevitability. MSE penalises large errors quadratically, which means a single outlier can dominate the entire fit. If your data has heavy-tailed noise, absolute error or Huber loss may be more appropriate.\n\nFor classification the natural choice is cross-entropy, which emerges from maximum likelihood estimation when outputs are probabilities. The course covers this transition when moving from regression to logistic models.",
    citations: [
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 5 },
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 6 }
    ]
  },
  {
    id: 'topic-overfitting',
    keywords: [/overfit/i, /under\s*fit/i, /generali[sz]/i, /bias[- ]variance/i, /train.*test/i, /validation/i],
    text: "Overfitting is when a model learns the noise in the training data rather than the signal. The classic symptom is a gap between training loss (low) and test loss (high).\n\nThe **bias-variance tradeoff** is the formal way to think about this:\n- **High bias** (underfitting): the model is too simple to capture the pattern\n- **High variance** (overfitting): the model is so flexible it fits the training noise\n\nThe course covers several defences against overfitting in Week 3:\n\n1. **Regularization** — L1 and L2 penalties that constrain model complexity\n2. **Early stopping** — halt training when validation loss stops improving\n3. **Cross-validation** — rotate the validation set to use all data for both training and evaluation\n\nThe deep lesson is that training loss was never the thing you cared about — it is a proxy for performance on data you have not seen yet. The test set is sacred.",
    citations: [
      { lecture: "Week 3 — Regularization and Generalization", slide: 13 },
      { lecture: "Week 3 — Regularization and Generalization", slide: 15 }
    ]
  },
  {
    id: 'topic-gradient',
    keywords: [/gradient/i, /learning\s*rate/i, /\blr\b/i, /convergence/i, /diverge/i, /step\s*size/i],
    text: "Gradient descent is the workhorse optimisation algorithm. The idea is simple: compute the gradient of the loss with respect to the parameters, then take a step in the opposite direction.\n\n$$w_{t+1} = w_t - \\eta \\nabla L(w_t)$$\n\nThe **learning rate** $\\eta$ is the most important hyperparameter:\n- **Too large**: the updates overshoot the minimum and the loss diverges\n- **Too small**: convergence is painfully slow, and you may get stuck in a local minimum\n- **Just right**: the loss decreases smoothly toward the optimum\n\nIn practice you rarely use a fixed learning rate. Schedules like cosine decay or warmup-then-decay, and adaptive methods like Adam, adjust the step size automatically based on the history of gradients.\n\nThe key geometric intuition: the gradient always points uphill, so subtracting it moves you downhill. Every optimisation method in the course is a variation on this theme.",
    citations: [
      { lecture: "Week 2 — Gradient Descent and Backpropagation", slide: 3 },
      { lecture: "Week 2 — Gradient Descent and Backpropagation", slide: 4 }
    ]
  },
  {
    id: 'topic-backprop',
    keywords: [/backprop/i, /chain\s*rule/i, /backward\s*pass/i, /forward\s*pass/i, /computational\s*graph/i],
    text: "Backpropagation is the chain rule applied systematically. In the **forward pass**, you compute each layer's output and store the intermediates. In the **backward pass**, you propagate derivatives from the loss back through the network, reusing those stored values.\n\nThe beauty is that each derivative is **local** — it depends only on quantities the layer already computed. That locality is what makes the algorithm efficient and is what enables automatic differentiation frameworks like PyTorch and JAX.\n\nThe challenge is **depth**. Each layer multiplies the gradient by an activation derivative. For sigmoid, that factor is at most 0.25, so through 10 layers the gradient can shrink by a factor of $10^{-6}$. This is the vanishing gradient problem, and it is why ReLU (derivative = 1 for positive inputs) replaced sigmoid as the default activation.",
    citations: [
      { lecture: "Week 2 — Gradient Descent and Backpropagation", slide: 6 },
      { lecture: "Week 2 — Gradient Descent and Backpropagation", slide: 9 }
    ]
  },
  {
    id: 'topic-relu',
    keywords: [/relu/i, /activation\s*function/i, /\bsigmoid\b/i, /\btanh\b/i, /vanishing/i, /dead\s*(neuron|unit)/i],
    text: "The choice of activation function has a dramatic effect on training dynamics.\n\n**Sigmoid**: $\\sigma(z) = \\frac{1}{1 + e^{-z}}$ — squashes to $(0,1)$, derivative peaks at 0.25. Causes vanishing gradients in deep networks because each layer multiplies the gradient by at most 0.25.\n\n**ReLU**: $f(z) = \\max(0, z)$ — derivative is exactly 1 for positive inputs, solving the vanishing gradient problem. The downside is **dead units**: if a neuron's pre-activation is always negative, its gradient is always zero and it never recovers.\n\n**Leaky ReLU** and **ELU** address this by allowing a small gradient for negative inputs.\n\nThe practical default today is ReLU or one of its variants, used in nearly every modern architecture. The course covers this transition in Week 2 as part of the discussion on what makes deep networks trainable.",
    citations: [
      { lecture: "Week 2 — Gradient Descent and Backpropagation", slide: 11 },
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 8 }
    ]
  },
  {
    id: 'topic-regularization',
    keywords: [/regulariz/i, /\bl1\b/i, /\bl2\b/i, /ridge/i, /lasso/i, /weight\s*decay/i, /dropout/i, /penalty/i],
    text: "Regularization adds a penalty to the loss function that discourages model complexity.\n\n**L2 (Ridge)** adds $\\lambda \\|w\\|_2^2$ — it shrinks all weights toward zero but rarely makes them exactly zero. It is the sensible default.\n\n**L1 (Lasso)** adds $\\lambda \\|w\\|_1$ — it drives some weights to exactly zero, effectively performing feature selection. Use it when you want a sparse, interpretable model.\n\n**Dropout** randomly zeroes activations during training, forcing the network to learn redundant representations. It acts as an ensemble method.\n\n**Early stopping** halts training when validation loss stops improving. It is essentially free and should always be used.\n\nThe unifying idea is that all regularization techniques trade a small increase in training error for a large decrease in test error. They encode the prior that simpler models generalise better.",
    citations: [
      { lecture: "Week 3 — Regularization and Generalization", slide: 14 },
      { lecture: "Week 3 — Regularization and Generalization", slide: 13 }
    ]
  },
  {
    id: 'topic-features',
    keywords: [/feature/i, /input/i, /dimension/i, /\bx\b.*variable/i, /predictor/i, /attribute/i],
    text: "Features are the inputs to your model — the individual measurable properties of each data point. In the course's notation, each example $x_i$ is a vector of $d$ features.\n\nGood features are the single biggest determinant of model performance. A simple model with good features will outperform a complex model with bad ones.\n\nThe course starts with raw features in Week 1 and progressively shows how:\n- **Feature scaling** (standardisation) keeps gradient descent well-conditioned\n- **Polynomial features** let a linear model capture nonlinear relationships\n- **Regularization** (Week 3) handles the curse of dimensionality when features are numerous\n\nThe deep networks covered later in the course learn features automatically, which is why they are so powerful — but also why they need so much data.",
    citations: [
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 2 },
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 3 }
    ]
  },
  {
    id: 'topic-classification',
    keywords: [/classif/i, /logistic/i, /\bsvm\b/i, /decision\s*boundary/i, /\bclass\b/i, /\blabel/i, /binary/i],
    text: "Classification is the supervised learning task where the target is a discrete label rather than a continuous value.\n\nThe simplest approach is **logistic regression**, which passes the linear model output through a sigmoid to produce a probability:\n\n$$P(y=1 | x) = \\sigma(w^T x + b)$$\n\nThe decision boundary is the hyperplane where $w^T x + b = 0$ — on one side the model predicts class 1, on the other class 0.\n\nThe loss function for classification is **cross-entropy** rather than MSE, because cross-entropy penalises confident wrong predictions much more heavily. This is covered in the transition from regression to classification in Week 1.\n\nThe course builds from here to multi-class classification, where softmax replaces sigmoid and cross-entropy generalises naturally.",
    citations: [
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 7 },
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 8 }
    ]
  },
  {
    id: 'topic-neural-networks',
    keywords: [/neural\s*net/i, /deep\s*learn/i, /\blayer/i, /hidden\s*layer/i, /perceptron/i, /mlp/i, /\bnn\b/i, /neuron/i],
    text: "A neural network is a composition of linear transformations interleaved with nonlinear activation functions. Each layer computes:\n\n$$a^{(l)} = \\sigma(W^{(l)} a^{(l-1)} + b^{(l)})$$\n\nThe power comes from depth: a two-layer network can approximate any continuous function (universal approximation theorem), but depth makes the approximation exponentially more efficient.\n\nThe course builds to neural networks through a careful sequence:\n1. **Week 1**: Linear models — the foundation\n2. **Week 2**: Gradient descent and backpropagation — how to train them\n3. **Week 3**: Regularization — how to prevent overfitting when models are powerful\n\nThe key insight is that everything covered in the course — loss functions, gradients, regularization — applies directly to neural networks. The only new ingredient is the chain rule applied to deeper compositions.",
    citations: [
      { lecture: "Week 2 — Gradient Descent and Backpropagation", slide: 6 },
      { lecture: "Week 2 — Gradient Descent and Backpropagation", slide: 7 }
    ]
  }
]

/**
 * Generic fallback responses when no specific topic matches.
 * Rotated based on a hash of the input to avoid repetition.
 */
const GENERIC_RESPONSES = [
  {
    text: "That's a thoughtful question. Let me connect it to the course material.\n\nThe core framework in CS 4780 is: **choose a model** (hypothesis class), **define a loss** (what \"wrong\" means), and **optimise** (find parameters that minimise the loss).\n\nEvery topic in the course — from linear regression to regularization — fits into this framework. Could you rephrase your question in terms of one of these three steps? That will help me give you a more specific answer grounded in the lecture material.",
    citations: [
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 2 }
    ]
  },
  {
    text: "Good question — let me point you to the relevant course concepts.\n\nThe three weeks we have covered so far build on each other:\n\n1. **Week 1 — Linear Models**: the mathematical foundation, how to define what \"good\" means through loss functions\n2. **Week 2 — Optimisation**: how to actually find the best parameters when a closed-form solution doesn't exist\n3. **Week 3 — Generalization**: why training performance is misleading and how regularization helps\n\nWhich of these areas does your question relate to most closely? I can walk you through the specific lecture material.",
    citations: [
      { lecture: "Week 1 — Linear Models and Loss Functions", slide: 2 },
      { lecture: "Week 3 — Regularization and Generalization", slide: 15 }
    ]
  },
  {
    text: "Let me think about this in terms of the course content.\n\nThe fundamental tension in machine learning is between **fitting the training data** and **generalising to new data**. A model that memorises every training example has zero training error but tells you nothing about the world.\n\nThis is why the course spends Week 1 on models, Week 2 on how to train them, and Week 3 on how to prevent them from overfitting. Everything we cover serves this central story.\n\nIf you can tell me which part of this pipeline you're asking about, I can ground my answer more precisely in the lecture slides.",
    citations: [
      { lecture: "Week 3 — Regularization and Generalization", slide: 13 }
    ]
  }
]

/**
 * Simple hash for string -> index mapping (deterministic but varied).
 */
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/**
 * Find a topic-specific response for the user's question.
 * Returns a response object { text, citations } or null if no topic matches.
 */
export function findTopicResponse(userInput) {
  if (!userInput || typeof userInput !== 'string') return null

  const input = userInput.trim().toLowerCase()

  for (const topic of TOPIC_RESPONSES) {
    for (const pattern of topic.keywords) {
      if (pattern.test(input)) {
        return {
          id: topic.id,
          text: topic.text,
          citations: topic.citations,
        }
      }
    }
  }

  return null
}

/**
 * Get a generic fallback response (rotated by input hash to avoid repetition).
 */
export function getGenericResponse(userInput) {
  const hash = simpleHash(userInput || '')
  const idx = hash % GENERIC_RESPONSES.length
  return {
    id: 'generic-' + idx,
    text: GENERIC_RESPONSES[idx].text,
    citations: GENERIC_RESPONSES[idx].citations,
  }
}
