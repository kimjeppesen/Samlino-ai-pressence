/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_PERPLEXITY_API_KEY?: string;
  readonly VITE_GOOGLE_API_KEY?: string;
  readonly VITE_BRAND_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
