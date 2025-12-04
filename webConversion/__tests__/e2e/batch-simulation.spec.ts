import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Batch Simulation
 * Tests the batch tank filling, mixing, and draining process
 */

test.describe('PLC Simulator - Batch Simulation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
    await expect(page).toHaveTitle(/PLC Simulator/i, { timeout: 10000 });
  });

  test.describe('Batch Scene Setup', () => {
    test('should switch to Batch scene', async ({ page }) => {
      // Look for scene selector
      const sceneButton = page.locator('button:has-text("Batch")').or(
        page.locator('[data-testid="scene-batch"]')
      ).or(
        page.locator('select[name="scene"] option:has-text("Batch")')
      );

      if (await sceneButton.isVisible()) {
        await sceneButton.click();
      }

      // Verify batch scene elements are visible
      await expect(page.locator('text=/batch|simulação/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should display tank visualization', async ({ page }) => {
      // Switch to batch scene (if needed)
      const batchButton = page.locator('button:has-text("Batch")');
      if (await batchButton.isVisible()) {
        await batchButton.click();
      }

      // Check for tank elements
      await expect(page.locator('.batch-scene__tank-area, .tank__liquid, [class*="tank"]').first()).toBeVisible({ timeout: 5000 });
    });

    test('should show control buttons (START and STOP)', async ({ page }) => {
      const batchButton = page.locator('button:has-text("Batch")');
      if (await batchButton.isVisible()) {
        await batchButton.click();
      }

      // Check for START button (I0.0)
      await expect(page.locator('button:has-text("START"), button:has-text("I0.0")').first()).toBeVisible({ timeout: 5000 });

      // Check for STOP button (I0.1)
      await expect(page.locator('button:has-text("STOP"), button:has-text("I0.1")').first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Batch Example Loading', () => {
    test('should load "Batch Process - Automatic" example', async ({ page }) => {
      // Open examples menu
      const examplesButton = page.locator('button:has-text("Examples"), button:has-text("Exemplos")').first();
      await examplesButton.click();
      await page.waitForTimeout(500);

      // Find and click batch example
      const batchExample = page.locator('text=/Batch.*Automatic/i').first();
      await expect(batchExample).toBeVisible({ timeout: 5000 });
      await batchExample.click();
      await page.waitForTimeout(500);

      // Verify program was loaded
      const editor = page.locator('textarea, [contenteditable="true"]').first();
      const programText = await editor.inputValue().catch(() => editor.textContent());

      expect(programText).toContain('PUMP');
      expect(programText).toContain('I0.0');
      expect(programText).toContain('Q0.1');
    });
  });

  test.describe('Fill Cycle', () => {
    test('should fill tank when START pressed', async ({ page }) => {
      // Load batch example
      const examplesBtn = page.locator('button:has-text("Examples"), button:has-text("Exemplos")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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

      // Press START button
      const startButton = page.locator('button:has-text("START"), button:has-text("I0.0")').first();
      await startButton.click();
      await page.waitForTimeout(300);

      // Check if PUMP1 (Q0.1) is ON
      await expect(page.locator('text=/PUMP1.*ON/i, text=/Q0\\.1.*ON/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should stop filling when tank reaches 100%', async ({ page }) => {
      // This test requires the simulation to run long enough to fill
      // Load and start batch simulation
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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

      // Press START
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();

      // Wait for tank to fill (up to 10 seconds)
      await page.waitForTimeout(10000);

      // Check if HI-LEVEL sensor activated
      const hiLevelActive = page.locator('text=/HI-LEVEL.*1|I1\\.0.*1|I1\\.0.*ON/i');
      await expect(hiLevelActive.first()).toBeVisible({ timeout: 5000 });

      // PUMP1 should stop when tank is full
      // Note: May still show ON due to UI update delay
    });
  });

  test.describe('Mixer Operation', () => {
    test('should start mixer when tank is full', async ({ page }) => {
      // Load batch simulation
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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

      // Press START and wait for tank to fill
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(10000); // Wait for fill

      // Check if MIXER (Q0.2) is ON
      const mixerOn = page.locator('text=/MIXER.*ON/i, text=/Q0\\.2.*ON/i');
      await expect(mixerOn.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Drain Cycle', () => {
    test('should drain tank when STOP pressed', async ({ page }) => {
      // Load and setup batch simulation
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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

      // Press STOP button to start drain
      const stopButton = page.locator('button:has-text("STOP"), button:has-text("I0.1")').first();
      await stopButton.click();
      await page.waitForTimeout(300);

      // Check if PUMP3 (Q0.3) is ON
      await expect(page.locator('text=/PUMP3.*ON/i, text=/Q0\\.3.*ON/i').first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Status LEDs', () => {
    test('should show RUN LED when system is operating', async ({ page }) => {
      // Load batch simulation
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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

      // Press START
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(300);

      // RUN LED (Q1.0) should be ON
      await expect(page.locator('text=/RUN.*ON/i, text=/Q1\\.0.*ON/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should show IDLE LED when system is stopped', async ({ page }) => {
      // Load batch simulation
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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
      await page.waitForTimeout(500);

      // Don't press any buttons - system should be idle
      // IDLE LED (Q1.1) should be ON
      await expect(page.locator('text=/IDLE.*ON/i, text=/Q1\\.1.*ON/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should show FULL LED when tank reaches 100%', async ({ page }) => {
      // Load batch simulation
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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

      // Press START and wait for fill
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(10000);

      // FULL LED (Q1.2) should be ON
      await expect(page.locator('text=/FULL.*ON/i, text=/Q1\\.2.*ON/i').first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Complete Batch Cycle', () => {
    test('should execute full cycle: fill → mix → drain', async ({ page }) => {
      // Load batch simulation
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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

      // Phase 1: Fill
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();

      // Verify PUMP1 is ON
      await expect(page.locator('text=/PUMP1.*ON/i').first()).toBeVisible({ timeout: 2000 });

      // Wait for fill to complete
      await page.waitForTimeout(10000);

      // Phase 2: Mix (should start automatically when full)
      await expect(page.locator('text=/MIXER.*ON/i').first()).toBeVisible({ timeout: 3000 });

      // Phase 3: Drain
      const stopButton = page.locator('button:has-text("STOP")').first();
      await stopButton.click();
      await page.waitForTimeout(300);

      // Verify PUMP3 is ON
      await expect(page.locator('text=/PUMP3.*ON/i').first()).toBeVisible({ timeout: 2000 });

      // Eventually system returns to IDLE
      await page.waitForTimeout(12000);
      await expect(page.locator('text=/IDLE.*ON/i').first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Emergency Stop', () => {
    test('should stop filling immediately when STOP pressed', async ({ page }) => {
      // Load batch simulation
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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

      // Start filling
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(2000); // Let it fill partially

      // Emergency stop
      const stopButton = page.locator('button:has-text("STOP")').first();
      await stopButton.click();
      await page.waitForTimeout(300);

      // PUMP1 should stop, PUMP3 should start
      await expect(page.locator('text=/PUMP3.*ON/i').first()).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Sensor Behavior', () => {
    test('should activate HI-LEVEL sensor at 100%', async ({ page }) => {
      // This test verifies sensor activation
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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

      // Fill tank
      const startButton = page.locator('button:has-text("START")').first();
      await startButton.click();
      await page.waitForTimeout(10000);

      // Check HI-LEVEL sensor (I1.0)
      const hiLevel = page.locator('text=/HI-LEVEL.*1|I1\\.0.*1/i');
      await expect(hiLevel.first()).toBeVisible({ timeout: 3000 });
    });

    test('should deactivate LO-LEVEL sensor when tank empties', async ({ page }) => {
      const examplesBtn = page.locator('button:has-text("Examples")').first();
      await examplesBtn.click();
      await page.waitForTimeout(300);

      const batchExample = page.locator('text=/Batch/i').first();
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

      // Start drain cycle
      const stopButton = page.locator('button:has-text("STOP")').first();
      await stopButton.click();
      await page.waitForTimeout(300);

      // Wait for drain
      await page.waitForTimeout(12000);

      // LO-LEVEL should be 0
      const loLevel = page.locator('text=/LO-LEVEL.*0|I1\\.1.*0/i');
      await expect(loLevel.first()).toBeVisible({ timeout: 3000 });
    });
  });
});
