-- What a `vehicles` row is (docs/legacy-inventory.md section 8.4): `source` against whether the
-- row carries a plane's tail number, a yacht's columns, both or neither, and its pictures.
SELECT
  source,
  CASE
    WHEN btrim(tail_number) <> '' AND btrim(yacht_length) <> '' THEN 'plane and yacht'
    WHEN btrim(tail_number) <> '' THEN 'plane'
    WHEN btrim(yacht_length) <> '' OR btrim(yacht_builder) <> '' THEN 'yacht'
    ELSE 'neither'
  END AS kind,
  count(*) AS row_count,
  count(*) FILTER (WHERE btrim(image) <> '') AS with_image,
  count(*) FILTER (WHERE btrim(thumb) <> '') AS with_thumb,
  count(*) FILTER (WHERE image = thumb) AS image_is_thumb,
  min(id) AS first_id,
  max(id) AS last_id
FROM vehicles
GROUP BY 1, 2
ORDER BY 1, 2;
