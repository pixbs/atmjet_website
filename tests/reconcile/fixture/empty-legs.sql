-- Two more legs for the table `airports.sql` creates: one to an airport no table has, which
-- the legacy section dropped from the page, and one timed to the microsecond with no order.
INSERT INTO {{schema}}.atmjet_admin__empty_legs ("start", "end", "from", "to", type, category, company, safety, price, "order")
VALUES
  ('2026-10-03T22:30:00+04:00', '2026-10-04T02:00:00+04:00', 'ZZAC', 'QQZZ', 'ZZJet 6000', 'Heavy', 'Zed Air', 'ARGUS Gold', 15000, 3),
  ('2026-10-04T06:15:30.123456Z', '2026-10-04T09:00:00Z', 'ZZAE', 'zzaa', NULL, NULL, NULL, NULL, NULL, NULL);
