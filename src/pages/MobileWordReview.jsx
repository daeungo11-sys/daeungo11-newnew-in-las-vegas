import React, { useState, useEffect, useCallback } from 'react';
import { fetchStudent, fetchVocabulary } from '../services/apiClient';
import './MobileWordReview.css';

const GAME_MODES = { menu: 'menu', flashcard: 'flashcard', quiz: 'quiz' };

function MobileWordReview() {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState([]);
  const [gameMode, setGameMode] = useState(GAME_MODES.menu);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(null);

  const loadWords = useCallback(async (sid) => {
    if (!sid) return;
    setLoading(true);
    setLoginError('');
    try {
      const student = await fetchStudent(sid);
      if (!student?.id) throw new Error('학생 정보를 찾을 수 없어요.');
      setStudentId(student.id);
      setStudentName(student.name || '');
      const list = await fetchVocabulary(sid, 300);
      setWords(Array.isArray(list) ? list : []);
    } catch (err) {
      setLoginError(err?.message || '로그인에 실패했어요.');
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 모바일: /review 접속 후 학생 ID를 입력해 로그인 (방법 B) */

  const handleLogin = (e) => {
    e.preventDefault();
    const id = studentId.trim();
    if (!id) {
      setLoginError('학생 ID를 입력해주세요.');
      return;
    }
    loadWords(id);
  };

  const normalizedWords = words.map((w) => ({
    id: w.id,
    word: w.word || '',
    meaning: w.meaning || '',
  })).filter((w) => w.word);

  const buildQuizQuestion = useCallback((idx) => {
    if (normalizedWords.length < 2) return null;
    const correct = normalizedWords[idx];
    const others = normalizedWords.filter((_, i) => i !== idx);
    const pool = [correct, ...others].slice(0, 4);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return { word: correct.word, meaning: correct.meaning, options: pool.map((p) => p.meaning), correctId: correct.id };
  }, [normalizedWords]);

  const startGame = (mode) => {
    if (normalizedWords.length < 2) {
      setLoginError('단어가 2개 이상 있어야 게임을 할 수 있어요.');
      return;
    }
    setLoginError('');
    setGameMode(mode);
    setFlashcardIndex(0);
    setQuizIndex(0);
    setFlipped(false);
    setQuizChoice(null);
    setQuizScore({ correct: 0, total: 0 });
    setQuizFeedback(null);
    if (mode === GAME_MODES.quiz) setCurrentQuizQuestion(buildQuizQuestion(0));
  };

  const currentFlashcard = normalizedWords[flashcardIndex];
  const totalCards = normalizedWords.length;

  const goNext = () => {
    setFlipped(false);
    setFlashcardIndex((i) => (i + 1) % totalCards);
  };

  const goPrev = () => {
    setFlipped(false);
    setFlashcardIndex((i) => (i - 1 + totalCards) % totalCards);
  };

  const handleQuizAnswer = (meaning) => {
    if (quizChoice !== null || !currentQuizQuestion) return;
    setQuizChoice(meaning);
    const correct = currentQuizQuestion.meaning === meaning;
    setQuizScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setQuizFeedback(correct ? '정답!' : `오답. 정답: ${currentQuizQuestion.meaning}`);
  };

  const handleQuizNext = () => {
    if (quizIndex >= normalizedWords.length - 1) {
      setGameMode(GAME_MODES.menu);
      setCurrentQuizQuestion(null);
      return;
    }
    const nextIndex = quizIndex + 1;
    setQuizIndex(nextIndex);
    setQuizChoice(null);
    setQuizFeedback(null);
    setCurrentQuizQuestion(buildQuizQuestion(nextIndex));
  };

  if (gameMode === GAME_MODES.menu && !studentId && !loading) {
    return (
      <div className="mobile-review app">
        <div className="mobile-review-card">
          <h1>📱 단어 복습</h1>
          <p>학원에서 저장한 단어를 이동 중에 게임처럼 복습해보세요.</p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.trim())}
              placeholder="학생 ID"
              autoComplete="off"
            />
            <button type="submit" disabled={loading}>
              {loading ? '불러오는 중...' : '내 단어 불러오기'}
            </button>
          </form>
          {loginError && <p className="mobile-review-error">{loginError}</p>}
          <p className="mobile-review-hint">PC에서 학습 플랫폼에 로그인한 뒤 「내 단어장」에 단어를 추가하세요.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mobile-review app">
        <div className="mobile-review-card"><p>단어 불러오는 중...</p></div>
      </div>
    );
  }

  if (gameMode === GAME_MODES.menu) {
    return (
      <div className="mobile-review app">
        <div className="mobile-review-card">
          <p className="mobile-review-user">👤 {studentName || studentId}</p>
          <p className="mobile-review-count">저장된 단어 {normalizedWords.length}개</p>
          {loginError && <p className="mobile-review-error">{loginError}</p>}
          {normalizedWords.length < 2 ? (
            <p className="mobile-review-hint">단어를 2개 이상 추가한 뒤 게임을 시작할 수 있어요.</p>
          ) : (
            <>
              <button type="button" className="mobile-review-btn primary" onClick={() => startGame(GAME_MODES.flashcard)}>
                🃏 플래시카드
              </button>
              <button type="button" className="mobile-review-btn secondary" onClick={() => startGame(GAME_MODES.quiz)}>
                ❓ 뜻 맞히기 퀴즈
              </button>
            </>
          )}
          <button type="button" className="mobile-review-btn outline" onClick={() => { setStudentId(''); setStudentName(''); setWords([]); setLoginError(''); }}>
            다른 계정으로 로그인
          </button>
        </div>
      </div>
    );
  }

  if (gameMode === GAME_MODES.flashcard) {
    return (
      <div className="mobile-review app">
        <div className="flashcard-container">
          <p className="flashcard-progress">{flashcardIndex + 1} / {totalCards}</p>
          <div
            className={`flashcard ${flipped ? 'flipped' : ''}`}
            onClick={() => setFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFlipped((f) => !f); }}
          >
            <div className="flashcard-inner">
              <div className="flashcard-front">
                <span className="flashcard-label">영단어</span>
                <span className="flashcard-word">{currentFlashcard?.word}</span>
                <span className="flashcard-tap">탭하면 뒤집기</span>
              </div>
              <div className="flashcard-back">
                <span className="flashcard-label">뜻</span>
                <span className="flashcard-meaning">{currentFlashcard?.meaning}</span>
                <span className="flashcard-tap">탭하면 뒤집기</span>
              </div>
            </div>
          </div>
          <div className="flashcard-actions">
            <button type="button" onClick={goPrev}>← 이전</button>
            <button type="button" onClick={goNext}>다음 →</button>
          </div>
          <button type="button" className="mobile-review-btn outline" onClick={() => setGameMode(GAME_MODES.menu)}>
            메뉴로
          </button>
        </div>
      </div>
    );
  }

  if (gameMode === GAME_MODES.quiz && currentQuizQuestion) {
    const isDone = quizChoice !== null;
    return (
      <div className="mobile-review app">
        <div className="quiz-container">
          <p className="quiz-progress">퀴즈 {quizIndex + 1} / {normalizedWords.length} · 맞힌 개수 {quizScore.correct}</p>
          <div className="quiz-question">
            <span className="quiz-word">{currentQuizQuestion.word}</span>
            <p className="quiz-prompt">뜻을 고르세요</p>
          </div>
          <div className="quiz-options">
            {currentQuizQuestion.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`quiz-option ${quizChoice === opt ? (opt === currentQuizQuestion.meaning ? 'correct' : 'wrong') : ''} ${isDone && opt === currentQuizQuestion.meaning ? 'correct' : ''}`}
                onClick={() => handleQuizAnswer(opt)}
                disabled={isDone}
              >
                {opt}
              </button>
            ))}
          </div>
          {quizFeedback && <p className={`quiz-feedback ${currentQuizQuestion.meaning === quizChoice ? 'correct' : 'wrong'}`}>{quizFeedback}</p>}
          {isDone && (
            <button type="button" className="mobile-review-btn primary" onClick={handleQuizNext}>
              {quizIndex >= normalizedWords.length - 1 ? '결과 보기' : '다음 문제'}
            </button>
          )}
          <button type="button" className="mobile-review-btn outline" onClick={() => setGameMode(GAME_MODES.menu)}>
            메뉴로
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default MobileWordReview;
