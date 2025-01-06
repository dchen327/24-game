import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {};

export default withPWA({
  dest: "public", // PWA assets (service worker) will be generated in the public folder
  register: true, // Automatically register the service worker
  skipWaiting: true, // Activate the new service worker as soon as it's available
  disable: process.env.NODE_ENV === "development", // Disable PWA in development
  ...nextConfig, // Merge other Next.js config options
});
