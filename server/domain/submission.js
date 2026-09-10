const fields = [
  ["assumptions", 30],
  ["classes", 30],
  ["relationships", 20],
  ["tradeoffs", 30],
  ["edgeCases", 20]
];

export function validateSubmission(submission = {}) {
  const errors = [];

  for (const [field, minLength] of fields) {
    if (typeof submission[field] !== "string" || submission[field].trim().length < minLength) {
      errors.push(`${field} must contain at least ${minLength} characters.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
