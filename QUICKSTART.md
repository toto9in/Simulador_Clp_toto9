# Guia Rápido - Simulador CLP

## Início Rápido com Scripts Automatizados

Scripts que instalam automaticamente todas as dependências e compilam o projeto:

### Linux / macOS
```bash
# Dar permissão de execução (apenas primeira vez)
chmod +x setup.sh

# Instalar dependências e compilar
./setup.sh

# Executar o projeto
./setup.sh run
```

### Windows (PowerShell)
```powershell
# Executar como Administrador (clique direito > Executar como Administrador)

# Instalar dependências e compilar
.\setup.ps1

# Executar o projeto
.\setup.ps1 -Run
```

**Comandos disponíveis:**
- `./setup.sh` ou `.\setup.ps1` - Instala e compila tudo
- `./setup.sh run` ou `.\setup.ps1 -Run` - Executa o projeto
- `./setup.sh build` ou `.\setup.ps1 -Build` - Apenas compila
- `./setup.sh clean` ou `.\setup.ps1 -Clean` - Limpa arquivos compilados
- `./setup.sh help` ou `.\setup.ps1 -Help` - Exibe ajuda

Os scripts instalam automaticamente:
- Java JDK (se não estiver instalado)
- Apache Ant (se não estiver instalado)
- Compilam o projeto
- Permitem executar com um único comando

**Nota:** No Windows, pode ser necessário executar como Administrador para instalar as dependências.

---

## Usando Gradle (Recomendado)

O projeto agora suporta **Gradle** como sistema de build moderno, além do Apache Ant tradicional.

### Vantagens do Gradle:
- ✅ Não precisa instalar Gradle (usa wrapper incluído)
- ✅ Dependências baixadas automaticamente do Maven Central
- ✅ Comandos mais simples e intuitivos
- ✅ Melhor suporte em IDEs modernas

### Comandos Gradle:

**Linux / macOS:**
```bash
# Compilar o projeto
./gradlew build

# Executar o projeto
./gradlew run

# Criar JAR em dist/ (compatível com Ant)
./gradlew dist

# Limpar arquivos compilados
./gradlew clean
```

**Windows:**
```powershell
# Compilar o projeto
.\gradlew.bat build

# Executar o projeto
.\gradlew.bat run

# Criar JAR em dist/ (compatível com Ant)
.\gradlew.bat dist

# Limpar arquivos compilados
.\gradlew.bat clean
```

### Requisitos:
- **Java JDK 17 ou superior** (o código usa recursos modernos do Java)

### Estrutura de saída:
- `build/libs/SimuladorClp-1.0.1.jar` - JAR gerado pelo Gradle
- `dist/SimuladorClp.jar` - JAR copiado para dist/ (ao usar `./gradlew dist`)

---

## Instalação Manual com Apache Ant

Se preferir instalar manualmente sem usar os scripts:

## Requisitos do Sistema

### Java
- **JDK 17 ou superior** (o projeto usa recursos modernos do Java como switch expressions e text blocks)
- Testado com Java 23
- Para verificar a versão instalada:
  ```bash
  java -version
  ```

### Apache Ant
- Necessário para compilar e gerar o build do projeto
- Para verificar se está instalado:
  ```bash
  ant -version
  ```

## Como Compilar o Projeto

### 1. Compilar o código fonte
```bash
ant compile
```
Este comando compila todos os arquivos `.java` do diretório `src/` e coloca os `.class` em `build/`.

### 2. Gerar o arquivo JAR executável
```bash
ant jar
```
Este comando:
- Compila o código (se necessário)
- Copia recursos não-Java para o build
- Gera o arquivo `dist/SimuladorClp.jar`
- Copia a dependência `AbsoluteLayout.jar` para `dist/`

### 3. Limpar arquivos compilados (opcional)
```bash
ant clean
```
Remove os diretórios `build/` e `dist/`.

## Como Executar o Projeto

### Opção 1: Executar via JAR (Recomendado)
```bash
java -jar dist/SimuladorClp.jar
```

### Opção 2: Executar via classe principal
```bash
java -cp build:lib/* SimuladorClp
```

