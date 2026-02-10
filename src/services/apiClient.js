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

/**
 * 학습 히스토리 저장 및 포인트/뱃지 지급
 * @param {string} studentId
 * @param {object} payload - activityType, inputText, outputText, [extraPoints], [badgeKey]
 * @returns {Promise<object>} - 저장된 활동 + pointsAwarded, totalPoints, badgesEarned (선택)
 */
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

/**
 * 학원 내 포인트 랭킹 (상위 N명)
 * @param {number} limit - 조회할 인원 수 (기본 50, 최대 100)
 * @returns {Promise<Array<{ rank, studentId, name, points }>>}
 */
export function fetchLeaderboard(limit = 50) {
  return request(`/get-leaderboard?limit=${limit}`);
}

export function findStudentsByName(name) {
  return request(`/find-student?name=${encodeURIComponent(name)}`);
}

/** 단어장: 목록 조회 */
export function fetchVocabulary(studentId, limit = 200) {
  return request(`/get-vocabulary?studentId=${studentId}&limit=${limit}`);
}

/** 단어장: 단어 추가 */
export function addVocabulary(studentId, { word, meaning }) {
  return request('/add-vocabulary', {
    method: 'POST',
    body: JSON.stringify({ studentId, word, meaning: meaning ?? '' }),
  });
}

/** 단어장: 단어 삭제 */
export function deleteVocabulary(studentId, id) {
  return request('/delete-vocabulary', {
    method: 'POST',
    body: JSON.stringify({ studentId, id }),
  });
}

/**
 * 학급 요약 대시보드 (제출률, 평균 점수, 최다 오류, 활동 학생 수, 오류 유형별 분포)
 * @returns {Promise<{ submissionRate, averageScore, topError, activeStudentsToday, errorDistribution }>}
 */
export function fetchClassSummary() {
  return request('/get-class-summary');
}
