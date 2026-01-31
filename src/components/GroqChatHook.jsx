import React, { useState } from 'react';
import { useGroqChat } from '../hooks/useGroqChat';
import './GroqChat.css';

/**
 * useGroqChat 훅을 사용한 채팅 컴포넌트 예제
 */
function GroqChatHook() {
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');

  const {
    messages,
    loading,
    error,
    sendMessage,
    sendStreamMessage,
    clearMessages,
  } = useGroqChat({
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    try {
      await sendMessage(input);
      setInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleStreamSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setStreamingText('');
    const userInput = input;
    setInput('');

    try {
      await sendStreamMessage(
        userInput,
        (chunk, fullText) => {
          setStreamingText(fullText);
        }
      );
      setStreamingText('');
    } catch (err) {
      console.error('Error streaming message:', err);
      setStreamingText('');
    }
  };

  return (
    <div className="groq-chat-container">
      <h2>Groq AI Chat (Hook 버전)</h2>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          오류: {error}
        </div>
      )}

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? '사용자' : 'AI'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {streamingText && (
          <div className="message assistant streaming">
            <strong>AI:</strong>
            <p>{streamingText}</p>
          </div>
        )}
        {loading && !streamingText && (
          <div className="message assistant">
            <p>생성 중...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={loading}
        />
        <div className="button-group">
          <button type="submit" disabled={loading}>
            일반 전송
          </button>
          <button
            type="button"
            onClick={handleStreamSubmit}
            disabled={loading}
          >
            스트리밍 전송
          </button>
          <button
            type="button"
            onClick={clearMessages}
            disabled={loading}
            style={{ backgroundColor: '#dc3545' }}
          >
            대화 초기화
          </button>
        </div>
      </form>
    </div>
  );
}

export default GroqChatHook;
