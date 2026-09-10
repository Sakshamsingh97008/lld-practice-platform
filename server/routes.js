import { Router } from "express";

export function createRoutes(service) {
  const router = Router();

  router.get("/problems", async (req, res) => {
    res.json(await service.listProblems());
  });

  router.get("/problems/:id", async (req, res) => {
    const problem = await service.getProblem(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  });

  router.get("/attempts", async (req, res) => {
    res.json(await service.listAttempts());
  });

  router.get("/attempts/:id", async (req, res) => {
    const attempt = await service.getAttempt(req.params.id);
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    res.json(attempt);
  });

  router.post("/attempts", async (req, res) => {
    try {
      const attempt = await service.createAttempt(req.body);
      res.status(201).json(attempt);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/attempts/:id/evaluate", async (req, res) => {
    try {
      const attempt = await service.evaluateAttempt(req.params.id);
      res.json(attempt);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/attempts/:id/retry", async (req, res) => {
    try {
      const attempt = await service.retryAttempt(req.params.id);
      res.status(201).json(attempt);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
