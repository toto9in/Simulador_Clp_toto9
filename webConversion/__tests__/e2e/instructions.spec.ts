import { test, expect } from '@playwright/test';

/**
 * E2E Tests for PLC Instructions
 * Tests all implemented IL instructions: LD, LDN, ST, STN, AND, ANDN, OR, ORN, TON, TOFF, CTU, CTD, CTR, CTL, RST
 */

test.describe('PLC Simulator - Instructions E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
    await expect(page).toHaveTitle(/PLC Simulator/i, { timeout: 10000 });
  });

  test.describe('Basic Load and Store Instructions', () => {
    test('LD - Load should read input and set accumulator', async ({ page }) => {
      // Write program with LD instruction
      const program = `LD I0.0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Initially I0.0 is OFF, so Q0.0 should be OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Toggle I0.0 ON
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Now Q0.0 should be ON
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Toggle I0.0 OFF
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Now Q0.0 should be OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
    });

    test('LDN - Load Negated should invert input', async ({ page }) => {
      // Write program with LDN instruction
      const program = `LDN I0.0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Initially I0.0 is OFF, so Q0.0 should be ON (negated)
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Toggle I0.0 ON
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Now Q0.0 should be OFF (negated)
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
    });

    test('ST - Store should write accumulator to output', async ({ page }) => {
      // Write program with ST instruction
      const program = `LD I0.0
ST Q0.0
ST Q0.1`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Toggle I0.0 ON
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Both outputs should be ON
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
      await expect(page.locator('text=/Q0\\.1.*ON/i')).toBeVisible();
    });

    test('STN - Store Negated should write inverted accumulator', async ({ page }) => {
      // Write program with STN instruction
      const program = `LD I0.0
ST Q0.0
STN Q0.1`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Toggle I0.0 ON
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Q0.0 should be ON, Q0.1 should be OFF (negated)
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
      await expect(page.locator('text=/Q0\\.1.*OFF/i')).toBeVisible();

      // Toggle I0.0 OFF
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Q0.0 should be OFF, Q0.1 should be ON (negated)
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
      await expect(page.locator('text=/Q0\\.1.*ON/i')).toBeVisible();
    });
  });

  test.describe('Logical AND Instructions', () => {
    test('AND - Logical AND should require all inputs ON', async ({ page }) => {
      // Write program with AND instruction
      const program = `LD I0.0
AND I0.1
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Both inputs OFF -> output OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Turn I0.0 ON, I0.1 still OFF -> output OFF
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Turn I0.1 ON, both ON -> output ON
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Turn I0.0 OFF -> output OFF
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
    });

    test('ANDN - AND Negated should AND with inverted input', async ({ page }) => {
      // Write program with ANDN instruction
      const program = `LD I0.0
ANDN I0.1
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // I0.0 OFF, I0.1 OFF (negated=ON) -> OFF AND ON = OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Turn I0.0 ON, I0.1 OFF (negated=ON) -> ON AND ON = ON
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Turn I0.1 ON (negated=OFF) -> ON AND OFF = OFF
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
    });

    test('AND - Multiple AND operations (3 inputs)', async ({ page }) => {
      // Write program with multiple AND instructions
      const program = `LD I0.0
AND I0.1
AND I0.2
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // All OFF -> output OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Turn all ON one by one
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      await page.locator('button:has-text("I0.2")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
    });
  });

  test.describe('Logical OR Instructions', () => {
    test('OR - Logical OR should activate with any input ON', async ({ page }) => {
      // Write program with OR instruction
      const program = `LD I0.0
OR I0.1
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Both OFF -> output OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Turn I0.0 ON -> output ON
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Turn I0.0 OFF, I0.1 ON -> output ON
      await page.locator('button:has-text("I0.0")').click();
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Both ON -> output ON
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
    });

    test('ORN - OR Negated should OR with inverted input', async ({ page }) => {
      // Write program with ORN instruction
      const program = `LD I0.0
ORN I0.1
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // I0.0 OFF, I0.1 OFF (negated=ON) -> OFF OR ON = ON
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Turn I0.0 ON, I0.1 OFF (negated=ON) -> ON OR ON = ON
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Turn I0.1 ON (negated=OFF) -> ON OR OFF = ON
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Turn I0.0 OFF, I0.1 ON (negated=OFF) -> OFF OR OFF = OFF
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
    });
  });

  test.describe('Timer Instructions', () => {
    test('TON - Timer On-Delay should delay activation', async ({ page }) => {
      // Write program with TON instruction (2 second delay)
      const program = `LD I0.0
TON T0,20
LD T0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Output should be OFF initially
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Turn I0.0 ON to start timer
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Output should still be OFF (timer running)
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Wait for timer to complete (2.5 seconds to be safe)
      await page.waitForTimeout(2500);

      // Output should now be ON
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Turn I0.0 OFF
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Output should be OFF (timer reset)
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
    });

    test('TOFF - Timer Off-Delay should delay deactivation', async ({ page }) => {
      // Write program with TOFF instruction (2 second delay)
      const program = `LD I0.0
TOFF T0,20
LD T0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Output should be OFF initially
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Turn I0.0 ON
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Output should be ON immediately
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Turn I0.0 OFF to start off-delay
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Output should still be ON (timer running)
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Wait for timer to complete (2.5 seconds to be safe)
      await page.waitForTimeout(2500);

      // Output should now be OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
    });

    test('TON - Timer should reset when input goes OFF during delay', async ({ page }) => {
      // Write program with TON instruction
      const program = `LD I0.0
TON T0,30
LD T0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Turn I0.0 ON to start timer
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(1000); // Wait 1 second (not enough to complete)

      // Turn I0.0 OFF to reset timer
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Output should be OFF (timer was reset)
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Turn I0.0 ON again
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);

      // Wait 1 second - still shouldn't be done
      await page.waitForTimeout(1000);
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
    });
  });

  test.describe('Counter Instructions', () => {
    test('CTU - Counter Up should count rising edges', async ({ page }) => {
      // Write program with CTU instruction (preset=3)
      const program = `LD I0.0
CTU C0,3
LD C0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Output should be OFF initially
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Generate 3 rising edges
      for (let i = 0; i < 3; i++) {
        // Rising edge: OFF -> ON
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);

        // Falling edge: ON -> OFF
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
      }

      // After 3 counts, output should be ON
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
    });

    test('CTD - Counter Down should count down and activate at zero', async ({ page }) => {
      // Write program with CTD instruction (preset=3)
      const program = `LD I0.1
CTL C0,3
LD I0.0
CTD C0,3
LD C0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Load counter with preset value (I0.1)
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);

      // Output should be OFF (counter at 3)
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Count down 3 times
      for (let i = 0; i < 3; i++) {
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
      }

      // After counting to zero, output should be ON
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
    });

    test('CTR - Counter Reset should clear counter', async ({ page }) => {
      // Write program with CTR instruction
      const program = `LD I0.0
CTU C0,5
LD I0.1
CTR C0
LD C0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Count up 3 times
      for (let i = 0; i < 3; i++) {
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
      }

      // Reset counter
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);

      // Counter should be reset, output OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Count 5 more times to reach preset
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
      }

      // Now output should be ON
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
    });

    test('CTL - Counter Load should set counter value', async ({ page }) => {
      // Write program with CTL instruction
      const program = `LD I0.1
CTL C0,5
LD I0.0
CTU C0,10
LD C0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Load counter with preset=5
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);

      // Count 5 more times (5+5=10, should reach preset)
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
      }

      // Output should be ON (reached preset of 10)
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
    });
  });

  test.describe('Combined Logic Instructions', () => {
    test('Complex AND/OR combination', async ({ page }) => {
      // (I0.0 AND I0.1) OR (I0.2 AND I0.3)
      const program = `LD I0.0
AND I0.1
ST Q0.0
LD I0.2
AND I0.3
OR Q0.0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // All OFF -> output OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // Turn I0.0 and I0.1 ON -> output ON
      await page.locator('button:has-text("I0.0")').click();
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // Turn them OFF, turn I0.2 and I0.3 ON -> output ON
      await page.locator('button:has-text("I0.0")').click();
      await page.locator('button:has-text("I0.1")').click();
      await page.locator('button:has-text("I0.2")').click();
      await page.locator('button:has-text("I0.3")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
    });

    test('Mix of LD, AND, OR operations', async ({ page }) => {
      // I0.0 AND (I0.1 OR I0.2)
      const program = `LD I0.1
OR I0.2
AND I0.0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // All OFF -> output OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // I0.1 ON, I0.0 OFF -> output OFF
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();

      // I0.1 ON, I0.0 ON -> output ON
      await page.locator('button:has-text("I0.0")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();

      // I0.1 OFF, I0.2 ON, I0.0 ON -> output ON
      await page.locator('button:has-text("I0.1")').click();
      await page.locator('button:has-text("I0.2")').click();
      await page.waitForTimeout(100);
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('Multiple timers in same program', async ({ page }) => {
      const program = `LD I0.0
TON T0,10
LD T0
ST Q0.0

LD I0.1
TON T1,15
LD T1
ST Q0.1`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Both outputs should be OFF
      await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
      await expect(page.locator('text=/Q0\\.1.*OFF/i')).toBeVisible();

      // Start both timers
      await page.locator('button:has-text("I0.0")').click();
      await page.locator('button:has-text("I0.1")').click();
      await page.waitForTimeout(1100);

      // T0 should be done, T1 still running
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
      await expect(page.locator('text=/Q0\\.1.*OFF/i')).toBeVisible();

      // Wait for T1
      await page.waitForTimeout(600);
      await expect(page.locator('text=/Q0\\.1.*ON/i')).toBeVisible();
    });

    test('Multiple counters in same program', async ({ page }) => {
      const program = `LD I0.0
CTU C0,2
LD C0
ST Q0.0

LD I0.1
CTU C1,3
LD C1
ST Q0.1`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Count C0 twice
      for (let i = 0; i < 2; i++) {
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(100);
      }

      // Q0.0 should be ON, Q0.1 still OFF
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
      await expect(page.locator('text=/Q0\\.1.*OFF/i')).toBeVisible();

      // Count C1 three times
      for (let i = 0; i < 3; i++) {
        await page.locator('button:has-text("I0.1")').click();
        await page.waitForTimeout(100);
        await page.locator('button:has-text("I0.1")').click();
        await page.waitForTimeout(100);
      }

      // Both should be ON
      await expect(page.locator('text=/Q0\\.1.*ON/i')).toBeVisible();
    });

    test('Timer with counter combination', async ({ page }) => {
      // Count pulses that are at least 0.5 seconds long
      const program = `LD I0.0
TON T0,5
LD T0
CTU C0,3
LD C0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Generate 3 long pulses
      for (let i = 0; i < 3; i++) {
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(600); // Long enough for timer
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(200);
      }

      // Output should be ON after 3 qualified pulses
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
    });
  });

  test.describe('Performance and Stress Tests', () => {
    test('Should handle rapid input toggling', async ({ page }) => {
      const program = `LD I0.0
ST Q0.0`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Rapidly toggle input 10 times
      for (let i = 0; i < 10; i++) {
        await page.locator('button:has-text("I0.0")').click();
        await page.waitForTimeout(50);
      }

      // Final state should match input state
      const isOn = i % 2 === 0; // 10 toggles = even = back to OFF
      if (isOn) {
        await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
      } else {
        await expect(page.locator('text=/Q0\\.0.*OFF/i')).toBeVisible();
      }
    });

    test('Should maintain responsiveness with complex program', async ({ page }) => {
      // Complex program with multiple instructions
      const program = `LD I0.0
AND I0.1
OR I0.2
ST Q0.0

LD I0.3
TON T0,10
LD T0
ST Q0.1

LD I0.4
CTU C0,5
LD C0
ST Q0.2`;

      await page.locator('textarea').fill(program);
      await page.locator('button:has-text("RUN")').click();
      await page.waitForTimeout(100);

      // Toggle various inputs
      await page.locator('button:has-text("I0.0")').click();
      await page.locator('button:has-text("I0.1")').click();
      await page.locator('button:has-text("I0.3")').click();
      await page.waitForTimeout(100);

      // Application should still be responsive
      await expect(page.locator('button:has-text("STOP")')).toBeEnabled();
      await expect(page.locator('text=/Q0\\.0.*ON/i')).toBeVisible();
    });
  });
});
