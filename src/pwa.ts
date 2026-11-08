/// <reference types="vite/client" />

export function registerServiceWorker(): void {
  if (import.meta.env.PROD && window.isSecureContext && "serviceWorker" in navigator) {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // The game remains available online when registration fails.
    });
  }
}
