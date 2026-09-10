# LLD Practice Platform 
https://lld-practice-platform-5rag.onrender.com

A focused 2-day engineering assignment prototype for practicing Low-Level Design (LLD).

## Product thesis

The hardest part of LLD practice is not finding another problem. It is knowing **why a design is good or weak** and what to improve in the next attempt.

This MVP closes the loop:

**Choose problem → Design → Submit → Explainable feedback → Review history → Try again**

## MVP

- 4 curated LLD problems: Parking Lot, Vending Machine, Elevator, Rate Limiter
- Structured text submission:
  - assumptions
  - classes/responsibilities
  - relationships
  - design decisions/trade-offs
  - edge cases
- Deterministic pre-checks for completeness
- Pluggable evaluator interface
- Rule-based evaluator works with no API key
- Optional OpenAI evaluator adapter using a fixed rubric and structured JSON
- Evaluation state: `SUBMITTED → EVALUATING → COMPLETED/FAILED`
- Attempt history with previous feedback
- "Improve this attempt" flow pre-fills a new attempt
- REST API + React UI
- Automated backend tests for domain behaviour and failure cases

## Why structured text for the MVP?

Code execution and diagram editing add significant implementation cost. A structured design response still gives evidence about requirements, responsibilities, relationships, abstraction, trade-offs, and edge cases—the dimensions that matter for an LLD review.

The domain model deliberately keeps the submission format behind a `Submission` abstraction, so a future `DiagramSubmission` or `CodeSubmission` can be added without rewriting the practice flow.

## Architecture

```text
React UI
   |
   v
Express REST API
   |
   +--> PracticeService
   |       |
   |       +--> ProblemRepository
   |       +--> AttemptRepository
   |       +--> Evaluator
   |
   +--> RuleBasedEvaluator (default)
   |
   +--> OpenAIEvaluator (optional)
   |
   +--> JSON repositories
```

The JSON repository is intentional for a 2-day prototype: zero database setup, persistent history, and a clear repository seam for MongoDB/PostgreSQL later.

## Run

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

The Vite dev server proxies `/api` to Express on port 4000.

### Production build

```bash
npm run build
npm start
```

### Tests

```bash
npm test
```

## Optional AI evaluation

The prototype works without an API key. To use the LLM evaluator:

```bash
cp .env.example .env
```

Set:

```env
EVALUATOR=ai
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-5.6-mini
```

The AI evaluator is constrained by the same rubric as the deterministic evaluator and must return structured JSON. The server never sends the API key to the browser.

## API

- `GET /api/problems`
- `GET /api/problems/:id`
- `POST /api/attempts`
- `GET /api/attempts`
- `GET /api/attempts/:id`
- `POST /api/attempts/:id/evaluate`
- `POST /api/attempts/:id/retry`

## Key engineering decisions

1. **Structured submission instead of a free-form textarea**
   - Makes feedback evidence-based.
   - Makes deterministic completeness checks possible.
   - Keeps the UI simple.

2. **Evaluator as an interface**
   - `RuleBasedEvaluator` is reliable and free.
   - `OpenAIEvaluator` can be swapped in without changing the practice flow.
   - A future human reviewer can implement the same contract.

3. **Persist before evaluation**
   - Submission is not lost if evaluation fails.
   - Evaluation state is explicit.

4. **Rubric over reference-answer matching**
   - LLD has multiple valid designs.
   - We evaluate dimensions such as responsibility, coupling, abstraction, extensibility, and edge cases rather than checking for one canonical class diagram.

5. **Simple monolith**
   - Appropriate for the assignment.
   - The first component worth separating at scale is evaluation execution because it can be slow and independently retried.

## Limitations

- JSON persistence is single-process and not suitable for multi-instance production deployment.
- No authentication/authorization in the MVP.
- No executable code sandbox.
- No diagram editor.
- Rule-based evaluation is intentionally conservative.
- AI evaluation is optional and asynchronous behaviour is simulated within the API process.

## Suggested demo flow

1. Open Parking Lot.
2. Start an attempt.
3. Fill assumptions, classes, relationships, trade-offs and edge cases.
4. Submit.
5. Review the rubric score and evidence.
6. Open history.
7. Click "Improve this attempt".
8. Submit a second version and compare the score.

## Research basis

See `docs/RESEARCH.md`.

## Design note

See `docs/DESIGN.md`.

## AI usage

See `AI_USAGE.md`.
