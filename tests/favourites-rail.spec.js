import { test, expect } from '@playwright/test';
import { HomeScreenPage } from '../src/pages/HomeScreenPage.js';

/**
 * Favourites Rail Tests
 * Tests to verify adding, removing, and protecting apps in the Favourite Apps rail.
 */
test.describe('Favourites Rail Tests', () => {
  let homePage;

  /**
   * Test helper: Verify bottom overlay hint is initially disabled
   */
  const verifyBottomOverlayDisabled = async () => {
    const { hint } = homePage.getBottomOverlayElements();
    await expect(hint).toHaveAttribute('data-enabled', 'false');
  };

  /**
   * Test helper: Navigate to an app and verify it's focused
   */
  const navigateAndVerifyApp = async (appName) => {
    const favouriteAppsRail = homePage.getFavouriteAppsRail();
    await expect(favouriteAppsRail).toBeVisible();

    await homePage.navigateToApp(appName);

    const focusedApp = homePage.getFocusedAppInFavouritesRail();
    await expect(focusedApp).toHaveAttribute('data-testid', appName);
  };

  test.beforeEach(async ({ page }) => {
    
    homePage = new HomeScreenPage(page);

    
    await homePage.goto();

    
    const favouriteAppsRail = homePage.getFavouriteAppsRail();
    await expect(favouriteAppsRail).toBeVisible();
  });

  test('should NOT allow deleting "Watch TV" app from Favourite Apps rail', async () => {
    
    await navigateAndVerifyApp('Watch TV');

    
    await verifyBottomOverlayDisabled();

    
    await homePage.remote.holdSelect(1500);

    
    const editControls = homePage.getEditControlsForFocusedApp();
    await expect(editControls).toBeVisible();
    const moveAppLeftButton = editControls.locator('[class^="_chevronLeft_"]');
    await expect(moveAppLeftButton).toHaveAttribute('data-focused', 'disabled');
    const moveAppRightButton = editControls.locator('[class^="_chevronRight_"]');
    await expect(moveAppRightButton).toHaveAttribute('data-focused', 'disabled');
    
    const deleteButton = editControls.getByTestId('editmode-remove-app');
    await expect(deleteButton).toHaveAttribute('data-focused', 'disabled');
    
    const watchTVFound = await homePage.navigateToApp('Watch TV');
    expect(watchTVFound).toBe(true);
  });

  test('should allow deleting an app from Favourite Apps rail via long press', async ({ page }) => {
    
    await homePage.ensureNetflixInFavorites();

    
    await homePage.goto();

    
    await navigateAndVerifyApp('Netflix');

    
    await verifyBottomOverlayDisabled();

    
    await homePage.remote.holdSelect(1500);

    
    const editControls = homePage.getEditControlsForFocusedApp();
    const deleteButton = editControls.getByTestId('editmode-remove-app');
    await expect(deleteButton).toBeVisible();

    
    await homePage.remote.moveDown();

    
    const { overlay, hint } = homePage.getBottomOverlayElements();
    await expect(overlay).toBeVisible();
    await expect(hint).toHaveText('Press OK to remove');

    
    await homePage.remote.select();

    
    await page.reload();

    
    const refreshedRail = homePage.getFavouriteAppsRail();
    await expect(refreshedRail).toBeVisible();

    const netflixFound = await homePage.navigateToApp('Netflix');
    expect(netflixFound).toBe(false);
  });

  test('should allow adding an app to Favourite Apps rail from Apps page', async () => {
    
    
    await homePage.removeAppFromFavoritesIfExists('Crunchyroll');
    await homePage.goto(); 

    
    const isInFavoritesBefore = await homePage.isAppInFavorites('Crunchyroll');
    expect(isInFavoritesBefore).toBe(false);

    
    await homePage.navigateToAppsPage();

    
    const added = await homePage.addAppToFavoritesFromAppsPage('Crunchyroll');
    expect(added).toBe(true);

    
    await homePage.goto();

    
    const favouriteAppsRail = homePage.getFavouriteAppsRail();
    await expect(favouriteAppsRail).toBeVisible();

    
    const isInFavoritesAfter = await homePage.isAppInFavorites('Crunchyroll');
    expect(isInFavoritesAfter).toBe(true);

    
    const crunchyrollFound = await homePage.navigateToApp('Crunchyroll');
    expect(crunchyrollFound).toBe(true);

    
    const focusedApp = homePage.getFocusedAppInFavouritesRail();
    await expect(focusedApp).toHaveAttribute('data-testid', 'Crunchyroll');
  });
});
