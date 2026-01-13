// Configuration for AI Visibility Dashboard

export interface BrandConfig {
  brandName: string;
  brandAliases?: string[]; // Alternative names/variations of the brand
}

export interface APIConfig {
  openai?: {
    apiKey: string;
    model?: string; // e.g., 'gpt-4', 'gpt-3.5-turbo'
  };
  anthropic?: {
    apiKey: string;
    model?: string; // e.g., 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'
  };
  perplexity?: {
    apiKey: string;
    model?: string; // e.g., 'pplx-70b-online'
  };
  google?: {
    apiKey: string;
    model?: string; // e.g., 'gemini-pro'
  };
}

export interface AppConfig {
  brand: BrandConfig;
  api: APIConfig;
  dataFile?: {
    path?: string;
    type?: 'csv' | 'excel';
  };
  language?: {
    code?: string; // e.g., 'da' for Danish
    country?: string; // e.g., 'DK' for Denmark
  };
}

// Default configuration - can be overridden
let appConfig: AppConfig = {
  brand: {
    brandName: 'Samlino',
    brandAliases: ['Samlino', 'samlino', 'samlino.dk', 'samlino dk'],
  },
  api: {},
  language: {
    code: 'da', // Danish
    country: 'DK', // Denmark
  },
};

export function getConfig(): AppConfig {
  return appConfig;
}

export function setConfig(config: Partial<AppConfig>): void {
  appConfig = { ...appConfig, ...config };
}

export function getBrandName(): string {
  return appConfig.brand.brandName;
}

export function getBrandAliases(): string[] {
  return appConfig.brand.brandAliases || [];
}

// Load config from localStorage and environment variables
export function loadConfigFromStorage(): AppConfig | null {
  try {
    const stored = localStorage.getItem('ai-visibility-config');
    if (stored) {
      const config = JSON.parse(stored);
      appConfig = { ...appConfig, ...config };
      return config;
    } else {
      // Initialize with environment variables if available
      const envConfig: Partial<AppConfig> = {
        brand: {
          brandName: import.meta.env.VITE_BRAND_NAME || 'Samlino',
          brandAliases: ['Samlino', 'samlino', 'samlino.dk', 'samlino dk'],
        },
        api: {},
        language: {
          code: 'da', // Danish
          country: 'DK', // Denmark
        },
      };

      // Load API keys from environment variables
      if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
        envConfig.api!.anthropic = {
          apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
          model: 'claude-3-5-haiku-20241022', // Haiku 4.5
        };
      }
      if (import.meta.env.VITE_OPENAI_API_KEY) {
        envConfig.api!.openai = {
          apiKey: import.meta.env.VITE_OPENAI_API_KEY,
          model: 'gpt-5-nano', // GPT-5 Nano
        };
      }
      if (import.meta.env.VITE_PERPLEXITY_API_KEY) {
        envConfig.api!.perplexity = {
          apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY,
          model: 'pplx-70b-online',
        };
      }
      if (import.meta.env.VITE_GOOGLE_API_KEY) {
        envConfig.api!.google = {
          apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
          model: 'gemini-pro',
        };
      }

      if (Object.keys(envConfig.api || {}).length > 0 || envConfig.brand?.brandName) {
        setConfig(envConfig);
        saveConfigToStorage(envConfig);
        return envConfig as AppConfig;
      }
    }
  } catch (error) {
    console.error('Failed to load config from storage:', error);
  }
  return null;
}

// Save config to localStorage
export function saveConfigToStorage(config: Partial<AppConfig>): void {
  try {
    setConfig(config);
    const configToSave = JSON.stringify(appConfig);
    localStorage.setItem('ai-visibility-config', configToSave);
    console.log('[Config] Saved to localStorage:', {
      hasAnthropic: !!appConfig.api.anthropic?.apiKey,
      hasOpenAI: !!appConfig.api.openai?.apiKey,
      openaiModel: appConfig.api.openai?.model,
    });
    // Trigger storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'ai-visibility-config',
      newValue: configToSave,
    }));
  } catch (error) {
    console.error('Failed to save config to storage:', error);
  }
}

/**
 * Clear config cache and reload from defaults/environment
 */
export function clearConfigCache(): void {
  localStorage.removeItem('ai-visibility-config');
  // Reset to defaults
  appConfig = {
    brand: {
      brandName: 'Samlino',
      brandAliases: ['Samlino', 'samlino', 'samlino.dk', 'samlino dk'],
    },
    api: {},
    language: {
      code: 'da', // Danish
      country: 'DK', // Denmark
    },
  };
  // Reload from environment if available
  loadConfigFromStorage();
  console.log('[Config] Cache cleared, config reset');
}
