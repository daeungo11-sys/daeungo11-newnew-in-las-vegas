import React, { useState } from 'react';
import { chatCompletion, streamChatCompletion } from '../services/groqApi';
import './GroqChat.css';

/**
 * Groq API를 사용한 채팅 컴포넌트 예제
 */
function GroqChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  // 일반 채팅 완성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await chatCompletion(newMessages, {
        model: 'llama-3.1-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.choices[0]?.message?.content || '응답을 생성할 수 없습니다.',
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: '오류가 발생했습니다. API 키를 확인해주세요.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 스트리밍 채팅 완성
  const handleStreamSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);
    setStreamingMessage('');

    try {
      await streamChatCompletion(
        newMessages,
        (chunk) => {
          setStreamingMessage((prev) => prev + chunk);
        },
        {
          model: 'llama-3.1-70b-versatile',
          temperature: 0.7,
          max_tokens: 1024,
        }
      );

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: streamingMessage,
        },
      ]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: '오류가 발생했습니다. API 키를 확인해주세요.',
        },
      ]);
    } finally {
      setStreaming(false);
      setStreamingMessage('');
    }
  };

  return (
    <div className="groq-chat-container">
      <h2>Groq AI Chat</h2>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? '사용자' : 'AI'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {streaming && streamingMessage && (
          <div className="message assistant streaming">
            <strong>AI:</strong>
            <p>{streamingMessage}</p>
          </div>
        )}
        {loading && (
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
          disabled={loading || streaming}
        />
        <div className="button-group">
          <button type="submit" disabled={loading || streaming}>
            일반 전송
          </button>
          <button
            type="button"
            onClick={handleStreamSubmit}
            disabled={loading || streaming}
          >
            스트리밍 전송
          </button>
        </div>
      </form>
    </div>
  );
}

export default GroqChat;
