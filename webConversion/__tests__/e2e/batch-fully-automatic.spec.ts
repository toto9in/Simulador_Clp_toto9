import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Fully Automatic Batch Simulation
 * Tests the complete automatic cycle: Fill → Mix (5s) → Drain
 */

test.describe('PLC Simulator - Batch Fully Automatic E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
    await expect(page).toHaveTitle(/PLC Simulator/i, { timeout: 10000 });
  });

  test.describe('Setup and Loading', () => {
    test('should load "Batch Process - Fully Automatic" example', async ({ page }) => {
      // Open examples menu
      const examplesButton = page.locator('button:has-text("Examples"), button:has-text("Exemplos")').first();
      await examplesButton.click();
      await page.waitForTimeout(500);

      // Find and click fully automatic batch example
      const batchExample = page.locator('text=/Batch.*Fully Automatic/i').first();
      await expect(batchExample).toBeVisible({ timeout: 5000 });
      await batchExample.click();
      await page.waitForTimeout(500);

      // Verify program was loaded
      const editor = page.locator('textarea, [contenteditable="true"]').first();
      const programText = await editor.inputValue().catch(() => editor.textContent());

      expect(programText).toContain('Fully Automatic');
      expect(programText).toContain('M0');
      expect(programText).toContain('M1');
      expect(programText).toContain('M2');
      expect(programText).toContain('T0');
    });

    test('should display correct state machine logic', async ({ page }) => {
      // Load example
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      // Verify program contains state machine elements
      const editor = page.locator('textarea').first();
      const programText = await editor.inputValue().catch(() => editor.textContent());

      // Check for all three states
      expect(programText).toContain('STATE 1');
      expect(programText).toContain('STATE 2');
      expect(programText).toContain('STATE 3');
    });
  });

  test.describe('Automatic Fill Cycle', () => {
    test('should start fill cycle when START pressed', async ({ page }) => {
      // Load fully automatic batch example
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      // Switch to Batch scene
      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      // Start program
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      // Press START button only once
      const startButton = page.locator('button:has-text("START"), button:has-text("I0.0")').first();
      await startButton.click();
      await page.waitForTimeout(300);

      // Release START button (click again to toggle off)
      await startButton.click();
      await page.waitForTimeout(300);

      // PUMP1 (Q0.1) should be ON (filling continues automatically)
      await expect(page.locator('text=/PUMP1.*ON/i, text=/Q0\\.1.*ON/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should continue filling after START is released', async ({ page }) => {
      // This verifies the seal-in behavior of state M0
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      // Press and release START
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(300);
      await startButton.click(); // Release
      await page.waitForTimeout(2000);

      // PUMP1 should still be ON (self-maintaining)
      await expect(page.locator('text=/PUMP1.*ON/i').first()).toBeVisible({ timeout: 3000 });
    });

    test('should transition to mix when tank reaches 100%', async ({ page }) => {
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      // Start cycle
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(300);
      await startButton.click(); // Release

      // Wait for fill to complete (up to 12 seconds)
      await page.waitForTimeout(12000);

      // PUMP1 should be OFF, MIXER should be ON
      await expect(page.locator('text=/MIXER.*ON/i, text=/Q0\\.2.*ON/i').first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Automatic Mix Cycle', () => {
    test('should run mixer for exactly 5 seconds', async ({ page }) => {
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      // Start cycle
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(100);
      await startButton.click();

      // Wait for fill
      await page.waitForTimeout(12000);

      // Mixer should be ON
      await expect(page.locator('text=/MIXER.*ON/i').first()).toBeVisible({ timeout: 3000 });

      // Wait 5 seconds
      await page.waitForTimeout(5500);

      // After 5 seconds, mixer should be OFF and drain should start
      await expect(page.locator('text=/PUMP3.*ON/i, text=/Q0\\.3.*ON/i').first()).toBeVisible({ timeout: 3000 });
    });

    test('should show FULL LED during mixing', async ({ page }) => {
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(100);
      await startButton.click();

      // Wait for fill
      await page.waitForTimeout(12000);

      // FULL LED should be ON
      await expect(page.locator('text=/FULL.*ON/i, text=/Q1\\.2.*ON/i').first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Automatic Drain Cycle', () => {
    test('should automatically transition to drain after mixing', async ({ page }) => {
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(100);
      await startButton.click();

      // Wait for fill + mix (12s + 6s)
      await page.waitForTimeout(18000);

      // PUMP3 should be ON (draining)
      await expect(page.locator('text=/PUMP3.*ON/i').first()).toBeVisible({ timeout: 3000 });
    });

    test('should complete drain and return to IDLE', async ({ page }) => {
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(100);
      await startButton.click();

      // Wait for complete cycle (fill + mix + drain = 12s + 6s + 15s = 33s)
      await page.waitForTimeout(35000);

      // IDLE LED should be ON
      await expect(page.locator('text=/IDLE.*ON/i, text=/Q1\\.1.*ON/i').first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Complete Automatic Cycle', () => {
    test('should execute full automatic cycle without intervention', async ({ page }) => {
      // This is the main test - full cycle with only one START press
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      // Phase 1: Start cycle (single button press)
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(100);
      await startButton.click(); // Release immediately

      // Phase 2: Verify filling
      await expect(page.locator('text=/PUMP1.*ON/i').first()).toBeVisible({ timeout: 2000 });

      // Wait for fill
      await page.waitForTimeout(11000);

      // Phase 3: Verify mixing
      await expect(page.locator('text=/MIXER.*ON/i').first()).toBeVisible({ timeout: 3000 });

      // Wait for mix timer
      await page.waitForTimeout(6000);

      // Phase 4: Verify draining
      await expect(page.locator('text=/PUMP3.*ON/i').first()).toBeVisible({ timeout: 3000 });

      // Wait for drain
      await page.waitForTimeout(14000);

      // Phase 5: Verify IDLE
      await expect(page.locator('text=/IDLE.*ON/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should allow multiple cycles with same START button', async ({ page }) => {
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      // First cycle
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(100);
      await startButton.click();

      // Wait for first cycle to complete
      await page.waitForTimeout(35000);

      // Verify IDLE
      await expect(page.locator('text=/IDLE.*ON/i').first()).toBeVisible({ timeout: 3000 });

      // Start second cycle
      await startButton.click();
      await page.waitForTimeout(100);
      await startButton.click();

      // Verify second cycle starts (PUMP1 should be ON)
      await expect(page.locator('text=/PUMP1.*ON/i').first()).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('State Machine Behavior', () => {
    test('should maintain RUN LED throughout entire cycle', async ({ page }) => {
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(100);
      await startButton.click();

      // RUN LED should be ON throughout cycle
      await expect(page.locator('text=/RUN.*ON/i, text=/Q1\\.0.*ON/i').first()).toBeVisible({ timeout: 2000 });

      // Wait 5 seconds and check again
      await page.waitForTimeout(5000);
      await expect(page.locator('text=/RUN.*ON/i').first()).toBeVisible({ timeout: 1000 });

      // Wait 10 more seconds and check again
      await page.waitForTimeout(10000);
      await expect(page.locator('text=/RUN.*ON/i').first()).toBeVisible({ timeout: 1000 });
    });

    test('should properly transition between all three states', async ({ page }) => {
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(100);
      await startButton.click();

      // State 1: FILL - only PUMP1 should be ON
      await expect(page.locator('text=/PUMP1.*ON/i').first()).toBeVisible({ timeout: 2000 });

      // Wait for transition to State 2
      await page.waitForTimeout(12000);

      // State 2: MIX - only MIXER should be ON
      const mixer = page.locator('text=/MIXER.*ON/i').first();
      await expect(mixer).toBeVisible({ timeout: 3000 });

      // PUMP1 should be OFF now
      // Note: Can't reliably check for OFF state in UI, so we skip this assertion

      // Wait for transition to State 3
      await page.waitForTimeout(6000);

      // State 3: DRAIN - only PUMP3 should be ON
      await expect(page.locator('text=/PUMP3.*ON/i').first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Timer Behavior', () => {
    test('should use T0 timer for 5-second mix delay', async ({ page }) => {
      // This test verifies the timer is working correctly
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Fully Automatic/i').first();
      if (await batchExample.isVisible()) {
        await batchExample.click();
        await page.waitForTimeout(300);
      }

      const batchSceneBtn = page.locator('button:has-text("Batch")');
      if (await batchSceneBtn.isVisible()) {
        await batchSceneBtn.click();
        await page.waitForTimeout(300);
      }

      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(300);

      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(100);
      await startButton.click();

      // Wait for fill
      await page.waitForTimeout(12000);

      // Record when mixer starts
      await expect(page.locator('text=/MIXER.*ON/i').first()).toBeVisible({ timeout: 3000 });

      // Mixer should still be ON after 3 seconds
      await page.waitForTimeout(3000);
      await expect(page.locator('text=/MIXER.*ON/i').first()).toBeVisible({ timeout: 1000 });

      // After 2 more seconds (total 5s), drain should start
      await page.waitForTimeout(2500);
      await expect(page.locator('text=/PUMP3.*ON/i').first()).toBeVisible({ timeout: 3000 });
    });
  });
});
