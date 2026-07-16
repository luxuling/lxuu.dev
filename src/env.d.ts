interface ImportMetaEnv {
  readonly GITHUB_USERNAME?: string;
  readonly GITHUB_TOKEN?: string;
  readonly DATABASE_URL: string;
  readonly SESSION_SECRET: string;
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    db: import('./lib/db/client').Db;
  }
}
