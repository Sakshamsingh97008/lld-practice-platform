import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ProblemRepository } from "./repositories/problemRepository.js";
import { AttemptRepository } from "./repositories/attemptRepository.js";
import { RuleBasedEvaluator } from "./evaluators/ruleBasedEvaluator.js";
import { OpenAIEvaluator } from "./evaluators/openaiEvaluator.js";
import { PracticeService } from "./services/practiceService.js";
import { createRoutes } from "./routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "data");
const problemRepository = new ProblemRepository(join(dataDir, "problems.json"));
const attemptRepository = new AttemptRepository(join(dataDir, "attempts.json"));

const evaluator =
  process.env.EVALUATOR === "ai" && process.env.OPENAI_API_KEY
    ? new OpenAIEvaluator({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || "gpt-5.6-mini"
      })
    : new RuleBasedEvaluator();

const service = new PracticeService({
  problemRepository,
  attemptRepository,
  evaluator
});

app.use("/api", createRoutes(service));

const clientDist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
app.use(express.static(clientDist));
app.get("*splat", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(join(clientDist, "index.html"));
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`LLD API running on http://localhost:${port}`);
  console.log(`Evaluator: ${evaluator.constructor.name}`);
});
