#!/bin/bash

# Script de Inicialização Rápida - Simulador CLP
# Detecta, instala dependências e executa o projeto

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de utilidade
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}===${NC} $1 ${BLUE}===${NC}\n"
}

# Detectar sistema operacional
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_info "Sistema operacional detectado: Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_info "Sistema operacional detectado: macOS"
    else
        print_error "Sistema operacional não suportado: $OSTYPE"
        exit 1
    fi
}

# Verificar se o comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar e instalar Java
check_install_java() {
    print_header "Verificando Java"

    if command_exists java; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
        print_success "Java já instalado (versão $JAVA_VERSION)"
        return 0
    fi

    print_warning "Java não encontrado. Instalando..."

    if [ "$OS" == "macos" ]; then
        if ! command_exists brew; then
            print_error "Homebrew não encontrado. Instale em: https://brew.sh"
            exit 1
        fi
        brew install openjdk
        print_success "Java instalado via Homebrew"
    elif [ "$OS" == "linux" ]; then
        if command_exists apt-get; then
            sudo apt-get update
            sudo apt-get install -y default-jdk
            print_success "Java instalado via apt-get"
        elif command_exists yum; then
            sudo yum install -y java-11-openjdk-devel
            print_success "Java instalado via yum"
        elif command_exists dnf; then
            sudo dnf install -y java-11-openjdk-devel
            print_success "Java instalado via dnf"
        else
            print_error "Gerenciador de pacotes não suportado. Instale Java manualmente."
            exit 1
        fi
    fi
}

# Verificar e instalar Apache Ant
check_install_ant() {
    print_header "Verificando Apache Ant"

    if command_exists ant; then
        ANT_VERSION=$(ant -version 2>&1 | head -n 1)
        print_success "Apache Ant já instalado ($ANT_VERSION)"
        return 0
    fi

    print_warning "Apache Ant não encontrado. Instalando..."

    if [ "$OS" == "macos" ]; then
        brew install ant
        print_success "Apache Ant instalado via Homebrew"
    elif [ "$OS" == "linux" ]; then
        if command_exists apt-get; then
            sudo apt-get install -y ant
            print_success "Apache Ant instalado via apt-get"
        elif command_exists yum; then
            sudo yum install -y ant
            print_success "Apache Ant instalado via yum"
        elif command_exists dnf; then
            sudo dnf install -y ant
            print_success "Apache Ant instalado via dnf"
        else
            print_error "Gerenciador de pacotes não suportado. Instale Ant manualmente."
            exit 1
        fi
    fi
}

# Compilar o projeto
build_project() {
    print_header "Compilando o Projeto"

    if [ ! -f "build.xml" ]; then
        print_error "Arquivo build.xml não encontrado. Execute este script do diretório raiz do projeto."
        exit 1
    fi

    print_info "Executando: ant jar"
    ant jar
    print_success "Projeto compilado com sucesso!"
}

# Executar o projeto
run_project() {
    print_header "Executando Simulador CLP"

    if [ ! -f "dist/SimuladorClp.jar" ]; then
        print_error "Arquivo dist/SimuladorClp.jar não encontrado."
        print_info "Execute primeiro: ./setup.sh (sem argumentos) para compilar"
        exit 1
    fi

    print_info "Iniciando aplicação..."
    java -jar dist/SimuladorClp.jar
}

# Exibir ajuda
show_help() {
    echo "Script de Inicialização Rápida - Simulador CLP"
    echo ""
    echo "Uso:"
    echo "  ./setup.sh          - Instala dependências e compila o projeto"
    echo "  ./setup.sh run      - Executa o projeto (após compilação)"
    echo "  ./setup.sh build    - Apenas compila o projeto"
    echo "  ./setup.sh clean    - Limpa arquivos compilados"
    echo "  ./setup.sh help     - Exibe esta ajuda"
    echo ""
}

# Limpar build
clean_project() {
    print_header "Limpando Arquivos Compilados"

    if [ -f "build.xml" ]; then
        ant clean
        print_success "Arquivos compilados removidos"
    else
        print_error "Arquivo build.xml não encontrado"
        exit 1
    fi
}

# Função principal
main() {
    clear
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║   Simulador CLP - Setup Automático       ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"

    # Processar argumentos
    case "${1:-}" in
        run)
            run_project
            exit 0
            ;;
        build)
            detect_os
            build_project
            exit 0
            ;;
        clean)
            clean_project
            exit 0
            ;;
        help|--help|-h)
            show_help
            exit 0
            ;;
        "")
            # Continua com instalação completa
            ;;
        *)
            print_error "Argumento inválido: $1"
            show_help
            exit 1
            ;;
    esac

    # Instalação completa
    detect_os
    check_install_java
    check_install_ant
    build_project

    print_header "Instalação Concluída!"
    print_success "Todas as dependências instaladas e projeto compilado"
    echo ""
    print_info "Para executar o projeto, use:"
    echo -e "  ${GREEN}./setup.sh run${NC}"
    echo ""
}

# Executar script
main "$@"
