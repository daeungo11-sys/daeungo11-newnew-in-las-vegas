import React, { useState, useEffect } from 'react';
import { saveStudentHistory } from '../services/apiClient';
import '../index.css';
import '../components/ToeicPlatform.css';

const STORAGE_KEY = 'miniQuizData';

export default function MiniQuizPage() {
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState(['', '', '']);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData(parsed);
      }
    } catch (_) {
      setData(null);
    }
  }, []);

  const handleCheck = () => {
    if (!data?.quiz?.length) return;
    let correct = 0;
    let incorrect = 0;
    data.quiz.forEach((item, index) => {
      const user = (answers[index] || '').trim().toLowerCase();
      const expected = (item.answer || '').toLowerCase();
      if (user && user.includes(expected)) correct += 1;
      else incorrect += 1;
    });
    setChecked(true);
    setScore({ correct, incorrect });
    if (data.studentId) {
      saveStudentHistory(data.studentId, {
        activityType: 'MINI_QUIZ',
        inputText: '미니 퀴즈 3문항',
        outputText: `${correct}/3 정답`,
        extraPoints: correct * 5,
        badgeKey: correct === 3 ? 'quiz_perfect' : undefined,
      }).catch(() => {});
    }
  };

  const handleClose = () => {
    window.close();
  };

  if (!data) {
    return (
      <div className="toeic-platform" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>퀴즈 데이터가 없어요. 보완학습에서 「약점 보완 미니 문제 풀기」를 눌러 열어주세요.</p>
        <button type="button" onClick={handleClose}>창 닫기</button>
      </div>
    );
  }

  const quiz = data.quiz || [];

  return (
    <div className="toeic-platform mini-quiz-page" style={{ padding: '24px', maxWidth: '640px', margin: '0 auto' }}>
      <div className="card" style={{ borderRadius: '20px' }}>
        <div className="modal-header" style={{ marginBottom: '12px' }}>
          <h3>약점 보완 미니 문제</h3>
          <button type="button" className="modal-close" onClick={handleClose}>
            닫기
          </button>
        </div>
        <div className="modal-body">
          {quiz.map((item, index) => (
            <div key={index} className="quiz-item">
              <p className="quiz-question">{item.question}</p>
              <input
                type="text"
                value={answers[index] ?? ''}
                onChange={(e) => {
                  const next = [...answers];
                  next[index] = e.target.value;
                  setAnswers(next);
                }}
                placeholder="정답을 입력하세요"
                disabled={checked}
              />
              {checked && (
                <p className="quiz-feedback">정답: {item.answer}</p>
              )}
            </div>
          ))}
          <button type="button" onClick={handleCheck} disabled={checked}>
            채점하기
          </button>
          {checked && (
            <p className="quiz-score">
              정답 {score.correct}개 / 오답 {score.incorrect}개
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
