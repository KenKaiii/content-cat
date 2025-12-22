#!/usr/bin/env bash
#
# Content Cat - Beautiful One-Line Installer
# curl -fsSL https://raw.githubusercontent.com/KenKaiii/content-cat/main/scripts/install.sh | bash
#

set -e

# ══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

REPO_URL="https://github.com/KenKaiii/content-cat"
INSTALL_DIR="$HOME/content-cat"
NODE_VERSION="20"

# ══════════════════════════════════════════════════════════════════════════════
# COLORS
# ══════════════════════════════════════════════════════════════════════════════

BOLD='\033[1m'
DIM='\033[2m'
ITALIC='\033[3m'
RESET='\033[0m'

# Colors
BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'

# Bright colors
BR_BLACK='\033[0;90m'
BR_RED='\033[0;91m'
BR_GREEN='\033[0;92m'
BR_YELLOW='\033[0;93m'
BR_BLUE='\033[0;94m'
BR_MAGENTA='\033[0;95m'
BR_CYAN='\033[0;96m'
BR_WHITE='\033[0;97m'

# ══════════════════════════════════════════════════════════════════════════════
# UTILITIES
# ══════════════════════════════════════════════════════════════════════════════

CURRENT_STEP=0
TOTAL_STEPS=6

command_exists() {
    command -v "$1" &>/dev/null
}

# Hide/show cursor
hide_cursor() { tput civis 2>/dev/null || true; }
show_cursor() { tput cnorm 2>/dev/null || true; }

# Ensure cursor is shown on exit
trap 'show_cursor; echo' EXIT INT TERM

# Clear current line
clear_line() {
    printf "\r\033[K"
}

# ══════════════════════════════════════════════════════════════════════════════
# SPINNER
# ══════════════════════════════════════════════════════════════════════════════

spinner() {
    local pid=$1
    local message=$2
    local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0

    hide_cursor
    while kill -0 "$pid" 2>/dev/null; do
        printf "\r    ${BR_CYAN}%s${RESET} ${DIM}%s${RESET}" "${spin:i++%10:1}" "$message"
        sleep 0.08
    done
    clear_line
    show_cursor
}

# Run command with spinner
run_step() {
    local message=$1
    shift

    # Run command in background
    ("$@") &>/dev/null &
    local pid=$!

    spinner $pid "$message"
    wait $pid
    local status=$?

    if [[ $status -eq 0 ]]; then
        printf "\r    ${BR_GREEN}✓${RESET} %s\n" "$message"
    else
        printf "\r    ${BR_RED}✗${RESET} %s\n" "$message"
        return $status
    fi
}

# Print step header
step() {
    ((CURRENT_STEP++))
    echo ""
    printf "  ${BOLD}${WHITE}[%d/%d]${RESET} ${BOLD}%s${RESET}\n" "$CURRENT_STEP" "$TOTAL_STEPS" "$1"
    echo ""
}

# Simple status messages
ok() { printf "    ${BR_GREEN}✓${RESET} %s\n" "$1"; }
info() { printf "    ${BR_BLUE}→${RESET} ${DIM}%s${RESET}\n" "$1"; }
warn() { printf "    ${BR_YELLOW}!${RESET} %s\n" "$1"; }
fail() { printf "    ${BR_RED}✗${RESET} %s\n" "$1"; }

# ══════════════════════════════════════════════════════════════════════════════
# BANNER
# ══════════════════════════════════════════════════════════════════════════════

print_banner() {
    clear
    echo ""
    echo ""
    printf "${BR_MAGENTA}"
    cat << 'EOF'
       ██████╗ ██████╗ ███╗   ██╗████████╗███████╗███╗   ██╗████████╗
      ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝████╗  ██║╚══██╔══╝
      ██║     ██║   ██║██╔██╗ ██║   ██║   █████╗  ██╔██╗ ██║   ██║
      ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██║╚██╗██║   ██║
      ╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██║ ╚████║   ██║
       ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝   ╚═╝
EOF
    printf "${RESET}"
    printf "${BR_CYAN}"
    cat << 'EOF'
                             ██████╗ █████╗ ████████╗
                            ██╔════╝██╔══██╗╚══██╔══╝
                            ██║     ███████║   ██║
                            ██║     ██╔══██║   ██║
                            ╚██████╗██║  ██║   ██║
                             ╚═════╝╚═╝  ╚═╝   ╚═╝
EOF
    printf "${RESET}"
    echo ""
    printf "  ${DIM}AI-powered image and video generation platform${RESET}\n"
    printf "  ${DIM}By${RESET} ${BR_WHITE}Ken Kai${RESET}\n"
    echo ""
    printf "  ${BR_BLACK}─────────────────────────────────────────────────────────────────${RESET}\n"
    echo ""
}

