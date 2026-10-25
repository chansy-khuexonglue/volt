#!/usr/bin/env bash
# ==============================================================================
# Volt Framework - Git Status & Diagnostic Script
# ==============================================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}⚡ Volt Framework - Git Status Diagnostic${NC}\n"

# 1. Branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "detached / none")
echo -e "${BOLD}Current Branch:${NC} ${GREEN}$BRANCH${NC}"

# 2. Remote
REMOTE=$(git remote get-url origin 2>/dev/null || echo "None configured")
echo -e "${BOLD}Origin Remote:${NC}  ${BLUE}$REMOTE${NC}"

# 3. User info
GIT_USER=$(git config user.name || echo "Not set")
GIT_EMAIL=$(git config user.email || echo "Not set")
echo -e "${BOLD}Author Identity:${NC} $GIT_USER <$GIT_EMAIL>"

# 4. Status summary
echo -e "\n${BOLD}Working Tree Status:${NC}"
git status -s

# 5. Recent commits
echo -e "\n${BOLD}Recent Commits (last 5):${NC}"
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  git log -n 5 --oneline --graph --decorate
else
  echo -e "${YELLOW}(No commits in repository yet)${NC}"
fi

echo ""
