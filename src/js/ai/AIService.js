// ===== AI Service — LLM API Wrapper =====
import { loadAIConfig, getProviderConfig } from './aiConfig.js';

class AIService {
  constructor() {
    this.totalTokensUsed = 0;
  }

  getConfig() {
    return loadAIConfig();
  }

  isConfigured() {
    const cfg = this.getConfig();
    return !!(cfg.apiKey && cfg.apiKey.length > 5);
  }

  _buildURL(cfg) {
    const provider = getProviderConfig(cfg.provider);
    return `${provider.baseURL}/chat/completions`;
  }

  _buildHeaders(cfg) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
    };
  }

  /** 普通请求，返回完整回复文本 */
  async chat(messages) {
    const cfg = this.getConfig();
    if (!this.isConfigured()) throw new Error('未配置 API Key');

    const url = this._buildURL(cfg);
    const body = {
      model: cfg.model,
      messages,
      max_tokens: cfg.maxTokens,
      temperature: cfg.temperature,
      stream: false,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: this._buildHeaders(cfg),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      if (res.status === 401) throw new Error('API Key 无效，请检查设置');
      if (res.status === 429) throw new Error('请求过于频繁，请稍后再试');
      throw new Error(`API 请求失败 (${res.status}): ${errText.slice(0, 100)}`);
    }

    const data = await res.json();
    if (data.usage) {
      this.totalTokensUsed += (data.usage.total_tokens || 0);
    }
    const content = data.choices?.[0]?.message?.content || '';
    return content;
  }

  /** 流式请求，逐块回调 */
  async chatStream(messages, onChunk) {
    const cfg = this.getConfig();
    if (!this.isConfigured()) throw new Error('未配置 API Key');

    const url = this._buildURL(cfg);
    const body = {
      model: cfg.model,
      messages,
      max_tokens: cfg.maxTokens,
      temperature: cfg.temperature,
      stream: true,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: this._buildHeaders(cfg),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      if (res.status === 401) throw new Error('API Key 无效，请检查设置');
      if (res.status === 429) throw new Error('请求过于频繁，请稍后再试');
      throw new Error(`API 请求失败 (${res.status}): ${errText.slice(0, 100)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') continue;

        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            onChunk(delta, fullText);
          }
          // Track usage from final chunk if present
          if (json.usage) {
            this.totalTokensUsed += (json.usage.total_tokens || 0);
          }
        } catch {
          // skip malformed JSON
        }
      }
    }

    return fullText;
  }

  /** 测试连接 */
  async testConnection() {
    const messages = [
      { role: 'user', content: 'Hi, respond with OK' },
    ];
    try {
      const reply = await this.chat(messages);
      return { success: true, reply: reply.slice(0, 50) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  getTokensUsed() {
    return this.totalTokensUsed;
  }

  resetTokenCount() {
    this.totalTokensUsed = 0;
  }
}

export const aiService = new AIService();
export default aiService;
