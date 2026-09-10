# AI_USAGE.md

## 1. Product scope

**AI suggested:** Support code, UML, free-form text, and an AI interviewer from the start.

**Decision:** Rejected the broad scope for the 2-day MVP. I chose a structured design submission because it provides enough evidence for meaningful LLD evaluation while keeping the practice loop reliable and demonstrable.

## 2. Evaluation model

**AI suggested:** A single overall score such as "rate this design out of 100".

**Decision:** Rejected. The evaluator uses a fixed rubric:
- requirement understanding
- class responsibilities
- coupling/cohesion
- encapsulation/interfaces
- abstraction/pattern fit
- extensibility
- edge cases/testability
- explanation/trade-offs

Each criterion contains score, evidence, concern, suggestion, and confidence.

## 3. Architecture

**AI suggested:** Separate services for problems, submissions, evaluation, and analytics.

**Decision:** Rejected for this assignment. A modular monolith gives the same domain boundaries with much lower operational complexity. The evaluator is an interface, so it can be extracted later if evaluation volume or latency justifies it.

## 4. Persistence

**AI suggested:** MongoDB immediately.

**Decision:** Rejected as a hard dependency for the demo. A JSON repository keeps setup to `npm install && npm run dev`, while the repository interface allows MongoDB to be introduced later without changing the domain service.

## 5. AI reliability

**AI suggested:** Let the model decide whether the design is "good".

**Decision:** Rejected. The model receives a fixed rubric and must return schema-constrained JSON. Deterministic checks remain responsible for submission completeness and known structural requirements.
