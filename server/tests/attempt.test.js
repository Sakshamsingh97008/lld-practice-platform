import test from "node:test";
import assert from "node:assert/strict";
import { transition } from "../domain/attempt.js";

test("moves submitted attempt to evaluating", () => {
  const attempt = { status: "SUBMITTED" };
  assert.equal(transition(attempt, "EVALUATING").status, "EVALUATING");
});

test("rejects invalid lifecycle transition", () => {
  assert.throws(
    () => transition({ status: "COMPLETED" }, "EVALUATING"),
    /Invalid attempt transition/
  );
});
