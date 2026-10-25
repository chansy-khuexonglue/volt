#!/usr/bin/env bash
# ==============================================================================
# Volt Framework - Git Commit & Push Script
# Target Repository: https://github.com/chansy-khuexonglue/volt.git
# ==============================================================================

set -e

# Terminal Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

REPO_URL="https://github.com/chansy-khuexonglue/volt.git"
SKIP_TESTS=false
COMMIT_MSG=""

# Parse flags & arguments
for arg in "$@"; do
  case $arg in
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    *)
      if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="$arg"
      else
        COMMIT_MSG="$COMMIT_MSG $arg"
      fi
      ;;
  esac
done

echo -e "${CYAN}${BOLD}⚡ Volt Framework - Commit & Push Tool${NC}"
echo -e "${BLUE}Target Repo:${NC} $REPO_URL\n"

# 1. Ensure we are inside git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo -e "${RED}❌ Error: Not inside a git repository.${NC}"
  exit 1
fi

WORKSPACE_ROOT=$(git rev-parse --show-toplevel)
cd "$WORKSPACE_ROOT"

# 2. Ensure remote 'origin' is configured
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$CURRENT_REMOTE" ]; then
  echo -e "${YELLOW}⚠️  Remote 'origin' not found. Adding $REPO_URL...${NC}"
  git remote add origin "$REPO_URL"
  echo -e "${GREEN}✓ Remote 'origin' added.${NC}"
else
  echo -e "${GREEN}✓ Remote origin:${NC} $CURRENT_REMOTE"
fi

# 3. Ensure branch is named 'main'
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ "$CURRENT_BRANCH" = "master" ] || [ -z "$CURRENT_BRANCH" ]; then
  echo -e "${YELLOW}⚠️  Renaming branch to 'main'...${NC}"
  git branch -M main
  CURRENT_BRANCH="main"
fi
echo -e "${GREEN}✓ Current branch:${NC} ${BOLD}$CURRENT_BRANCH${NC}"

# 4. Pre-flight Quality Gate
if [ "$SKIP_TESTS" = false ]; then
  echo -e "\n${CYAN}🔍 Running pre-flight checks (TypeScript + Tests)...${NC}"
  
  echo -e "${BLUE}  → Checking TypeScript types (bun run typecheck)...${NC}"
  if ! bun run typecheck; then
    echo -e "${RED}❌ Typecheck failed! Please fix TypeScript errors before committing.${NC}"
    exit 1
  fi
  echo -e "${GREEN}  ✓ Typecheck passed.${NC}"

  echo -e "${BLUE}  → Running unit and integration tests (bun test)...${NC}"
  if ! bun test; then
    echo -e "${RED}❌ Tests failed! Please fix test failures before committing.${NC}"
    exit 1
  fi
  echo -e "${GREEN}  ✓ All tests passed.${NC}"
else
  echo -e "${YELLOW}⚠️  Skipping tests (--skip-tests flag passed).${NC}"
fi

# 5. Staging files
echo -e "\n${CYAN}📦 Staging files...${NC}"
git add .

STATUS=$(git status --porcelain)
if [ -z "$STATUS" ]; then
  echo -e "${YELLOW}ℹ️  No changes to commit (working tree clean).${NC}"
  
  # Check if remote has unpushed commits
  UNPUSHED=$(git log origin/$CURRENT_BRANCH..$CURRENT_BRANCH 2>/dev/null || echo "")
  if [ -n "$UNPUSHED" ]; then
    echo -e "${YELLOW}Found unpushed commits. Pushing to origin/$CURRENT_BRANCH...${NC}"
    git push -u origin "$CURRENT_BRANCH"
    echo -e "${GREEN}✓ Pushed successfully!${NC}"
  fi
  exit 0
fi

# 6. Commit Message
if [ -z "$COMMIT_MSG" ]; then
  echo -e "\n${BOLD}Enter Conventional Commit message (e.g. feat(core): implement feature):${NC}"
  read -r COMMIT_MSG
fi

if [ -z "$COMMIT_MSG" ]; then
  echo -e "${RED}❌ Error: Commit message cannot be empty.${NC}"
  exit 1
fi

# 7. Commit
echo -e "\n${CYAN}💾 Committing changes...${NC}"
git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✓ Changes committed with message:${NC} \"$COMMIT_MSG\""

# 8. Push to GitHub
echo -e "\n${CYAN}🚀 Pushing to GitHub (origin/$CURRENT_BRANCH)...${NC}"
if git push -u origin "$CURRENT_BRANCH"; then
  echo -e "\n${GREEN}${BOLD}🎉 Successfully committed and pushed to GitHub!${NC}"
  echo -e "${BLUE}URL:${NC} https://github.com/chansy-khuexonglue/volt/tree/$CURRENT_BRANCH\n"
else
  echo -e "\n${RED}❌ Push failed.${NC}"
  echo -e "${YELLOW}Common causes:${NC}"
  echo -e "  1. GitHub authentication required. Run ${BOLD}gh auth login${NC} or provide a Personal Access Token."
  echo -e "  2. If using SSH, ensure your key is added: ${BOLD}ssh -T git@github.com${NC}."
  echo -e "  3. Remote branch has newer commits. Pull with: ${BOLD}git pull origin $CURRENT_BRANCH --rebase${NC}."
  exit 1
fi
