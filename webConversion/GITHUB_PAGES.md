# GitHub Pages Configuration

## Overview
This document explains the configuration needed for deploying the PLC Simulator to GitHub Pages.

## Configuration Details

### 1. Vite Configuration (`vite.config.ts`)
The Vite configuration is set up to:
- Use the correct base path (`/Simulador_Clp/`) for GitHub Pages
- Copy all files from `public/` directory to `dist/`
- Preserve original filenames for images and examples
- Automatically adjust paths when `GITHUB_PAGES=true` environment variable is set

### 2. Public Directory Structure
```
public/
├── assets/          # Images and icons (PNG files)
│   ├── menu.png
│   ├── pause.png
│   ├── start.png
│   ├── led_ligado.png
│   └── ... (more images)
├── examples/        # Example programs (.txt files)
│   ├── index.json
│   ├── 01_hello_world.txt
│   ├── 02_multiple_outputs.txt
│   └── ... (more examples)
└── .nojekyll       # Disables Jekyll processing on GitHub Pages
```

### 3. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
The workflow:
- Triggers on push to `main` branch
- Installs Node.js and dependencies
- Builds the project with `GITHUB_PAGES=true`
- Deploys the `dist/` folder to GitHub Pages

### 4. Asset References
All assets are referenced with absolute paths starting with `/`:
```tsx
// Correct
<img src="/assets/menu.png" />

// Incorrect (won't work on GitHub Pages)
<img src="./assets/menu.png" />
```

When built with `GITHUB_PAGES=true`, Vite automatically converts:
- `/assets/menu.png` → `/Simulador_Clp/assets/menu.png`
- `/examples/01_hello_world.txt` → `/Simulador_Clp/examples/01_hello_world.txt`

## Deployment Process

### 1. Local Testing
```bash
cd webConversion
GITHUB_PAGES=true npm run build
```

### 2. Verify Build Output
Check that `dist/` contains:
- `index.html` with correct base path
- `assets/` folder with all images
- `examples/` folder with all .txt files

### 3. Push to Main
```bash
git push origin main
```

### 4. Monitor Deployment
- Go to repository Settings → Pages
- Check that source is set to "GitHub Actions"
- Monitor the Actions tab for deployment progress

## Troubleshooting

### Images Not Loading
- Verify `GITHUB_PAGES=true` is set in the workflow
- Check browser console for 404 errors
- Verify base path is correct in `vite.config.ts`

### Examples Not Loading
- Verify `public/examples/` contains all .txt files
- Check `public/examples/index.json` is valid JSON
- Verify fetch paths use `/examples/` not `./examples/`

### General Issues
- Clear browser cache and hard reload (Ctrl+Shift+R)
- Check GitHub Actions logs for build errors
- Verify `dist/` folder structure matches `public/`

## File Locations

- Configuration: `webConversion/vite.config.ts`
- Workflow: `.github/workflows/deploy.yml`
- Assets: `webConversion/public/assets/`
- Examples: `webConversion/public/examples/`
- Build output: `webConversion/dist/` (generated)
