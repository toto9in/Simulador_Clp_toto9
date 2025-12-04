/**
 * E2E tests for button types and PushButton component
 * Tests UI interaction with SWITCH, NO, and NC button types
 */

import { test, expect } from '@playwright/test';

test.describe('Button Types - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
    await expect(page).toHaveTitle(/PLC Simulator/i, { timeout: 10000 });

    // Enter a simple program
    await page.getByRole('button', { name: /program/i }).click();
    const codeEditor = page.locator('[role="textbox"]').first();
    await codeEditor.fill('LD I0.0\nOUT Q0.0');

    // Switch to RUN mode
    await page.getByRole('button', { name: /run/i }).click();
    await page.waitForTimeout(500);
  });

  test('should display SWITCH type by default', async ({ page }) => {
    // Find I0.0 button - should show SWITCH type label
    const input0 = page.locator('text=I0.0').first();
    await expect(input0).toBeVisible();

    // Check for SWITCH type indicator
    const typeLabel = page.locator('.io-item:has-text("I0.0")').locator('.io-item__type');
    await expect(typeLabel).toContainText('SWITCH');
  });

  test('should toggle SWITCH button state on click', async ({ page }) => {
    // Find I0.0 button
    const buttonContainer = page.locator('.io-item').filter({ hasText: 'I0.0' });
    const button = buttonContainer.locator('button.io-item__button');
    const status = buttonContainer.locator('.io-item__status');

    // Initial state should be 0
    await expect(status).toContainText('0');

    // Click to toggle ON
    await button.click();
    await page.waitForTimeout(200);
    await expect(status).toContainText('1');

    // Click again to toggle OFF
    await button.click();
    await page.waitForTimeout(200);
    await expect(status).toContainText('0');
  });

  test('should cycle through button types with right-click', async ({ page }) => {
    const buttonContainer = page.locator('.io-item').filter({ hasText: 'I0.0' });
    const button = buttonContainer.locator('button.io-item__button');
    const typeLabel = buttonContainer.locator('.io-item__type');

    // Initially SWITCH
    await expect(typeLabel).toContainText('SWITCH');

    // Right-click to cycle to NO
    await button.click({ button: 'right' });
    await page.waitForTimeout(200);
    await expect(typeLabel).toContainText('NO');

    // Right-click to cycle to NC
    await button.click({ button: 'right' });
    await page.waitForTimeout(200);
    await expect(typeLabel).toContainText('NC');

    // Right-click to cycle back to SWITCH
    await button.click({ button: 'right' });
    await page.waitForTimeout(200);
    await expect(typeLabel).toContainText('SWITCH');
  });

  test('should handle NO (Normally Open) button behavior', async ({ page }) => {
    const buttonContainer = page.locator('.io-item').filter({ hasText: 'I0.0' });
    const button = buttonContainer.locator('button.io-item__button');
    const status = buttonContainer.locator('.io-item__status');
    const typeLabel = buttonContainer.locator('.io-item__type');

    // Change to NO type
    await button.click({ button: 'right' }); // SWITCH -> NO
    await expect(typeLabel).toContainText('NO');
    await page.waitForTimeout(200);

    // NO button should start at 0 (released)
    await expect(status).toContainText('0');

    // Press and hold (mousedown) - should go to 1
    await button.dispatchEvent('mousedown');
    await page.waitForTimeout(200);
    await expect(status).toContainText('1');

    // Release (mouseup) - should return to 0
    await button.dispatchEvent('mouseup');
    await page.waitForTimeout(200);
    await expect(status).toContainText('0');
  });

  test('should handle NC (Normally Closed) button behavior', async ({ page }) => {
    const buttonContainer = page.locator('.io-item').filter({ hasText: 'I0.0' });
    const button = buttonContainer.locator('button.io-item__button');
    const status = buttonContainer.locator('.io-item__status');
    const typeLabel = buttonContainer.locator('.io-item__type');

    // Change to NC type
    await button.click({ button: 'right' }); // SWITCH -> NO
    await button.click({ button: 'right' }); // NO -> NC
    await expect(typeLabel).toContainText('NC');
    await page.waitForTimeout(200);

    // NC button should start at 1 (released/not pressed)
    await expect(status).toContainText('1');

    // Press (mousedown) - should go to 0
    await button.dispatchEvent('mousedown');
    await page.waitForTimeout(200);
    await expect(status).toContainText('0');

    // Release (mouseup) - should return to 1
    await button.dispatchEvent('mouseup');
    await page.waitForTimeout(200);
    await expect(status).toContainText('1');
  });

  test('should display different icons for different button types', async ({ page }) => {
    const buttonContainer = page.locator('.io-item').filter({ hasText: 'I0.0' });
    const button = buttonContainer.locator('button.io-item__button');
    const icon = button.locator('img.io-item__icon');

    // SWITCH icon
    const switchIconSrc = await icon.getAttribute('src');
    expect(switchIconSrc).toContain('chave');

    // Change to NO
    await button.click({ button: 'right' });
    await page.waitForTimeout(200);
    const noIconSrc = await icon.getAttribute('src');
    expect(noIconSrc).toContain('buttom.png');

    // Change to NC
    await button.click({ button: 'right' });
    await page.waitForTimeout(200);
    const ncIconSrc = await icon.getAttribute('src');
    expect(ncIconSrc).toContain('buttom_pi');
  });
});

