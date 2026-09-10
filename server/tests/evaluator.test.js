import test from "node:test";
import assert from "node:assert/strict";
import { RuleBasedEvaluator } from "../evaluators/ruleBasedEvaluator.js";

test("produces a structured rubric result", async () => {
  const evaluator = new RuleBasedEvaluator();
  const result = await evaluator.evaluate(
    { id: "parking-lot" },
    {
      assumptions: "Requirements and assumptions define scope and constraints.",
      classes: "ParkingLot has clear responsibility; PricingStrategy is an interface.",
      relationships: "Use composition and dependency injection to reduce coupling.",
      tradeoffs: "Strategy lets new pricing rules extend without changing callers.",
      edgeCases: "Handle full capacity, invalid input, duplicate operations and failures."
    }
  );

  assert.equal(typeof result.score, "number");
  assert.equal(result.criteria.length, 8);
  assert.ok(result.criteria.every((item) => item.evidence));
});
