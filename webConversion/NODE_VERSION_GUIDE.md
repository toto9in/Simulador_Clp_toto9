# Node.js Version Compatibility Guide

## Supported Node.js Versions

This project is compatible with **Node.js 18.x, 20.x, 21.x, and 22.x**.

### Required Version
- **Minimum:** Node.js 18.0.0
- **Recommended:** Node.js 20.x LTS or 22.x

---

## Checking Your Node.js Version

```bash
node --version
```

---

## Installing/Updating Node.js

### Option 1: Using nvm (Recommended)

**Install nvm:**
- macOS/Linux: https://github.com/nvm-sh/nvm
- Windows: https://github.com/coreybutler/nvm-windows

**Install Node.js 20 LTS:**
```bash
nvm install 20
nvm use 20
```

**Install Node.js 22:**
```bash
nvm install 22
nvm use 22
```

### Option 2: Official Installer

Download from: https://nodejs.org/

- **LTS (Long Term Support):** Node.js 20.x - Recommended for most users
- **Current:** Node.js 22.x - Latest features

---

## Dependency Versions

The project uses the following compatible versions:

### Core Dependencies
- **React:** 18.3.1 (stable, widely used)
- **React DOM:** 18.3.1
- **i18next:** 23.15.0
- **react-i18next:** 15.1.0

### Development Dependencies
- **Vite:** 5.4.11 (build tool)
- **TypeScript:** 5.6.3
- **Vitest:** 2.1.8 (testing)
- **ESLint:** 9.17.0
- **Prettier:** 3.4.2

---

## Installation Steps

```bash
# 1. Navigate to project directory
cd webConversion

# 2. Clean install (if you had previous version issues)
rm -rf node_modules package-lock.json

# 3. Install dependencies
npm install

# 4. Verify installation
npm run build
```

---

## Common Issues & Solutions

### Issue: "Unsupported engine" warnings

**Symptoms:**
```
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'vite@7.2.2',
npm warn EBADENGINE   required: { node: '^20.19.0 || >=22.12.0' },
npm warn EBADENGINE   current: { node: 'v21.6.0', npm: '11.5.2' }
npm warn EBADENGINE }
```

**Solution:**
This has been fixed! The project now uses Vite 5.x which supports Node.js 18+.

### Issue: "crypto.hash is not a function"

**Symptoms:**
```
TypeError: crypto.hash is not a function
    at getHash (file:///.../vite/dist/node/chunks/config.js:2680:21)
```

**Solution:**
Update to the latest package versions:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: React version conflicts

**Symptoms:**
```
npm warn ERESOLVE overriding peer dependency
npm warn peer react@"^19.2.0" from react-dom@19.2.0
```

**Solution:**
The project now uses React 18.x which is more stable and compatible:
```bash
npm install react@18.3.1 react-dom@18.3.1 --save
```

---

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

---

## Troubleshooting

### 1. Clear npm cache
```bash
npm cache clean --force
```

### 2. Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### 3. Check Node.js version
```bash
node --version
# Should show v18.x, v20.x, v21.x, or v22.x
```

### 4. Update npm
```bash
npm install -g npm@latest
```

---

## CI/CD Compatibility

The project is configured with `engines` field in package.json:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

This ensures compatibility checks during deployment.

---

## Questions?

- Check the main README: [README.md](README.md)
- Review the tickets: [docs/TICKETS.md](docs/TICKETS.md)
- See the changelog: [CHANGELOG.md](CHANGELOG.md)

---

**Last Updated:** 2025-11-11
**Tested With:** Node.js 18.20.0, 20.18.0, 21.6.0, 22.21.1
