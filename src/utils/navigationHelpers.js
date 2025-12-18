/**
 * Navigation Helpers - Shared utilities for TV navigation operations.
 * Provides reusable functions for focus management, text normalization, and polling.
 */

import { TIMEOUTS } from './constants.js';

/**
 * Normalise a string value for comparison.
 * Converts to lowercase and trims whitespace.
 * @param {string|null|undefined} value - The value to normalise
 * @returns {string} Normalised string or empty string if value is falsy
 */
export function normalise(value) {
  return value ? value.toLowerCase().trim() : '';
}

/**
 * Wait for focus to change by polling the focused element's attribute.
 * Useful when navigating through lists where focus shifts between elements.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {Function} getValueFn - Async function that returns the current focused element's identifier
 * @param {string|null} previousValue - The value before the navigation action
 * @param {number} [timeout=TIMEOUTS.FOCUS_CHANGE] - Maximum time to wait for focus change
 * @returns {Promise<string|null>} The new focused value, or previousValue if timeout
 */
export async function waitForFocusChange(page, getValueFn, previousValue, timeout = TIMEOUTS.FOCUS_CHANGE) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const currentValue = await getValueFn();
    if (currentValue !== previousValue) {
      return currentValue;
    }
    await page.waitForTimeout(TIMEOUTS.POLLING_INTERVAL);
  }

  return previousValue;
}

/**
 * Log a navigation failure with context.
 * @param {string} context - Description of what was being attempted
 * @param {string} target - The target that was not found
 * @param {string|null} lastFocused - The last focused element identifier
 */
export function logNavigationFailure(context, target, lastFocused) {
  console.warn(
    `[Navigation] Failed to find "${target}" during ${context}. ` +
      `Last focused element: "${lastFocused || 'none'}"`
  );
}

/**
 * Create a focus getter function for elements with data-testid attribute.
 * @param {import('@playwright/test').Locator} containerLocator - The container to search within
 * @param {string} [focusSelector='[role="listitem"][data-focused="focused"]'] - Selector for focused element
 * @returns {Function} Async function that returns the focused element's data-testid
 */
export function createTestIdFocusGetter(
  containerLocator,
  focusSelector = '[role="listitem"][data-focused="focused"]'
) {
  return async () => {
    const focused = containerLocator.locator(focusSelector);
    if ((await focused.count()) === 0) {
      return null;
    }
    return await focused.getAttribute('data-testid');
  };
}

/**
 * Create a focus getter function for elements with text content.
 * @param {import('@playwright/test').Locator} containerLocator - The container to search within
 * @param {string} [focusSelector='[role="listitem"][data-focused="focused"]'] - Selector for focused element
 * @returns {Function} Async function that returns the focused element's text content
 */
export function createTextFocusGetter(
  containerLocator,
  focusSelector = '[role="listitem"][data-focused="focused"]'
) {
  return async () => {
    const focused = containerLocator.locator(focusSelector);
    if ((await focused.count()) === 0) {
      return null;
    }
    return await focused.textContent();
  };
}

export default {
  normalise,
  waitForFocusChange,
  logNavigationFailure,
  createTestIdFocusGetter,
  createTextFocusGetter,
};
