-- The charter catalogue's slugs against the admin's rule (docs/legacy-inventory.md section 8.2:
-- lower case, everything but a-z, 0-9 and spaces dropped, spaces to `_`), and its prices.
SELECT measure, value
FROM (VALUES
  (1, 'rows', (SELECT count(*) FROM new_yachts)),
  (2, 'slug blank, or only underscores', (SELECT count(*) FROM new_yachts WHERE btrim(slug, ' _') = '')),
  (3, 'slug held by more than one row',
      (SELECT count(*) FROM (SELECT slug FROM new_yachts GROUP BY slug HAVING count(*) > 1) d)),
  (4, 'slug the admin rule does not give for the name',
      (SELECT count(*) FROM new_yachts
       WHERE slug IS DISTINCT FROM regexp_replace(regexp_replace(lower(name), '[^a-z0-9 ]', '', 'g'), '\s+', '_', 'g'))),
  (5, 'name with a character outside printable ASCII', (SELECT count(*) FROM new_yachts WHERE name ~ '[^ -~]')),
  (6, 'slug found inside another slug (the legacy page matched ILIKE ''%slug%'')',
      (SELECT count(*) FROM new_yachts a
       WHERE EXISTS (SELECT 1 FROM new_yachts b WHERE b.id <> a.id AND b.slug LIKE '%' || a.slug || '%'))),
  (7, 'customer_price null or zero', (SELECT count(*) FROM new_yachts WHERE coalesce(customer_price, 0) = 0)),
  (8, 'customer_price with decimals', (SELECT count(*) FROM new_yachts WHERE customer_price <> trunc(customer_price))),
  (9, 'photos missing or empty', (SELECT count(*) FROM new_yachts WHERE coalesce(cardinality(photos), 0) = 0))
) AS m (n, measure, value)
ORDER BY n;
