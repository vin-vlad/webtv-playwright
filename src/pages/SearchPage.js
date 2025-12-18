import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { RemoteControl } from '../utils/remoteControl.js';
import { NavigationBar } from '../components/NavigationBar.js';
import { TIMEOUTS } from '../utils/constants.js';

/**
 * SearchPage - Page object for the TV Search page.
 * Models the search interface with text input and category selection.
 */
export class SearchPage extends BasePage {
  /**
   * Creates an instance of SearchPage.
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.remote = new RemoteControl(page);
    this.nav = new NavigationBar(page);
  }

  /**
   * Navigate to the Search page from home screen.
   * Uses NavigationBar to navigate to the Search menu item and selects it.
   */
  async navigateToSearchPageFromHome() {
    await this.nav.navigateToMenuItemByName(this.remote, 'Search');

    await this.remote.select();

    await this.waitForSearchPageLoad();
  }

  /**
   * Wait for the search page to be fully loaded.
   */
  async waitForSearchPageLoad() {
    await this.waitForPageLoad('networkidle');

    const searchInput = this.getSearchInput();
    await expect(searchInput).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBILITY });
  }

  /**
   * Go to the search page (navigate and wait for load).
   * Note: This assumes starting from home screen.
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    await this.navigateToSearchPageFromHome();
  }

  /**
   * Get the search input field locator.
   * @returns {import('@playwright/test').Locator} Locator for search input
   */
  getSearchInput() {
    return this.page.locator('#search-input');
  }

  /**
   * Get the categories list locator (Genre list).
   * @returns {import('@playwright/test').Locator} Locator for categories list
   */
  getCategoriesList() {
    return this.page.locator('#search-genres');
  }

  /**
   * Get all category items.
   * @returns {import('@playwright/test').Locator} Locator for all category items
   */
  getCategoryItems() {
    return this.getCategoriesList().locator('[role="listitem"]');
  }

  /**
   * Get the currently focused category item.
   * Note: Categories may use different focus indicators, so we check multiple options.
   * @returns {import('@playwright/test').Locator} Locator for focused category
   */
  getFocusedCategory() {
    const withDataFocused = this.getCategoriesList().locator(
      '[role="listitem"][data-focused="focused"]'
    );
    return withDataFocused;
  }

  /**
   * Wait for search results to update after a category selection.
   * @returns {Promise<void>}
   */
  async waitForSearchResults() {
    await this.page
      .waitForLoadState('networkidle', { timeout: TIMEOUTS.NETWORK_IDLE })
      .catch(() => {
        // Silently catch network idle timeout - results may have loaded already
      });
  }

  /**
   * Get a category by its visible text (uses aria-label).
   * @param {string} categoryText - The visible text of the category (e.g., "Action", "Comedy")
   * @returns {import('@playwright/test').Locator} Locator for the category
   */
  getCategoryByText(categoryText) {
    return this.getCategoriesList().locator(`[role="listitem"][aria-label="${categoryText}"]`);
  }

  /**
   * Get the search results grid locator.
   * @returns {import('@playwright/test').Locator} Locator for search results grid
   */
  getSearchResultsGrid() {
    return this.page.locator('#search-results-grid');
  }

  /**
   * Get all row containers in the search results grid.
   * @returns {import('@playwright/test').Locator} Locator for all row containers
   */
  getSearchResultsRowContainers() {
    return this.getSearchResultsGrid().locator('[class*="_rowContainer_"]');
  }

  /**
   * Get the first row container in the search results grid.
   * @returns {import('@playwright/test').Locator} Locator for first row container
   */
  getFirstSearchResultsRowContainer() {
    return this.getSearchResultsRowContainers().first();
  }
}

export default SearchPage;
