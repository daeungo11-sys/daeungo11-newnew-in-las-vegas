import React, { useMemo, useState, useEffect } from 'react';
import { generateText } from '../services/groqApi';
import {
  createStudent,
  findStudentsByName,
  fetchStudent,
  fetchStudentHistory,
  saveStudentHistory,
} from '../services/apiClient';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
  const [theme, setTheme] = useState('light');
  const [entryName, setEntryName] = useState('');
  const [entryId, setEntryId] = useState('');
  const [entryMode, setEntryMode] = useState('login');
  const [entryMessage, setEntryMessage] = useState('');
  const [findName, setFindName] = useState('');
  const [findResults, setFindResults] = useState([]);
  const [findLoading, setFindLoading] = useState(false);
  const [findError, setFindError] = useState('');
  const [showFindModal, setShowFindModal] = useState(false);
  const [reissueLoading, setReissueLoading] = useState(false);
  const [reissueMessage, setReissueMessage] = useState('');

  const [paraphraseInput, setParaphraseInput] = useState('');
  const [paraphraseOutput, setParaphraseOutput] = useState('');
  const [paraphraseLoading, setParaphraseLoading] = useState(false);
  const [paraphraseError, setParaphraseError] = useState('');
  const [paraphraseNotice, setParaphraseNotice] = useState('');

  const [selectedWeaknesses, setSelectedWeaknesses] = useState([]);
  const [classNotes, setClassNotes] = useState('');
  const [practiceOutput, setPracticeOutput] = useState('');
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceError, setPracticeError] = useState('');
  const [dailyReviewOutput, setDailyReviewOutput] = useState('');
  const [dailyReviewLoading, setDailyReviewLoading] = useState(false);
  const [dailyReviewError, setDailyReviewError] = useState('');
  const [showMiniQuiz, setShowMiniQuiz] = useState(false);
  const [miniQuizAnswers, setMiniQuizAnswers] = useState(['', '', '']);
  const [miniQuizChecked, setMiniQuizChecked] = useState(false);
  const [miniQuizScore, setMiniQuizScore] = useState({ correct: 0, incorrect: 0 });

  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [editorText, setEditorText] = useState('');
  const [editorError, setEditorError] = useState('');
  const [editorSubmitting, setEditorSubmitting] = useState(false);
  const [editorSuccess, setEditorSuccess] = useState('');
  const [editorFeedback, setEditorFeedback] = useState('');

  const [compareInput, setCompareInput] = useState('');

  const [activeTooltip, setActiveTooltip] = useState('');
  const [activeSection, setActiveSection] = useState('history');
  const [passageType, setPassageType] = useState('Email');
  const [passageSummary, setPassageSummary] = useState(
    '상황 요약: 회의 일정 변경 안내'
  );
  const [dailyQuestion, setDailyQuestion] = useState(
    '문제: 회의 일정 변경을 정중하게 안내하는 이메일을 작성하세요.'
  );

  const passageOptions = {
    Email: [
      {
        summary: '상황 요약: 회의 일정 변경 안내',
        question:
          '문제: 회의 일정 변경을 정중하게 안내하는 이메일을 작성하세요.',
      },
      {
        summary: '상황 요약: 출장 일정 변경 및 대체 일정 제안',
        question: '문제: 출장 일정 변경에 대한 대체 일정을 제안하세요.',
      },
      {
        summary: '상황 요약: 계약서 검토 완료 및 회신 요청',
        question: '문제: 계약서 검토 완료 사실과 회신 요청을 작성하세요.',
      },
    ],
    'News Article': [
      {
        summary: '상황 요약: 회사의 신규 지점 오픈 소식',
        question: '문제: 신규 지점 오픈에 대한 간단한 기사 요약을 작성하세요.',
      },
      {
        summary: '상황 요약: 분기 실적 발표 및 성장률 강조',
        question: '문제: 분기 실적 발표 기사 요약을 작성하세요.',
      },
      {
        summary: '상황 요약: 친환경 캠페인 참여 소식',
        question: '문제: 친환경 캠페인 참여 내용을 기사로 요약하세요.',
      },
    ],
    Announcement: [
      {
        summary: '상황 요약: 사내 시스템 점검 공지',
        question: '문제: 시스템 점검 일정과 유의사항을 공지문으로 작성하세요.',
      },
      {
        summary: '상황 요약: 사내 교육 일정 안내',
        question: '문제: 교육 일정과 준비 사항을 공지문으로 작성하세요.',
      },
      {
        summary: '상황 요약: 사무실 이전 일정 공지',
        question: '문제: 사무실 이전 일정과 안내사항을 공지문으로 작성하세요.',
      },
    ],
  };

  const weaknessText = useMemo(() => {
    if (selectedWeaknesses.length === 0) {
      return '없음';
    }
    return selectedWeaknesses.join(', ');
  }, [selectedWeaknesses]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const todayKey = new Date().toLocaleDateString('ko-KR');
  const todayHistory = useMemo(
    () =>
      historyItems.filter(
        (item) =>
          new Date(item.createdAt).toLocaleDateString('ko-KR') === todayKey
      ),
    [historyItems, todayKey]
  );
  const todayWrongQuestions = useMemo(() => {
    if (todayHistory.length === 0) {
      return [
        '문제 1: 회의 일정 변경 안내 문장 작성',
        '문제 2: inform/notify 차이 활용 문장',
        '문제 3: 전치사 in/on/at 선택',
      ];
    }
    return todayHistory.map(
      (item, index) =>
        `문제 ${index + 1}: ${item.inputText?.slice(0, 80) || '입력 없음'}`
    );
  }, [todayHistory]);

  const miniQuiz = useMemo(() => {
    const fallback = [
      {
        question: '빈칸에 들어갈 전치사를 고르세요: We will meet ___ Friday.',
        answer: 'on',
      },
      {
        question: '다음 문장을 정중하게 고치세요: The meeting is late.',
        answer: 'The meeting has been postponed.',
      },
      {
        question: '알맞은 동사를 고르세요: We would like to ___ you that...',
        answer: 'inform',
      },
    ];
    if (selectedWeaknesses.length === 0) return fallback;
    const picks = selectedWeaknesses.slice(0, 3).map((item, index) => {
      if (item.includes('전치사') || item.includes('독해')) {
        return fallback[0];
      }
      if (item.includes('동의어') || item.includes('어휘')) {
        return fallback[2];
      }
      return fallback[index % fallback.length];
    });
    return picks.length ? picks : fallback;
  }, [selectedWeaknesses]);

  const getFriendlyError = (error, fallbackMessage) => {
    const message = error?.message || '';
    if (message.includes('Missing VITE_GROQ_API_KEY')) {
      return 'Groq API 키가 설정되지 않았어요. Vercel 환경변수 또는 .env를 확인해주세요.';
    }
    if (message.includes('Supabase Edge Functions environment variables are missing')) {
      return 'Supabase 환경변수가 설정되지 않았어요. Vercel 환경변수를 확인해주세요.';
    }
    if (message.includes("Could not find the table 'public.students'")) {
      return 'Supabase students 테이블이 없어요. SQL Editor에서 테이블을 생성해주세요.';
    }
    if (message.includes("Could not find the table 'public.student_activities'")) {
      return 'Supabase student_activities 테이블이 없어요. SQL Editor에서 테이블을 생성해주세요.';
    }
    return fallbackMessage;
  };

  const loadHistoryForId = async (id) => {
    if (!id || historyLoading) return;
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const items = await fetchStudentHistory(id, 10);
      setHistoryItems(items);
      setHistoryLoaded(true);
    } catch (error) {
      console.error('History Load Error:', error);
      setHistoryError('히스토리를 불러오지 못했어요. 학생 ID를 확인해주세요.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEnter = () => {
    if (studentLoading) return;
    const name = entryName.trim();
    const id = entryId.trim();

    if (!name || !id) {
      setStudentError('이름과 학생 ID를 모두 입력해주세요.');
      return;
    }

    setStudentLoading(true);
    setStudentError('');
    fetchStudent(id)
      .then((student) => {
        if (!student?.id) {
          throw new Error('학생 ID를 확인할 수 없어요.');
        }
        setStudentName(name);
        setStudentId(student.id);
        loadHistoryForId(student.id);
      })
      .catch((error) => {
        console.error('Student Fetch Error:', error);
        setStudentError('학생 ID를 확인할 수 없어요. 다시 확인해주세요.');
      })
      .finally(() => {
        setStudentLoading(false);
      });
  };

  const handleEntryCreate = async () => {
    if (studentLoading) return;
    const name = entryName.trim();
    if (!name) {
      setStudentError('이름을 입력해주세요.');
      return;
    }
    setStudentLoading(true);
    setStudentError('');
    setEntryMessage('');
    try {
      const student = await createStudent({ name });
      if (!student?.id) {
        throw new Error('학생 ID 생성에 실패했어요.');
      }
      setEntryId(student.id);
      setEntryMessage(`학생 ID가 발급되었어요: ${student.id}`);
    } catch (error) {
      console.error('Entry Create Error:', error);
      setStudentError('학생 ID 생성에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleGoHome = () => {
    setStudentName('');
    setStudentId('');
    setEntryName('');
    setEntryId('');
    setStudentError('');
    setHistoryItems([]);
    setHistoryError('');
    setHistoryLoaded(false);
    setMiniQuizAnswers(['', '', '']);
    setMiniQuizChecked(false);
    setMiniQuizScore({ correct: 0, incorrect: 0 });
    setDailyReviewOutput('');
    setDailyReviewError('');
    setFindResults([]);
    setFindError('');
    setFindName('');
    setShowFindModal(false);
    setReissueMessage('');
    setEntryMode('login');
    setEntryMessage('');
  };

  const sectionNav = [
    { id: 'history', label: '학습 히스토리' },
    { id: 'paraphrase', label: 'Paraphrasing Training' },
    { id: 'summary', label: '학습 지문 요약' },
    { id: 'compare', label: 'Paraphrasing Diff View' },
    { id: 'review', label: '수업 후 반복 학습+개인별 약점 보완' },
  ];

  const handleSectionNav = (id) => {
    setActiveSection(id);
    requestAnimationFrame(() => {
      const target = document.getElementById(`section-${id}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const handlePassageSelect = (type) => {
    const options = passageOptions[type];
    if (!options || options.length === 0) return;
    const pick = options[Math.floor(Math.random() * options.length)];
    setPassageType(type);
    setPassageSummary(pick.summary);
    setDailyQuestion(pick.question);
  };

  const handleFindStudent = async () => {
    if (findLoading) return;
    const name = findName.trim();
    if (!name) {
      setFindError('이름을 입력해주세요.');
      return;
    }
    setFindLoading(true);
    setFindError('');
    setFindResults([]);
    try {
      const result = await findStudentsByName(name);
      setFindResults(Array.isArray(result) ? result : []);
      if (!result || result.length === 0) {
        setFindError('해당 이름의 학생 ID를 찾지 못했어요.');
      }
    } catch (error) {
      console.error('Find Student Error:', error);
      setFindError('학생 ID 조회에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setFindLoading(false);
    }
  };

  const isLegacyId = (id) => !/^\d{2}[A-Z]{2}$/.test(id);

  const handleReissueId = async (name) => {
    if (reissueLoading) return;
    setReissueLoading(true);
    setReissueMessage('');
    try {
      const student = await createStudent({ name });
      if (!student?.id) {
        throw new Error('학생 ID 재발급에 실패했어요.');
      }
      if (isLegacyId(student.id)) {
        throw new Error('새 ID 형식이 올바르지 않아요.');
      }
      setEntryId(student.id);
      setReissueMessage(`새 학생 ID가 발급되었어요: ${student.id}`);
    } catch (error) {
      console.error('Reissue Student Error:', error);
      setReissueMessage(
        '학생 ID 재발급에 실패했어요. create-student 함수를 최신으로 배포해주세요.'
      );
    } finally {
      setReissueLoading(false);
    }
  };

  const handleParaphraseSubmit = async (e) => {
    e.preventDefault();
    if (!paraphraseInput.trim() || paraphraseLoading) return;

    setParaphraseLoading(true);
    setParaphraseError('');
    setParaphraseOutput('');
    setParaphraseNotice('');

    const prompt = `You are a TOEIC paraphrasing coach.
Given the student's sentence, rewrite it using common TOEIC-style expressions.
Return 3 paraphrase alternatives in English, each as a bullet point, and add a short Korean note about the key expression used.
Then add a Korean "오답 피드백" that explains what was weak in the student's sentence for today's lesson.
Today's lesson type: ${passageType}
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
          setParaphraseError(
            getFriendlyError(
              saveError,
              '히스토리 저장에 실패했어요. 학생 ID를 확인해주세요.'
            )
          );
        }
      } else {
        setParaphraseNotice('학생 ID를 설정하면 결과가 히스토리에 저장돼요.');
      }
    } catch (error) {
      console.error('Paraphrase Error:', error);
      setParaphraseError(
        getFriendlyError(error, '문장을 분석하지 못했어요. API 키를 확인해주세요.')
      );
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

  const handleMiniQuizCheck = () => {
    let correct = 0;
    let incorrect = 0;
    miniQuiz.forEach((item, index) => {
      const user = miniQuizAnswers[index]?.trim().toLowerCase();
      const expected = item.answer.toLowerCase();
      if (user && user.includes(expected)) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    });
    setMiniQuizChecked(true);
    setMiniQuizScore({ correct, incorrect });
  };

  const handleDailyReview = async () => {
    if (dailyReviewLoading) return;

    setDailyReviewLoading(true);
    setDailyReviewError('');
    setDailyReviewOutput('');

    const historySummary =
      todayHistory.length > 0
        ? todayHistory
            .map((item) => `- ${item.activityType}: ${item.inputText}`)
            .join('\n')
        : '오늘 기록된 학습 히스토리가 없습니다.';

    const prompt = `You are a TOEIC coach.
Summarize today's mistakes and create a short review plan in Korean.
1) 오늘 약점 요약 2) 다시 연습할 핵심 표현 3) 복습 미니 문제 3개
오늘 틀린 문제 목록:
${todayWrongQuestions.map((item) => `- ${item}`).join('\n')}

오늘 학습 기록:
${historySummary}`;

    try {
      const text = await generateText(prompt, {
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 700,
      });
      setDailyReviewOutput(text.trim());

      if (studentId) {
        try {
          await saveStudentHistory(studentId, {
            activityType: 'DAILY_REVIEW',
            inputText: todayWrongQuestions.join('\n'),
            outputText: text.trim(),
          });
        } catch (saveError) {
          console.error('History Save Error:', saveError);
          setDailyReviewError(
            getFriendlyError(
              saveError,
              '히스토리 저장에 실패했어요. 학생 ID를 확인해주세요.'
            )
          );
        }
      } else {
        setDailyReviewError('학생 ID를 설정하면 결과가 히스토리에 저장돼요.');
      }
    } catch (error) {
      console.error('Daily Review Error:', error);
      setDailyReviewError(
        getFriendlyError(error, '오늘 학습 약점 분석에 실패했어요.')
      );
    } finally {
      setDailyReviewLoading(false);
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
    if (!studentId.trim()) return;
    await loadHistoryForId(studentId.trim());
    setActiveSection('history');
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
    { label: '제출률', value: '0%', helper: '지난 7일 기준' },
    { label: '평균 점수', value: '0점', helper: '문법+어휘+적합도 평균' },
    { label: '최다 오류', value: '없음', helper: '오류 0건' },
    { label: '활동 학생', value: '0명', helper: '오늘 참여' },
  ];

  const errorDistribution = [
    { name: '시제/수일치', value: 0 },
    { name: '전치사', value: 0 },
    { name: '동의어', value: 0 },
    { name: '관계사', value: 0 },
  ];

  const errorColors = ['#4f46e5', '#7c83f1', '#7dd3a6', '#c7d2fe'];

  const quizChartData = [
    { name: '정답', value: miniQuizScore.correct },
    { name: '오답', value: miniQuizScore.incorrect },
  ];
  const totalQuiz = miniQuizScore.correct + miniQuizScore.incorrect;
  const wrongRate = totalQuiz
    ? Math.round((miniQuizScore.incorrect / totalQuiz) * 100)
    : 0;

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
    setEditorSuccess('');
    setEditorFeedback('');
    try {
      if (!studentId) {
        setEditorError('학생 ID가 없어요. 먼저 학생 ID를 생성하거나 입력해주세요.');
        return;
      }

      const prompt = `You are a TOEIC writing coach.
Give concise feedback in Korean on the student's business document writing.
Include: 1) 잘한 점 2) 개선할 점 3) 더 TOEIC스럽게 바꾼 예시 1개.
학생 문장:
${editorText.trim()}`;

      const feedback = await generateText(prompt, {
        model: 'llama-3.1-8b-instant',
        temperature: 0.4,
        max_tokens: 600,
      });

      setEditorFeedback(feedback.trim());

      await saveStudentHistory(studentId, {
        activityType: 'WRITING_SUBMISSION',
        inputText: editorText.trim(),
        outputText: feedback.trim(),
      });
      setEditorSuccess('제출이 완료되었어요.');
    } catch (error) {
      console.error('Writing Submit Error:', error);
      setEditorError(
        getFriendlyError(error, '제출에 실패했어요. 학생 ID를 확인해주세요.')
      );
    } finally {
      setEditorSubmitting(false);
    }
  };

  const hasAccess = Boolean(studentName.trim() && studentId.trim());

  if (!hasAccess) {
    return (
      <div className="toeic-platform">
        <div className="top-actions">
          <button type="button" className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '라이트 모드' : '다크 모드'}
          </button>
        </div>
        <header className="platform-hero entry-hero">
          <div className="hero-content">
            <h1>TOEIC Paraphrasing & Review Platform</h1>
            <p>내 학습 히스토리를 불러오기 위해 이름과 학생 ID를 입력하세요.</p>
          </div>
          <div className="hero-badges">
            <span>학습 히스토리</span>
            <span>TOEIC 훈련</span>
            <span>개인 맞춤 복습</span>
          </div>
        </header>

        <section className="platform-section">
          <div className="card entry-card">
            <div className="section-header">
              <h2>내 학습 히스토리</h2>
              <p>이름과 학생 ID를 입력하면 본 페이지로 이동합니다.</p>
            </div>
            <div className="entry-toggle">
              <button
                type="button"
                className={entryMode === 'login' ? 'active' : ''}
                onClick={() => setEntryMode('login')}
              >
                로그인
              </button>
              <button
                type="button"
                className={entryMode === 'signup' ? 'active' : ''}
                onClick={() => setEntryMode('signup')}
              >
                신규 가입
              </button>
            </div>
            <label htmlFor="entry-name">이름</label>
            <input
              id="entry-name"
              type="text"
              value={entryName}
              onChange={(e) => setEntryName(e.target.value)}
              placeholder="예: 홍길동"
            />
            {entryMode === 'login' ? (
              <>
                <label htmlFor="entry-id">학생 ID</label>
                <input
                  id="entry-id"
                  type="text"
                  value={entryId}
                  onChange={(e) => setEntryId(e.target.value.toUpperCase())}
                  placeholder="예: 42AB"
                />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleEntryCreate}
                  disabled={studentLoading}
                >
                  {studentLoading ? '발급 중...' : '학생 ID 발급받기'}
                </button>
                {entryMessage && <p className="success-text">{entryMessage}</p>}
              </>
            )}
            {studentError && <p className="error-text">{studentError}</p>}
            {entryMode === 'login' && (
              <button
                type="button"
                onClick={handleEnter}
                disabled={studentLoading}
              >
                {studentLoading ? '확인 중...' : '내 학습 시작하기'}
              </button>
            )}
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setShowFindModal(true)}
            >
              학생 ID 찾기
            </button>
          </div>
        </section>
        {showFindModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>학생 ID 찾기</h3>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowFindModal(false)}
                >
                  닫기
                </button>
              </div>
              <div className="modal-body">
                <label htmlFor="find-name">이름</label>
                <input
                  id="find-name"
                  type="text"
                  value={findName}
                  onChange={(event) => setFindName(event.target.value)}
                  placeholder="이름을 입력하세요"
                />
                <button type="button" onClick={handleFindStudent}>
                  {findLoading ? '조회 중...' : '학생 ID 조회'}
                </button>
                {findError && <p className="error-text">{findError}</p>}
                {findResults.length > 0 && (
                  <div className="result-box">
                    <h3>조회 결과</h3>
                    <ul className="result-list">
                      {findResults.map((item) => {
                        const legacy = isLegacyId(item.id);
                        return (
                          <li key={item.id}>
                            <span>{item.name}</span>
                            <strong className={legacy ? 'legacy-id' : ''}>
                              {item.id}
                            </strong>
                            {legacy && (
                              <button
                                type="button"
                                className="ghost-btn"
                                onClick={() => handleReissueId(item.name)}
                                disabled={reissueLoading}
                              >
                                {reissueLoading ? '발급 중...' : '새 ID 발급'}
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="hint-text">
                      찾은 ID를 복사해서 입력 후 시작하세요.
                    </p>
                    {reissueMessage && (
                      <p className="success-text">{reissueMessage}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="toeic-platform">
      <div className="top-actions">
        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '라이트 모드' : '다크 모드'}
        </button>
      </div>
      <div className="home-button-wrapper">
        <button type="button" className="home-button" onClick={handleGoHome}>
          홈
        </button>
      </div>
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

      {activeView === 'student' && (
        <div className="section-nav">
          {sectionNav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSection === item.id ? 'active' : ''}
              onClick={() => handleSectionNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

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
          <section id="section-history" className="platform-section">
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
              {historyLoaded && historyItems.length === 0 && !historyError && (
                <p className="empty-text">아직 저장된 학습 히스토리가 없어요.</p>
              )}
              <div className="history-chart card">
                <div className="chart-header">
                  <h3>정답/오답률 요약</h3>
                  <span className="chart-helper">
                    오답률 {wrongRate}% · 0부터 시작
                  </span>
                </div>
                <div className="chart-area">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={quizChartData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeSection === 'history' && (
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
      )}

      {activeSection === 'paraphrase' && (
      <section id="section-paraphrase" className="platform-section">
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
          {paraphraseNotice && <p className="info-text">{paraphraseNotice}</p>}
          {paraphraseOutput && (
            <div className="result-box">
              <h3>추천 대체 문장</h3>
              <pre>{paraphraseOutput}</pre>
            </div>
          )}
        </form>
      </section>
      )}

      {activeSection === 'summary' && (
      <section id="section-summary" className="platform-section">
        <div className="section-header">
          <h2>Step 1-2. 학습 지문 요약 & 영작 에디터</h2>
          <p>
            오늘 학습할 지문의 유형과 상황 요약을 확인하고, 핵심 구문을 참고해
            문장을 작성하세요.
          </p>
        </div>
        <div className="study-grid">
          <div className="study-left">
            <div className="passage-toggle">
              {Object.keys(passageOptions).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={passageType === type ? 'active' : ''}
                  onClick={() => handlePassageSelect(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="badge-row">
              <span className="badge">{passageType}</span>
              <span className="badge soft">{passageSummary}</span>
            </div>
            <div className="card question-card">
              <h3>오늘의 문제</h3>
              <p>{dailyQuestion}</p>
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
                {editorSuccess && <p className="success-text">{editorSuccess}</p>}
                {editorFeedback && (
                  <div className="result-box">
                    <h3>AI 피드백</h3>
                    <pre>{editorFeedback}</pre>
                  </div>
                )}
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
      )}

      {activeSection === 'compare' && (
      <section id="section-compare" className="platform-section">
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
      )}

      {activeSection === 'review' && (
      <section id="section-review" className="platform-section">
        <div className="section-header">
          <h2>Step 2. 수업 후 반복 학습 + 개인별 약점 보완</h2>
          <p>
            수업 후 바로 복습 루틴과 3일 반복 학습 플랜을 제공하고, 약점에 맞는
            미니 문제로 보완합니다.
          </p>
        </div>
        <div className="card">
          <div className="review-card">
            <div className="review-header">
              <h3>오늘 틀린 문제</h3>
              <span className="review-helper">{todayKey} 기준</span>
            </div>
            <ul className="wrong-list">
              {todayWrongQuestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleDailyReview}
              disabled={dailyReviewLoading}
            >
              {dailyReviewLoading ? '분석 중...' : '오늘 학습 약점 분석'}
            </button>
            {dailyReviewError && <p className="error-text">{dailyReviewError}</p>}
            {dailyReviewOutput && (
              <div className="result-box">
                <h3>오늘 학습 약점 & 복습</h3>
                <pre>{dailyReviewOutput}</pre>
              </div>
            )}
          </div>
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
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              setMiniQuizAnswers(['', '', '']);
              setMiniQuizChecked(false);
              setShowMiniQuiz(true);
            }}
            disabled={!practiceOutput}
          >
            약점 보완 미니 문제 풀기
          </button>
        </div>
        {showMiniQuiz && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>약점 보완 미니 문제</h3>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowMiniQuiz(false)}
                >
                  닫기
                </button>
              </div>
              <div className="modal-body">
                {miniQuiz.map((item, index) => (
                  <div key={item.question} className="quiz-item">
                    <p className="quiz-question">{item.question}</p>
                    <input
                      type="text"
                      value={miniQuizAnswers[index] || ''}
                      onChange={(event) => {
                        const next = [...miniQuizAnswers];
                        next[index] = event.target.value;
                        setMiniQuizAnswers(next);
                      }}
                      placeholder="정답을 입력하세요"
                    />
                    {miniQuizChecked && (
                      <p className="quiz-feedback">
                        정답: {item.answer}
                      </p>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleMiniQuizCheck}>
                  채점하기
                </button>
                {miniQuizChecked && (
                  <p className="quiz-score">
                    정답 {miniQuizScore.correct}개 / 오답{' '}
                    {miniQuizScore.incorrect}개
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
      )}
    </div>
  );
}

export default ToeicPlatform;
