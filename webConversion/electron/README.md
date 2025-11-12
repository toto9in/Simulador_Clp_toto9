# Electron Desktop Application

Este diretório contém os arquivos do Electron para transformar o PLC Simulator web em uma aplicação desktop nativa.

## 📁 Estrutura

```
electron/
├── main.js      # Processo principal do Electron (Node.js)
├── preload.js   # Script de pré-carga (bridge seguro entre main e renderer)
└── README.md    # Este arquivo
```

## 🚀 Como Usar

### Desenvolvimento

```bash
# Inicia o servidor Vite e abre o Electron
npm run electron:dev
```

Isso vai:
1. Iniciar o servidor de desenvolvimento Vite em `http://localhost:5173`
2. Aguardar o servidor estar pronto
3. Abrir a janela do Electron apontando para o servidor local
4. Habilitar DevTools automaticamente

### Testar Build de Produção

```bash
# Compila a aplicação React e abre no Electron
npm run electron:build
```

Isso vai:
1. Executar `npm run build` (TypeScript + Vite)
2. Abrir o Electron carregando de `dist/index.html`

### Criar Instalador Windows

```bash
# Cria instalador .exe usando electron-builder
npm run electron:dist
```

Isso vai:
1. Compilar a aplicação React
2. Empacotar com Electron
3. Criar instalador NSIS em `release/`

**Saída:**
- `release/PLC Simulator Setup 0.1.0.exe` - Instalador Windows (x64 e ia32)
- `release/win-unpacked/` - Aplicação descompactada (para testes)

## 🔧 Configuração

### package.json

```json
{
  "main": "electron/main.js",
  "build": {
    "appId": "com.plcsimulator.app",
    "productName": "PLC Simulator",
    "win": {
      "target": ["nsis"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

## 🏗️ Arquitetura

### main.js (Processo Principal)

- Cria a janela do aplicativo (1400x900)
- Gerencia ciclo de vida da aplicação
- Implementa IPC handlers para:
  - `dialog:openFile` - Diálogo nativo de abrir arquivo
  - `dialog:saveFile` - Diálogo nativo de salvar arquivo
  - `app:isElectron` - Detectar se está rodando no Electron
  - `app:getVersion` - Obter versão da aplicação

### preload.js (Bridge Seguro)

Expõe APIs do Electron para o renderer process via `contextBridge`:

```javascript
window.electronAPI = {
  isElectron: () => Promise<boolean>,
  getVersion: () => Promise<string>,
  openFile: () => Promise<{canceled, filePath?, content?, error?}>,
  saveFile: (content) => Promise<{canceled, filePath?, error?}>
}
```

### Renderer Process (React)

O código React detecta automaticamente se está no Electron:

```typescript
// src/services/fileIO.ts
if (window.electronAPI) {
  // Usa diálogos nativos
  const result = await window.electronAPI.openFile();
} else {
  // Fallback para File API do navegador
  const file = await this.selectFileWeb();
}
```

## 🔐 Segurança

- **contextIsolation: true** - Isola contexto do renderer
- **nodeIntegration: false** - Desabilita Node.js no renderer
- **sandbox: false** - Necessário para preload script
- **contextBridge** - Única forma segura de expor APIs

## 🎨 Funcionalidades

### Diálogos Nativos

✅ **Abrir Arquivo**
- Filtro por extensão (.txt)
- Leitura direta do sistema de arquivos
- Melhor UX que `<input type="file">`

✅ **Salvar Arquivo**
- Permite escolher local e nome
- Sem downloads "forçados"
- Compatível com permissões do sistema

### Compatibilidade

O código funciona tanto no **Electron** quanto no **navegador web** sem modificações:

| Ambiente | Abrir | Salvar |
|----------|-------|--------|
| Electron | Dialog nativo | Dialog nativo |
| Chrome   | `<input>` | Blob download |
| Firefox  | `<input>` | Blob download |
| Safari   | `<input>` | Blob download |

## 📦 Distribuição

### Windows

```bash
npm run electron:dist
```

Cria:
- ✅ Instalador NSIS (.exe)
- ✅ Atalho no Desktop
- ✅ Atalho no Menu Iniciar
- ✅ Opção de desinstalar

### macOS (futuro)

```bash
npm run electron:dist
```

Cria:
- 📦 DMG (disk image)
- 📦 ZIP (aplicação standalone)

### Linux (futuro)

```bash
npm run electron:dist
```

Cria:
- 📦 AppImage (executável universal)
- 📦 DEB (Debian/Ubuntu)

## 🐛 Debug

### DevTools

Em desenvolvimento, DevTools abre automaticamente. Em produção:

```javascript
// Adicionar em main.js
mainWindow.webContents.openDevTools();
```

### Console Logs

```javascript
// main.js (Node.js console)
console.log('Main process');

// renderer process (DevTools console)
console.log('Renderer process');
```

### Erros Comuns

**❌ "Cannot find module 'electron'"**
```bash
npm install --save-dev electron
```

**❌ "Failed to load preload script"**
- Verificar caminho em `main.js`: `preload: path.join(__dirname, 'preload.js')`

**❌ "window.electronAPI is undefined"**
- Verificar se `contextBridge.exposeInMainWorld` está em `preload.js`
- Verificar se `contextIsolation: true` em `main.js`

## 📚 Referências

- [Electron Docs](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [Context Isolation](https://www.electronjs.org/docs/tutorial/context-isolation)
- [IPC Communication](https://www.electronjs.org/docs/api/ipc-main)

---

**Desenvolvido para:** PLC Simulator v0.1.0
**Electron:** v39.1.2
**Node.js:** >=18.0.0
