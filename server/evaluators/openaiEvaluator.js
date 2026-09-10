const rubric = [
  { key: "requirements", name: "Requirement understanding", weight: 15 },
  { key: "responsibilities", name: "Class responsibilities", weight: 20 },
  { key: "coupling", name: "Coupling & cohesion", weight: 15 },
  { key: "encapsulation", name: "Encapsulation & interfaces", weight: 10 },
  { key: "abstraction", name: "Abstraction / pattern fit", weight: 10 },
  { key: "extensibility", name: "Extensibility", weight: 15 },
  { key: "edgeCases", name: "Edge cases & testability", weight: 10 },
  { key: "explanation", name: "Explanation & trade-offs", weight: 5 }
];

export class OpenAIEvaluator {
  constructor({ apiKey, model }) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async evaluate(problem, submission) {
    const prompt = {
      problem,
      submission,
      rubric,
      outputShape: {
        score: "integer 0-100",
        summary: "string",
        criteria: [
          {
            key: "rubric key",
            name: "criterion name",
            weight: "number",
            score: "number 0-10",
            evidence: "specific evidence from submission",
            concern: "specific concern",
            suggestion: "specific improvement",
            confidence: "low|medium|high"
          }
        ],
        nextSteps: ["string", "string", "string"]
      }
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: [
          {
            role: "system",
            content:
              "You are a senior software engineer reviewing an LLD interview design. Evaluate the candidate against the supplied rubric. There can be multiple valid designs. Do not reward pattern names unless they solve a real change point. Return only valid JSON matching the requested shape."
          },
          {
            role: "user",
            content: JSON.stringify(prompt)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI evaluator returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.output_text || "";
    const parsed = JSON.parse(text);
    return { ...parsed, evaluator: "openai" };
  }
}
