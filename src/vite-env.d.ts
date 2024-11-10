/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONFLUENCE_BASE_URL: string
  readonly VITE_CONFLUENCE_USERNAME: string
  readonly VITE_CONFLUENCE_API_TOKEN: string
  readonly VITE_CONFLUENCE_SPACE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}