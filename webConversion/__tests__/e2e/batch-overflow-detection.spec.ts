import { test, expect } from '@playwright/test';

test.describe('Batch Overflow Detection E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to Batch scene
    await page.locator('select').selectOption('batch');
    await page.waitForTimeout(500);

    // Load the overflow detection example
    const examplesButton = page.locator('button:has-text("Examples")');
    await examplesButton.click();
    await page.waitForTimeout(200);

    const overflowExample = page.locator('text=Batch Process - Overflow Detection');
    await overflowExample.click();
    await page.waitForTimeout(500);

    // Start execution
    await page.locator('button:has-text("RUN")').click();
    await page.waitForTimeout(200);
  });

  test('should load overflow detection example correctly', async ({ page }) => {
    const codeEditor = page.locator('textarea');
    const content = await codeEditor.inputValue();

    expect(content).toContain('Batch Process - Overflow Detection');
    expect(content).toContain('TON T1,120'); // 12 second timeout
    expect(content).toContain('M3'); // Overflow alarm memory
    expect(content).toContain('M4'); // Emergency drain memory
  });

  test('should run normal cycle without triggering overflow alarm', async ({ page }) => {
    // Brief START press (normal operation)
    const startButton = page.locator('button:has-text("START")').first();
    await startButton.click();
    await page.waitForTimeout(100);
    await startButton.click(); // Release

    // Verify filling starts
    await expect(page.locator('text=/PUMP1.*ON/i').first()).toBeVisible({ timeout: 2000 });

    // Wait for tank to fill (10 seconds)
    await page.waitForTimeout(11000);

    // Verify no alarm (ERROR LED should be OFF)
    await expect(page.locator('text=/ERROR.*OFF/i').first()).toBeVisible({ timeout: 2000 });

    // Verify mixing starts
    await expect(page.locator('text=/MIXER.*ON/i').first()).toBeVisible({ timeout: 2000 });
  });

  test('should detect overflow when START held too long', async ({ page }) => {
    // Hold START button for extended period (>12 seconds)
    const startButton = page.locator('button:has-text("START")').first();
    await startButton.click();

    // Verify filling starts
    await expect(page.locator('text=/PUMP1.*ON/i').first()).toBeVisible({ timeout: 2000 });

    // Wait for overflow timeout (12 seconds + margin)
    await page.waitForTimeout(13000);

    // Verify ERROR LED activates
    await expect(page.locator('text=/ERROR.*ON/i').first()).toBeVisible({ timeout: 3000 });

    // Verify ALARM activates
    await expect(page.locator('text=/ALARM.*ON/i').first()).toBeVisible({ timeout: 1000 });

    // Release START
    await startButton.click();
    await page.waitForTimeout(500);

    // Alarm should remain latched
    await expect(page.locator('text=/ERROR.*ON/i').first()).toBeVisible();
  });

  test('should activate emergency drain when overflow detected', async ({ page }) => {
    // Trigger overflow
    const startButton = page.locator('button:has-text("START")').first();
    await startButton.click();

    // Wait for overflow
    await page.waitForTimeout(13000);

    // Release START
    await startButton.click();
    await page.waitForTimeout(500);

    // Verify emergency drain activates
    await expect(page.locator('text=/PUMP3.*ON/i').first()).toBeVisible({ timeout: 3000 });

    // Wait for tank to drain
    await page.waitForTimeout(14000);

    // Verify PUMP3 turns off when empty
    await expect(page.locator('text=/PUMP3.*OFF/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('should clear alarm with RESET button', async ({ page }) => {
    // Trigger overflow
    const startButton = page.locator('button:has-text("START")').first();
    await startButton.click();
    await page.waitForTimeout(13000);
    await startButton.click(); // Release

    // Verify alarm is active
    await expect(page.locator('text=/ERROR.*ON/i').first()).toBeVisible({ timeout: 2000 });

    // Wait for emergency drain to complete
    await page.waitForTimeout(15000);

    // Press RESET (STOP button)
    const resetButton = page.locator('button:has-text("STOP")').first();
    await resetButton.click();
    await page.waitForTimeout(500);
    await resetButton.click(); // Release

    // Verify alarm clears
    await expect(page.locator('text=/ERROR.*OFF/i').first()).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=/ALARM.*OFF/i').first()).toBeVisible({ timeout: 1000 });
  });

  test('should prevent normal operations during overflow alarm', async ({ page }) => {
    // Trigger overflow
    const startButton = page.locator('button:has-text("START")').first();
    await startButton.click();
    await page.waitForTimeout(13000);

    // Alarm should be active
    await expect(page.locator('text=/ERROR.*ON/i').first()).toBeVisible({ timeout: 2000 });

    // PUMP1 should be OFF (blocked by alarm)
    await expect(page.locator('text=/PUMP1.*OFF/i').first()).toBeVisible({ timeout: 2000 });

    // RUN LED should be OFF (no normal operation)
    await expect(page.locator('text=/RUN.*OFF/i').first()).toBeVisible({ timeout: 1000 });

    // Release START
    await startButton.click();
  });

  test('should have separate timers for fill timeout and mix duration', async ({ page }) => {
    // Brief START press (normal operation)
    const startButton = page.locator('button:has-text("START")').first();
    await startButton.click();
    await page.waitForTimeout(100);
    await startButton.click();

    // Wait for filling to complete
    await page.waitForTimeout(11000);

    // Verify mixing starts
    await expect(page.locator('text=/MIXER.*ON/i').first()).toBeVisible({ timeout: 3000 });

    // Mix should run for ~5 seconds (T0)
    await page.waitForTimeout(3000);
    await expect(page.locator('text=/MIXER.*ON/i').first()).toBeVisible();

    await page.waitForTimeout(3000);
    // Mixer should stop after timer completes
    await expect(page.locator('text=/MIXER.*OFF/i').first()).toBeVisible({ timeout: 2000 });
  });

  test('should reset fill timeout timer when not filling', async ({ page }) => {
    // Start and immediately stop
    const startButton = page.locator('button:has-text("START")').first();
    const stopButton = page.locator('button:has-text("STOP")').first();

    await startButton.click();
    await page.waitForTimeout(2000); // Fill for 2 seconds

    await stopButton.click();
    await page.waitForTimeout(500);
    await stopButton.click(); // Release

    await page.waitForTimeout(1000);

    // Verify no alarm (timer should have reset)
    await expect(page.locator('text=/ERROR.*OFF/i').first()).toBeVisible();

    // Start again - should get full 12 seconds
    await startButton.click();
    await page.waitForTimeout(100);
    await startButton.click();

    // Wait 11 seconds - should still be OK
    await page.waitForTimeout(11000);
    await expect(page.locator('text=/ERROR.*OFF/i').first()).toBeVisible();
  });

  test('should complete full recovery cycle after overflow', async ({ page }) => {
    const startButton = page.locator('button:has-text("START")').first();
    const resetButton = page.locator('button:has-text("STOP")').first();

    // 1. Trigger overflow
    await startButton.click();
    await page.waitForTimeout(13000);
    await startButton.click(); // Release

    // 2. Wait for emergency drain
    await page.waitForTimeout(15000);

    // 3. Clear alarm
    await resetButton.click();
    await page.waitForTimeout(500);
    await resetButton.click();

    await page.waitForTimeout(1000);

    // 4. Verify system is ready for new cycle
    await expect(page.locator('text=/ERROR.*OFF/i').first()).toBeVisible();
    await expect(page.locator('text=/ALARM.*OFF/i').first()).toBeVisible();

    // 5. Start new normal cycle
    await startButton.click();
    await page.waitForTimeout(100);
    await startButton.click();

    // 6. Verify normal operation resumes
    await expect(page.locator('text=/PUMP1.*ON/i').first()).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=/RUN.*ON/i').first()).toBeVisible({ timeout: 1000 });
  });

  test('should show correct LED states during overflow condition', async ({ page }) => {
    const startButton = page.locator('button:has-text("START")').first();

    // Trigger overflow
    await startButton.click();
    await page.waitForTimeout(13000);

    // Check all LED states during alarm
    await expect(page.locator('text=/RUN.*OFF/i').first()).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=/ERROR.*ON/i').first()).toBeVisible({ timeout: 1000 });
    await expect(page.locator('text=/ALARM.*ON/i').first()).toBeVisible({ timeout: 1000 });

    await startButton.click(); // Release
  });

  test('should handle rapid START/STOP cycles without false alarms', async ({ page }) => {
    const startButton = page.locator('button:has-text("START")').first();
    const stopButton = page.locator('button:has-text("STOP")').first();

    // Rapid on/off cycles
    for (let i = 0; i < 3; i++) {
      await startButton.click();
      await page.waitForTimeout(500);
      await stopButton.click();
      await page.waitForTimeout(200);
      await stopButton.click();
      await page.waitForTimeout(500);
    }

    // No alarm should trigger
    await expect(page.locator('text=/ERROR.*OFF/i').first()).toBeVisible();
    await expect(page.locator('text=/ALARM.*OFF/i').first()).toBeVisible();
  });
});
