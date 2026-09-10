const RUBRIC = [
  ["requirements", "Requirement understanding", 15],
  ["responsibilities", "Class responsibilities", 20],
  ["coupling", "Coupling & cohesion", 15],
  ["encapsulation", "Encapsulation & interfaces", 10],
  ["abstraction", "Abstraction / pattern fit", 10],
  ["extensibility", "Extensibility", 15],
  ["edgeCases", "Edge cases & testability", 10],
  ["explanation", "Explanation & trade-offs", 5]
];

function scoreCriterion(submission, key) {
  const text = [
    submission.assumptions,
    submission.classes,
    submission.relationships,
    submission.tradeoffs,
    submission.edgeCases
  ].join(" ").toLowerCase();

  const signals = {
    requirements: ["requirement", "assumption", "scope", "constraint"],
    responsibilities: ["responsibility", "single responsibility", "cohes", "service", "manager"],
    coupling: ["coupling", "depend", "composition", "delegat"],
    encapsulation: ["private", "interface", "encaps", "public api", "abstraction"],
    abstraction: ["strategy", "factory", "observer", "interface", "polymorphism", "composition"],
    extensibility: ["extend", "new type", "without changing", "open/closed", "future"],
    edgeCases: ["edge", "failure", "invalid", "concurrent", "duplicate", "empty", "capacity"],
    explanation: ["trade-off", "why", "alternative", "reason", "chosen"]
  };

  const matches = (signals[key] || []).filter((signal) => text.includes(signal)).length;
  const base = Math.min(10, 4 + matches * 1.4);
  return Math.round(base * 10) / 10;
}

export class RuleBasedEvaluator {
  async evaluate(problem, submission) {
    const criteria = RUBRIC.map(([key, name, weight]) => {
      const score = scoreCriterion(submission, key);
      const pct = score / 10;
      const concern =
        score >= 8
          ? "No major gap detected by the deterministic review."
          : "Add concrete evidence and explain how the design behaves under change.";

      return {
        key,
        name,
        weight,
        score,
        evidence: evidenceFor(key, submission),
        concern,
        suggestion: suggestionFor(key),
        confidence: "medium"
      };
    });

    const weighted = criteria.reduce((sum, c) => sum + c.score * c.weight, 0) / 10;
    const score = Math.round(weighted);

    return {
      evaluator: "rule-based",
      score,
      summary:
        score >= 80
          ? "Strong foundation. The next improvement should focus on making trade-offs and extension points more explicit."
          : score >= 60
            ? "Good start. The design covers the main structure, but several responsibilities and trade-offs need sharper evidence."
            : "The core idea is present, but the design needs more explicit responsibilities, relationships, and change reasoning.",
      criteria,
      nextSteps: [
        "Explain one concrete requirement change and what code would need to change.",
        "Identify one class that could become a dependency bottleneck and reduce that coupling.",
        "Add one failure/edge case and describe the expected behaviour."
      ],
      problemId: problem.id
    };
  }
}

function evidenceFor(key, submission) {
  const source = {
    requirements: submission.assumptions,
    responsibilities: submission.classes,
    coupling: submission.relationships,
    encapsulation: submission.classes,
    abstraction: submission.classes,
    extensibility: submission.tradeoffs,
    edgeCases: submission.edgeCases,
    explanation: submission.tradeoffs
  }[key] || "";

  return source.trim().slice(0, 220);
}

function suggestionFor(key) {
  return {
    requirements: "State explicit scope boundaries and assumptions before introducing classes.",
    responsibilities: "For each major class, state one primary responsibility and avoid god objects.",
    coupling: "Prefer composition and dependency injection where a collaborator may vary.",
    encapsulation: "Expose behaviour through small interfaces rather than leaking mutable state.",
    abstraction: "Use patterns only where they remove a real change point; avoid pattern-for-pattern's-sake.",
    extensibility: "Describe the next likely feature and show which class changes versus which stays stable.",
    edgeCases: "Cover invalid input, capacity/failure conditions, and duplicate or repeated operations.",
    explanation: "Name at least one alternative and explain why the chosen design is preferable."
  }[key];
}
