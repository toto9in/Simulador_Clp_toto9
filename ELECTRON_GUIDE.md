# Guia Completo do Electron - PLC Simulator

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Por Que Usar Electron](#por-que-usar-electron)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Desenvolvimento](#desenvolvimento)
6. [Build e Distribuição](#build-e-distribuição)
7. [Mantendo Web e Electron Sincronizados](#mantendo-web-e-electron-sincronizados)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## 🎯 Visão Geral

O **PLC Simulator** funciona tanto como **aplicação web** quanto como **aplicação desktop** (instalador .exe para Windows). O Electron é a tecnologia que permite empacotar nossa aplicação React em um executável nativo, mantendo **100% do mesmo código** usado na versão web.

### Princípio Fundamental

> **Uma única base de código → Duas formas de distribuição**
>
> - **Web**: Hospedado no GitHub Pages, acesso via navegador
> - **Desktop**: Instalador Windows (.exe), executado localmente

---

## 🏗️ Arquitetura

### Como o Electron Funciona

O Electron combina **Chromium** (motor de navegador) + **Node.js** (runtime JavaScript) para criar aplicações desktop usando tecnologias web.

```
┌─────────────────────────────────────────────────────────┐
│                    Aplicação Electron                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐          ┌────────────────────┐    │
│  │  Main Process   │          │  Renderer Process  │    │
│  │  (Node.js)      │◄────────►│  (React + Vite)    │    │
│  │                 │   IPC    │                    │    │
│  │ • Janela        │          │ • UI Components    │    │
│  │ • Menus         │          │ • Business Logic   │    │
│  │ • File System   │          │ • User Interaction │    │
│  │ • Native APIs   │          │                    │    │
│  └─────────────────┘          └────────────────────┘    │
│         ▲                              ▲                 │
│         │                              │                 │
│         └──────────────┬───────────────┘                 │
│                        │                                 │
│                 ┌──────▼──────┐                          │
│                 │  Preload    │                          │
│                 │  Script     │                          │
│                 │             │                          │
│                 │ • Bridge    │                          │
│                 │ • Security  │                          │
│                 └─────────────┘                          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Processos

1. **Main Process** (`electron/main.js`)
   - Controla o ciclo de vida da aplicação
   - Cria e gerencia janelas
   - Acessa APIs nativas do sistema operacional
   - **NÃO tem acesso direto ao DOM**

2. **Renderer Process** (Seu código React em `src/`)
   - Renderiza a interface do usuário
   - Roda o código React/TypeScript
   - **É exatamente o mesmo código da versão web**
   - Isolado por segurança (não tem acesso direto ao Node.js)

3. **Preload Script** (`electron/preload.js`)
   - Ponte segura entre Main e Renderer
   - Expõe APIs seletivamente via `contextBridge`
   - Garante que o Renderer só acesse o que é permitido

---

## 🤔 Por Que Usar Electron

### Vantagens

✅ **Código Único**
- Mesma base de código para web e desktop
- Manutenção simplificada
- Atualizações simultâneas

✅ **Funcionalidades Nativas**
- Diálogos nativos de abrir/salvar arquivo
- Acesso ao sistema de arquivos
- Integração com o sistema operacional

✅ **Melhor UX Desktop**
- Instalador profissional
- Ícone na área de trabalho
- Funciona offline
- Melhor performance em alguns casos

✅ **Distribuição Flexível**
- Usuários podem escolher web ou desktop
- Instalador para ambientes corporativos/educacionais
- Não precisa de navegador atualizado

### Desvantagens

❌ **Tamanho**
- Instalador ~150MB (inclui Chromium + Node.js)
- Maior que aplicações nativas puras

❌ **Performance**
- Um pouco mais pesado que apps nativos
- Usa mais memória RAM

❌ **Atualizações**
- Web: automática
- Desktop: usuário precisa baixar nova versão

---

## 📁 Estrutura do Projeto

```
Simulador_Clp/
├── webConversion/               # Aplicação principal
│   ├── electron/                # Código Electron
│   │   ├── main.js             # Processo principal (cria janela, APIs nativas)
│   │   ├── preload.js          # Bridge seguro (contextBridge)
│   │   └── README.md           # Documentação básica do Electron
│   │
│   ├── src/                    # Código React (COMPARTILHADO web/desktop)
│   │   ├── components/         # Componentes React
│   │   ├── services/           # Lógica de negócios
│   │   │   └── fileIO.ts       # ⭐ Detecta Electron e usa APIs nativas
│   │   └── types/
│   │       └── electron.d.ts   # Tipos TypeScript para ElectronAPI
│   │
│   ├── public/                 # Assets estáticos
│   │   ├── assets/             # Imagens
│   │   └── examples/           # Programas de exemplo
│   │
│   ├── dist/                   # Build produção (gerado)
│   ├── release/                # Instaladores (gerado por electron-builder)
│   │
│   ├── package.json            # Dependências e scripts
│   ├── vite.config.ts          # Configuração Vite (web + Electron)
│   └── ...
│
└── ELECTRON_GUIDE.md           # Este arquivo
```

### Arquivos Principais

#### `webConversion/electron/main.js`

Processo principal do Electron. Responsável por:

- Criar a janela da aplicação
- Carregar a URL correta (dev server ou arquivos locais)
- Implementar IPC handlers para:
  - `dialog:openFile` - Diálogo nativo de abrir
  - `dialog:saveFile` - Diálogo nativo de salvar
  - `app:isElectron` - Detectar se está no Electron
  - `app:getVersion` - Obter versão da app

**Código importante:**

```javascript
// Desenvolvimento: carrega do Vite dev server
if (process.env.NODE_ENV === 'development') {
  mainWindow.loadURL('http://localhost:5173');
} else {
  // Produção: carrega arquivos do dist/
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}
```

#### `webConversion/electron/preload.js`

Ponte segura entre Main e Renderer.

**Código importante:**

```javascript
// Expõe APIs seletivamente para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: () => ipcRenderer.invoke('app:isElectron'),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content) => ipcRenderer.invoke('dialog:saveFile', content),
});
```

Isso cria `window.electronAPI` no React.

#### `webConversion/src/services/fileIO.ts`

Serviço que **detecta automaticamente** se está no Electron e usa APIs adequadas.

**Código importante:**

```typescript
// Detecta se está no Electron
private static isElectron(): boolean {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
}

// Usa API nativa se disponível, senão fallback para web
static async saveProgramToFile(programText: string): Promise<void> {
  if (this.isElectron() && window.electronAPI) {
    // Electron: usa diálogo nativo
    await window.electronAPI.saveFile(programText);
  } else {
    // Web: usa download via Blob
    this.saveProgramToFileWeb(programText);
  }
}
```

#### `webConversion/src/types/electron.d.ts`

Tipos TypeScript para `window.electronAPI`.

```typescript
interface Window {
  electronAPI?: ElectronAPI;
}
```

---

## 💻 Desenvolvimento

### Pré-requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0

### Instalação

```bash
cd webConversion
npm install
```

Isso instala todas as dependências, incluindo:
- `electron` - Runtime Electron
- `electron-builder` - Cria instaladores
- `concurrently` - Roda múltiplos comandos
- `wait-on` - Espera servidor estar pronto
- `cross-env` - Variáveis de ambiente multiplataforma

### Modo Desenvolvimento

#### Opção 1: Web (sem Electron)

```bash
npm run dev
```

- Abre em `http://localhost:5173`
- Hot reload automático
- Usa File API do navegador (download/upload)

#### Opção 2: Electron (recomendado para testar funcionalidades nativas)

```bash
npm run electron:dev
```

Isso executa:

1. `npm run dev` - Inicia Vite dev server
2. `wait-on http://localhost:5173` - Espera servidor estar pronto
3. `electron .` - Abre janela Electron apontando para `localhost:5173`

**Vantagens:**

- ✅ Testa funcionalidades nativas (diálogos de arquivo)
- ✅ DevTools aberto automaticamente
- ✅ Hot reload funciona normalmente
- ✅ Ambiente idêntico ao build final

**Desvantagens:**

- ⚠️ Um pouco mais lento para iniciar
- ⚠️ Usa mais memória

### Estrutura dos Scripts

```json
{
  "scripts": {
    "dev": "vite",                                          // Web dev server
    "build": "tsc -b && vite build",                        // Build produção
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && cross-env NODE_ENV=development electron .\"",
    "electron:build": "npm run build && electron .",        // Testa build
    "electron:dist": "npm run build && electron-builder"    // Cria instalador
  }
}
```

---

## 📦 Build e Distribuição

### Build de Produção (Web)

```bash
npm run build
```

Cria arquivos otimizados em `dist/`:

- HTML/CSS/JS minificados
- Assets otimizados
- Pronto para deploy (GitHub Pages, Netlify, etc.)

### Testar Build Localmente

#### Web

```bash
npm run preview
```

Serve `dist/` em `http://localhost:4173`

#### Electron

```bash
npm run electron:build
```

1. Compila com Vite
2. Abre Electron carregando `dist/index.html`
3. Testa se assets estão carregando corretamente

### Criar Instalador Windows

```bash
npm run electron:dist
```

**O que acontece:**

1. `npm run build` - Compila React/Vite
2. `electron-builder` - Empacota com Electron
3. Cria instalador NSIS em `release/`

**Saída:**

```
release/
├── PLC Simulator Setup 0.1.0.exe    # Instalador (x64 + ia32)
├── win-unpacked/                     # App descompactada (para testes)
│   └── PLC Simulator.exe
└── builder-effective-config.yaml    # Configuração usada
```

**Tamanho esperado:**
- Instalador: ~70-100 MB (compactado)
- App instalada: ~150-200 MB (inclui Chromium + Node.js)

### Configuração do Instalador

No `package.json`:

```json
{
  "build": {
    "appId": "com.plcsimulator.app",
    "productName": "PLC Simulator",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "public/assets/**/*",
      "public/examples/**/*"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,                          // Instalador customizável
      "allowToChangeInstallationDirectory": true, // Usuário escolhe onde instalar
      "createDesktopShortcut": true,              // Atalho na área de trabalho
      "createStartMenuShortcut": true,            // Atalho no Menu Iniciar
      "shortcutName": "PLC Simulator"
    }
  }
}
```

### Plataformas Suportadas

#### Windows ✅ (Configurado)

```bash
npm run electron:dist
```

Cria:
- ✅ `.exe` - Instalador NSIS
- ✅ `win-unpacked/` - Portable (sem instalação)

#### macOS 🔧 (Configurado, mas precisa testar)

```bash
npm run electron:dist
```

Cria:
- 📦 `.dmg` - Disk image
- 📦 `.zip` - App standalone

**Nota:** Precisa rodar em macOS para gerar instalador macOS.

#### Linux 🔧 (Configurado, mas precisa testar)

```bash
npm run electron:dist
```

Cria:
- 📦 `.AppImage` - Executável universal
- 📦 `.deb` - Pacote Debian/Ubuntu

---

## 🔄 Mantendo Web e Electron Sincronizados

### Princípio Fundamental

> **O código React em `src/` é compartilhado entre web e desktop.**
>
> Qualquer alteração em `src/` automaticamente afeta ambas as versões.

### Como Funciona

1. **Código compartilhado** (`src/`)
   - Componentes React
   - Lógica de negócios
   - Estilos
   - Tipos TypeScript

2. **Detecção de ambiente** (`fileIO.ts`)

   ```typescript
   if (window.electronAPI) {
     // Electron: usa APIs nativas
   } else {
     // Web: usa File API do navegador
   }
   ```

3. **Build separados, código idêntico**

   ```bash
   # Web
   npm run build          # → dist/ (para GitHub Pages)

   # Desktop
   npm run electron:dist  # → release/ (usa o mesmo dist/)
   ```

### Workflow de Desenvolvimento

#### Cenário 1: Adicionar Nova Funcionalidade

1. **Desenvolva normalmente em `src/`**

   ```bash
   npm run dev  # ou npm run electron:dev
   ```

2. **Teste em ambos os ambientes**

   ```bash
   # Testar web
   npm run dev

   # Testar Electron
   npm run electron:dev
   ```

3. **Build e distribua**

   ```bash
   # Web (GitHub Pages)
   npm run build
   git add dist/
   git commit -m "feat: nova funcionalidade"
   git push

   # Desktop (instalador)
   npm run electron:dist
   # release/PLC Simulator Setup x.x.x.exe
   ```

#### Cenário 2: Funcionalidade que Precisa de API Nativa

**Exemplo:** Adicionar exportação para PDF

1. **Adicione handler no `electron/main.js`**

   ```javascript
   ipcMain.handle('dialog:exportPDF', async (event, pdfData) => {
     const result = await dialog.showSaveDialog(mainWindow, {
       title: 'Exportar PDF',
       defaultPath: 'relatorio.pdf',
       filters: [{ name: 'PDF', extensions: ['pdf'] }]
     });

     if (!result.canceled) {
       fs.writeFileSync(result.filePath, pdfData);
       return { success: true };
     }
   });
   ```

2. **Exponha no `electron/preload.js`**

   ```javascript
   contextBridge.exposeInMainWorld('electronAPI', {
     // ... APIs existentes
     exportPDF: (data) => ipcRenderer.invoke('dialog:exportPDF', data),
   });
   ```

3. **Adicione tipo em `src/types/electron.d.ts`**

   ```typescript
   interface ElectronAPI {
     // ... tipos existentes
     exportPDF: (data: Buffer) => Promise<{success: boolean}>;
   }
   ```

4. **Use no código React com fallback**

   ```typescript
   // src/services/export.ts
   export async function exportToPDF(data: Buffer) {
     if (window.electronAPI) {
       // Electron: usa diálogo nativo
       return await window.electronAPI.exportPDF(data);
     } else {
       // Web: faz download direto
       const blob = new Blob([data], {type: 'application/pdf'});
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = 'relatorio.pdf';
       a.click();
     }
   }
   ```

5. **Teste em ambos**

   ```bash
   # Electron: diálogo nativo
   npm run electron:dev

   # Web: download automático
   npm run dev
   ```

### Checklist de Sincronização

Ao fazer qualquer alteração, verifique:

- ✅ **Funciona na web?** (`npm run dev`)
- ✅ **Funciona no Electron?** (`npm run electron:dev`)
- ✅ **Build web OK?** (`npm run build && npm run preview`)
- ✅ **Build Electron OK?** (`npm run electron:build`)
- ✅ **Instalador OK?** (`npm run electron:dist`)
- ✅ **Tipos TypeScript corretos?** (`npm run type-check`)
- ✅ **Testes passando?** (`npm test`)

### Versionamento

**Sempre atualize `package.json`:**

```json
{
  "version": "0.2.0"
}
```

Isso afeta:
- Nome do instalador: `PLC Simulator Setup 0.2.0.exe`
- Título da janela Electron
- `window.electronAPI.getVersion()`

### Deploy Simultâneo

```bash
# 1. Atualizar versão
# Edite package.json → "version": "0.2.0"

# 2. Build web
npm run build

# 3. Build desktop
npm run electron:dist

# 4. Commit tudo
git add .
git commit -m "release: v0.2.0"
git tag v0.2.0
git push origin main
git push origin v0.2.0

# 5. Deploy web (GitHub Actions faz automaticamente)
# Instalador está em release/
```

---

## 🐛 Troubleshooting

### Problemas Comuns

#### ❌ "Cannot find module 'electron'"

**Causa:** Dependências não instaladas

**Solução:**

```bash
cd webConversion
npm install
```

#### ❌ "Failed to load preload script"

**Causa:** Caminho incorreto em `main.js`

**Solução:**

Verificar em `electron/main.js`:

```javascript
preload: path.join(__dirname, 'preload.js')
```

Deve ser relativo a `electron/`.

#### ❌ "window.electronAPI is undefined"

**Causa:** `contextBridge` não está expondo corretamente

**Diagnóstico:**

1. Verificar `electron/preload.js`:

   ```javascript
   contextBridge.exposeInMainWorld('electronAPI', { ... });
   ```

2. Verificar `electron/main.js`:

   ```javascript
   webPreferences: {
     preload: path.join(__dirname, 'preload.js'),
     contextIsolation: true  // ⭐ DEVE ser true
   }
   ```

3. No console do Electron DevTools:

   ```javascript
   console.log(window.electronAPI);  // Deve mostrar objeto
   ```

#### ❌ Build Electron carrega página em branco

**Causa:** Caminhos incorretos no `dist/`

**Diagnóstico:**

1. Verificar `vite.config.ts`:

   ```typescript
   base: './'  // ⭐ Deve ser relativo para Electron
   ```

2. Verificar `dist/index.html`:

   ```html
   <!-- ERRADO -->
   <script src="/assets/index.js"></script>

   <!-- CORRETO -->
   <script src="./assets/index.js"></script>
   ```

3. Testar manualmente:

   ```bash
   npm run electron:build
   # Abre DevTools (F12) e verifica erros de carregamento
   ```

**Solução:**

```typescript
// vite.config.ts
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Simulador_Clp/' : './',
  // ...
});
```

#### ❌ "Error: spawn ENOENT" ao rodar `electron:dev`

**Causa:** `wait-on` ou `concurrently` não instalados

**Solução:**

```bash
npm install --save-dev wait-on concurrently
```

#### ❌ Instalador não inclui arquivos de `public/`

**Causa:** `electron-builder` não está copiando assets

**Solução:**

Verificar em `package.json`:

```json
{
  "build": {
    "files": [
      "dist/**/*",
      "electron/**/*",
      "public/assets/**/*",    // ⭐ Incluir
      "public/examples/**/*"   // ⭐ Incluir
    ],
    "extraResources": [
      {
        "from": "public/assets",
        "to": "assets"
      },
      {
        "from": "public/examples",
        "to": "examples"
      }
    ]
  }
}
```

#### ❌ Electron não atualiza após alterações no código

**Causa:** Precisa reiniciar processo principal

**Solução:**

1. **Alterações em `src/`:**
   - Hot reload funciona automaticamente ✅

2. **Alterações em `electron/main.js` ou `electron/preload.js`:**
   - Parar Electron (Ctrl+C)
   - Rodar `npm run electron:dev` novamente

3. **Usar nodemon para auto-restart (opcional):**

   ```bash
   npm install --save-dev nodemon
   ```

   ```json
   {
     "scripts": {
       "electron:dev:watch": "concurrently \"npm run dev\" \"nodemon --watch electron --exec 'cross-env NODE_ENV=development electron .'\""
     }
   }
   ```

### Debug

#### DevTools no Electron

**Desenvolvimento:**

DevTools abre automaticamente:

```javascript
// electron/main.js
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools();
}
```

**Produção:**

Adicionar temporariamente:

```javascript
mainWindow.webContents.openDevTools();
```

#### Console Logs

**Main Process** (electron/main.js):

```javascript
console.log('Main process log');
// Aparece no terminal onde você rodou npm run electron:dev
```

**Renderer Process** (src/):

```typescript
console.log('Renderer process log');
// Aparece no DevTools do Electron
```

#### Inspecionar IPC

```javascript
// electron/main.js
ipcMain.handle('dialog:openFile', async () => {
  console.log('[IPC] openFile called');
  // ...
});

// src/services/fileIO.ts
const result = await window.electronAPI.openFile();
console.log('[IPC] openFile result:', result);
```

---

## ❓ FAQ

### Preciso modificar código para funcionar no Electron?

**Não!** O código React é 100% compartilhado. Use detecção de ambiente:

```typescript
if (window.electronAPI) {
  // Electron
} else {
  // Web
}
```

### Como adiciono uma nova API nativa?

1. Handler em `electron/main.js`
2. Exposição em `electron/preload.js`
3. Tipo em `src/types/electron.d.ts`
4. Uso em `src/` com fallback para web

### Preciso fazer build separados?

**Não.** O mesmo `dist/` serve para:
- GitHub Pages (web)
- Electron (desktop)

A diferença está apenas em como é servido:
- Web: servidor HTTP
- Electron: `file://` protocol

### Como usuários recebem atualizações?

**Web:**
- Automático (refresh da página)

**Desktop:**
- Manual (baixar novo instalador)
- Ou implementar auto-updater (avançado)

### Posso usar Node.js no código React?

**Não diretamente.** Por segurança, apenas via `contextBridge`:

```javascript
// ❌ ERRADO (não funciona)
import fs from 'fs';

// ✅ CORRETO
await window.electronAPI.saveFile(content);
```

### Como testar sem instalar?

```bash
# Testar build sem criar instalador
npm run electron:build

# Ou usar versão "unpacked"
npm run electron:dist
# release/win-unpacked/PLC Simulator.exe
```

### Posso usar no macOS/Linux?

**Sim!** Configuração já existe em `package.json`.

Para gerar instaladores, rode em cada plataforma:

```bash
# macOS
npm run electron:dist  # → .dmg, .zip

# Linux
npm run electron:dist  # → .AppImage, .deb
```

### Como adicionar ícone customizado?

1. **Criar ícones:**

   - Windows: `.ico` (256x256)
   - macOS: `.icns`
   - Linux: `.png` (512x512)

2. **Adicionar em `package.json`:**

   ```json
   {
     "build": {
       "win": {
         "icon": "public/assets/icon.ico"
       },
       "mac": {
         "icon": "public/assets/icon.icns"
       },
       "linux": {
         "icon": "public/assets/icon.png"
       }
     }
   }
   ```

### Quanto pesa o instalador?

- Instalador compactado: ~70-100 MB
- App instalada: ~150-200 MB

**Por quê?**
Inclui Chromium (navegador) + Node.js + sua aplicação.

### Preciso de código assinado (code signing)?

**Para distribuição profissional: SIM**

Windows/macOS mostram aviso se não assinado:
- "Publisher: Unknown"
- "This app might harm your computer"

**Para testes/uso interno: NÃO**

**Como assinar:**

1. Obter certificado de code signing
2. Configurar em `package.json`:

   ```json
   {
     "build": {
       "win": {
         "certificateFile": "path/to/cert.pfx",
         "certificatePassword": "password"
       }
     }
   }
   ```

---

## 🚀 Próximos Passos

### Melhorias Futuras

- [ ] **Auto-updater**: Atualização automática sem reinstalar
- [ ] **Menu customizado**: Menu File/Edit/Help
- [ ] **Tray icon**: Ícone na bandeja do sistema
- [ ] **Multi-window**: Múltiplas janelas simultâneas
- [ ] **Splash screen**: Tela de carregamento
- [ ] **Instalador Linux/macOS**: Testar em outras plataformas
- [ ] **Assinatura de código**: Para distribuição profissional

### Recursos Úteis

- [Electron Docs](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [Context Isolation](https://www.electronjs.org/docs/tutorial/context-isolation)
- [IPC Tutorial](https://www.electronjs.org/docs/tutorial/ipc)
- [Security Best Practices](https://www.electronjs.org/docs/tutorial/security)

---

## 📝 Resumo Executivo

### Para Desenvolvedores

**Você só precisa saber:**

1. Código em `src/` é compartilhado (web + desktop)
2. Use `window.electronAPI` para funcionalidades nativas
3. Sempre teste em ambos os ambientes
4. Build web: `npm run build`
5. Build desktop: `npm run electron:dist`

### Para Usuários Finais

**Duas formas de usar:**

1. **Web**: Acesse https://kiwiabacaxi.github.io/Simulador_Clp/
2. **Desktop**: Baixe `PLC Simulator Setup.exe` e instale

**Mesmas funcionalidades, experiência diferente:**

| Recurso | Web | Desktop |
|---------|-----|---------|
| Funcionalidades | ✅ Completas | ✅ Completas |
| Diálogo de arquivo | Download/Upload | Diálogo nativo |
| Instalação | Nenhuma | ~150MB |
| Atualizações | Automáticas | Manual |
| Offline | ❌ | ✅ |

---

**Desenvolvido com ❤️ para o PLC Simulator**
**Versão deste guia:** 1.0.0
**Última atualização:** 2025-11-17
