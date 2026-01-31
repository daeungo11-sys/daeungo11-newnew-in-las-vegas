import React, { useMemo, useState } from 'react';
import { generateText } from '../services/groqApi';
import {
  createStudent,
  fetchStudentHistory,
  saveStudentHistory,
} from '../services/apiClient';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import './ToeicPlatform.css';

const WEAKNESS_OPTIONS = [
  '문법: 시제/수일치',
  '문법: 가정법/조동사',
  '어휘: 비즈니스 표현',
  '어휘: 동의어/유의어',
  '독해: 지문 요약',
  '독해: 추론/의도 파악',
  '파트5: 문장 완성',
  '파트6: 문단 완성',
];

function ToeicPlatform() {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentError, setStudentError] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [activeView, setActiveView] = useState('student');

  const [paraphraseInput, setParaphraseInput] = useState('');
  const [paraphraseOutput, setParaphraseOutput] = useState('');
  const [paraphraseLoading, setParaphraseLoading] = useState(false);
  const [paraphraseError, setParaphraseError] = useState('');

  const [selectedWeaknesses, setSelectedWeaknesses] = useState([]);
  const [classNotes, setClassNotes] = useState('');
  const [practiceOutput, setPracticeOutput] = useState('');
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceError, setPracticeError] = useState('');

  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const [editorText, setEditorText] = useState('');
  const [editorError, setEditorError] = useState('');
  const [editorSubmitting, setEditorSubmitting] = useState(false);

  const [compareInput, setCompareInput] = useState('');

  const [activeTooltip, setActiveTooltip] = useState('');

  const weaknessText = useMemo(() => {
    if (selectedWeaknesses.length === 0) {
      return '없음';
    }
    return selectedWeaknesses.join(', ');
  }, [selectedWeaknesses]);

  const handleParaphraseSubmit = async (e) => {
    e.preventDefault();
    if (!paraphraseInput.trim() || paraphraseLoading) return;

    setParaphraseLoading(true);
    setParaphraseError('');
    setParaphraseOutput('');

    const prompt = `You are a TOEIC paraphrasing coach.
Given the student's sentence, rewrite it using common TOEIC-style expressions.
Return 3 paraphrase alternatives in English, each as a bullet point, and add a short Korean note about the key expression used.
Sentence: "${paraphraseInput.trim()}"`;

    try {
      const text = await generateText(prompt, {
        model: 'llama-3.1-8b-instant',
        temperature: 0.4,
        max_tokens: 600,
      });
      setParaphraseOutput(text.trim());

      if (studentId) {
        try {
          await saveStudentHistory(studentId, {
            activityType: 'PARAPHRASE',
            inputText: paraphraseInput.trim(),
            outputText: text.trim(),
          });
        } catch (saveError) {
          console.error('History Save Error:', saveError);
          setParaphraseError('히스토리 저장에 실패했어요. 학생 ID를 확인해주세요.');
        }
      } else {
        setParaphraseError('학생 ID를 설정하면 결과가 히스토리에 저장돼요.');
      }
    } catch (error) {
      console.error('Paraphrase Error:', error);
      setParaphraseError('문장을 분석하지 못했어요. API 키를 확인해주세요.');
    } finally {
      setParaphraseLoading(false);
    }
  };

  const toggleWeakness = (value) => {
    setSelectedWeaknesses((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const handlePracticePlan = async () => {
    if (practiceLoading) return;

    setPracticeLoading(true);
    setPracticeError('');
    setPracticeOutput('');

    const prompt = `You are an AI TOEIC coach for after-class repetition.
Create a personalized review plan based on the student's weaknesses.
Weaknesses: ${weaknessText}
Class notes: ${classNotes.trim() || '없음'}
Output must be in Korean and include:
1) 오늘 복습 루틴(15~20분) 2) 3일 반복 학습 플랜 3) 약점 보완용 미니 문제 5문항
Keep it concise and actionable.`;

    try {
      const text = await generateText(prompt, {
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 900,
      });
      setPracticeOutput(text.trim());

      if (studentId) {
        try {
          await saveStudentHistory(studentId, {
            activityType: 'PRACTICE_PLAN',
            inputText: `약점: ${weaknessText}\n수업 내용: ${classNotes.trim() || '없음'}`,
            outputText: text.trim(),
          });
        } catch (saveError) {
          console.error('History Save Error:', saveError);
          setPracticeError('히스토리 저장에 실패했어요. 학생 ID를 확인해주세요.');
        }
      } else {
        setPracticeError('학생 ID를 설정하면 결과가 히스토리에 저장돼요.');
      }
    } catch (error) {
      console.error('Practice Plan Error:', error);
      setPracticeError('복습 플랜을 만들 수 없어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!studentName.trim() || studentLoading) return;

    setStudentLoading(true);
    setStudentError('');
    try {
      const student = await createStudent({ name: studentName.trim() });
      setStudentId(student.id);
    } catch (error) {
      console.error('Student Create Error:', error);
      setStudentError('학생 정보를 생성할 수 없어요. 서버를 확인해주세요.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleLoadHistory = async () => {
    if (!studentId.trim() || historyLoading) return;

    setHistoryLoading(true);
    setHistoryError('');
    try {
      const items = await fetchStudentHistory(studentId.trim(), 10);
      setHistoryItems(items);
    } catch (error) {
      console.error('History Load Error:', error);
      setHistoryError('히스토리를 불러오지 못했어요. 학생 ID를 확인해주세요.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (value) => {
    try {
      return new Date(value).toLocaleString('ko-KR');
    } catch {
      return value;
    }
  };

  const aiSentenceParts = [
    { text: 'We ' },
    {
      text: 'regret',
      highlight: true,
      tooltip: '비즈니스 이메일에서 정중한 사과/유감 표현으로 자주 쓰입니다.',
    },
    { text: ' to ' },
    {
      text: 'inform',
      highlight: true,
      tooltip: 'TOEIC 빈출 공지 표현: inform you that ~ 형태가 자연스럽습니다.',
    },
    { text: ' you that the meeting has been ' },
    {
      text: 'postponed',
      highlight: true,
      tooltip: 'postpone은 공식 일정 변경 공지에 적합한 동사입니다.',
    },
    { text: '.' },
  ];

  const summaryCards = [
    { label: '제출률', value: '86%', helper: '지난 7일 기준' },
    { label: '평균 점수', value: '78점', helper: '문법+어휘+적합도 평균' },
    { label: '최다 오류', value: '시제/수일치', helper: '오류 32건' },
    { label: '활동 학생', value: '24명', helper: '오늘 참여' },
  ];

  const errorDistribution = [
    { name: '시제/수일치', value: 32 },
    { name: '전치사', value: 18 },
    { name: '동의어', value: 14 },
    { name: '관계사', value: 9 },
  ];

  const errorColors = ['#4f46e5', '#7c83f1', '#7dd3a6', '#c7d2fe'];

  const requiredPhrases = [
    'Due to unforeseen circumstances',
    'We would like to inform you that',
    'Please note that the schedule has been revised',
  ];

  const editorLength = editorText.trim().length;
  const requiredUsed = requiredPhrases.filter((phrase) =>
    editorText.toLowerCase().includes(phrase.toLowerCase())
  ).length;
  const progressPercent = Math.min(Math.round((editorLength / 180) * 100), 100);

  const handleEditorSubmit = async () => {
    if (editorSubmitting) return;
    if (!editorText.trim()) {
      setEditorError('작성한 문장이 없어요. 내용을 입력해주세요.');
      return;
    }

    setEditorSubmitting(true);
    setEditorError('');
    try {
      if (!studentId) {
        throw new Error('학생 ID가 없습니다.');
      }

      await saveStudentHistory(studentId, {
        activityType: 'WRITING_SUBMISSION',
        inputText: editorText.trim(),
        outputText: editorText.trim(),
      });
    } catch (error) {
      console.error('Writing Submit Error:', error);
      setEditorError('제출에 실패했어요. 학생 ID를 확인해주세요.');
    } finally {
      setEditorSubmitting(false);
    }
  };

  return (
    <div className="toeic-platform">
      <header className="platform-hero">
        <div className="hero-content">
          <h1>TOEIC Paraphrasing & Review Platform</h1>
          <p>
            학생이 작성한 문장을 토익 빈출 표현으로 바꿔주고, 수업 후 반복 학습과
            개인별 약점 보완까지 이어지는 학습 플랫폼입니다.
          </p>
        </div>
        <div className="hero-badges">
          <span>AI 문장 패러프레이징</span>
          <span>수업 후 반복 학습</span>
          <span>개인별 약점 보완</span>
        </div>
      </header>

      <div className="view-toggle">
        <button
          type="button"
          className={activeView === 'teacher' ? 'active' : ''}
          onClick={() => setActiveView('teacher')}
        >
          강사
        </button>
        <button
          type="button"
          className={activeView === 'student' ? 'active' : ''}
          onClick={() => setActiveView('student')}
        >
          학생
        </button>
      </div>

      {activeView === 'teacher' && (
        <>
          <section className="platform-section">
            <div className="section-header">
              <h2>학급 요약 대시보드</h2>
              <p>제출률과 평균 점수, 주요 오류를 한눈에 확인하세요.</p>
            </div>
            <div className="summary-grid">
              {summaryCards.map((card) => (
                <div key={card.label} className="summary-card">
                  <span className="summary-label">{card.label}</span>
                  <strong>{card.value}</strong>
                  <span className="summary-helper">{card.helper}</span>
                </div>
              ))}
            </div>
            <div className="chart-row">
              <div className="card chart-card">
                <div className="chart-header">
                  <h3>오류 유형별 분포</h3>
                  <span className="chart-helper">최근 7일 기준</span>
                </div>
                <div className="chart-area">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={errorDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {errorDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={errorColors[index % errorColors.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-legend">
                  {errorDistribution.map((item, index) => (
                    <div key={item.name} className="legend-item">
                      <span
                        className="legend-dot"
                        style={{
                          background: errorColors[index % errorColors.length],
                        }}
                      />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card report-card">
                <h3>오늘 수업에서 이 3가지는 꼭 설명하세요!</h3>
                <ol>
                  <li>시제/수일치 오류: 과거완료 vs 과거시제 구분</li>
                  <li>전치사 선택: in/on/at의 시간 표현 규칙</li>
                  <li>동의어 선택: inform/notify/advise 차이</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="platform-section">
            <div className="section-header">
              <h2>학생별 학습 히스토리</h2>
              <p>학생 활동 기록을 확인하고 코칭에 활용하세요.</p>
            </div>
            <div className="card">
              <div className="student-row">
                <div className="student-field">
                  <label htmlFor="student-id-teacher">학생 ID</label>
                  <input
                    id="student-id-teacher"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="학생 ID 입력"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLoadHistory}
                  disabled={historyLoading}
                >
                  {historyLoading ? '불러오는 중...' : '최근 히스토리 조회'}
                </button>
              </div>
              {historyError && <p className="error-text">{historyError}</p>}
              {historyItems.length > 0 && (
                <div className="history-list">
                  <h3>최근 학습 히스토리</h3>
                  <ul>
                    {historyItems.map((item) => (
                      <li key={item.id}>
                        <div className="history-meta">
                          <span className="history-type">{item.activityType}</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        <p className="history-input">{item.inputText}</p>
                        <details className="history-details">
                          <summary>결과 보기</summary>
                          <pre>{item.outputText}</pre>
                        </details>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {activeView === 'student' && (
        <>
          <section className="platform-section">
            <div className="section-header">
              <h2>내 학습 히스토리</h2>
              <p>
                학생을 생성하거나 ID를 입력하면, 생성된 결과를 자동으로 기록하고
                최근 기록을 조회할 수 있습니다.
              </p>
            </div>
            <div className="card">
              <div className="student-row">
                <div className="student-field">
                  <label htmlFor="student-name">학생 이름</label>
                  <input
                    id="student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="예: 홍길동"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateStudent}
                  disabled={studentLoading}
                >
                  {studentLoading ? '생성 중...' : '학생 ID 생성'}
                </button>
              </div>
              <div className="student-row">
                <div className="student-field">
                  <label htmlFor="student-id">학생 ID</label>
                  <input
                    id="student-id"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="생성된 ID 또는 기존 ID 입력"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLoadHistory}
                  disabled={historyLoading}
                >
                  {historyLoading ? '불러오는 중...' : '최근 히스토리 조회'}
                </button>
              </div>
              {studentError && <p className="error-text">{studentError}</p>}
              {historyError && <p className="error-text">{historyError}</p>}
              {historyItems.length > 0 && (
                <div className="history-list">
                  <h3>최근 학습 히스토리</h3>
                  <ul>
                    {historyItems.map((item) => (
                      <li key={item.id}>
                        <div className="history-meta">
                          <span className="history-type">{item.activityType}</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        <p className="history-input">{item.inputText}</p>
                        <details className="history-details">
                          <summary>결과 보기</summary>
                          <pre>{item.outputText}</pre>
                        </details>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

      <section className="platform-section">
        <div className="section-header">
          <h2>Step 1. 토익 패러프레이징 훈련</h2>
          <p>
            학생이 작성한 문장을 입력하면, 토익에서 자주 쓰는 표현으로 대체 문장을
            제안합니다.
          </p>
        </div>
        <form className="card document-card" onSubmit={handleParaphraseSubmit}>
          <label htmlFor="paraphrase-input">학생 문장 입력</label>
          <textarea
            id="paraphrase-input"
            placeholder="예: Our company decided to postpone the meeting."
            value={paraphraseInput}
            onChange={(e) => setParaphraseInput(e.target.value)}
            rows={4}
          />
          <button type="submit" disabled={paraphraseLoading}>
            {paraphraseLoading ? '분석 중...' : '토익 패러프레이징 제안 받기'}
          </button>
          {paraphraseError && <p className="error-text">{paraphraseError}</p>}
          {paraphraseOutput && (
            <div className="result-box">
              <h3>추천 대체 문장</h3>
              <pre>{paraphraseOutput}</pre>
            </div>
          )}
        </form>
      </section>

      <section className="platform-section">
        <div className="section-header">
          <h2>Step 1-2. 학습 지문 요약 & 영작 에디터</h2>
          <p>
            오늘 학습할 지문의 유형과 상황 요약을 확인하고, 핵심 구문을 참고해
            문장을 작성하세요.
          </p>
        </div>
        <div className="study-grid">
          <div className="study-left">
            <div className="badge-row">
              <span className="badge">Email</span>
              <span className="badge">News Article</span>
              <span className="badge">Announcement</span>
              <span className="badge soft">상황 요약: 회의 일정 변경 안내</span>
            </div>
            <div className="card phrase-card">
              <div className="phrase-header">
                <h3>핵심 토익 구문</h3>
                <p>작성 전 반드시 참고할 표현</p>
              </div>
              <ul className="phrase-list">
                <li>Due to unforeseen circumstances, ...</li>
                <li>We would like to inform you that ...</li>
                <li>Please note that the schedule has been revised.</li>
                <li>We appreciate your understanding and cooperation.</li>
              </ul>
            </div>
          </div>
          <div className="study-right">
            <div className="card editor-card">
              <div className="editor-header">
                <h3>비즈니스 문서 작성</h3>
                <span className="editor-hint">TOEIC 스타일로 정중하게 작성</span>
              </div>
              <textarea
                className="clean-editor"
                placeholder="여기에 문장을 작성하세요..."
                rows={10}
                value={editorText}
                onChange={(event) => setEditorText(event.target.value)}
              />
              <div className="editor-footer">
                <div className="progress-info">
                  <span>현재 글자 수: {editorLength} / 180</span>
                  <span>필수 표현 사용: {requiredUsed} / 3</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {editorError && <p className="error-text">{editorError}</p>}
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handleEditorSubmit}
                  disabled={editorSubmitting}
                >
                  {editorSubmitting ? '제출 중...' : '제출하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="platform-section">
        <div className="section-header">
          <h2>코드 비교형 패러프레이징 뷰</h2>
          <p>
            개발자 코드 비교 화면처럼 좌측에는 내 문장, 우측에는 AI 추천 문장을
            나란히 표시합니다.
          </p>
        </div>
        <div className="card compare-card">
          <div className="compare-header">
            <span>[내 문장]</span>
            <span>[AI 추천 문장]</span>
          </div>
          <div className="compare-body">
            <div className="compare-panel">
              <textarea
                className="compare-input"
                placeholder="여기에 문장을 입력하세요..."
                value={compareInput}
                onChange={(event) => setCompareInput(event.target.value)}
                rows={6}
              />
            </div>
            <div className="compare-panel">
              <p className="compare-text">
                {compareInput.trim()
                  ? aiSentenceParts.map((part, index) => {
                      if (!part.highlight) {
                        return <span key={index}>{part.text}</span>;
                      }
                      const isActive = activeTooltip === part.text;
                      return (
                        <span
                          key={index}
                          className={`highlight-word ${isActive ? 'active' : ''}`}
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            setActiveTooltip(isActive ? '' : part.text)
                          }
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              setActiveTooltip(isActive ? '' : part.text);
                            }
                          }}
                        >
                          {part.text}
                          {isActive && (
                            <span className="tooltip">{part.tooltip}</span>
                          )}
                        </span>
                      );
                    })
                  : '내 문장을 입력하면 AI 추천 문장이 표시됩니다.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="platform-section">
        <div className="section-header">
          <h2>Step 2. 수업 후 반복 학습 + 개인별 약점 보완</h2>
          <p>
            수업 후 바로 복습 루틴과 3일 반복 학습 플랜을 제공하고, 약점에 맞는
            미니 문제로 보완합니다.
          </p>
        </div>
        <div className="card">
          <div className="weakness-grid">
            {WEAKNESS_OPTIONS.map((option) => (
              <label key={option} className="weakness-chip">
                <input
                  type="checkbox"
                  checked={selectedWeaknesses.includes(option)}
                  onChange={() => toggleWeakness(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <label htmlFor="class-notes">수업 내용 요약(선택)</label>
          <textarea
            id="class-notes"
            placeholder="예: 파트5에서 시제/수일치 오류가 많았고 비즈니스 메일 표현을 다룸"
            value={classNotes}
            onChange={(e) => setClassNotes(e.target.value)}
            rows={3}
          />
          <button type="button" onClick={handlePracticePlan} disabled={practiceLoading}>
            {practiceLoading ? '생성 중...' : '개인 맞춤 복습 플랜 생성'}
          </button>
          {practiceError && <p className="error-text">{practiceError}</p>}
          {practiceOutput && (
            <div className="result-box">
              <h3>개인 맞춤 반복 학습 플랜</h3>
              <pre>{practiceOutput}</pre>
            </div>
          )}
        </div>
      </section>
        </>
      )}
    </div>
  );
}

export default ToeicPlatform;
