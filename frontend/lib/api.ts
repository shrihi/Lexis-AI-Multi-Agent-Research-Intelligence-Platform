import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiWatch = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  responseType: 'text',
});

// Research API
export async function startResearch(
  query: string,
  depth: number
) {
  return api
    .post('/api/research/start', {
      query,
      depth,
    })
    .then((res) => res.data);
}

// SSE API
export async function streamResearch(
  sessionId: string
) {
  const eventSource = new EventSource(
    `${API_URL}/api/research/stream/${sessionId}`
  );

  return new Promise((resolve, reject) => {
    eventSource.onmessage = (e) => {
      resolve(e.data);
    };

    eventSource.onerror = (e) => {
      reject(e);
    };
  });
}

// Report API
export async function getReport(
  sessionId: string
) {
  return api
    .get(`/api/research/report/${sessionId}`)
    .then((res) => res.data);
}

// Memory API
export async function searchMemory(
  q: string,
  n: number = 5
) {
  return api
    .get(`/api/memory/search?q=${q}&n=${n}`)
    .then((res) => res.data);
}

export async function getAllSessions() {
  return api
    .get('/api/memory/all')
    .then((res) => res.data);
}

export async function deleteSession(
  sessionId: string
) {
  return api
    .delete(`/api/memory/${sessionId}`)
    .then((res) => res.data);
}