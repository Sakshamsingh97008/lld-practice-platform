const transitions = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["EVALUATING"],
  EVALUATING: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: []
};

export function transition(attempt, nextStatus) {
  if (!transitions[attempt.status]?.includes(nextStatus)) {
    throw new Error(`Invalid attempt transition: ${attempt.status} → ${nextStatus}`);
  }
  return { ...attempt, status: nextStatus, updatedAt: new Date().toISOString() };
}

export const ATTEMPT_STATUSES = Object.freeze([
  "DRAFT",
  "SUBMITTED",
  "EVALUATING",
  "COMPLETED",
  "FAILED"
]);
