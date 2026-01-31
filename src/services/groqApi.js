import Groq from 'groq-sdk';

// Groq 클라이언트 초기화
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Groq API를 사용하여 채팅 완성 요청
 * @param {Array} messages - 대화 메시지 배열 [{ role: 'user', content: '...' }]
 * @param {Object} options - 추가 옵션 (model, temperature, max_tokens 등)
 * @returns {Promise<Object>} API 응답
 */
export async function chatCompletion(messages, options = {}) {
  try {
    const {
      model = 'llama-3.1-8b-instant',
      temperature = 0.7,
      max_tokens = 1024,
      stream = false,
      ...otherOptions
    } = options;

    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      stream,
      ...otherOptions,
    });

    return response;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
}

/**
 * 스트리밍 채팅 완성 요청
 * @param {Array} messages - 대화 메시지 배열
 * @param {Function} onChunk - 각 청크를 받을 때 호출되는 콜백 함수
 * @param {Object} options - 추가 옵션
 */
export async function streamChatCompletion(messages, onChunk, options = {}) {
  try {
    const {
      model = 'llama-3.1-8b-instant',
      temperature = 0.7,
      max_tokens = 1024,
      ...otherOptions
    } = options;

    const stream = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      stream: true,
      ...otherOptions,
    });

    for await (const chunk of stream) {
      if (chunk.choices?.[0]?.delta?.content) {
        onChunk(chunk.choices[0].delta.content);
      }
    }
  } catch (error) {
    console.error('Groq Streaming API Error:', error);
    throw error;
  }
}

/**
 * 간단한 텍스트 생성 (단일 메시지)
 * @param {string} prompt - 사용자 프롬프트
 * @param {Object} options - 추가 옵션
 * @returns {Promise<string>} 생성된 텍스트
 */
export async function generateText(prompt, options = {}) {
  try {
    const messages = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await chatCompletion(messages, options);
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Text Generation Error:', error);
    throw error;
  }
}

export default groq;
