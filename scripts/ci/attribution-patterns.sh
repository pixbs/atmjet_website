# Builds the grep -E alternations from attribution-patterns.txt. Sourced by the convention scripts
# and by .claude/hooks/block-attribution.sh; not executable on its own.
_attribution_file="${ATTRIBUTION_PATTERNS_FILE:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/attribution-patterns.txt}"
ATTRIBUTION_TEXT="$(grep -vE '^[[:space:]]*(#|$)' "$_attribution_file" | grep -vE '^identity ' | paste -sd '|' -)"
ATTRIBUTION_IDENTITY="$(grep -E '^identity ' "$_attribution_file" | sed -E 's/^identity +//' | paste -sd '|' -)"
[[ -n "$ATTRIBUTION_TEXT" ]] || ATTRIBUTION_TEXT='^$'
[[ -n "$ATTRIBUTION_IDENTITY" ]] || ATTRIBUTION_IDENTITY='^$'
export ATTRIBUTION_TEXT ATTRIBUTION_IDENTITY