# ══════════════════════════════════════════════════════════════════════════════
# OS DETECTION
# ══════════════════════════════════════════════════════════════════════════════

detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PACKAGE_MANAGER="brew"
    elif [[ -f /proc/version ]] && grep -qi microsoft /proc/version; then
        OS="wsl"
        PACKAGE_MANAGER="apt"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if command_exists apt-get; then
            PACKAGE_MANAGER="apt"
        elif command_exists dnf; then
            PACKAGE_MANAGER="dnf"
        elif command_exists pacman; then
            PACKAGE_MANAGER="pacman"
        else
            PACKAGE_MANAGER="apt"
        fi
    else
        fail "Unsupported operating system"
        exit 1
    fi
}

# ══════════════════════════════════════════════════════════════════════════════
# INSTALLERS
# ══════════════════════════════════════════════════════════════════════════════

install_homebrew() {
    if command_exists brew; then
        ok "Homebrew"
        return 0
    fi

    run_step "Homebrew" /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add to PATH
    if [[ -f /opt/homebrew/bin/brew ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [[ -f /usr/local/bin/brew ]]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
}

install_git() {
    if command_exists git; then
        ok "Git"
        return 0
    fi

    case $PACKAGE_MANAGER in
        brew) run_step "Git" brew install git ;;
        apt) run_step "Git" bash -c "sudo apt-get update && sudo apt-get install -y git" ;;
        dnf) run_step "Git" sudo dnf install -y git ;;
        pacman) run_step "Git" sudo pacman -S --noconfirm git ;;
    esac
}

install_node() {
    if command_exists node; then
        local ver=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$ver" -ge "$NODE_VERSION" ]]; then
            ok "Node.js v$(node --version | cut -d'v' -f2)"
            return 0
        fi
    fi

    # Install nvm and node
    run_step "Node.js v$NODE_VERSION" bash -c '
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install '"$NODE_VERSION"'
        nvm alias default '"$NODE_VERSION"'
    '

    # Load nvm for this session
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
}

install_pnpm() {
    if command_exists pnpm; then
        ok "pnpm"
        return 0
    fi

    run_step "pnpm" bash -c '
        if command -v corepack &>/dev/null; then
            corepack enable
            corepack prepare pnpm@latest --activate
        else
            npm install -g pnpm
        fi
    '
}

install_ffmpeg() {
    if command_exists ffmpeg; then
        ok "FFmpeg"
        return 0
    fi

    case $PACKAGE_MANAGER in
        brew) run_step "FFmpeg" brew install ffmpeg ;;
        apt) run_step "FFmpeg" bash -c "sudo apt-get update && sudo apt-get install -y ffmpeg" ;;
        dnf) run_step "FFmpeg" bash -c "sudo dnf install -y https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-\$(rpm -E %fedora).noarch.rpm 2>/dev/null; sudo dnf install -y ffmpeg" ;;
        pacman) run_step "FFmpeg" sudo pacman -S --noconfirm ffmpeg ;;
    esac
}

install_docker() {
    if command_exists docker; then
        ok "Docker"
        return 0
    fi

    case $OS in
        macos)
            run_step "Docker Desktop" brew install --cask docker
            warn "Open Docker Desktop to complete setup"
            ;;
        wsl|linux)
            run_step "Docker" bash -c '
                sudo apt-get update
                sudo apt-get install -y ca-certificates curl gnupg
                sudo install -m 0755 -d /etc/apt/keyrings
                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
                sudo apt-get update
                sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
                sudo usermod -aG docker $USER
            '
            warn "Log out and back in for Docker permissions"
            ;;
    esac
}

# ══════════════════════════════════════════════════════════════════════════════
# PROJECT SETUP
# ══════════════════════════════════════════════════════════════════════════════

clone_repo() {
    if [[ -d "$INSTALL_DIR" ]]; then
        if [[ -f "$INSTALL_DIR/package.json" ]] && grep -q '"name": "content-cat"' "$INSTALL_DIR/package.json" 2>/dev/null; then
            ok "Repository exists"
            cd "$INSTALL_DIR"
            return 0
        fi
        rm -rf "$INSTALL_DIR"
    fi

    run_step "Downloading Content Cat" git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
}

