# Script de Inicialização Rápida - Simulador CLP (Windows PowerShell)
# Detecta, instala dependências e executa o projeto

param(
    [switch]$Run,
    [switch]$Build,
    [switch]$Clean,
    [switch]$Help
)

# Cores para output
$script:ErrorColor = "Red"
$script:SuccessColor = "Green"
$script:WarningColor = "Yellow"
$script:InfoColor = "Cyan"

# Funções de utilidade
function Print-Success {
    param([string]$Message)
    Write-Host "✓ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ " -ForegroundColor Cyan -NoNewline
    Write-Host $Message
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Print-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "=== " -ForegroundColor Cyan -NoNewline
    Write-Host $Message -NoNewline
    Write-Host " ===" -ForegroundColor Cyan
    Write-Host ""
}

# Verificar se está executando como administrador
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Verificar se o comando existe
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Verificar e instalar winget se necessário
function Install-Winget {
    if (Test-Command "winget") {
        return $true
    }

    Print-Warning "winget não encontrado. Tentando instalar..."

    try {
        # Baixar e instalar App Installer (que inclui winget)
        $progressPreference = 'silentlyContinue'
        Invoke-WebRequest -Uri "https://aka.ms/getwinget" -OutFile "$env:TEMP\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle"
        Add-AppxPackage "$env:TEMP\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe.msixbundle"
        Print-Success "winget instalado com sucesso"
        return $true
    } catch {
        Print-Error "Não foi possível instalar winget automaticamente"
        Print-Info "Por favor, instale o App Installer da Microsoft Store"
        return $false
    }
}

# Verificar e instalar Java
function Install-Java {
    Print-Header "Verificando Java"

    if (Test-Command "java") {
        $javaVersion = java -version 2>&1 | Select-String "version" | ForEach-Object { $_ -replace '.*"(.+)".*', '$1' }
        Print-Success "Java já instalado (versão $javaVersion)"
        return
    }

    Print-Warning "Java não encontrado. Instalando..."

    if (-not (Install-Winget)) {
        Print-Error "winget é necessário para instalação automática"
        Print-Info "Baixe Java em: https://adoptium.net/"
        exit 1
    }

    try {
        Print-Info "Instalando OpenJDK via winget..."
        winget install --id EclipseAdoptium.Temurin.21.JDK --silent --accept-source-agreements --accept-package-agreements

        # Atualizar variável de ambiente PATH na sessão atual
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        Print-Success "Java instalado com sucesso"
        Print-Warning "Pode ser necessário reiniciar o PowerShell para usar o Java"
    } catch {
        Print-Error "Erro ao instalar Java: $_"
        Print-Info "Tente instalar manualmente em: https://adoptium.net/"
        exit 1
    }
}

# Verificar e instalar Apache Ant
function Install-Ant {
    Print-Header "Verificando Apache Ant"

    if (Test-Command "ant") {
        $antVersion = ant -version 2>&1 | Select-String "Apache Ant"
        Print-Success "Apache Ant já instalado ($antVersion)"
        return
    }

    Print-Warning "Apache Ant não encontrado. Instalando..."

    if (-not (Install-Winget)) {
        Print-Error "winget é necessário para instalação automática"
        Print-Info "Baixe Ant em: https://ant.apache.org/"
        exit 1
    }

    try {
        Print-Info "Instalando Apache Ant via winget..."
        winget install --id Apache.Ant --silent --accept-source-agreements --accept-package-agreements

        # Atualizar variável de ambiente PATH na sessão atual
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        Print-Success "Apache Ant instalado com sucesso"
        Print-Warning "Pode ser necessário reiniciar o PowerShell para usar o Ant"
    } catch {
        Print-Error "Erro ao instalar Ant: $_"
        Print-Info "Tente instalar manualmente em: https://ant.apache.org/"
        exit 1
    }
}

# Compilar o projeto
function Build-Project {
    Print-Header "Compilando o Projeto"

    if (-not (Test-Path "build.xml")) {
        Print-Error "Arquivo build.xml não encontrado. Execute este script do diretório raiz do projeto."
        exit 1
    }

    Print-Info "Executando: ant jar"
    ant jar

    if ($LASTEXITCODE -eq 0) {
        Print-Success "Projeto compilado com sucesso!"
    } else {
        Print-Error "Erro ao compilar o projeto"
        exit 1
    }
}

# Executar o projeto
function Run-Project {
    Print-Header "Executando Simulador CLP"

    if (-not (Test-Path "dist\SimuladorClp.jar")) {
        Print-Error "Arquivo dist\SimuladorClp.jar não encontrado."
        Print-Info "Execute primeiro: .\setup.ps1 (sem parâmetros) para compilar"
        exit 1
    }

    Print-Info "Iniciando aplicação..."
    java -jar dist\SimuladorClp.jar
}

# Exibir ajuda
function Show-Help {
    Write-Host "Script de Inicialização Rápida - Simulador CLP (Windows)"
    Write-Host ""
    Write-Host "Uso:"
    Write-Host "  .\setup.ps1           - Instala dependências e compila o projeto"
    Write-Host "  .\setup.ps1 -Run      - Executa o projeto (após compilação)"
    Write-Host "  .\setup.ps1 -Build    - Apenas compila o projeto"
    Write-Host "  .\setup.ps1 -Clean    - Limpa arquivos compilados"
    Write-Host "  .\setup.ps1 -Help     - Exibe esta ajuda"
    Write-Host ""
    Write-Host "Nota: Pode ser necessário executar como Administrador para instalar dependências"
    Write-Host ""
}

# Limpar build
function Clean-Project {
    Print-Header "Limpando Arquivos Compilados"

    if (Test-Path "build.xml") {
        ant clean
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Arquivos compilados removidos"
        }
    } else {
        Print-Error "Arquivo build.xml não encontrado"
        exit 1
    }
}

# Função principal
function Main {
    Clear-Host
    Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   Simulador CLP - Setup Automático       ║" -ForegroundColor Cyan
    Write-Host "║              (Windows)                    ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    # Processar parâmetros
    if ($Help) {
        Show-Help
        exit 0
    }

    if ($Run) {
        Run-Project
        exit 0
    }

    if ($Build) {
        Build-Project
        exit 0
    }

    if ($Clean) {
        Clean-Project
        exit 0
    }

    # Verificar se está executando como administrador
    if (-not (Test-Administrator)) {
        Print-Warning "Executando sem privilégios de administrador"
        Print-Info "Algumas instalações podem falhar. Considere executar como Administrador."
        Write-Host ""
        $response = Read-Host "Deseja continuar? (S/N)"
        if ($response -notlike "S*" -and $response -notlike "Y*") {
            exit 0
        }
    }

    # Instalação completa
    Install-Java
    Install-Ant
    Build-Project

    Print-Header "Instalação Concluída!"
    Print-Success "Todas as dependências instaladas e projeto compilado"
    Write-Host ""
    Print-Info "Para executar o projeto, use:"
    Write-Host "  .\setup.ps1 -Run" -ForegroundColor Green
    Write-Host ""
    Print-Warning "Se os comandos java ou ant não funcionarem, reinicie o PowerShell"
    Write-Host ""
}

# Executar script
Main
