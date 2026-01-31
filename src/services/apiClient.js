const FUNCTIONS_BASE_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function request(path, options = {}) {
  if (!FUNCTIONS_BASE_URL || !ANON_KEY) {
    throw new Error('Supabase Edge Functions environment variables are missing');
  }

  const response = await fetch(`${FUNCTIONS_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'API request failed');
  }

  return response.json();
}

export function createStudent(payload) {
  return request('/create-student', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function saveStudentHistory(studentId, payload) {
  return request('/save-history', {
    method: 'POST',
    body: JSON.stringify({ studentId, ...payload }),
  });
}

export function fetchStudentHistory(studentId, limit = 10) {
  return request(`/get-history?studentId=${studentId}&limit=${limit}`);
}

export function fetchStudent(studentId) {
  return request(`/get-student?studentId=${studentId}`);
}
