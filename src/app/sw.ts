import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  // __SW_MANIFEST contains every hashed /_next/static asset plus the "/" shell
  // (injected via `additionalPrecacheEntries` in next.config.ts, each with a
  // real per-build revision). Spreading it directly — instead of appending a
  // hardcoded `{ url: "/", revision: null }` — ensures the shell rotates with
  // the chunks it references and never goes stale.
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
