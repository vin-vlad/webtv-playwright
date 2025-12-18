/**
 * BasePage - Base class for all page objects in the TV web application.
 * Provides common functionality shared across all pages.
 */
export class BasePage {
  /**
   * Creates an instance of BasePage.
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to the base URL (home screen).
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Wait for the page to be fully loaded.
   * @param {'domcontentloaded' | 'load' | 'networkidle'} [state='domcontentloaded'] - Load state to wait for
   */
  async waitForPageLoad(state = 'domcontentloaded') {
    await this.page.waitForLoadState(state);
  }
}

export default BasePage;
