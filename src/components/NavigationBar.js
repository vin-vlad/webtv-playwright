import { expect } from '@playwright/test';
import { NAVIGATION_LIMITS } from '../utils/constants.js';

/**
 * NavigationBar - Component object for the top navigation menu.
 *
 * This models the structure described in the TV web app:
 * - A top-level navigation region with role="navigation" and aria-label="Main menu"
 * - One or more child elements with roles "menubar" and "menu"
 * - Tabs inside the menubar identified by data-testid
 * - Child items with aria-labels: Search, Home, Tv Guide, Channels, Gaming, Free, Apps
 */
export class NavigationBar {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;

    /**
     * Root navigation region: role="navigation" aria-label="Main menu"
     * @type {import('@playwright/test').Locator}
     */
    this.root = this.page.getByRole('navigation', { name: 'Main menu' });

    /**
     * All menubar elements inside the navigation.
     * @type {import('@playwright/test').Locator}
     */
    this.menubars = this.root.getByRole('menubar');

    /**
     * All menu elements inside the navigation.
     * @type {import('@playwright/test').Locator}
     */
    this.menus = this.root.getByRole('menu');

    /**
     * Helper to get a specific tab within any menubar by its data-testid.
     * @param {string} testId
     * @returns {import('@playwright/test').Locator}
     */
    this.getTabByTestId = (testId) => this.menubars.getByTestId(testId);

    /**
     * Menu items within the navigation bar.
     * Using chained selectors to target the inner menuitem (not the wrapper).
     */
    this.searchItem = this.page
      .getByTestId('main-menu-item-0')
      .getByRole('menuitem', { name: 'Search' });
    this.homeItem = this.page
      .getByTestId('main-menu-item-1')
      .getByRole('menuitem', { name: 'Home' });
    this.tvGuideItem = this.page
      .getByTestId('main-menu-item-2')
      .getByRole('menuitem', { name: 'Tv Guide' });
    this.channelsItem = this.page
      .getByTestId('main-menu-item-3')
      .getByRole('menuitem', { name: 'Channels' });
    this.gamingItem = this.page
      .getByTestId('main-menu-item-4')
      .getByRole('menuitem', { name: 'Gaming' });
    this.freeItem = this.page
      .getByTestId('main-menu-item-5')
      .getByRole('menuitem', { name: 'Free' });
    this.appsItem = this.page
      .getByTestId('main-menu-item-6')
      .getByRole('menuitem', { name: 'Apps' });

    /**
     * Menu items map for navigation by name.
     * Keys are menu item names, values contain the locator and position index.
     */
    this.menuItems = {
      Search: { item: this.searchItem, index: 0 },
      Home: { item: this.homeItem, index: 1 },
      'Tv Guide': { item: this.tvGuideItem, index: 2 },
      Channels: { item: this.channelsItem, index: 3 },
      Gaming: { item: this.gamingItem, index: 4 },
      Free: { item: this.freeItem, index: 5 },
      Apps: { item: this.appsItem, index: 6 },
    };
  }

  /**
   * Navigate to a menu item by name from the home screen.
   * Moves up to reach the menubar, then navigates left/right to focus the target item.
   *
   * @param {import('../utils/remoteControl.js').RemoteControl} remote - Remote control instance
   * @param {string} menuName - Name of the menu item to navigate to (e.g., 'Search', 'Apps')
   * @param {number} [maxSteps=NAVIGATION_LIMITS.MAX_MENU_STEPS] - Maximum navigation steps
   * @returns {Promise<import('@playwright/test').Locator>} The focused menu item locator
   * @throws {Error} If menu name is not recognized
   */
  async navigateToMenuItemByName(remote, menuName, maxSteps = NAVIGATION_LIMITS.MAX_MENU_STEPS) {
    const target = this.menuItems[menuName];
    if (!target) {
      throw new Error(
        `Unknown menu item: "${menuName}". Valid items: ${Object.keys(this.menuItems).join(', ')}`
      );
    }

    // Move up to the menubar (focus starts on Home)
    await remote.moveUp(2);
    await expect(this.homeItem).toHaveAttribute('data-focused', 'focused');

    const homeIndex = 1;
    const direction = target.index > homeIndex ? 'right' : 'left';
    const steps = Math.abs(target.index - homeIndex);

    // Navigate to the target menu item
    if (direction === 'right') {
      for (let i = 0; i < Math.min(steps, maxSteps); i++) {
        const isFocused = await target.item.getAttribute('data-focused');
        if (isFocused === 'focused') {
          break;
        }
        await remote.moveRight();
      }
    } else {
      for (let i = 0; i < Math.min(steps, maxSteps); i++) {
        const isFocused = await target.item.getAttribute('data-focused');
        if (isFocused === 'focused') {
          break;
        }
        await remote.moveLeft();
      }
    }

    await expect(target.item).toHaveAttribute('data-focused', 'focused');
    return target.item;
  }
}

export default NavigationBar;
