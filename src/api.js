async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  problems: () => request("/api/problems"),
  problem: (id) => request(`/api/problems/${id}`),
  attempts: () => request("/api/attempts"),
  createAttempt: (body) =>
    request("/api/attempts", { method: "POST", body: JSON.stringify(body) }),
  evaluate: (id) =>
    request(`/api/attempts/${id}/evaluate`, { method: "POST" }),
  retry: (id) =>
    request(`/api/attempts/${id}/retry`, { method: "POST" })
};
