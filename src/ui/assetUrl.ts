/// <reference types="vite/client" />

/** Resolve public assets beneath the configured deployment base. */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

/** Share the application root without the current run or query parameters. */
export function appUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).href;
}
