# Como Corrigir o Deploy do GitHub Pages

## ⚠️ Problema Atual

O deploy do GitHub Pages está falhando com erros TypeScript:

```
error TS2678: Type '"NOT"' is not comparable to type 'ILInstruction'.
error TS2678: Type '"SET"' is not comparable to type 'ILInstruction'.
error TS2678: Type '"S"' is not comparable to type 'ILInstruction'.
error TS2678: Type '"RESET"' is not comparable to type 'ILInstruction'.
error TS2678: Type '"R"' is not comparable to type 'ILInstruction'.
```

## ✅ Solução

As correções já foram implementadas no branch `claude/setup-electron-desktop-01ADSswB7CR3uEdhGxpQwL9F`.

### Opção 1: Merge via Pull Request (Recomendado)

1. **Acesse o GitHub:**
   ```
   https://github.com/Kiwiabacaxi/Simulador_Clp
   ```

2. **Crie um Pull Request:**
   - Source: `claude/setup-electron-desktop-01ADSswB7CR3uEdhGxpQwL9F`
   - Target: `main`

3. **Merge o PR:**
   - Revise as alterações
   - Clique em "Merge pull request"
   - Confirme o merge

4. **Aguarde o deploy:**
   - GitHub Actions rodará automaticamente
   - Build deve passar sem erros
   - Site será atualizado em ~2-5 minutos

### Opção 2: Merge via Linha de Comando

```bash
# 1. Ir para o diretório do projeto
cd E:\0_Github_files\Simulador_Clp

# 2. Atualizar branches
git fetch origin

# 3. Checkout para main
git checkout main
git pull origin main

# 4. Merge do branch com correções
git merge origin/claude/setup-electron-desktop-01ADSswB7CR3uEdhGxpQwL9F

# 5. Resolver conflitos (se houver)
# Conflitos esperados em:
# - webConversion/electron/main.js → main.cjs
# - webConversion/electron/preload.js → preload.cjs
# - webConversion/package.json (main: "electron/main.cjs")

# 6. Commitar merge
git commit -m "Merge branch 'claude/setup-electron-desktop-01ADSswB7CR3uEdhGxpQwL9F'"

# 7. Push para main
git push origin main
```

### Opção 3: Aplicar Apenas as Correções TypeScript

Se você quiser aplicar apenas as correções TypeScript sem as mudanças do Electron:

1. **Edite `webConversion/src/types/plc.ts`:**

   Adicione as instruções faltantes no enum `ILInstruction` (linha ~30):

   ```typescript
   export enum ILInstruction {
     LD = 'LD',
     LDN = 'LDN',
     ST = 'ST',
     STN = 'STN',
     OUT = 'OUT',
     AND = 'AND',
     ANDN = 'ANDN',
     OR = 'OR',
     ORN = 'ORN',
     NOT = 'NOT',     // ⬅️ ADICIONAR
     SET = 'SET',     // ⬅️ ADICIONAR
     S = 'S',         // ⬅️ ADICIONAR
     RESET = 'RESET', // ⬅️ ADICIONAR
     R = 'R',         // ⬅️ ADICIONAR
     TON = 'TON',
     TOFF = 'TOFF',
     CTU = 'CTU',
     CTD = 'CTD',
     CTR = 'CTR',
     CTL = 'CTL',
     RST = 'RST',
   }
   ```

2. **Edite `webConversion/src/services/interpreter.ts`:**

   Troque os casos string por enum (linha ~250):

   ```typescript
   // ANTES:
   case 'NOT':
     this.executeNOT();
     break;

   case 'SET':
   case 'S':
     this.executeSET(variable, state);
     break;

   case 'RESET':
   case 'R':
     this.executeRESET(variable, state);
     break;

   // DEPOIS:
   case ILInstruction.NOT:
     this.executeNOT();
     break;

   case ILInstruction.SET:
   case ILInstruction.S:
     this.executeSET(variable, state);
     break;

   case ILInstruction.RESET:
   case ILInstruction.R:
     this.executeRESET(variable, state);
     break;
   ```

3. **Teste localmente:**

   ```bash
   cd webConversion
   npm run build
   ```

   Deve compilar sem erros.

4. **Commit e push:**

   ```bash
   git add webConversion/src/types/plc.ts webConversion/src/services/interpreter.ts
   git commit -m "fix: Add missing IL instructions to enum"
   git push origin main
   ```

## 🧪 Verificar o Deploy

Após fazer merge ou push:

1. **Acesse o GitHub Actions:**
   ```
   https://github.com/Kiwiabacaxi/Simulador_Clp/actions
   ```

2. **Verifique o workflow "Deploy to GitHub Pages":**
   - Deve estar rodando (círculo amarelo)
   - Aguarde conclusão (✓ verde = sucesso, ✗ vermelho = erro)

3. **Se passar, acesse o site:**
   ```
   https://kiwiabacaxi.github.io/Simulador_Clp/
   ```

4. **Teste as funcionalidades:**
   - Carregar programas de exemplo
   - Editar código IL
   - Executar simulação
   - Salvar programas

## 📝 O Que Foi Corrigido

### Arquivos Modificados

1. **`webConversion/src/types/plc.ts`**
   - Adicionado `NOT`, `SET`, `S`, `RESET`, `R` ao enum `ILInstruction`

2. **`webConversion/src/services/interpreter.ts`**
   - Trocado casos string por constantes do enum
   - `'NOT'` → `ILInstruction.NOT`
   - `'SET'`, `'S'` → `ILInstruction.SET`, `ILInstruction.S`
   - `'RESET'`, `'R'` → `ILInstruction.RESET`, `ILInstruction.R`

### Por Que o Erro Acontecia

TypeScript não permite comparar strings literais com valores de enum em switch cases (modo strict). As instruções `NOT`, `SET`, `S`, `RESET`, `R` estavam implementadas no código mas faltavam no enum, causando incompatibilidade de tipos.

## 🔄 Sobre o Branch do Electron

O branch `claude/setup-electron-desktop-01ADSswB7CR3uEdhGxpQwL9F` também contém:

- ✅ Correções TypeScript (necessárias para deploy)
- ✅ Guia completo do Electron (`ELECTRON_GUIDE.md`)
- ✅ Configuração ESM/CommonJS para Electron (.cjs)
- ✅ Melhorias no Vite config

Se você fizer merge completo, também receberá as melhorias do Electron (recomendado).

## ❓ Dúvidas

Se tiver problemas:

1. Verifique se está na branch `main`
2. Certifique-se de ter permissões de push
3. Verifique se não há conflitos de merge
4. Confira os logs do GitHub Actions para erros específicos

---

**Data:** 2025-11-18
**Branch com correções:** `claude/setup-electron-desktop-01ADSswB7CR3uEdhGxpQwL9F`
**Commit:** `10f1add - fix: Resolve Electron ESM compatibility and TypeScript errors`
