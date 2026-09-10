import crypto from "node:crypto";
import { validateSubmission } from "../domain/submission.js";
import { transition } from "../domain/attempt.js";

export class PracticeService {
  constructor({ problemRepository, attemptRepository, evaluator }) {
    this.problemRepository = problemRepository;
    this.attemptRepository = attemptRepository;
    this.evaluator = evaluator;
  }

  async listProblems() {
    return this.problemRepository.findAll();
  }

  async getProblem(id) {
    return this.problemRepository.findById(id);
  }

  async listAttempts() {
    return this.attemptRepository.findAll();
  }

  async getAttempt(id) {
    return this.attemptRepository.findById(id);
  }

  async createAttempt({ problemId, submission }) {
    const problem = await this.problemRepository.findById(problemId);
    if (!problem) throw new Error("Problem not found");

    const validation = validateSubmission(submission);
    if (!validation.valid) throw new Error(validation.errors.join(" "));

    const now = new Date().toISOString();
    const attempt = {
      id: crypto.randomUUID(),
      problemId,
      submission,
      status: "SUBMITTED",
      evaluation: null,
      createdAt: now,
      updatedAt: now
    };

    return this.attemptRepository.save(attempt);
  }

  async evaluateAttempt(id) {
    const attempt = await this.attemptRepository.findById(id);
    if (!attempt) throw new Error("Attempt not found");
    if (["COMPLETED", "EVALUATING"].includes(attempt.status)) {
      if (attempt.status === "COMPLETED") return attempt;
      throw new Error("Attempt is already being evaluated");
    }

    const problem = await this.problemRepository.findById(attempt.problemId);
    const evaluating = transition(attempt, "EVALUATING");
    await this.attemptRepository.save(evaluating);

    try {
      const evaluation = await this.evaluator.evaluate(problem, attempt.submission);
      return this.attemptRepository.save(
        transition(
          { ...evaluating, evaluation, updatedAt: new Date().toISOString() },
          "COMPLETED"
        )
      );
    } catch (error) {
      const failed = transition(
        {
          ...evaluating,
          evaluation: {
            score: 0,
            summary: "Evaluation failed. Your submission is safe and can be evaluated again.",
            criteria: [],
            error: error.message
          },
          updatedAt: new Date().toISOString()
        },
        "FAILED"
      );
      return this.attemptRepository.save(failed);
    }
  }

  async retryAttempt(id) {
    const attempt = await this.attemptRepository.findById(id);
    if (!attempt) throw new Error("Attempt not found");

    const now = new Date().toISOString();
    const retry = {
      id: crypto.randomUUID(),
      problemId: attempt.problemId,
      submission: { ...attempt.submission },
      status: "SUBMITTED",
      evaluation: null,
      createdAt: now,
      updatedAt: now,
      previousAttemptId: attempt.id
    };

    return this.attemptRepository.save(retry);
  }
}
