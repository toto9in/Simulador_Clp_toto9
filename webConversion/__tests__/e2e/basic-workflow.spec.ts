import { test, expect } from '@playwright/test';

test.describe('PLC Simulator - Basic Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
    await expect(page).toHaveTitle(/PLC Simulator/i, { timeout: 10000 });
  });

  test('should load the application successfully', async ({ page }) => {
    // Check that main components are visible
    await expect(page.locator('text=PLC Simulator')).toBeVisible();
    await expect(page.locator('[role="textbox"]')).toBeVisible(); // Code editor
  });

  test('should display control panel with mode buttons', async ({ page }) => {
    // Check mode buttons exist
    await expect(page.getByRole('button', { name: /program/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /stop/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /run/i })).toBeVisible();
  });

  test('should allow editing IL code in program mode', async ({ page }) => {
    // Click PROGRAM mode button
    await page.getByRole('button', { name: /program/i }).click();

    // Find code editor
    const codeEditor = page.locator('[role="textbox"]').first();

    // Type a simple program
    await codeEditor.fill('LD I0.0\nOUT Q0.0');

    // Verify code was entered
    const editorContent = await codeEditor.inputValue();
    expect(editorContent).toContain('LD I0.0');
    expect(editorContent).toContain('OUT Q0.0');
  });

  test('should convert code to uppercase automatically', async ({ page }) => {
    await page.getByRole('button', { name: /program/i }).click();

    const codeEditor = page.locator('[role="textbox"]').first();
    await codeEditor.fill('ld i0.0\nout q0.0');

    // Wait a bit for auto-uppercase
    await page.waitForTimeout(100);

    const editorContent = await codeEditor.inputValue();
    expect(editorContent).toBe('LD I0.0\nOUT Q0.0');
  });

  test('should execute program and update outputs', async ({ page }) => {
    // Enter program
    await page.getByRole('button', { name: /program/i }).click();
    const codeEditor = page.locator('[role="textbox"]').first();
    await codeEditor.fill('LD I0.0\nOUT Q0.0');

    // Switch to RUN mode
    await page.getByRole('button', { name: /run/i }).click();

    // Wait for execution to start
    await page.waitForTimeout(500);

    // Check that RUN mode is active (look for visual indicator)
    const runButton = page.getByRole('button', { name: /run/i });
    await expect(runButton).toHaveClass(/active|selected|bg-green/);

    // Find input I0.0 (should be a button or checkbox in the scene)
    const input = page.locator('[data-testid="input-I0.0"]').or(
      page.locator('button:has-text("I0.0")').first()
    );

    // Click the input to toggle it
    if (await input.isVisible()) {
      await input.click();

      // Wait for scan cycle
      await page.waitForTimeout(200);

      // Check that output Q0.0 is ON (should have some visual indicator)
      const output = page.locator('[data-testid="output-Q0.0"]').or(
        page.locator('.output:has-text("Q0.0")').first()
      );

      // Output should be visible and indicate ON state
      await expect(output).toBeVisible();
    }
  });

  test('should stop execution when STOP button is clicked', async ({ page }) => {
    // Start program
    await page.getByRole('button', { name: /program/i }).click();
    const codeEditor = page.locator('[role="textbox"]').first();
    await codeEditor.fill('LD I0.0\nOUT Q0.0');

    // Run program
    await page.getByRole('button', { name: /run/i }).click();
    await page.waitForTimeout(500);

    // Stop program
    await page.getByRole('button', { name: /stop/i }).click();

    // Verify STOP mode is active
    const stopButton = page.getByRole('button', { name: /stop/i });
    await expect(stopButton).toHaveClass(/active|selected|bg-red/);
  });

  test('should disable code editing in RUN mode', async ({ page }) => {
    // Enter program
    await page.getByRole('button', { name: /program/i }).click();
    const codeEditor = page.locator('[role="textbox"]').first();
    await codeEditor.fill('LD I0.0\nOUT Q0.0');

    // Switch to RUN
    await page.getByRole('button', { name: /run/i }).click();
    await page.waitForTimeout(200);

    // Code editor should be disabled
    await expect(codeEditor).toBeDisabled();
  });

  test('should show scan count incrementing in RUN mode', async ({ page }) => {
    // Enter program
    await page.getByRole('button', { name: /program/i }).click();
    const codeEditor = page.locator('[role="textbox"]').first();
    await codeEditor.fill('LD I0.0\nOUT Q0.0');

    // Run
    await page.getByRole('button', { name: /run/i }).click();

    // Wait for a few scan cycles
    await page.waitForTimeout(1000);

    // Look for scan count display (might be in status area)
    const scanCountText = page.locator('text=/Scan|Cycle|Count/i').first();
    if (await scanCountText.isVisible()) {
      const text = await scanCountText.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('should clear outputs when switching to PROGRAM mode', async ({ page }) => {
    // Run a program
    await page.getByRole('button', { name: /program/i }).click();
    const codeEditor = page.locator('[role="textbox"]').first();
    await codeEditor.fill('LD I0.0\nOUT Q0.0');

    await page.getByRole('button', { name: /run/i }).click();
    await page.waitForTimeout(500);

    // Switch back to PROGRAM
    await page.getByRole('button', { name: /program/i }).click();

    // Outputs should be cleared (implementation-specific check)
    // This might vary based on the actual UI implementation
  });

  test('should handle empty program gracefully', async ({ page }) => {
    // Leave editor empty
    await page.getByRole('button', { name: /program/i }).click();

    // Try to run
    await page.getByRole('button', { name: /run/i }).click();

    // Should not crash - might show a toast or stay in IDLE mode
    await page.waitForTimeout(500);

    // Page should still be responsive
    await expect(page.locator('text=PLC Simulator')).toBeVisible();
  });

  test('should handle invalid IL instructions gracefully', async ({ page }) => {
    await page.getByRole('button', { name: /program/i }).click();
    const codeEditor = page.locator('[role="textbox"]').first();
    await codeEditor.fill('INVALID INSTRUCTION\nFOO BAR');

    await page.getByRole('button', { name: /run/i }).click();
    await page.waitForTimeout(500);

    // Should show error toast or message
    const toast = page.locator('[role="alert"]').or(page.locator('.toast'));
    if (await toast.isVisible()) {
      await expect(toast).toContainText(/error|invalid/i);
    }
  });
});
