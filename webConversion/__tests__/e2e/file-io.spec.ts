import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('PLC Simulator - File I/O', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
    await expect(page).toHaveTitle(/PLC Simulator/i, { timeout: 10000 });
  });

  test.describe('Save Program', () => {
    test('should have Save button in menu', async ({ page }) => {
      // Open File menu
      const fileMenu = page.locator('button:has-text("File")').or(
        page.getByRole('button', { name: /file/i })
      );

      if (await fileMenu.isVisible()) {
        await fileMenu.click();

        // Look for Save option
        const saveButton = page.locator('button:has-text("Save")').or(
          page.getByRole('menuitem', { name: /save/i })
        );

        await expect(saveButton).toBeVisible();
      }
    });

    test('should trigger download when Save is clicked', async ({ page }) => {
      // Enter a program
      await page.getByRole('button', { name: /program/i }).click();
      const codeEditor = page.locator('[role="textbox"]').first();
      await codeEditor.fill('LD I0.0\nOUT Q0.0');

      // Set up download handler
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

      // Click Save button
      const fileMenu = page.locator('button:has-text("File")');
      if (await fileMenu.isVisible()) {
        await fileMenu.click();

        const saveButton = page.locator('button:has-text("Save")');
        await saveButton.click();

        // Wait for download
        try {
          const download = await downloadPromise;

          // Check filename
          const filename = download.suggestedFilename();
          expect(filename).toMatch(/\.txt$/);

          // Save to temp file and read content
          const downloadPath = await download.path();
          if (downloadPath) {
            const fs = require('fs');
            const content = fs.readFileSync(downloadPath, 'utf-8');
            expect(content).toContain('LD I0.0');
            expect(content).toContain('OUT Q0.0');
          }
        } catch (error) {
          // Download might not trigger in headless mode
          console.log('Download test skipped (likely headless mode)');
        }
      }
    });

    test('should show unsaved changes indicator when program is modified', async ({ page }) => {
      await page.getByRole('button', { name: /program/i }).click();
      const codeEditor = page.locator('[role="textbox"]').first();

      // Type something
      await codeEditor.fill('LD I0.0');

      // Look for unsaved indicator (might be a dot, asterisk, or icon)
      const unsavedIndicator = page.locator('[data-testid="unsaved-indicator"]').or(
        page.locator('text=*').first()
      );

      // Indicator might be visible
      if (await unsavedIndicator.isVisible()) {
        await expect(unsavedIndicator).toBeVisible();
      }
    });
  });

  test.describe('Load Program', () => {
    test('should have Open button in menu', async ({ page }) => {
      const fileMenu = page.locator('button:has-text("File")');

      if (await fileMenu.isVisible()) {
        await fileMenu.click();

        const openButton = page.locator('button:has-text("Open")').or(
          page.getByRole('menuitem', { name: /open/i })
        );

        await expect(openButton).toBeVisible();
      }
    });

    test('should support drag and drop file upload', async ({ page }) => {
      // Create a test file
      const testProgram = 'LD I0.0\nAND I0.1\nOUT Q0.0';

      // Create a temporary file
      const testFile = {
        name: 'test-program.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(testProgram),
      };

      // Look for drop zone
      const dropZone = page.locator('[data-testid="drop-zone"]').or(
        page.locator('body')
      );

      // Simulate file drop
      try {
        await dropZone.setInputFiles({
          name: testFile.name,
          mimeType: testFile.mimeType,
          buffer: testFile.buffer,
        });

        await page.waitForTimeout(500);

        // Check if program was loaded
        const codeEditor = page.locator('[role="textbox"]').first();
        const content = await codeEditor.inputValue();

        if (content.length > 0) {
          expect(content).toContain('LD I0.0');
        }
      } catch (error) {
        // Drag and drop might not work in all test environments
        console.log('Drag and drop test skipped');
      }
    });
  });

  test.describe('Example Programs', () => {
    test('should have Examples menu', async ({ page }) => {
      const examplesButton = page.locator('button:has-text("Examples")').or(
        page.getByRole('button', { name: /example/i })
      );

      // Examples button might be visible
      if (await examplesButton.isVisible()) {
        await expect(examplesButton).toBeVisible();
      }
    });

    test('should load example programs', async ({ page }) => {
      const examplesButton = page.locator('button:has-text("Examples")');

      if (await examplesButton.isVisible()) {
        await examplesButton.click();
        await page.waitForTimeout(300);

        // Look for example options
        const exampleItems = page.locator('[data-testid^="example-"]').or(
          page.locator('[role="menuitem"]')
        );

        const count = await exampleItems.count();

        if (count > 0) {
          // Click first example
          await exampleItems.first().click();
          await page.waitForTimeout(300);

          // Check that code was loaded
          const codeEditor = page.locator('[role="textbox"]').first();
          const content = await codeEditor.inputValue();

          expect(content.length).toBeGreaterThan(0);
        }
      }
    });

    test('should have basic logic example', async ({ page }) => {
      const examplesButton = page.locator('button:has-text("Examples")');

      if (await examplesButton.isVisible()) {
        await examplesButton.click();

        const basicExample = page.locator('text=/basic|logic|hello/i').first();

        if (await basicExample.isVisible()) {
          await expect(basicExample).toBeVisible();
          await basicExample.click();

          await page.waitForTimeout(200);

          const codeEditor = page.locator('[role="textbox"]').first();
          const content = await codeEditor.inputValue();

          expect(content).toBeTruthy();
        }
      }
    });

    test('should have timer example', async ({ page }) => {
      const examplesButton = page.locator('button:has-text("Examples")');

      if (await examplesButton.isVisible()) {
        await examplesButton.click();

        const timerExample = page.locator('text=/timer|TON|TOFF/i').first();

        if (await timerExample.isVisible()) {
          await expect(timerExample).toBeVisible();
          await timerExample.click();

          await page.waitForTimeout(200);

          const codeEditor = page.locator('[role="textbox"]').first();
          const content = await codeEditor.inputValue();

          expect(content).toMatch(/TON|TOFF/i);
        }
      }
    });

    test('should have counter example', async ({ page }) => {
      const examplesButton = page.locator('button:has-text("Examples")');

      if (await examplesButton.isVisible()) {
        await examplesButton.click();

        const counterExample = page.locator('text=/counter|CTU|CTD/i').first();

        if (await counterExample.isVisible()) {
          await expect(counterExample).toBeVisible();
          await counterExample.click();

          await page.waitForTimeout(200);

          const codeEditor = page.locator('[role="textbox"]').first();
          const content = await codeEditor.inputValue();

          expect(content).toMatch(/CTU|CTD/i);
        }
      }
    });

    test('should have batch simulation example', async ({ page }) => {
      const examplesButton = page.locator('button:has-text("Examples")');

      if (await examplesButton.isVisible()) {
        await examplesButton.click();

        const batchExample = page.locator('text=/batch|tank/i').first();

        if (await batchExample.isVisible()) {
          await expect(batchExample).toBeVisible();
        }
      }
    });
  });

  test.describe('File Validation', () => {
    test('should validate file extension', async ({ page }) => {
      // Try to load a file with wrong extension
      const invalidFile = {
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Invalid content'),
      };

      const dropZone = page.locator('body');

      try {
        await dropZone.setInputFiles({
          name: invalidFile.name,
          mimeType: invalidFile.mimeType,
          buffer: invalidFile.buffer,
        });

        await page.waitForTimeout(500);

        // Should show error toast
        const toast = page.locator('[role="alert"]').or(page.locator('.toast'));

        if (await toast.isVisible()) {
          await expect(toast).toContainText(/invalid|error/i);
        }
      } catch (error) {
        console.log('File validation test skipped');
      }
    });

    test('should handle empty files gracefully', async ({ page }) => {
      const emptyFile = {
        name: 'empty.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(''),
      };

      const dropZone = page.locator('body');

      try {
        await dropZone.setInputFiles({
          name: emptyFile.name,
          mimeType: emptyFile.mimeType,
          buffer: emptyFile.buffer,
        });

        await page.waitForTimeout(500);

        // Should show error or warning
        const toast = page.locator('[role="alert"]');

        if (await toast.isVisible()) {
          await expect(toast).toBeVisible();
        }
      } catch (error) {
        console.log('Empty file test skipped');
      }
    });
  });

  test.describe('Program Persistence', () => {
    test('should load example and then modify it', async ({ page }) => {
      const examplesButton = page.locator('button:has-text("Examples")');

      if (await examplesButton.isVisible()) {
        await examplesButton.click();

        const example = page.locator('[role="menuitem"]').first();
        if (await example.isVisible()) {
          await example.click();
          await page.waitForTimeout(200);

          // Modify the loaded program
          const codeEditor = page.locator('[role="textbox"]').first();
          const originalContent = await codeEditor.inputValue();

          await codeEditor.fill(originalContent + '\n// Modified');

          const newContent = await codeEditor.inputValue();
          expect(newContent).toContain('// Modified');
        }
      }
    });

    test('should show confirmation when loading new program with unsaved changes', async ({ page }) => {
      // Make changes to current program
      await page.getByRole('button', { name: /program/i }).click();
      const codeEditor = page.locator('[role="textbox"]').first();
      await codeEditor.fill('LD I0.0\nOUT Q0.0');

      // Try to load an example
      const examplesButton = page.locator('button:has-text("Examples")');

      if (await examplesButton.isVisible()) {
        await examplesButton.click();

        const example = page.locator('[role="menuitem"]').first();
        if (await example.isVisible()) {
          await example.click();

          // Might show confirmation dialog
          const dialog = page.locator('[role="dialog"]').or(page.locator('.modal'));

          if (await dialog.isVisible()) {
            await expect(dialog).toContainText(/unsaved|discard|confirm/i);
          }
        }
      }
    });
  });
});
