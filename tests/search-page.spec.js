import { test, expect } from '@playwright/test';
import { SearchPage } from '../src/pages/SearchPage.js';

/**
 * Search Page Tests
 * Tests to verify search page functionality including category selection and content display.
 */
test.describe('Search Page Tests', () => {
  let searchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);

    await searchPage.goto();

    const searchInput = searchPage.getSearchInput();
    await expect(searchInput).toBeVisible();

    const categoriesList = searchPage.getCategoriesList();
    await expect(categoriesList).toBeVisible();

    const categoryItems = searchPage.getCategoryItems();
    await expect(categoryItems.first()).toBeVisible({ timeout: 10000 });
    const categoryCount = await categoryItems.count();
    expect(categoryCount).toBeGreaterThan(0);
  });

  test('should be able to navigate through different categories', async () => {
    const categoryName = 'Action';

    const searchInput = searchPage.getSearchInput();
    await expect(searchInput).toBeVisible();

    const actionCategory = searchPage.getCategoryByText(categoryName);
    await expect(actionCategory).toBeVisible();
    await searchPage.remote.moveDown();

    await expect(actionCategory).toHaveAttribute('data-focused', 'true');
    await searchPage.remote.select();

    await searchPage.waitForSearchResults();

    const searchResultsGrid = searchPage.getSearchResultsGrid();
    await expect(searchResultsGrid).toBeVisible();

    await expect(searchResultsGrid).toHaveAttribute(
      'aria-label',
      `Search results for genre: ${categoryName}. Filtered by: movie`
    );

    const firstRowContainer = searchPage.getFirstSearchResultsRowContainer();
    await expect(firstRowContainer).toHaveAttribute('data-focused', 'focused');
  });
});
