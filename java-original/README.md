# 🤖 Simulador PLC - Versão Original (Java Swing)

Esta é a versão original do simulador PLC, desenvolvida em Java com interface Swing.

## 📁 Estrutura

```
java-original/
├── src/              # Código fonte Java
├── build/            # Arquivos de build
├── dist/             # Distribuíveis
├── lib/              # Bibliotecas externas
├── nbproject/        # Configuração NetBeans
├── gradle/           # Gradle wrapper
├── examples/         # Exemplos de programas IL
├── public/           # Assets públicos
├── docs/             # Documentação específica do Java
├── build.gradle      # Configuração Gradle
├── build.xml         # Configuração Ant
└── setup.sh/ps1      # Scripts de setup
```

## 🚀 Como Executar

### Opção 1: Gradle (Recomendado)

```bash
./gradlew run
```

### Opção 2: NetBeans

1. Abra o projeto no NetBeans
2. Clique em "Run Project" (F6)

### Opção 3: Compilar e Executar Manualmente

```bash
# Build
./gradlew build

# Run JAR
java -jar dist/SimuladorCLP.jar
```

## 📋 Requisitos

- Java JDK 8 ou superior
- Gradle (incluído via wrapper)
- NetBeans (opcional)

## 🔧 Build

```bash
# Build do projeto
./gradlew build

# Limpar build
./gradlew clean

# Criar JAR distribuível
./gradlew jar
```

## 📖 Documentação

Veja a pasta `docs/` para documentação técnica e arquitetural do projeto Java.

## ⚠️ Status

Esta versão é mantida para referência e compatibilidade. Para novos desenvolvimentos, recomendamos usar a **versão web moderna** em `../webConversion/`.

## 🔗 Links Úteis

- [Versão Web Moderna](../webConversion/)
- [Documentação Completa](../docs/)
- [README Principal](../README.md)
