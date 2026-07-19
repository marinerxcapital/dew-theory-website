import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Parent home directory has another package-lock.json; pin tracing to this app.
  outputFileTracingRoot: path.join(__dirname)
};

export default nextConfig;
