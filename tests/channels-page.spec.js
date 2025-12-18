import { test, expect } from '@playwright/test';
import { HomeScreenPage } from '../src/pages/HomeScreenPage.js';

/**
 * Channels Page Tests
 * Tests to verify video playback on the Channels page.
 */
test.describe('Channels Page Tests', () => {
  test('should play video content when navigating to Channels page', async ({ page, context }) => {
    const homePage = new HomeScreenPage(page);

    
    await homePage.goto();

    
    
    await homePage.remote.moveUp(2);

    
    const homeItem = page
      .getByTestId('main-menu-item-1')
      .getByRole('menuitem', { name: 'Home' });
    await expect(homeItem).toHaveAttribute('data-focused', 'focused');

    
    await homePage.remote.moveRight(2);

    
    const channelsItem = page
      .getByTestId('main-menu-item-3')
      .getByRole('menuitem', { name: 'Channels' });
    await expect(channelsItem).toHaveAttribute('data-focused', 'focused');

    
    const [channelsPage] = await Promise.all([
      context.waitForEvent('page'), 
      homePage.remote.select(),
    ]);

    
    await channelsPage.waitForLoadState('domcontentloaded');

    
    const m3u8Requests = [];
    channelsPage.on('request', (request) => {
      if (request.url().includes('.m3u8')) {
        m3u8Requests.push(request.url());
      }
    });

    
    await channelsPage.waitForResponse(
      (response) => response.url().includes('.m3u8'),
      { timeout: 15000 }
    );

    
    const video = channelsPage.locator('video');
    await expect(video).toBeVisible({ timeout: 10000 });
    await expect(video).toHaveAttribute('autoplay', /.*/);

    
    await channelsPage.waitForTimeout(10000);
    console.log('m3u8Requests', m3u8Requests.length);
    expect(m3u8Requests.length).toBeGreaterThan(0);
  });
});

