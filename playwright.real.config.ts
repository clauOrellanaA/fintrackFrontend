import { defineConfig } from '@playwright/test';

const required = ['FINTRACK_TEST_API_URL', 'FINTRACK_TEST_MONTH', 'FINTRACK_TEST_EMAIL_A', 'FINTRACK_TEST_PASSWORD_A', 'FINTRACK_TEST_EMAIL_B', 'FINTRACK_TEST_PASSWORD_B'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) throw new Error(`API real: faltan parámetros ${missing.join(', ')}`);
const api = new URL(process.env.FINTRACK_TEST_API_URL!);
if (!['http:', 'https:'].includes(api.protocol) || api.username || api.password || api.search || api.hash) throw new Error('API real: URL HTTP(S) sin credenciales ni query requerida');
if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(process.env.FINTRACK_TEST_MONTH!)) throw new Error('API real: mes YYYY-MM requerido');
if (process.env.FINTRACK_TEST_EMAIL_A === process.env.FINTRACK_TEST_EMAIL_B) throw new Error('API real: se requieren dos cuentas distintas');
export default defineConfig({
  testDir: './e2e/real', workers: 1, retries: 0, reporter: 'list',
  use: { baseURL: 'http://localhost:5175', browserName: 'chromium', trace: 'off', screenshot: 'off', video: 'off' },
  webServer: { command: 'npm run dev -- --port 5175', url: 'http://localhost:5175', reuseExistingServer: false, env: { VITE_API_BASE_URL: api.href.replace(/\/$/, '') } },
});
