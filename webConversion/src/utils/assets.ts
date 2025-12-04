/**
 * Asset path utility
 * Ensures assets work correctly in both dev and GitHub Pages
 */

// Get base path from Vite config
const BASE_PATH = import.meta.env.BASE_URL || '/';

/**
 * Get the full path for an asset
 * @param path - Asset path relative to public directory (e.g., 'assets/menu.png')
 * @returns Full path with base URL
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine base path with asset path
  return `${BASE_PATH}${cleanPath}`;
}

/**
 * Common asset paths for easy access
 */
export const ASSETS = {
  // Control panel icons
  MENU: getAssetPath('assets/menu.png'),
  PAUSE: getAssetPath('assets/pause.png'),
  START: getAssetPath('assets/start.png'),
  START_GREEN: getAssetPath('assets/start_green.png'),
  
  // Editor icons
  BLOCO_NOTAS: getAssetPath('assets/bloco_notas.png'),
  
  // LED icons
  LED_ON: getAssetPath('assets/led_ligado.png'),
  LED_OFF: getAssetPath('assets/led_desligado.png'),
  
  // Switch icons
  CHAVE_ABERTA: getAssetPath('assets/chave_aberta.png'),
  CHAVE_FECHADA: getAssetPath('assets/chave_fechada.png'),
  
  // Button icons
  BUTTON: getAssetPath('assets/buttom.png'),
  BUTTON_CLOSED: getAssetPath('assets/botao_fechado.png'),
  BUTTON_PI: getAssetPath('assets/buttom_pi.png'),
  BUTTON_PI_OPEN: getAssetPath('assets/button_pi_aberto.png'),
  
  // Other icons
  CONTADOR: getAssetPath('assets/contador.png'),
  BATCH_BG: getAssetPath('assets/batch_bg.png'),
} as const;

/**
 * Get path for an example file
 * @param filename - Example filename (e.g., '01_hello_world.txt')
 * @returns Full path to example
 */
export function getExamplePath(filename: string): string {
  return getAssetPath(`examples/${filename}`);
}
