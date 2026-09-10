import test from "node:test";
import assert from "node:assert/strict";
import { validateSubmission } from "../domain/submission.js";

const good = {
  assumptions: "We support multiple floors and define capacity, vehicle compatibility, and pricing scope.",
  classes: "ParkingLot owns floors, Floor owns spots, Vehicle owns vehicle data, and PricingStrategy owns fee calculation.",
  relationships: "ParkingLot composes floors; a floor composes spots; the lot depends on interfaces for allocation and pricing.",
  tradeoffs: "I prefer composition and Strategy so a new pricing rule can be introduced without changing ParkingLot.",
  edgeCases: "Handle full lot, invalid vehicle type, missing ticket, duplicate unpark requests, and pricing failures."
};

test("accepts a complete submission", () => {
  assert.equal(validateSubmission(good).valid, true);
});

test("rejects incomplete submissions", () => {
  const result = validateSubmission({ ...good, classes: "too short" });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /classes/);
});
