# 🚀 Deployment Guide - GitHub Pages

Este guia explica como fazer o deploy do PLC Simulator para GitHub Pages.

## ✅ Pré-requisitos

- Repositório no GitHub
- Push access ao repositório
- GitHub Actions habilitado (geralmente já vem habilitado)

---

## 📋 Passo a Passo

### 1️⃣ **Configurar GitHub Pages**

1. Vá para o seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em **Source**, selecione:
   - Source: **GitHub Actions**
   - (NÃO use "Deploy from a branch")

![GitHub Pages Settings](https://docs.github.com/assets/cb-158070/images/help/pages/publishing-source.png)

### 2️⃣ **Ajustar Base Path (se necessário)**

O arquivo `vite.config.ts` já está configurado para usar `/Simulador_Clp/` como base path.

Se o nome do seu repositório for diferente, edite o arquivo:

```typescript
// webConversion/vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/SEU-REPO-NAME/' : '/',
})
```

**Exemplos:**
- Repo: `https://github.com/usuario/meu-plc` → base: `/meu-plc/`
- Repo: `https://github.com/usuario/Simulador_Clp` → base: `/Simulador_Clp/` ✅ (já está assim)

### 3️⃣ **Fazer Merge para Main**

O deploy automático acontece quando há push para a branch `main`:

```bash
# Certifique-se de estar na branch feature
git checkout claude/plc-simulator-environment-011CV2s3T6wSAn8DYYbMxBLG

# Faça merge para main
git checkout main
git merge claude/plc-simulator-environment-011CV2s3T6wSAn8DYYbMxBLG

# Push para o GitHub
git push origin main
```

**Ou crie um Pull Request:**
1. Vá para o GitHub
2. Crie um Pull Request da sua branch para `main`
3. Faça o merge

### 4️⃣ **Aguardar o Deploy**

1. Vá para a aba **Actions** no GitHub
2. Você verá o workflow "Deploy to GitHub Pages" rodando
3. Aguarde cerca de 2-3 minutos

![GitHub Actions](https://docs.github.com/assets/cb-29329/images/help/repository/actions-workflow-run-overview.png)

### 5️⃣ **Acessar o Site**

Após o deploy ser concluído, acesse:

```
https://USERNAME.github.io/Simulador_Clp/
```

Substitua `USERNAME` pelo seu usuário do GitHub.

**Exemplo:**
- `https://kiwiabacaxi.github.io/Simulador_Clp/`

---

## 🎯 Funcionalidades no Deploy

✅ **Todos os recursos funcionam:**
- Carregar/Salvar programas (download browser)
- Drag & Drop de arquivos
- **12 Programas de Exemplo** (📚 botão Examples no menu)
- Todas as cenas (Default e Batch)
- Todos os temas e idiomas
- Atalhos de teclado
- Toast notifications
- Data Table

---

## 📚 Programas de Exemplo Incluídos

O menu **📚 Examples** inclui 12 programas prontos:

### 🟢 Básicos (Beginner)
1. **Hello World** - I/O básico
2. **Multiple Outputs** - Múltiplas saídas
3. **AND Logic** - Circuito de segurança
4. **OR Logic** - Múltiplos botões

### 🟡 Intermediários
5. **Start/Stop Seal** - Controle com selo
6. **Timer On-Delay** - TON (5s)
7. **Timer Off-Delay** - TOFF (3s)
8. **Blinker** - Pisca-pisca
9. **Counter Up** - Contagem crescente
10. **Counter Down** - Contagem decrescente

### 🔴 Avançados
11. **Traffic Light** - Semáforo automático
12. **Batch Automatic** - Processo batch completo

---

## 🔧 Troubleshooting

### ❌ **Deploy falhou**

**Problema:** O workflow falha no GitHub Actions

**Solução:**
1. Verifique os logs em Actions
2. Certifique-se que `package-lock.json` existe
3. Rode `npm install` localmente e commit o lock file

### ❌ **Página 404**

**Problema:** Ao acessar a URL, aparece 404

**Solução:**
1. Verifique se o deploy terminou com sucesso
2. Verifique se GitHub Pages está configurado para "GitHub Actions"
3. Aguarde alguns minutos (pode demorar para propagar)
4. Verifique se o `base` path no `vite.config.ts` está correto

### ❌ **Recursos não carregam (CSS, JS quebrado)**

**Problema:** Site carrega mas sem estilos/funcionalidades

**Solução:**
1. O `base` path está errado no `vite.config.ts`
2. Deve ser `/nome-do-repo/` com barras no início e fim
3. Edite, commit e push novamente

### ❌ **Exemplos não carregam**

**Problema:** Menu Examples aparece vazio

**Solução:**
1. Verifique se a pasta `public/examples/` foi commitada
2. Rode o build localmente: `npm run build`
3. Verifique se os arquivos estão em `dist/examples/`
4. Certifique-se que o `index.json` está correto

---

## 🆕 Deploys Futuros

Depois da configuração inicial, **deploys automáticos acontecem sempre que você fizer push para main:**

```bash
# Faça suas mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Deploy automático acontece! 🎉
```

Você pode acompanhar o progresso na aba **Actions** do GitHub.

---

## 🎨 Customização

### **Mudar o Nome/URL**

Se quiser um domínio customizado:

1. Compre um domínio (ex: `meu-plc-simulator.com`)
2. No GitHub Settings > Pages:
   - Configure "Custom domain"
3. Atualize o `vite.config.ts`:
   ```typescript
   base: process.env.GITHUB_PAGES === 'true' ? '/' : '/',
   ```

### **Deploy em Outro Serviço**

O build gerado em `dist/` é compatível com:
- ✅ GitHub Pages
- ✅ Netlify
- ✅ Vercel
- ✅ Cloudflare Pages
- ✅ Qualquer hosting estático

Basta fazer upload da pasta `dist/` após rodar `npm run build`.

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs do GitHub Actions
2. Veja o console do navegador (F12)
3. Teste localmente primeiro: `npm run dev`
4. Compare com o build: `npm run build && npm run preview`

---

## ✅ Checklist Final

Antes de fazer o deploy:

- [ ] Testei localmente com `npm run dev`
- [ ] Build funciona: `npm run build`
- [ ] Todos os exemplos funcionam
- [ ] Base path está correto no `vite.config.ts`
- [ ] GitHub Pages está configurado para "GitHub Actions"
- [ ] Fiz push para a branch `main`
- [ ] Aguardei o workflow terminar (Actions tab)
- [ ] Acessei a URL e testei o site

---

🎉 **Pronto! Seu PLC Simulator está online!**

Compartilhe a URL com seus usuários:
```
https://SEU-USUARIO.github.io/Simulador_Clp/
```
