const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
  return request('/api/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function saveStudentHistory(studentId, payload) {
  return request(`/api/students/${studentId}/history`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchStudentHistory(studentId, limit = 10) {
  return request(`/api/students/${studentId}/history?limit=${limit}`);
}
