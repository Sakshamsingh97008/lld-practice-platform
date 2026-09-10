# Research Note

## Learner problem

LLD practice is unusually difficult to self-evaluate because the task is open-ended. A learner may produce a design that compiles or looks plausible but still has poor responsibility boundaries, excessive coupling, weak abstractions, or an extension strategy that will become painful when requirements change.

The learner therefore needs more than a problem bank. The useful loop is:

**attempt → evidence-based review → understand the gap → retry**

The most valuable feedback is tied to something the learner actually wrote, rather than simply comparing the attempt to one "correct" solution.

## Existing approaches researched

### Hello Interview

Hello Interview offers guided LLD practice with common problems such as Connect Four, Amazon Locker, Elevator, Parking Lot, File System, Movie Ticket Booking, Logging Service and Rate Limiter. Its guided-practice model focuses on stepping through an interview and receiving personalized feedback.

**Observation:** Strong emphasis on guided practice and interview realism.

Source: https://www.hellointerview.com/practice/low-level-design

### LLDCanvas

LLDCanvas combines a UML editor, design patterns, practice problems, timed practice, analytics, runnable code and revision material.

**Observation:** A broad all-in-one toolkit is valuable, but it is significantly larger than what is necessary to validate the core practice-feedback loop in two days.

Source: https://www.lldcanvas.in/

### DesignGurus

DesignGurus provides a structured object-oriented design course with lessons, playgrounds and assessments.

**Observation:** Structured learning content is useful, but an MVP for this assignment should prioritize repeated practice and explainable feedback rather than becoming a course platform.

Source: https://www.designgurus.io/course/grokking-the-object-oriented-design-interview

### Open-source LLD Arena

LLD Arena combines LLD problems, a code editor, local Java compilation, hidden tests, rubric checks and an optional AI design grader.

**Observation:** Code execution is compelling when implementation correctness is part of the goal, but it increases sandboxing and language/runtime complexity. For this MVP, structured design text gives enough evidence to test the product thesis faster.

Source: https://github.com/mightbeanshuu/lld-arena

### Community discussion

LeetCode discussions repeatedly use Parking Lot and similar problems to discuss entities, relationships, vehicle management, availability and object responsibilities.

**Observation:** Common interview problems are familiar and therefore useful for a small MVP; Parking Lot is a strong first problem because it naturally exposes responsibility and strategy decisions.

Source: https://leetcode.com/discuss/post/5328221/Frequently-Asked-Low-Level-Design-/

## Product gap

The opportunity for this assignment is not to compete on breadth. It is to make a small practice loop that explains **why** an attempt can improve.

A focused MVP should therefore:
1. make the learner produce explicit design evidence;
2. evaluate against a rubric rather than a reference answer;
3. separate deterministic validation from judgment-heavy feedback;
4. retain attempts so improvement is visible;
5. keep evaluator and submission formats replaceable.

## Product direction

The prototype implements four problems and one structured submission format. The evaluation engine is pluggable and can run without an external AI provider. The UI is deliberately compact so most engineering effort goes into the domain and evaluation model.

## Key hypotheses

- H1: Structured design prompts produce more actionable feedback than one free-form answer.
- H2: Per-criterion evidence is more useful than a single score.
- H3: Seeing previous attempts encourages deliberate improvement.
- H4: A pluggable evaluator makes it possible to add AI or human review without coupling the practice flow to one evaluator.
