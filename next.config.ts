import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {};

export default withPWA({
  dest: "public", // PWA assets (service worker) will be generated in the public folder
  ...nextConfig,
});
