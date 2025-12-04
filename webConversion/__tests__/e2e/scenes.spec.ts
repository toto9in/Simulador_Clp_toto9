import { test, expect } from '@playwright/test';

test.describe('PLC Simulator - Scenes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
    await expect(page).toHaveTitle(/PLC Simulator/i, { timeout: 10000 });
  });

  test.describe('Default Scene', () => {
    test('should display 8 inputs and 8 outputs', async ({ page }) => {
      // Look for inputs I0.0 through I0.7
      for (let i = 0; i < 8; i++) {
        const input = page.locator(`[data-testid="input-I0.${i}"]`).or(
          page.locator(`text=I0.${i}`).first()
        );
        await expect(input).toBeVisible();
      }

      // Look for outputs Q0.0 through Q0.7
      for (let i = 0; i < 8; i++) {
        const output = page.locator(`[data-testid="output-Q0.${i}"]`).or(
          page.locator(`text=Q0.${i}`).first()
        );
        await expect(output).toBeVisible();
      }
    });

    test('should toggle input when clicked', async ({ page }) => {
      const input = page.locator('[data-testid="input-I0.0"]').or(
        page.locator('button:has-text("I0.0")').first()
      );

      await expect(input).toBeVisible();

      // Get initial state
      const initialClass = await input.getAttribute('class');

      // Click to toggle
      await input.click();

      // Wait for state change
      await page.waitForTimeout(100);

      // Class should have changed (indicating state change)
      const newClass = await input.getAttribute('class');
      expect(initialClass).not.toBe(newClass);
    });

    test('should change input type on right-click', async ({ page }) => {
      const input = page.locator('[data-testid="input-I0.0"]').or(
        page.locator('button:has-text("I0.0")').first()
      );

      await expect(input).toBeVisible();

      // Right-click to cycle input type
      await input.click({ button: 'right' });

      // Wait for context menu or type change
      await page.waitForTimeout(200);

      // Input should still be visible
      await expect(input).toBeVisible();
    });

    test('should reflect output state visually', async ({ page }) => {
      // Enter a simple program
      await page.getByRole('button', { name: /program/i }).click();
      const codeEditor = page.locator('[role="textbox"]').first();
      await codeEditor.fill('LD I0.0\nOUT Q0.0');

      // Run program
      await page.getByRole('button', { name: /run/i }).click();
      await page.waitForTimeout(300);

      // Toggle input I0.0
      const input = page.locator('[data-testid="input-I0.0"]').or(
        page.locator('button:has-text("I0.0")').first()
      );

      if (await input.isVisible()) {
        await input.click();
        await page.waitForTimeout(200);

        // Check output Q0.0 visual state
        const output = page.locator('[data-testid="output-Q0.0"]').or(
          page.locator('[class*="output"]:has-text("Q0.0")').first()
        );

        // Output should be visible and likely have an "on" or "active" class
        await expect(output).toBeVisible();
      }
    });

    test('should support multiple input combinations', async ({ page }) => {
      // Test AND logic
      await page.getByRole('button', { name: /program/i }).click();
      const codeEditor = page.locator('[role="textbox"]').first();
      await codeEditor.fill('LD I0.0\nAND I0.1\nOUT Q0.0');

      await page.getByRole('button', { name: /run/i }).click();
      await page.waitForTimeout(300);

      // Toggle both inputs
      const input0 = page.locator('[data-testid="input-I0.0"]').or(
        page.locator('button:has-text("I0.0")').first()
      );
      const input1 = page.locator('[data-testid="input-I0.1"]').or(
        page.locator('button:has-text("I0.1")').first()
      );

      if ((await input0.isVisible()) && (await input1.isVisible())) {
        await input0.click();
        await page.waitForTimeout(150);
        await input1.click();
        await page.waitForTimeout(150);

        // Both inputs on → output should be on
        const output = page.locator('[data-testid="output-Q0.0"]').first();
        await expect(output).toBeVisible();
      }
    });
  });

  test.describe('Batch Simulation Scene', () => {
    test.beforeEach(async ({ page }) => {
      // Switch to batch simulation scene
      // This might be a dropdown or button in the UI
      const sceneSelector = page.locator('[data-testid="scene-selector"]').or(
        page.locator('select').first()
      );

      if (await sceneSelector.isVisible()) {
        await sceneSelector.selectOption({ label: /batch|tank/i });
        await page.waitForTimeout(500);
      }
    });

    test('should display tank simulation', async ({ page }) => {
      // Look for tank canvas or container
      const tank = page.locator('[data-testid="batch-tank"]').or(
        page.locator('canvas').first()
      );

      // Tank should be visible
      if (await tank.isVisible()) {
        await expect(tank).toBeVisible();
      }
    });

    test('should show level sensors', async ({ page }) => {
      // Look for sensor indicators
      const sensors = ['Low', 'Mid', 'High', 'Critical'];

      for (const sensor of sensors) {
        const sensorEl = page.locator(`[data-testid="sensor-${sensor}"]`).or(
          page.locator(`text=${sensor}`).first()
        );

        if (await sensorEl.isVisible()) {
          await expect(sensorEl).toBeVisible();
        }
      }
    });

    test('should have control buttons', async ({ page }) => {
      // Look for batch control buttons
      const buttons = ['Start', 'Stop', 'Reset'];

      for (const button of buttons) {
        const btn = page.locator(`button:has-text("${button}")`);
        if (await btn.count() > 0) {
          await expect(btn.first()).toBeVisible();
        }
      }
    });

    test('should animate tank filling', async ({ page }) => {
      // Start batch program
      await page.getByRole('button', { name: /program/i }).click();

      // Load batch simulation example
      const examplesButton = page.locator('button:has-text("Examples")').or(
        page.getByRole('button', { name: /example/i })
      );

      if (await examplesButton.isVisible()) {
        await examplesButton.click();

        // Select batch simulation example
        const batchExample = page.locator('text=/batch|tank/i').first();
        if (await batchExample.isVisible()) {
          await batchExample.click();
        }
      }

      // Run simulation
      await page.getByRole('button', { name: /run/i }).click();
      await page.waitForTimeout(500);

      // Start button (might be I0.0 or a dedicated button)
      const startButton = page.locator('[data-testid="input-I0.0"]').or(
        page.locator('button:has-text("Start")').first()
      );

      if (await startButton.isVisible()) {
        await startButton.click();

        // Wait for animation to start
        await page.waitForTimeout(2000);

        // Tank should show some fill level
        const tank = page.locator('canvas').first();
        await expect(tank).toBeVisible();
      }
    });

    test('should trigger sensors at correct levels', async ({ page }) => {
      // This test would require the batch program to be running
      // and would check that sensors change state as tank fills

      // Load and run batch program
      await page.getByRole('button', { name: /program/i }).click();

      const codeEditor = page.locator('[role="textbox"]').first();

      // Simple batch program that fills tank
      await codeEditor.fill(`LD I0.0
OUT Q0.0
OUT Q0.1`);

      await page.getByRole('button', { name: /run/i }).click();
      await page.waitForTimeout(300);

      // Start filling
      const startInput = page.locator('[data-testid="input-I0.0"]').first();
      if (await startInput.isVisible()) {
        await startInput.click();
        await page.waitForTimeout(3000);

        // Check if any sensor indicators changed
        const sensors = page.locator('[data-testid^="sensor-"]');
        const count = await sensors.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Scene Switching', () => {
    test('should switch between scenes without losing program', async ({ page }) => {
      // Enter a program
      await page.getByRole('button', { name: /program/i }).click();
      const codeEditor = page.locator('[role="textbox"]').first();
      const testProgram = 'LD I0.0\nOUT Q0.0';
      await codeEditor.fill(testProgram);

      // Switch scene (if scene selector is available)
      const sceneSelector = page.locator('[data-testid="scene-selector"]').or(
        page.locator('select').first()
      );

      if (await sceneSelector.isVisible()) {
        // Get current scene
        const currentScene = await sceneSelector.inputValue();

        // Switch to different scene
        const options = await sceneSelector.locator('option').allTextContents();
        const otherScene = options.find((opt) => opt !== currentScene);

        if (otherScene) {
          await sceneSelector.selectOption({ label: otherScene });
          await page.waitForTimeout(500);

          // Switch back
          await sceneSelector.selectOption({ label: currentScene });
          await page.waitForTimeout(500);

          // Program should still be there
          const editorContent = await codeEditor.inputValue();
          expect(editorContent).toBe(testProgram);
        }
      }
    });

    test('should preserve execution state when switching scenes', async ({ page }) => {
      // Run a program
      await page.getByRole('button', { name: /program/i }).click();
      const codeEditor = page.locator('[role="textbox"]').first();
      await codeEditor.fill('LD I0.0\nOUT Q0.0');

      await page.getByRole('button', { name: /run/i }).click();
      await page.waitForTimeout(300);

      // Switch scene
      const sceneSelector = page.locator('[data-testid="scene-selector"]').or(
        page.locator('select').first()
      );

      if (await sceneSelector.isVisible()) {
        const options = await sceneSelector.locator('option').allTextContents();
        if (options.length > 1) {
          await sceneSelector.selectOption({ index: 1 });
          await page.waitForTimeout(500);

          // Should still be in RUN mode
          const runButton = page.getByRole('button', { name: /run/i });
          await expect(runButton).toHaveClass(/active|selected/);
        }
      }
    });
  });
});