> **Nota:** No Windows, use `;` ao invés de `:` no classpath:
> ```bash
> java -cp build;lib/* SimuladorClp
> ```

## Estrutura do Projeto

```
SimuladorClp/
├── src/                    # Código fonte Java
│   ├── SimuladorClp.java  # Classe principal (entry point)
│   ├── Controllers/        # Controladores MVC
│   ├── Models/            # Modelos de dados
│   ├── screens/           # Interfaces gráficas
│   ├── ilcompiler/        # Interpretador de Instruction List
│   └── save/              # Funcionalidade de salvar/carregar
├── lib/                    # Bibliotecas externas (apenas para Ant)
│   └── AbsoluteLayout.jar # Dependência para layout GUI
├── gradle/                 # Gradle Wrapper
│   └── wrapper/
├── build/                  # Arquivos compilados (.class)
├── dist/                   # Arquivos de distribuição (.jar)
├── build.gradle           # Script de build do Gradle (novo!)
├── settings.gradle        # Configurações do Gradle (novo!)
├── gradlew / gradlew.bat  # Scripts Gradle Wrapper (novo!)
├── build.xml              # Script de build do Ant (mantido)
└── build.properties       # Propriedades do projeto
```

## Comparação: Comandos Gradle vs Ant

| Tarefa                | Gradle                  | Ant             |
|-----------------------|-------------------------|-----------------|
| Limpar build          | `./gradlew clean`       | `ant clean`     |
| Compilar código       | `./gradlew compileJava` | `ant compile`   |
| Gerar JAR             | `./gradlew jar`         | `ant jar`       |
| Build completo        | `./gradlew build`       | `ant jar`       |
| Executar aplicação    | `./gradlew run`         | *(não disponível)* |
| Criar JAR em dist/    | `./gradlew dist`        | `ant jar`       |

### Comandos Ant Disponíveis (Legado)

| Comando       | Descrição                                    |
|---------------|----------------------------------------------|
| `ant clean`   | Remove diretórios build/ e dist/            |
| `ant compile` | Compila o código fonte                       |
| `ant jar`     | Compila e gera o JAR executável (padrão)     |

## Solução de Problemas

### Gradle

#### Erro de versão do Java (Gradle)
Se você receber erros sobre "switch expressions", "text blocks" ou recursos não suportados:
```
switch expressions are not supported in -source 8
```
**Solução:** Certifique-se de ter Java 17 ou superior instalado.

#### Gradle não compila o código
**Solução:** O Gradle Wrapper baixa automaticamente o Gradle na primeira execução. Aguarde o download completar.

#### Erro de permissão no gradlew (Linux/macOS)
```bash
chmod +x gradlew
```

### Apache Ant

#### Erro: "ant: command not found"
Instale o Apache Ant:
- **macOS**: `brew install ant`
- **Ubuntu/Debian**: `sudo apt-get install ant`
- **Windows**: Baixe em https://ant.apache.org/

### Geral

#### Erro: "java: command not found"
Instale o Java JDK 17+:
- **macOS**: `brew install openjdk@17`
- **Ubuntu/Debian**: `sudo apt-get install openjdk-17-jdk`
- **Windows**: Baixe em https://adoptium.net/

#### Erro ao executar o JAR
Certifique-se de que:
1. Você tem Java 17+ instalado (`java -version`)
2. O arquivo JAR existe no diretório esperado
3. Você está executando o comando do diretório raiz do projeto

## Informações Adicionais

- **Versão do Projeto:** 1.0.1
- **Classe Principal:** `SimuladorClp`
- **Java Mínimo:** Java 17 (usa switch expressions, text blocks e var)
- **Dependências:**
  - AbsoluteLayout (NetBeans) - baixada automaticamente pelo Gradle do Maven Central
  - `lib/AbsoluteLayout.jar` - incluída localmente para build com Ant

### Sistemas de Build Disponíveis:
1. **Gradle** (Recomendado) - Moderno, sem instalação necessária, dependências automáticas
2. **Apache Ant** (Legado) - Mantido para compatibilidade com versões anteriores

Para mais informações sobre o projeto, consulte o [README.md](./README.md).
