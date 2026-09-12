#!/usr/bin/env bash
# Downloads the legacy baseline bundle from the legacy/v1 release into tests/visual/legacy/bundle
# (ignored by git). Exits 0 with a notice when the release or the asset does not exist yet, so the
# parity tests skip instead of failing. Needs gh (GH_TOKEN optional for a public repository).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"
repo="${GITHUB_REPOSITORY:-pixbs/atmjet_website}"
dir="$root/tests/visual/legacy"
bundle="$dir/bundle"

if ! command -v gh >/dev/null 2>&1; then
  echo "download-legacy-bundle: gh is not installed; the parity tests will skip" >&2
  exit 0
fi
if ! gh release view legacy/v1 --repo "$repo" --json assets --jq '.assets[].name' 2>/dev/null | grep -qx 'legacy-baselines.zip'; then
  echo "download-legacy-bundle: no legacy-baselines.zip on the legacy/v1 release of $repo yet; the parity tests will skip" >&2
  exit 0
fi

mkdir -p "$dir"
gh release download legacy/v1 --repo "$repo" --pattern legacy-baselines.zip --dir "$dir" --clobber
rm -rf "$bundle"
mkdir -p "$bundle"
unzip -q -o "$dir/legacy-baselines.zip" -d "$bundle"
rm -f "$dir/legacy-baselines.zip"
echo "download-legacy-bundle: $(jq '.entries | length' "$bundle/manifest.json") entries in $bundle (captured $(jq -r .capturedAt "$bundle/manifest.json"))"
