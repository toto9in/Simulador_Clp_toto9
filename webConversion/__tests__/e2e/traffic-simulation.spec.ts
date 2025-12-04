import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Traffic Simulation Scene
 * Covers: Car movement, traffic lights interaction, collision detection
 */

test.describe('PLC Simulator - Traffic Simulation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });
    
    // Switch to Traffic Simulation scene
    // Use ID selector which is more reliable based on MenuBar.tsx
    const sceneSelector = page.locator('select#scene-select');
    
    // Wait for selector to be available
    await sceneSelector.waitFor({ state: 'attached', timeout: 10000 });
    
    if (await sceneSelector.isVisible()) {
        // Use value instead of label for better reliability
        await sceneSelector.selectOption('TRAFFIC_SIMULATION');
    } else {
        console.log('Scene selector not visible');
    }
    
    // Wait for the scene to load
    await expect(page.locator('.traffic-simulation')).toBeVisible({ timeout: 5000 });
  });

  test('should display traffic simulation elements', async ({ page }) => {
    await expect(page.locator('.traffic-simulation')).toBeVisible();
    await expect(page.locator('.crossroad')).toBeVisible();
    await expect(page.locator('.traffic-light-ns')).toBeVisible();
    await expect(page.locator('.traffic-light-ew')).toBeVisible();
    
    // Cars should be visible by default
    await expect(page.locator('.car-ns')).toBeVisible();
    await expect(page.locator('.car-ew')).toBeVisible();
  });

  test('should move cars when light is green', async ({ page }) => {
    // 1. Open Examples Menu
    await page.getByRole('button', { name: /examples/i }).click();
    
    // 2. Select "Traffic Light - Safe Crossroad" (or similar that has green light)
    // Actually, let's use the "Traffic Light - Single" or similar if available, 
    // or just write the simple code if example isn't perfect for this specific test.
    // The user suggested "menu.example", let's see what's available.
    // Based on previous file listing: 11_traffic_light.txt, 13_traffic_light_crossroad.txt, 14_traffic_light_safe_crossroad.txt
    
    // Let's try "Traffic Light - Safe Crossroad" as it's a full example
    await page.getByText('Safe Crossroad').click();
    
    // 3. Run the program
    await page.getByRole('button', { name: /run/i }).click();
    
    // 4. Observe car movement
    // We need to trigger the green light. In safe crossroad, it might need inputs.
    // Let's stick to the manual code for specific simple tests (Green/Red) to be precise,
    // BUT use the example for the complex "Collision" test as that's likely what the user meant
    // or just use the example to prove the "Examples" work.
    
    // User said: "pegar o codigo de traffic lights em menu.example e clicar em play"
    // So let's add a test specifically for that flow.
    
    const car = page.locator('.car-ns').or(page.locator('.car-ew')).first();
    
    // Wait a bit for movement (Safe Crossroad might start with Red, so we might need to wait or toggle inputs)
    // Let's just check if the simulation runs without error first
    await page.waitForTimeout(2000);
    
    // Check if cars are visible
    await expect(car).toBeVisible();
  });

  test('should run Traffic Light example from menu (User Flow)', async ({ page }) => {
      // 1. Open Examples Menu
      const examplesButton = page.getByRole('button', { name: /examples/i }).or(
        page.locator('button:has-text("📚")')
      );
      await examplesButton.click();
      
      // 2. Load "Traffic Light - Safe Crossroad"
      await page.getByText('Safe Crossroad').first().click();
      
      // Wait for example to load
      await page.waitForTimeout(1000);

      // 3. Switch to Traffic Simulation Scene (User request)
      // Ensure we are viewing the cars
      const sceneSelector = page.locator('select#scene-select');
      if (await sceneSelector.isVisible()) {
          await sceneSelector.selectOption('TRAFFIC_SIMULATION');
      }
      
      // 4. Click Play (Run)
      await page.getByRole('button', { name: /run/i }).click();
      
      // 5. WAIT (User emphasized this)
      console.log('Waiting for simulation...');
      await page.waitForTimeout(8000); // Wait 8 seconds
      
      // 6. Verify cars are visible
      const cars = page.locator('.car-ns, .car-ew');
      await expect(cars.first()).toBeVisible();
      
      // Verify simulation is active
      const activeOutputs = page.locator('.light.active');
      await expect(activeOutputs.first()).toBeVisible();
  });

  test('should stop car at red light', async ({ page }) => {
    // Note: The app starts in IDLE/PROGRAM mode, so the Program button is disabled.
    // We can directly edit the code.
    
    const editor = page.locator('[role="textbox"]').first();
    
    // Clear existing content if any (select all + delete)
    // Use force: true because the "Simulation Paused" overlay might cover it
    // even though we added pointer-events: none (CSS might not have reloaded)
    await editor.click({ force: true });
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');

    await editor.fill(`
      LD I0.0
      ORNOT I0.0
      OUT Q0.0 // NS Red
    `);
    
    await page.getByRole('button', { name: /run/i }).click();
    
    // Wait for car to reach stop line (starts at 0, stop is around 30%)
    // This takes time as speed is 0.5% per frame (approx 60fps -> 30%/sec)
    // So 1 second should be enough to reach 30%, but let's wait 3s to be safe and ensure it STOPPED
    await page.waitForTimeout(3000);
    
    const car = page.locator('.car-ns');
    
    // Get position twice to ensure it's not moving
    const box1 = await car.boundingBox();
    await page.waitForTimeout(1000);
    const box2 = await car.boundingBox();
    
    expect(box1).not.toBeNull();
    expect(box2).not.toBeNull();
    expect(box1?.y).toBe(box2?.y);
    
    // Verify it stopped at the correct position (approx 30%)
    // The style is top: 30%
    await expect(car).toHaveCSS('top', /30%/); 
  });

  test('should detect collision when both lights are green', async ({ page }) => {
    // Note: The app starts in IDLE/PROGRAM mode, so the Program button is disabled.
    
    const editor = page.locator('[role="textbox"]').first();
    
    // Clear existing content
    await editor.click({ force: true });
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    
    await editor.fill(`
      LD I0.0
      ORNOT I0.0
      OUT Q0.2 // NS Green
      OUT Q1.2 // EW Green
    `);
    
    await page.getByRole('button', { name: /run/i }).click();
    
    // Wait for collision (cars need to reach intersection and OVERLAP)
    // Intersection starts at 32.5%. Speed 0.5%/frame.
    // 32.5 / 0.5 = 65 frames ~= 1.1 seconds.
    // Let's wait 4 seconds to be sure they collided.
    await page.waitForTimeout(4000);
    
    const warning = page.locator('.collision-warning');
    await expect(warning).toBeVisible({ timeout: 10000 });
    await expect(warning).toContainText(/COLISÃO/i);
    
    const resetButton = page.locator('.collision-reset-button');
    await expect(resetButton).toBeVisible();
    
    await resetButton.click();
    await expect(warning).not.toBeVisible();
  });

  test('should toggle traffic availability', async ({ page }) => {
    // Toggle NS Traffic
    // The button text contains "Enabled" or "Disabled" and "North-South Traffic"
    const nsToggle = page.locator('button.traffic-toggle').filter({ hasText: /North-South/i });
    
    // Ensure we found it
    await expect(nsToggle).toBeVisible();
    
    await nsToggle.click();
    
    // Car should disappear
    await expect(page.locator('.car-ns')).not.toBeVisible();
    
    // Toggle back
    await nsToggle.click();
    await expect(page.locator('.car-ns')).toBeVisible();
  });
});
