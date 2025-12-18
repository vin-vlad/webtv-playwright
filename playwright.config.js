import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';


dotenv.config();

/**
 * Playwright configuration for TV web interface testing.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  
  testDir: './tests',

  
  fullyParallel: false,

  
  forbidOnly: !!process.env.CI,

  
  retries: process.env.CI ? 2 : 0,

  
  workers: process.env.CI ? 1 : undefined,

  
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  
  use: {
    
    baseURL: process.env.APP_URL || 'http://localhost:3000',

    
    trace: 'on-first-retry',

    
    screenshot: 'only-on-failure',

    
    video: 'retain-on-failure',

    
    viewport: { width: 1920, height: 1080 },

    
    actionTimeout: 10000,
  },

  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    
    
    
    
    
    
    
    
  ],

  
  outputDir: 'test-results/',
});
