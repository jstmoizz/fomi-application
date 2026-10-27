// Client-side wrappers around the mock API. Throw with the server's message on failure.

const OFFLINE = "You’re offline or the server didn’t respond. Check your connection and retry.";

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    // fetch rejects with a bare TypeError ("Failed to fetch") on network failure; aborts must pass through.
    throw e.name === "AbortError" ? e : new Error(OFFLINE);
  }
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
