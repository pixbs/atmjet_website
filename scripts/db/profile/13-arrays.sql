-- The two picture arrays: how many elements, and the blanks, padding and repeats inside them,
-- which the importers drop or keep in array order (scripts/migrate/yachts.ts).
WITH arrays (column_name, id, items) AS (
  SELECT 'yachts.pictures', id, pictures FROM yachts
  UNION ALL SELECT 'new_yachts.photos', id, photos FROM new_yachts
)
SELECT
  column_name,
  count(*) AS row_count,
  count(*) FILTER (WHERE items IS NULL) AS null_arrays,
  count(*) FILTER (WHERE cardinality(items) = 0) AS empty_arrays,
  min(cardinality(items)) AS min_items,
  max(cardinality(items)) AS max_items,
  sum(cardinality(items)) AS items,
  sum((SELECT count(*) FROM unnest(items) u WHERE u IS NULL OR btrim(u) = '')) AS blank_items,
  sum((SELECT count(*) FROM unnest(items) u WHERE u ~ '^\s|\s$')) AS padded_items,
  sum((SELECT count(*) - count(DISTINCT u) FROM unnest(items) u)) AS repeated_items,
  count(*) FILTER (WHERE (SELECT count(DISTINCT substring(u FROM '^https?://([^/]+)')) FROM unnest(items) u) > 1) AS arrays_on_two_hosts
FROM arrays
GROUP BY 1
ORDER BY 1;
