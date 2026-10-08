import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // Shared YAML lives one directory above the Vercel project root.
  outputFileTracingRoot: fileURLToPath(new URL('..', import.meta.url)),
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) },
  experimental: { useTypeScriptCli: true },
};
export default nextConfig;
