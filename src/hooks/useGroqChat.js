import { useState, useCallback } from 'react';
import { chatCompletion, streamChatCompletion } from '../services/groqApi';

/**
 * Groq API를 사용한 채팅을 위한 커스텀 훅
 * @param {Object} options - 기본 옵션 설정
 * @returns {Object} 채팅 관련 상태와 함수들
 */
export function useGroqChat(options = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultOptions = {
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_tokens: 1024,
    ...options,
  };

  /**
   * 메시지 추가
   */
  const addMessage = useCallback((role, content) => {
    setMessages((prev) => [...prev, { role, content }]);
  }, []);

  /**
   * 메시지 초기화
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * 일반 채팅 완성
   */
  const sendMessage = useCallback(
    async (content, customOptions = {}) => {
      if (!content.trim() || loading) return;

      const userMessage = { role: 'user', content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setLoading(true);
      setError(null);

      try {
        const response = await chatCompletion(newMessages, {
          ...defaultOptions,
          ...customOptions,
        });

        const assistantMessage = {
          role: 'assistant',
          content: response.choices[0]?.message?.content || '응답을 생성할 수 없습니다.',
        };

        setMessages([...newMessages, assistantMessage]);
        return assistantMessage;
      } catch (err) {
        const errorMessage = err.message || '오류가 발생했습니다.';
        setError(errorMessage);
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `오류: ${errorMessage}`,
          },
        ]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, defaultOptions]
  );

  /**
   * 스트리밍 채팅 완성
   */
  const sendStreamMessage = useCallback(
    async (content, onChunk, customOptions = {}) => {
      if (!content.trim() || loading) return;

      const userMessage = { role: 'user', content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setLoading(true);
      setError(null);

      let fullResponse = '';

      try {
        await streamChatCompletion(
          newMessages,
          (chunk) => {
            fullResponse += chunk;
            if (onChunk) onChunk(chunk, fullResponse);
          },
          {
            ...defaultOptions,
            ...customOptions,
          }
        );

        const assistantMessage = {
          role: 'assistant',
          content: fullResponse,
        };

        setMessages([...newMessages, assistantMessage]);
        return assistantMessage;
      } catch (err) {
        const errorMessage = err.message || '오류가 발생했습니다.';
        setError(errorMessage);
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `오류: ${errorMessage}`,
          },
        ]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, defaultOptions]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendStreamMessage,
    addMessage,
    clearMessages,
  };
}

export default useGroqChat;
