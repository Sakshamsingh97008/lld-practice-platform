# Design Note

## MVP user flow

```text
Problem list
   ↓
Problem detail
   ↓
Start attempt
   ↓
Structured design form
   ↓
Submit
   ↓
Persist attempt as SUBMITTED
   ↓
Evaluate
   ↓
COMPLETED / FAILED
   ↓
Rubric feedback + score
   ↓
History
   ↓
Improve this attempt
```

## Domain model

### Problem

Owns the prompt, requirements, difficulty and rubric metadata.

### Attempt

Owns the learner's practice lifecycle and links a problem to a submission and evaluation.

States:

```text
DRAFT → SUBMITTED → EVALUATING → COMPLETED
                           └────→ FAILED
```

### Submission

Represents learner evidence. The MVP uses `DesignSubmission`, but the interface is deliberately format-independent.

Future implementations could be:
- `DiagramSubmission`
- `CodeSubmission`
- `CombinedSubmission`

### Evaluation

Stores the result of evaluating an attempt. It is not part of the submission itself because evaluation may fail, be retried, or be performed by a different evaluator later.

### Evaluator

```text
interface Evaluator {
  evaluate(problem, submission): Promise<EvaluationResult>
}
```

Implementations:
- `RuleBasedEvaluator`
- `OpenAIEvaluator`

A future `HumanEvaluator` can implement the same contract.

## Rubric

The MVP evaluates:

| Criterion | Weight |
|---|---:|
| Requirement understanding | 15% |
| Class responsibilities | 20% |
| Coupling & cohesion | 15% |
| Encapsulation & interfaces | 10% |
| Abstraction / pattern fit | 10% |
| Extensibility | 15% |
| Edge cases & testability | 10% |
| Explanation / trade-offs | 5% |

The score is not treated as absolute truth. It is a compact progress signal; evidence and suggestions are the learning output.

## Deterministic vs AI evaluation

### Deterministic

- required fields present
- minimum content
- duplicate/empty submissions
- state transition validity
- known problem-specific keywords and requirements

### AI

- responsibility quality
- coupling/cohesion
- abstraction quality
- trade-off reasoning
- extensibility
- nuanced improvement suggestions

This split avoids asking an LLM to do things that code can verify reliably.

## Failure handling

Submission is stored before evaluation. If evaluation fails:
- attempt remains persisted;
- status becomes `FAILED`;
- the learner can retry evaluation;
- no work is lost.

The prototype evaluates synchronously from the API perspective for simplicity, but the domain state is asynchronous-ready. In production, evaluation would move behind a small job queue/worker if latency or volume justified it.

## Change test A: submission format

Today:

```text
Attempt → DesignSubmission
```

Later:

```text
Attempt → Submission
            ├── DesignSubmission
            ├── DiagramSubmission
            └── CodeSubmission
```

The practice service depends on the abstraction, not on textarea-specific fields.

## Change test B: evaluator

Today:

```text
PracticeService → Evaluator
                       └── RuleBasedEvaluator
```

Later:

```text
PracticeService → Evaluator
                       ├── RuleBasedEvaluator
                       ├── OpenAIEvaluator
                       └── HumanEvaluator
```

No practice-flow rewrite is required.

## Light HLD consideration

For a larger product, the first component to separate would be evaluation execution because it can be slow, expensive and independently retryable.

A simple production shape would be:

```text
Web/API → DB
           |
           +→ Evaluation Queue → Evaluator Worker → DB
```

No microservices are needed for the rest of the domain at this stage.
