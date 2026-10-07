-- Where every picture, brochure and panorama the legacy rows name lives: the scheme (`(none)`
-- for a value written without one), the host, and how many values are padded with whitespace.
-- Answers the hosts docs/legacy-inventory.md section 8.9 left unverified.
WITH urls (column_name, value) AS (
  SELECT 'vehicles.image', image FROM vehicles
  UNION ALL SELECT 'vehicles.thumb', thumb FROM vehicles
  UNION ALL SELECT 'aircraft_images.url', url FROM aircraft_images
  UNION ALL SELECT 'aircrafts.pdf_attachment', pdf_attachment FROM aircrafts
  UNION ALL SELECT 'aircrafts.extension_view_360', extension_view_360 FROM aircrafts
  UNION ALL SELECT 'yachts.pictures[]', unnest(pictures) FROM yachts
  UNION ALL SELECT 'new_yachts.photos[]', unnest(photos) FROM new_yachts
)
SELECT
  column_name,
  CASE
    WHEN value IS NULL THEN 'null'
    WHEN btrim(value) = '' THEN 'blank'
    ELSE coalesce(lower(substring(btrim(value) FROM '^([A-Za-z][A-Za-z0-9+.-]*)://')), '(none)')
  END AS scheme,
  lower(substring(btrim(value) FROM '^(?:[A-Za-z][A-Za-z0-9+.-]*://)?([^/?#\s]+)')) AS host,
  count(*) AS value_count,
  count(*) FILTER (WHERE value ~ '^\s|\s$') AS padded
FROM urls
GROUP BY 1, 2, 3
ORDER BY 1, 4 DESC, 3;
