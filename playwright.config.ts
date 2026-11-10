import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// Endereço da Toolshop: o site público por omissão, ou o que vier em BASE_URL
// (ex.: http://localhost:4200 para a Toolshop local em Docker).
const baseURL = process.env.BASE_URL ?? 'https://practicesoftwaretesting.com';
const ambienteLocal = /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(baseURL);

// Tags que ficam de fora:
// @wip      - sempre
// @sem-ci   - na CI (criam contas)
// @so-local - fora da Toolshop local (provocam falhas de login e bloqueios de conta)
const tagsExcluidas = ['@wip'];
if (process.env.CI) tagsExcluidas.push('@sem-ci');
if (!ambienteLocal) tagsExcluidas.push('@so-local');

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
  tags: tagsExcluidas.map((tag) => `not ${tag}`).join(' and '),
});

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  //testDir: './tests',
  testDir,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  // Na Toolshop local, o mesmo computador corre os browsers E a loja (em modo de
  // desenvolvimento, mais lenta). Com 6 testes em paralelo, o filtro de preço
  // (um pedido à API por tecla) esgotava o tempo. Por isso: menos paralelismo
  // e mais tempo por teste. O site público e a CI ficam como estavam.
  workers: process.env.CI ? 1 : ambienteLocal ? 2 : undefined,
  timeout: ambienteLocal ? 60_000 : 30_000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    baseURL,
    testIdAttribute: 'data-test',

    // Cada ação (clicar, preencher...) desiste ao fim de 15 s. Sem isto, um seletor errado
    // ficava à espera até ao fim do tempo do teste (180 s nos cenários @slow).
    actionTimeout: 15_000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    //trace: 'on-first-retry',

    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  expect: {
    timeout: process.env.CI ? 10_000 : 5_000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
