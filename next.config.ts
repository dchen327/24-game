import withSerwistInit from "@serwist/next";

// A unique id per build. Used both as the Next.js build id (which rotates the
// hashed /_next/static chunk URLs) and as the precache revision for the "/"
// app-shell HTML. Tying them to the same value guarantees the precached shell
// and the precached chunks it references always rotate together, so a stale
// shell can never point at chunks that were already evicted from the cache
// (which would crash the app offline with a ChunkLoadError).
const buildId = `${Date.now().toString(36)}-${Math.random()
  .toString(36)
  .slice(2, 10)}`;

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  // The "/" route is server-rendered HTML and isn't auto-globbed by Serwist's
  // webpack plugin (the HTML files don't exist yet when the SW is bundled), so
  // precache it explicitly — but WITH a per-build revision so it updates on
  // every deploy instead of being frozen forever.
  additionalPrecacheEntries: [{ url: "/", revision: buildId }],
});

export default withSerwist({
  output: "export",
  images: { unoptimized: true },
  generateBuildId: () => buildId,
});
