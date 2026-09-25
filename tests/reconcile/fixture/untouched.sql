-- The three tables no importer reads, which stay in the frozen `legacy` schema until E12.6
-- (`docs/legacy-inventory.md` section 8.7). Values are fictional; the admin passwords are not
-- real ones, but the legacy table did store them in plain text.
CREATE TABLE {{schema}}.city_list (
  id serial PRIMARY KEY,
  name varchar(30) NOT NULL DEFAULT ''
);

CREATE TABLE {{schema}}.atmjet_admin__users (
  id serial PRIMARY KEY,
  username varchar(256) NOT NULL,
  password text NOT NULL
);

CREATE TABLE {{schema}}.migration_status (
  id serial PRIMARY KEY,
  last_processed_page integer,
  last_processed_slug text
);

INSERT INTO {{schema}}.city_list (name) VALUES ('Alpha City'), ('');
INSERT INTO {{schema}}.atmjet_admin__users (username, password) VALUES ('zed-admin', 'not-a-real-password');
INSERT INTO {{schema}}.migration_status (last_processed_page, last_processed_slug) VALUES (12, 'zzjet-zz-001');
