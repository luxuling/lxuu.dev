interface ImportMetaEnv {
  readonly GITHUB_TOKEN?: string;
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface WindowEventMap {
  'app:toast': CustomEvent<string>;
}

declare namespace App {
  interface Locals {
    db: import('./db/client').Db;
    sessionSecret: string;
  }
}
