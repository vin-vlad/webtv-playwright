import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { RemoteControl } from '../utils/remoteControl.js';
import { NavigationBar } from '../components/NavigationBar.js';
import { TIMEOUTS, NAVIGATION_LIMITS } from '../utils/constants.js';
import {
  normalise,
  waitForFocusChange,
  logNavigationFailure,
  createTestIdFocusGetter,
} from '../utils/navigationHelpers.js';

/**
 * HomeScreenPage - Page object for the TV home screen.
 * Models the main TV interface with focusable tiles, menus, and carousels.
 */
export class HomeScreenPage extends BasePage {
  /**
   * Creates an instance of HomeScreenPage.
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    super(page);
    this.remote = new RemoteControl(page);
    this.nav = new NavigationBar(page);

    this.selectors = {
      homeContainer: '[data-testid="home-container"], .home-container, #home',
      focusedItem: '[data-focused="true"], .focused, :focus',
      loadingIndicator: '[data-testid="loading"], .loading, .spinner',
    };
  }

  /**
   * Navigate to the home screen.
   */
  async goto() {
    await this.page.goto('/');
    await this.waitForHomeScreen();
  }

  /**
   * Wait for the home screen to be fully loaded.
   */
  async waitForHomeScreen() {
    await this.waitForPageLoad('networkidle');

    await expect(this.nav.root).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBILITY });
  }

  /**
   * Get the currently focused element.
   * @returns {import('@playwright/test').Locator} Locator for focused element
   */
  getFocusedElement() {
    return this.page.locator(this.selectors.focusedItem).first();
  }

  /**
   * Get text content of the currently focused element.
   * @returns {Promise<string|null>} Text content of focused element
   */
  async getFocusedElementText() {
    const focused = this.getFocusedElement();
    if ((await focused.count()) > 0) {
      return await focused.textContent();
    }
    return null;
  }

  /**
   * Navigate through the Favourite Apps rail and try to focus a specific app.
   *
   * The method will:
   * - Assume the current focus is already within the Favourite Apps rail
   * - Move right until:
   *   - The requested app is focused (returns true), or
   *   - Pressing right no longer changes the focused element (end of rail, returns false)
   *
   * @param {string} appName - Name of the app to look for (matches against data-testid or text)
   * @param {number} [maxSteps=NAVIGATION_LIMITS.MAX_RAIL_STEPS] - Safety limit for maximum right moves
   * @returns {Promise<boolean>} True if the app was found in the rail, otherwise false
   */
  async navigateToApp(appName, maxSteps = NAVIGATION_LIMITS.MAX_RAIL_STEPS) {
    const favouriteAppsRail = this.page.getByLabel('Favourite Apps');
    await favouriteAppsRail.waitFor({ state: 'visible' });

    const getFocusedAppTestId = createTestIdFocusGetter(favouriteAppsRail);

    const target = normalise(appName);

    for (let i = 0; i < maxSteps; i++) {
      const currentId = await getFocusedAppTestId();

      if (currentId && normalise(currentId) === target) {
        return true;
      }

      await this.remote.moveRight();

      const newId = await waitForFocusChange(
        this.page,
        getFocusedAppTestId,
        currentId,
        TIMEOUTS.FOCUS_CHANGE
      );

      if (newId === currentId) {
        logNavigationFailure('app navigation in Favourite Apps rail', appName, currentId);
        return false;
      }
    }

    logNavigationFailure('app navigation (max steps reached)', appName, null);
    return false;
  }

  /**
   * Check if an app exists in the Favourite Apps rail.
   * @param {string} appName - Name of the app to check (matches aria-label)
   * @returns {Promise<boolean>} True if app is in favorites
   */
  async isAppInFavorites(appName) {
    const rail = this.page.getByRole('list', { name: 'Favourite Apps' });
    const app = rail.getByRole('listitem', { name: appName });
    return (await app.count()) > 0;
  }

  /**
   * Navigate from home screen to the Apps page via the menubar.
   * Uses NavigationBar to navigate to the Apps menu item and selects it.
   */
  async navigateToAppsPage() {
    await this.nav.navigateToMenuItemByName(this.remote, 'Apps');

    await this.remote.select();

    await expect(this.page.getByTestId('lists-container')).toBeVisible();
    await expect(this.page.getByLabel('Featured Apps')).toBeVisible();
    await expect(this.page.getByLabel('Video')).toBeVisible();
  }

  /**
   * Add an app to favorites from the Apps page.
   * Navigates to the Video rail, finds the app, and adds it to favorites.
   * @param {string} appName - Name of the app to add (matches data-testid)
   * @returns {Promise<boolean>} True if app was found and added, false if not found
   */
  async addAppToFavoritesFromAppsPage(appName) {
    const videoRail = this.page.getByRole('list', { name: 'Video' });

    const getFocusedTestId = createTestIdFocusGetter(videoRail);

    /**
     * Check if any item in the Video rail is focused.
     * @returns {Promise<boolean>}
     */
    const isVideoRailItemFocused = async () => {
      const focused = videoRail.locator('[role="listitem"][data-focused="focused"]');
      return (await focused.count()) > 0;
    };

    for (let i = 0; i < NAVIGATION_LIMITS.MAX_DOWN_STEPS; i++) {
      await this.remote.moveDown();

      const hasFocus = await isVideoRailItemFocused();
      if (hasFocus) {
        break;
      }

      if (i < NAVIGATION_LIMITS.MAX_DOWN_STEPS - 1) {
        await this.page.waitForLoadState('domcontentloaded');
      }
    }

    if (!(await isVideoRailItemFocused())) {
      console.warn(
        `[HomeScreenPage] Could not focus any item in Video rail while adding "${appName}"`
      );
      return false;
    }

    let previousTestId = null;

    for (let i = 0; i < NAVIGATION_LIMITS.MAX_APP_SEARCH_STEPS; i++) {
      const currentTestId = await getFocusedTestId();

      if (currentTestId === appName) {
        break;
      }

      if (currentTestId === null || (i > 0 && currentTestId === previousTestId)) {
        logNavigationFailure('Video rail app search', appName, previousTestId);
        return false;
      }

      previousTestId = currentTestId;

      await this.remote.moveRight();

      const newTestId = await waitForFocusChange(
        this.page,
        getFocusedTestId,
        currentTestId,
        TIMEOUTS.POLLING
      );

      if (newTestId === currentTestId) {
        logNavigationFailure('Video rail navigation (end of rail)', appName, currentTestId);
        return false;
      }
    }

    const finalTestId = await getFocusedTestId();
    if (finalTestId !== appName) {
      logNavigationFailure('Video rail final verification', appName, finalTestId);
      return false;
    }

    await this.remote.select();

    const favButton = this.page.locator('#app-fav-button');
    await expect(favButton).toHaveAttribute('data-focused', 'true');
    await this.remote.select();

    await this.waitForHomeScreen();

    await this.remote.select();

    return true;
  }

  /**
   * Ensure Netflix is present in the Favourite Apps rail.
   * If Netflix is not in favorites, navigates to the Apps page and adds it.
   * @throws {Error} If Netflix app cannot be found in the Apps page
   */
  async ensureNetflixInFavorites() {
    if (await this.isAppInFavorites('Netflix')) {
      return;
    }

    console.info('[HomeScreenPage] Netflix not in favorites, attempting to add it...');
    await this.navigateToAppsPage();
    const added = await this.addAppToFavoritesFromAppsPage('Netflix');
    if (!added) {
      throw new Error('Netflix app not found in the Video rail on Apps page');
    }
    console.info('[HomeScreenPage] Netflix successfully added to favorites');
  }

  /**
   * Remove an app from the Favourite Apps rail if it exists.
   * @param {string} appName - Name of the app to remove (matches data-testid)
   * @returns {Promise<boolean>} True if app was removed, false if it wasn't in favorites
   */
  async removeAppFromFavoritesIfExists(appName) {
    if (!(await this.isAppInFavorites(appName))) {
      console.info(`[HomeScreenPage] App "${appName}" not in favorites, nothing to remove`);
      return false;
    }

    const found = await this.navigateToApp(appName);
    if (!found) {
      console.warn(`[HomeScreenPage] Could not navigate to "${appName}" in favorites rail`);
      return false;
    }

    await this.remote.holdSelect(TIMEOUTS.LONG_PRESS_DURATION);

    const editControls = this.getEditControlsForFocusedApp();
    const deleteButton = editControls.getByTestId('editmode-remove-app');

    const deleteButtonState = await deleteButton.getAttribute('data-focused');
    if (deleteButtonState === 'disabled') {
      console.warn(`[HomeScreenPage] App "${appName}" is protected and cannot be deleted`);
      await this.remote.back();
      return false;
    }

    await this.remote.moveDown();

    await this.remote.select();

    console.info(`[HomeScreenPage] App "${appName}" removed from favorites`);
    return true;
  }

  /**
   * Get the Favourite Apps rail locator.
   * @returns {import('@playwright/test').Locator} Locator for the Favourite Apps rail
   */
  getFavouriteAppsRail() {
    return this.page.getByLabel('Favourite Apps');
  }

  /**
   * Get the currently focused app in the Favourite Apps rail.
   * @returns {import('@playwright/test').Locator} Locator for the focused app
   */
  getFocusedAppInFavouritesRail() {
    return this.getFavouriteAppsRail().locator('[role="listitem"][data-focused="focused"]');
  }

  /**
   * Get the bottom overlay elements (overlay container and hint text).
   * @returns {{overlay: import('@playwright/test').Locator, hint: import('@playwright/test').Locator}}
   */
  getBottomOverlayElements() {
    const overlay = this.page.locator('[class^="_bottomOverlay_"]');
    return {
      overlay,
      hint: overlay.locator('[class^="_hint_"]'),
    };
  }

  /**
   * Get edit controls for the currently focused app in Favourites rail.
   * @returns {import('@playwright/test').Locator} Locator for the edit controls
   */
  getEditControlsForFocusedApp() {
    return this.getFocusedAppInFavouritesRail().locator('[class^="_editControls_"]');
  }
}

export default HomeScreenPage;