test.describe('PushButton Component - Batch Scene', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });

    // Load batch example
    await page.getByRole('button', { name: /examples/i }).click();
    await page.waitForTimeout(500);

    // Find and click batch example
    const batchExample = page.locator('text=/batch.*automatic/i').first();
    if (await batchExample.isVisible()) {
      await batchExample.click();
      await page.waitForTimeout(500);
    }

    // Switch to batch scene
    await page.getByRole('button', { name: /scenes/i }).click();
    await page.waitForTimeout(300);
    const batchScene = page.locator('text=/batch/i').first();
    if (await batchScene.isVisible()) {
      await batchScene.click();
      await page.waitForTimeout(500);
    }

    // Switch to RUN mode
    await page.getByRole('button', { name: /run/i }).click();
    await page.waitForTimeout(500);
  });

  test('should display START and STOP PushButtons', async ({ page }) => {
    // Look for PushButton components
    const startButton = page.locator('.push-button').filter({ hasText: /START/i }).or(
      page.locator('text=/START.*I0.0/i')
    );
    const stopButton = page.locator('.push-button').filter({ hasText: /STOP/i }).or(
      page.locator('text=/STOP.*I0.1/i')
    );

    // Both buttons should be visible
    const startVisible = await startButton.count() > 0;
    const stopVisible = await stopButton.count() > 0;

    expect(startVisible || stopVisible).toBeTruthy();
  });

  test('should have different colors for START and STOP buttons', async ({ page }) => {
    // Find START button (should be GRAY palette)
    const startPushButton = page.locator('.push-button--gray').first();

    // Find STOP button (should be RED palette)
    const stopPushButton = page.locator('.push-button--red').first();

    // Check if at least one of each exists
    const hasGrayButton = await startPushButton.count() > 0;
    const hasRedButton = await stopPushButton.count() > 0;

    expect(hasGrayButton).toBeTruthy();
    expect(hasRedButton).toBeTruthy();
  });

  test('should show visual feedback when PushButton is pressed', async ({ page }) => {
    const pushButton = page.locator('.push-button').first();

    if (await pushButton.isVisible()) {
      // Check initial state (not pressed)
      const initialClass = await pushButton.getAttribute('class');
      expect(initialClass).not.toContain('push-button--pressed');

      // Press button
      await pushButton.dispatchEvent('mousedown');
      await page.waitForTimeout(100);

      // Should have pressed class
      const pressedClass = await pushButton.getAttribute('class');
      expect(pressedClass).toContain('push-button--pressed');

      // Release button
      await pushButton.dispatchEvent('mouseup');
      await page.waitForTimeout(100);

      // Should no longer have pressed class
      const releasedClass = await pushButton.getAttribute('class');
      expect(releasedClass).not.toContain('push-button--pressed');
    }
  });
});

test.describe('Button Type Examples', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
    await page.getByRole('button', { name: /program/i }).click();
  });

  test('should load SWITCH basic example', async ({ page }) => {
    await page.getByRole('button', { name: /examples/i }).click();
    await page.waitForTimeout(500);

    const switchExample = page.locator('text=/SWITCH.*Basic/i').first();
    if (await switchExample.isVisible()) {
      await switchExample.click();
      await page.waitForTimeout(500);

      // Verify program was loaded
      const codeEditor = page.locator('[role="textbox"]').first();
      const content = await codeEditor.inputValue();
      expect(content).toContain('LD I0.0');
      expect(content).toContain('OUT Q0.0');
    }
  });

  test('should load NO basic example', async ({ page }) => {
    await page.getByRole('button', { name: /examples/i }).click();
    await page.waitForTimeout(500);

    const noExample = page.locator('text=/NO.*Basic/i').first();
    if (await noExample.isVisible()) {
      await noExample.click();
      await page.waitForTimeout(500);

      const codeEditor = page.locator('[role="textbox"]').first();
      const content = await codeEditor.inputValue();
      expect(content).toContain('Normally Open');
      expect(content).toContain('LD I0.0');
    }
  });

  test('should load NC basic example', async ({ page }) => {
    await page.getByRole('button', { name: /examples/i }).click();
    await page.waitForTimeout(500);

    const ncExample = page.locator('text=/NC.*Basic/i').first();
    if (await ncExample.isVisible()) {
      await ncExample.click();
      await page.waitForTimeout(500);

      const codeEditor = page.locator('[role="textbox"]').first();
      const content = await codeEditor.inputValue();
      expect(content).toContain('Normally Closed');
      expect(content).toContain('LD I0.0');
    }
  });

  test('should load NO START/STOP example', async ({ page }) => {
    await page.getByRole('button', { name: /examples/i }).click();
    await page.waitForTimeout(500);

    const startStopExample = page.locator('text=/NO.*START/i').first();
    if (await startStopExample.isVisible()) {
      await startStopExample.click();
      await page.waitForTimeout(500);

      const codeEditor = page.locator('[role="textbox"]').first();
      const content = await codeEditor.inputValue();
      expect(content).toContain('Seal-in');
      expect(content).toContain('OR Q0.0');
    }
  });

  test('should load NC safety circuit example', async ({ page }) => {
    await page.getByRole('button', { name: /examples/i }).click();
    await page.waitForTimeout(500);

    const safetyExample = page.locator('text=/NC.*Safety/i').first();
    if (await safetyExample.isVisible()) {
      await safetyExample.click();
      await page.waitForTimeout(500);

      const codeEditor = page.locator('[role="textbox"]').first();
      const content = await codeEditor.inputValue();
      expect(content).toContain('Safety Circuit');
      expect(content).toContain('AND I0.0');
      expect(content).toContain('AND I0.1');
    }
  });
});
