/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GITHUB_USERNAME?: string;
  /** Server/build only — never PUBLIC_; matches yuichkun github-contribution-graph-example. */
  readonly GITHUB_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
