# 🚀 Guia de Releases - Simulador de CLP

Este guia explica como criar e publicar releases automáticas do Simulador de CLP usando GitHub Actions.

## 📋 Visão Geral

O projeto está configurado para criar releases automaticamente quando você cria uma tag de versão. O GitHub Actions vai:

1. ✅ Buildar automaticamente para **Windows** (x64 e x86)
2. ✅ Criar uma **GitHub Release** com os arquivos
3. ✅ Gerar **changelog automático**
4. ✅ Disponibilizar os instaladores para download

> 💡 **Nota:** Atualmente apenas Windows está ativo. Builds para Linux e macOS podem ser ativados no futuro editando `.github/workflows/release.yml`.

## 🎯 Como Fazer uma Release

### Passo 1: Atualize a Versão no package.json

Edite o arquivo `webConversion/package.json` e atualize o número da versão:

```json
{
  "version": "1.0.0"  // Altere para a nova versão
}
```

### Passo 2: Commit as Mudanças

```bash
git add webConversion/package.json
git commit -m "chore: bump version to 1.0.0"
git push origin main
```

### Passo 3: Crie a Tag de Versão

```bash
# Crie a tag (DEVE começar com 'v')
git tag v1.0.0

# Ou crie com mensagem anotada (recomendado)
git tag -a v1.0.0 -m "Release v1.0.0 - Primeira release oficial"

# Push da tag para o GitHub
git push origin v1.0.0
```

### Passo 4: Aguarde o Build

O GitHub Actions vai automaticamente:
- Detectar a nova tag
- Iniciar o workflow de release
- Buildar para todas as plataformas (Windows, Linux, macOS)
- Criar a release no GitHub

Você pode acompanhar o progresso em: **Actions** → **Release Electron App**

⏱️ **Tempo estimado:** 15-20 minutos (builds em paralelo)

## 📦 Arquivos Gerados

Após o build, a release terá os seguintes arquivos:

### Windows
- `PLC-Simulator-Setup-{version}.exe` - Instalador NSIS para x64 e x86 (testado e funcional)

> 💡 **Builds para outras plataformas:** Linux e macOS podem ser adicionados futuramente caso necessário.

## 🔢 Versionamento Semântico

Recomendamos usar [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (ex: `1.2.3`)
  - **MAJOR**: Mudanças incompatíveis na API
  - **MINOR**: Nova funcionalidade (compatível com versões anteriores)
  - **PATCH**: Correções de bugs

Exemplos:
- `v1.0.0` - Primeira release estável
- `v1.1.0` - Adição de nova funcionalidade
- `v1.1.1` - Correção de bug
- `v2.0.0` - Mudanças significativas (breaking changes)

## 🏷️ Tags Especiais

### Pre-release (Beta/RC)

Para releases de teste:

```bash
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

### Release Candidate

```bash
git tag v1.0.0-rc.1
git push origin v1.0.0-rc.1
```

## 📝 Dicas e Boas Práticas

### ✅ Antes de Criar uma Release:

1. **Teste localmente:**
   ```bash
   cd webConversion
   npm run build
   npm run electron:dist
   ```

2. **Execute os testes:**
   ```bash
   npm test
   npm run test:e2e
   ```

3. **Verifique o linting:**
   ```bash
   npm run lint
   ```

4. **Teste o instalador** gerado em `webConversion/release/`

### ⚠️ Importante:

- ❌ **NÃO crie tags em branches de desenvolvimento** - Sempre crie tags na branch principal (main)
- ❌ **NÃO delete tags já publicadas** - Crie uma nova versão ao invés disso
- ✅ **Sempre teste antes de criar a tag** - Releases devem ser estáveis
- ✅ **Use mensagens descritivas** nas tags anotadas

## 🔧 Troubleshooting

### Build Falhou?

1. Verifique os logs em **Actions** → **Release Electron App**
2. Certifique-se que o `package.json` está correto
3. Verifique se todos os testes passam localmente

### Tag Errada?

Se você criou uma tag errada e **NÃO fez push ainda:**

```bash
# Deletar tag local
git tag -d v1.0.0
```

Se já fez push (⚠️ use com cuidado):

```bash
# Deletar tag remota
git push --delete origin v1.0.0

# Deletar release no GitHub (manualmente na interface)
```

### Atualizar uma Release Existente

Se precisar adicionar arquivos ou atualizar descrição:
1. Vá para **Releases** no GitHub
2. Clique em **Edit** na release
3. Faça as alterações necessárias

## 🎉 Após a Release

1. ✅ Verifique se todos os arquivos foram uploadados
2. ✅ Teste o download e instalação em cada plataforma
3. ✅ Atualize o README.md se necessário
4. ✅ Anuncie a nova versão!

## 📊 Monitoramento

Você pode ver estatísticas de downloads em:
- **Insights** → **Traffic** → **Downloads**
- Cada release mostra o número de downloads por arquivo

## 🔗 Links Úteis

- [Semantic Versioning](https://semver.org/)
- [Electron Builder Docs](https://www.electron.build/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Releases Guide](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**Dúvidas?** Abra uma issue no repositório!
