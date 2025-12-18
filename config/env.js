import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment configuration helper.
 * Provides centralized access to environment variables with defaults.
 */
export const env = {
  /**
   * Base URL of the TV web application being tested.
   * @type {string}
   */
  APP_URL: process.env.APP_URL || 'http://localhost:3000',

  /**
   * Whether running in CI environment.
   * @type {boolean}
   */
  CI: !!process.env.CI,

  /**
   * Debug mode flag.
   * @type {boolean}
   */
  DEBUG: process.env.DEBUG === 'true',
};

export default env;
