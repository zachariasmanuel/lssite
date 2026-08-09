#!/usr/bin/env sh
#
# Publish staging/ to the site root.
#
#   ./publish.sh
#
# GitHub Pages serves this repo from the master branch, root path, so "live"
# means the files sitting next to this script. staging/ is where edits happen;
# this copies that build out and rewrites the one thing that differs between
# the two — the absolute URLs in the social-card and JSON-LD tags, which must
# name the real page rather than the staging preview.
#
# It does not commit or push. Review with `git diff`, then commit yourself.

set -eu
cd "$(dirname "$0")"

[ -d staging ] || { echo "no staging/ directory here" >&2; exit 1; }

echo "staging/ -> site root"

cp staging/index.html index.html
mkdir -p assets/css assets/js assets/img
cp staging/assets/css/style.css assets/css/style.css
cp staging/assets/js/main.js    assets/js/main.js
cp staging/assets/img/lakshmi.jpg     assets/img/lakshmi.jpg
cp staging/assets/img/lakshmi@600.jpg assets/img/'lakshmi@600.jpg'
cp staging/assets/img/lakshmi-og.jpg  assets/img/lakshmi-og.jpg
cp staging/favicon.ico favicon.ico

# /staging/assets/… -> /assets/… in og:image, twitter:image and JSON-LD "image"
sed -i '' 's|lakshmisreedhar\.com/staging/assets/|lakshmisreedhar.com/assets/|g' index.html

if grep -q '/staging/assets/' index.html; then
  echo "warning: a /staging/ path survived the rewrite in index.html" >&2
  exit 1
fi

echo "done. review with: git diff"
