# Groq API 설정 가이드

## 1. Groq SDK 설치

프로젝트 루트 디렉토리에서 다음 명령어를 실행하세요:

```bash
npm install groq-sdk
```

## 2. API 키 발급

1. [Groq Console](https://console.groq.com/)에 접속
2. 계정 생성 또는 로그인
3. [API Keys](https://console.groq.com/keys) 페이지로 이동
4. 새 API 키 생성

## 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```
VITE_GROQ_API_KEY=your_actual_api_key_here
```

⚠️ **중요**: `.env` 파일은 절대 Git에 커밋하지 마세요. `.gitignore`에 추가되어 있는지 확인하세요.

## 4. 사용 방법

### 기본 사용법

```javascript
import { generateText, chatCompletion } from './services/groqApi';

// 간단한 텍스트 생성
const response = await generateText('안녕하세요!');
console.log(response);

// 채팅 완성
const messages = [
  { role: 'user', content: 'Hello, how are you?' }
];
const completion = await chatCompletion(messages);
console.log(completion.choices[0].message.content);
```

### 컴포넌트에서 사용

```jsx
import GroqChat from './components/GroqChat';

function App() {
  return (
    <div>
      <GroqChat />
    </div>
  );
}
```

## 5. 사용 가능한 모델

Groq에서 제공하는 주요 모델:

- `llama-3.1-70b-versatile` (기본값) - 범용 모델
- `llama-3.1-8b-instant` - 빠른 응답
- `mixtral-8x7b-32768` - 긴 컨텍스트 지원
- `gemma-7b-it` - 대화형 모델

## 6. API 옵션

```javascript
await chatCompletion(messages, {
  model: 'llama-3.1-70b-versatile',
  temperature: 0.7,        // 0.0 ~ 2.0 (창의성 조절)
  max_tokens: 1024,        // 최대 토큰 수
  top_p: 1.0,              // 토큰 선택 범위
  stream: false            // 스트리밍 여부
});
```

## 7. 문제 해결

### API 키 오류
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 `VITE_GROQ_API_KEY`인지 확인
- 개발 서버를 재시작하세요 (환경 변수 변경 시)

### 네트워크 오류
- 인터넷 연결 확인
- Groq API 서비스 상태 확인

## 참고 자료

- [Groq 공식 문서](https://console.groq.com/docs)
- [Groq SDK GitHub](https://github.com/groq/groq-sdk-javascript)
