// Client-side wrappers around the mock API. Throw with the server's message on failure.

async function request(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export function fetchGenerations(cursor) {
  return request(`/api/generations?cursor=${cursor}`);
}

export function createGeneration(params, signal) {
  return request("/api/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal,
  });
}
