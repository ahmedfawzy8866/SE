#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# make-clean-copy.sh
# Build a CLEAN, deploy-ready copy of the Sierra Estates monorepo (source only)
# and (optionally) push it to a fresh GitHub repo with NO history and NO junk.
#
# Usage (from git-bash / WSL / macOS / Linux):
#   ./scripts/make-clean-copy.sh <SOURCE_CHECKOUT> <DEST_DIR> [git@github:owner/repo.git]
#
# Windows example (git-bash), paths with spaces are fine when quoted:
#   ./scripts/make-clean-copy.sh "/f/SE" "/f/SE Vercel deploy" \
#       "https://github.com/sierrablue8866-droid/SE-Vercel-deploy.git"
#
# It copies ONLY git-tracked source files, minus the junk/duplicate/secret paths,
# writes a clean .gitignore, then inits a brand-new git repo in DEST_DIR.
# The push step is the LAST thing and is echoed for you to confirm.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SRC="${1:?Usage: make-clean-copy.sh <SOURCE_CHECKOUT> <DEST_DIR> [remote-url]}"
DEST="${2:?Usage: make-clean-copy.sh <SOURCE_CHECKOUT> <DEST_DIR> [remote-url]}"
REMOTE="${3:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Paths excluded from the clean copy (junk, duplicates, secrets, build output)
EXCLUDE_RE='^(\.venv/|\.agent/|\.agents/|\.codex/|_unused_archive/|firebase/Sierra-Estates-Final/|firebase/firebase/|\.firebase/|tsconfig\.tsbuildinfo$|\.gitignore$|apps/admin-dashboard/api/server\.js(\.map)?$)|/\.wwebjs_auth/'

echo ">> Source : $SRC"
echo ">> Dest   : $DEST"
[ -d "$SRC/.git" ] || { echo "ERROR: $SRC is not a git checkout"; exit 1; }

mkdir -p "$DEST"

echo ">> Copying tracked source files (excluding junk)…"
COUNT=0
cd "$SRC"
# NUL-delimited + no path quoting so spaces / unicode (Arabic) filenames survive
while IFS= read -r -d '' f; do
  case "$f" in
    "") continue ;;
  esac
  if printf '%s' "$f" | grep -qE "$EXCLUDE_RE"; then continue; fi
  mkdir -p "$DEST/$(dirname "$f")"
  cp "$SRC/$f" "$DEST/$f"
  COUNT=$((COUNT+1))
done < <(git -c core.quotePath=false ls-files -z)
echo ">> Copied $COUNT files."

echo ">> Installing clean .gitignore…"
cp "$SCRIPT_DIR/clean-repo.gitignore" "$DEST/.gitignore"

echo ">> Secret sweep on destination…"
LEAK=$(find "$DEST" -type f \( -name '.env' -o -name '*.pem' -o -name '*.key' \
        -o -name '*service-account*' -o -name '*adminsdk*' \) ! -name '.env.example' 2>/dev/null || true)
WWEB=$(find "$DEST" -path '*wwebjs*' 2>/dev/null | wc -l | tr -d ' ')
if [ -n "$LEAK" ] || [ "$WWEB" != "0" ]; then
  echo "!! ABORT — potential secrets found in destination:"; echo "$LEAK"; exit 2
fi
echo ">> Clean. No secrets, no wwebjs sessions."

echo ">> Initialising fresh git repo…"
cd "$DEST"
git init -b main >/dev/null
git add -A
git -c user.name="Sierra Estates" -c user.email="dev@sierra-estates.net" \
    commit -q -m "chore: clean import of Sierra Estates monorepo (deploy-ready)"
echo ">> First commit created with $(git ls-files | wc -l | tr -d ' ') files."

if [ -n "$REMOTE" ]; then
  git remote add origin "$REMOTE"
  echo ""
  echo ">> Ready to push. Review, then run:"
  echo "     cd \"$DEST\" && git push -u origin main"
else
  echo ""
  echo ">> No remote given. Add it and push when ready:"
  echo "     cd \"$DEST\" && git remote add origin <URL> && git push -u origin main"
fi
echo ">> DONE."
