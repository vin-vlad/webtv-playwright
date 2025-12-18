/**
 * Constants - Centralized configuration values for TV web application tests.
 * Provides named constants for timeouts, navigation limits, and other magic numbers.
 */

/**
 * Timeout values in milliseconds.
 * Use these instead of hardcoded numbers for better maintainability.
 */
export const TIMEOUTS = {
  /** Default timeout for general operations */
  DEFAULT: 10000,

  /** Timeout for element visibility checks */
  ELEMENT_VISIBILITY: 15000,

  /** Timeout for network idle state */
  NETWORK_IDLE: 5000,

  /** Duration to hold a button for long press actions */
  LONG_PRESS_DURATION: 1500,

  /** Timeout for detecting focus changes */
  FOCUS_CHANGE: 500,

  /** Timeout for polling operations */
  POLLING: 1000,

  /** Delay between key presses for realistic simulation */
  KEY_PRESS_DELAY: 100,

  /** Polling interval for checking state changes */
  POLLING_INTERVAL: 50,

  /** Timeout for waiting for loading states to complete */
  LOADING_COMPLETE: 30000,
};

/**
 * Navigation limits to prevent infinite loops.
 */
export const NAVIGATION_LIMITS = {
  /** Maximum steps when navigating through menu items */
  MAX_MENU_STEPS: 10,

  /** Maximum steps when navigating through a rail/list */
  MAX_RAIL_STEPS: 50,

  /** Maximum steps when navigating to a specific category */
  MAX_CATEGORY_STEPS: 20,

  /** Maximum steps when searching for an app in a rail */
  MAX_APP_SEARCH_STEPS: 100,

  /** Maximum attempts for retry loops */
  MAX_RETRY_ATTEMPTS: 15,

  /** Maximum consecutive attempts without focus change before giving up */
  MAX_STALE_FOCUS_ATTEMPTS: 2,

  /** Maximum down presses when looking for a rail */
  MAX_DOWN_STEPS: 15,
};

export default { TIMEOUTS, NAVIGATION_LIMITS };
