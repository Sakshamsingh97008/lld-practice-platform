import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const emptySubmission = {
  assumptions: "",
  classes: "",
  relationships: "",
  tradeoffs: "",
  edgeCases: ""
};

export default function App() {
  const [problems, setProblems] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [submission, setSubmission] = useState(emptySubmission);
  const [view, setView] = useState("problems");
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    const [p, a] = await Promise.all([api.problems(), api.attempts()]);
    setProblems(p);
    setAttempts(a);
  };

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  const stats = useMemo(() => {
    const completed = attempts.filter((a) => a.status === "COMPLETED");
    const avg = completed.length
      ? Math.round(completed.reduce((s, a) => s + a.evaluation.score, 0) / completed.length)
      : 0;
    return { completed: completed.length, avg };
  }, [attempts]);

  const start = (problem) => {
    setSelectedProblem(problem);
    setSubmission(emptySubmission);
    setSelectedAttempt(null);
    setError("");
    setView("practice");
  };

  const update = (key, value) =>
    setSubmission((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const attempt = await api.createAttempt({
        problemId: selectedProblem.id,
        submission
      });
      const evaluated = await api.evaluate(attempt.id);
      setSelectedAttempt(evaluated);
      setView("feedback");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const improve = async (attempt) => {
    setBusy(true);
    setError("");
    try {
      const next = await api.retry(attempt.id);
      setSelectedProblem(await api.problem(next.problemId));
      setSubmission(next.submission);
      setSelectedAttempt(null);
      setView("practice");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">LLD Practice</div>
          <div className="subtitle">Design. Submit. Understand. Improve.</div>
        </div>
        <nav>
          <button className={view === "problems" ? "active" : ""} onClick={() => setView("problems")}>
            Problems
          </button>
          <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>
            History <span className="nav-count">{attempts.length}</span>
          </button>
        </nav>
      </header>

      <main className="container">
        {error && <div className="error">{error}</div>}

        {view === "problems" && (
          <>
            <section className="hero">
              <div>
                <span className="eyebrow">INTERVIEW-STYLE PRACTICE</span>
                <h1>Build designs you can defend.</h1>
                <p>
                  Practice realistic LLD problems and get rubric-based feedback
                  that points to evidence in your own design.
                </p>
              </div>
              <div className="stats">
                <div><strong>{problems.length}</strong><span>problems</span></div>
                <div><strong>{stats.completed}</strong><span>reviews</span></div>
                <div><strong>{stats.avg || "—"}</strong><span>avg score</span></div>
              </div>
            </section>

            <div className="section-title">
              <div>
                <span className="eyebrow">PRACTICE SET</span>
                <h2>Choose a problem</h2>
              </div>
              <span className="muted">30–45 minutes each</span>
            </div>

            <div className="problem-grid">
              {problems.map((problem) => (
                <article className="card problem-card" key={problem.id}>
                  <div className="card-top">
                    <span className="difficulty">{problem.difficulty}</span>
                    <span className="muted">{problem.duration}</span>
                  </div>
                  <h3>{problem.title}</h3>
                  <p>{problem.summary}</p>
                  <div className="tags">
                    {problem.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <button className="primary full" onClick={() => start(problem)}>
                    Start practice →
                  </button>
                </article>
              ))}
            </div>
          </>
        )}

        {view === "practice" && selectedProblem && (
          <Practice
            problem={selectedProblem}
            submission={submission}
            update={update}
            submit={submit}
            busy={busy}
            back={() => setView("problems")}
          />
        )}

        {view === "feedback" && selectedAttempt && (
          <Feedback
            attempt={selectedAttempt}
            problem={selectedProblem}
            improve={improve}
            back={() => setView("history")}
            busy={busy}
          />
        )}

        {view === "history" && (
          <History
            attempts={attempts}
            problems={problems}
            open={(attempt) => {
              setSelectedAttempt(attempt);
              setSelectedProblem(problems.find((p) => p.id === attempt.problemId));
              setView("feedback");
            }}
            improve={improve}
          />
        )}
      </main>
    </div>
  );
}

function Practice({ problem, submission, update, submit, busy, back }) {
  return (
    <section>
      <button className="back" onClick={back}>← Back to problems</button>
      <div className="practice-layout">
        <aside className="card prompt-panel">
          <span className="eyebrow">{problem.difficulty} · {problem.duration}</span>
          <h1>{problem.title}</h1>
          <p>{problem.summary}</p>
          <h4>Requirements</h4>
          <ul>
            {problem.requirements.map((r) => <li key={r}>{r}</li>)}
          </ul>
          <div className="tip">
            <strong>Interview tip</strong>
            <span>State assumptions first. Prefer simple composition over patterns that do not solve a real change point.</span>
          </div>
        </aside>

        <div className="card form-panel">
          <div className="form-header">
            <div>
              <span className="eyebrow">YOUR DESIGN</span>
              <h2>Make your reasoning explicit</h2>
            </div>
            <span className="muted">All sections are required</span>
          </div>

          <Field label="1. Assumptions & scope" hint="What are you deliberately including or excluding?" value={submission.assumptions} onChange={(v) => update("assumptions", v)} placeholder="Example: I support multiple floors, four vehicle types, one active ticket per vehicle..." />
          <Field label="2. Classes & responsibilities" hint="Name important classes/interfaces and what each owns." value={submission.classes} onChange={(v) => update("classes", v)} placeholder="Example: ParkingLot coordinates floors; Floor owns spots; PricingStrategy calculates fees..." />
          <Field label="3. Relationships & interactions" hint="Explain composition, dependencies, interfaces and key flows." value={submission.relationships} onChange={(v) => update("relationships", v)} placeholder="Example: ParkingLot composes Floor objects and depends on a SpotAllocationStrategy..." />
          <Field label="4. Trade-offs & extensibility" hint="Explain one alternative and how your design handles a likely future change." value={submission.tradeoffs} onChange={(v) => update("tradeoffs", v)} placeholder="Example: Strategy is used for pricing because new pricing rules should not change ParkingLot..." />
          <Field label="5. Edge cases & testability" hint="Think about invalid input, failures, duplicates, concurrency or boundaries." value={submission.edgeCases} onChange={(v) => update("edgeCases", v)} placeholder="Example: full lot, invalid vehicle, duplicate exit, payment failure..." />

          <button className="primary submit" onClick={submit} disabled={busy}>
            {busy ? "Submitting & reviewing…" : "Submit for review →"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, hint, value, onChange, placeholder }) {
  return (
    <label className="field">
      <div className="field-title"><strong>{label}</strong><span>{hint}</span></div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows="4" />
    </label>
  );
}

function Feedback({ attempt, problem, improve, back, busy }) {
  const e = attempt.evaluation;
  return (
    <section>
      <button className="back" onClick={back}>← Back to history</button>
      <div className="feedback-head">
        <div>
          <span className="eyebrow">REVIEW COMPLETE</span>
          <h1>{problem?.title || "LLD Attempt"}</h1>
          <p className="muted">{new Date(attempt.createdAt).toLocaleString()} · Evaluator: {e.evaluator}</p>
        </div>
        <div className="score-ring"><strong>{e.score}</strong><span>/ 100</span></div>
      </div>

      <div className="summary card">
        <strong>Reviewer summary</strong>
        <p>{e.summary}</p>
      </div>

      <div className="criteria-grid">
        {e.criteria.map((c) => (
          <article className="card criterion" key={c.key}>
            <div className="criterion-head">
              <div><strong>{c.name}</strong><span>{c.weight}% weight</span></div>
              <b>{c.score}/10</b>
            </div>
            <div className="bar"><i style={{ width: `${c.score * 10}%` }} /></div>
            <p><strong>Evidence</strong><br />{c.evidence || "No specific evidence found."}</p>
            <p><strong>Concern</strong><br />{c.concern}</p>
            <p className="suggestion"><strong>Improve</strong><br />{c.suggestion}</p>
          </article>
        ))}
      </div>

      <div className="next card">
        <div>
          <span className="eyebrow">NEXT ATTEMPT</span>
          <h2>Turn feedback into another round</h2>
          <ul>{e.nextSteps?.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <button className="primary" disabled={busy} onClick={() => improve(attempt)}>
          Improve this attempt →
        </button>
      </div>
    </section>
  );
}

function History({ attempts, problems, open, improve }) {
  return (
    <section>
      <div className="section-title">
        <div>
          <span className="eyebrow">YOUR PROGRESS</span>
          <h1>Attempt history</h1>
        </div>
        <span className="muted">{attempts.length} total attempts</span>
      </div>

      {attempts.length === 0 ? (
        <div className="empty card">
          <h2>No attempts yet</h2>
          <p>Choose a problem and complete your first design review.</p>
        </div>
      ) : (
        <div className="history-list">
          {attempts.map((attempt) => {
            const problem = problems.find((p) => p.id === attempt.problemId);
            return (
              <article className="card history-row" key={attempt.id}>
                <div>
                  <span className="eyebrow">{problem?.difficulty || "LLD"}</span>
                  <h3>{problem?.title || attempt.problemId}</h3>
                  <span className="muted">{new Date(attempt.createdAt).toLocaleString()}</span>
                </div>
                <div className="history-score">
                  {attempt.evaluation ? <strong>{attempt.evaluation.score}<small>/100</small></strong> : <span>{attempt.status}</span>}
                </div>
                <div className="history-actions">
                  <button className="secondary" onClick={() => open(attempt)}>Review</button>
                  <button className="secondary" onClick={() => improve(attempt)}>Improve</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
