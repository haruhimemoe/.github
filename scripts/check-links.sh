#!/bin/sh
# Checks every link in the repository's Markdown and llms.txt.
# Absolute links must answer 200. npm's website answers 403 to scripts, so npm pages are
# checked through the registry. Relative links must name a file or folder that exists.
set -u
cd "$(dirname "$0")/.." || exit 1

files="profile/README.md llms.txt README.md CONTRIBUTING.md SECURITY.md"
fail=0

for url in $(grep -ohE 'https://[^] )>"`]+' $files | sort -u); do
  case "$url" in
    https://www.npmjs.com/package/*)
      name=${url#https://www.npmjs.com/package/}
      check="https://registry.npmjs.org/$(printf %s "$name" | sed 's|/|%2F|')" ;;
    https://www.npmjs.com/org/*)
      check="https://registry.npmjs.org/-/org/${url#https://www.npmjs.com/org/}/package" ;;
    *)
      check=$url ;;
  esac
  code=$(curl -s -o /dev/null -L --retry 2 --max-time 30 -w '%{http_code}' "$check")
  if [ "$code" = 200 ]; then
    echo "ok   $url"
  elif [ "$code" = 429 ]; then
    echo "warn $url (429, rate limited)"
  else
    echo "FAIL $url ($code)"
    fail=1
  fi
done

for f in $files; do
  dir=$(dirname "$f")
  for path in $(grep -oE '\]\([^):#]+\)' "$f" | tr -d '()]'); do
    if [ -e "$dir/$path" ]; then
      echo "ok   $f -> $path"
    else
      echo "FAIL $f -> $path (missing)"
      fail=1
    fi
  done
done

exit $fail
