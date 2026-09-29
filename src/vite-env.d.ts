/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_TIMEOUT_MS?: string
  readonly VITE_AUTH_RELAXED?: string
  readonly VITE_USE_DASHBOARD_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