install_deps() {
    cd "$INSTALL_DIR"
    run_step "Installing dependencies" pnpm install --frozen-lockfile
}

setup_env() {
    cd "$INSTALL_DIR"

    if [[ -f ".env" ]]; then
        ok "Environment configured"
        return 0
    fi

    local session_secret=$(openssl rand -hex 32)
    local cron_secret=$(openssl rand -hex 16)
    local encryption_key=$(openssl rand -hex 32)

    cat > .env << EOF
DATABASE_URL="postgresql://contentcat:contentcat@localhost:5499/contentcat?schema=public"
NODE_ENV="development"
SESSION_SECRET="${session_secret}"
SESSION_EXPIRY_DAYS=7
REDIS_URL="redis://localhost:6379"
CRON_SECRET="${cron_secret}"
ENCRYPTION_KEY="${encryption_key}"
# FAL_KEY="your-fal-api-key"
EOF

    ok "Environment configured"
}

setup_database() {
    cd "$INSTALL_DIR"

    # Check if Docker is running
    if ! docker info &>/dev/null 2>&1; then
        if [[ "$OS" == "macos" ]]; then
            info "Starting Docker Desktop..."
            open -a Docker 2>/dev/null || true

            local count=0
            hide_cursor
            while ! docker info &>/dev/null 2>&1; do
                printf "\r    ${BR_CYAN}⠋${RESET} ${DIM}Waiting for Docker...${RESET}"
                sleep 2
                ((count++))
                if [[ $count -gt 30 ]]; then
                    clear_line
                    show_cursor
                    warn "Docker not ready - run 'content-cat' later"
                    return 0
                fi
            done
            clear_line
            show_cursor
        else
            sudo systemctl start docker 2>/dev/null || true
            sleep 2
        fi
    fi

    # Start containers
    if docker info &>/dev/null 2>&1; then
        run_step "Starting database" bash -c "cd '$INSTALL_DIR' && docker compose up -d postgres redis 2>/dev/null"

        # Wait for healthy
        info "Waiting for database..."
        local count=0
        while ! docker exec content-cat-db pg_isready -U contentcat &>/dev/null 2>&1; do
            sleep 1
            ((count++))
            [[ $count -gt 30 ]] && break
        done
        sleep 2

        run_step "Setting up schema" pnpm prisma db push --skip-generate
    else
        warn "Docker unavailable - run 'content-cat' to complete"
    fi
}

install_command() {
    cd "$INSTALL_DIR"
    chmod +x scripts/content-cat

    if [[ -w /usr/local/bin ]]; then
        cp scripts/content-cat /usr/local/bin/content-cat
    else
        sudo cp scripts/content-cat /usr/local/bin/content-cat
    fi

    ok "Installed 'content-cat' command"
}

# ══════════════════════════════════════════════════════════════════════════════
# COMPLETION
# ══════════════════════════════════════════════════════════════════════════════

print_success() {
    echo ""
    printf "  ${BR_BLACK}─────────────────────────────────────────────────────────────────${RESET}\n"
    echo ""
    printf "  ${BR_GREEN}${BOLD}Installation complete!${RESET} 🎉\n"
    echo ""
    printf "  ${BOLD}To start Content Cat:${RESET}\n"
    echo ""
    printf "      ${BR_CYAN}content-cat${RESET}\n"
    echo ""
    printf "  ${DIM}This will open${RESET} ${BR_WHITE}http://localhost:3000${RESET}\n"
    echo ""
    printf "  ${BR_BLACK}─────────────────────────────────────────────────────────────────${RESET}\n"
    echo ""
    printf "  ${DIM}Get your FAL.ai API key:${RESET} ${BR_BLUE}https://fal.ai/dashboard/keys${RESET}\n"
    echo ""
    echo ""
}

# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

main() {
    print_banner
    detect_os

    # Step 1: System tools
    step "Checking system tools"

    if [[ "$OS" == "macos" ]]; then
        install_homebrew
    fi
    install_git

    # Step 2: Node.js
    step "Setting up Node.js"
    install_node
    install_pnpm

    # Step 3: Media tools
    step "Installing media tools"
    install_ffmpeg

    # Step 4: Docker
    step "Setting up Docker"
    install_docker

    # Step 5: Project
    step "Installing Content Cat"
    clone_repo
    install_deps
    setup_env

    # Step 6: Database
    step "Configuring database"

    # Generate Prisma client first
    cd "$INSTALL_DIR"
    run_step "Generating database client" pnpm prisma generate

    setup_database
    install_command

    print_success
}

main "$@"
