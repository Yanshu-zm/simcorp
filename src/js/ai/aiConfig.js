// ===== AI Provider Configuration =====

export const PROVIDERS = {
  deepseek: {
    name: 'DeepSeek (火山引擎)',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'deepseek-v3-2-251201',
    models: ['deepseek-v3-2-251201'],
  },
  zhipu: {
    name: '智谱 GLM-4',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    models: ['glm-4-flash', 'glm-4-air', 'glm-4'],
  },
};

const AI_CONFIG_KEY = 'simcorp_ai_config';

const DEFAULT_CONFIG = {
  provider: 'deepseek',
  apiKey: '',
  model: 'deepseek-v3-2-251201',
  maxTokens: 300,
  temperature: 0.8,
  language: 'zh',
};

export function loadAIConfig() {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveAIConfig(config) {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

export function clearAIConfig() {
  localStorage.removeItem(AI_CONFIG_KEY);
}

export function getProviderConfig(providerId) {
  return PROVIDERS[providerId] || PROVIDERS.deepseek;
}
