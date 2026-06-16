/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * GA4 Measurement ID（格式：G-XXXXXXXXXX）
   * 在 Vercel 项目设置 → Environment Variables 中配置。
   * 本地开发可在 .env.local 中定义（不提交到 git）。
   */
  readonly VITE_GA4_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
