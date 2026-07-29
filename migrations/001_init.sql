-- Job Portal SQLi case study — initial schema, seed data, and least-privilege role.
-- Run this manually in the Supabase SQL Editor (Project > SQL Editor > New query).

-- ============================================================
-- 1. Tables
-- ============================================================

DROP TABLE IF EXISTS jobs;
CREATE TABLE jobs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  salary INTEGER,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
);

-- ============================================================
-- 2. Seed data — jobs (~20 rows across several companies)
-- ============================================================

INSERT INTO jobs (title, company, location, description, salary, posted_at) VALUES
('Backend Engineer', 'Initech', 'Austin, TX', 'Build and maintain internal billing services.', 118000, now() - interval '2 days'),
('Frontend Engineer', 'Initech', 'Remote', 'Own the customer-facing dashboard in React.', 112000, now() - interval '5 days'),
('DevOps Engineer', 'Initech', 'Austin, TX', 'Manage CI/CD pipelines and cloud infrastructure.', 125000, now() - interval '9 days'),
('Data Analyst', 'Globex Corporation', 'Chicago, IL', 'Analyze sales data and build reporting dashboards.', 95000, now() - interval '1 days'),
('Software Engineer', 'Globex Corporation', 'Remote', 'Work on the core product platform.', 120000, now() - interval '3 days'),
('Product Manager', 'Globex Corporation', 'New York, NY', 'Own the roadmap for the payments product line.', 135000, now() - interval '12 days'),
('Security Engineer', 'Umbrella Corp', 'Raccoon City, MI', 'Perform application security reviews and pen tests.', 130000, now() - interval '4 days'),
('QA Engineer', 'Umbrella Corp', 'Remote', 'Design and execute manual and automated test plans.', 90000, now() - interval '7 days'),
('Site Reliability Engineer', 'Stark Industries', 'Malibu, CA', 'Keep production systems online and observable.', 140000, now() - interval '6 days'),
('Machine Learning Engineer', 'Stark Industries', 'Remote', 'Build ML models for predictive maintenance.', 145000, now() - interval '10 days'),
('Mobile Engineer (iOS)', 'Stark Industries', 'Malibu, CA', 'Develop and ship the flagship iOS application.', 122000, now() - interval '1 days'),
('Engineering Manager', 'Wayne Enterprises', 'Gotham, NJ', 'Lead a team of 8 backend engineers.', 160000, now() - interval '15 days'),
('Full Stack Engineer', 'Wayne Enterprises', 'Remote', 'Work across the stack on internal tooling.', 115000, now() - interval '2 days'),
('Technical Writer', 'Wayne Enterprises', 'Gotham, NJ', 'Write developer-facing API documentation.', 85000, now() - interval '8 days'),
('Software Engineer', 'Wonka Industries', 'Remote', 'Build the online candy ordering platform.', 105000, now() - interval '3 days'),
('Data Engineer', 'Wonka Industries', 'Chicago, IL', 'Own the ETL pipelines feeding analytics.', 118000, now() - interval '11 days'),
('Research Scientist', 'Aperture Science', 'Remote', 'Conduct applied research in robotics.', 150000, now() - interval '4 days'),
('Software Engineer', 'Aperture Science', 'Cleveland, OH', 'Build internal lab automation software.', 128000, now() - interval '6 days'),
('Customer Support Engineer', 'Hooli', 'Palo Alto, CA', 'Provide technical support to enterprise customers.', 80000, now() - interval '1 days'),
('Backend Engineer', 'Hooli', 'Remote', 'Work on the core search infrastructure.', 121000, now() - interval '13 days');

-- ============================================================
-- 3. Seed data — users (exfiltration target)
-- password_hash values are FAKE bcrypt-shaped strings for demo purposes only.
-- They are NOT derived from any real password and cannot be used to log in anywhere.
-- ============================================================

INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@jobportal.test', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MgYqQxJz3fVh6z5FdY6Tq5r6LxKQxWa', 'Alice Admin', 'admin'),
('jsmith@jobportal.test', '$2b$10$C1vTz3nR7Ff2K9pQwYtL6uSf8oQhX2rZmB4vNc1eD5gH7jKpL0wS2', 'John Smith', 'user'),
('mrodriguez@jobportal.test', '$2b$10$Qk4mP8sVn2Zx7Rb1YtG5auK3wLd9oT6cJf0hE2iN4rXpS8vB1mQyC', 'Maria Rodriguez', 'user'),
('dlee@jobportal.test', '$2b$10$Xy8bN2vQm5Ks9Tp3RaW6zuL1oJf7hD4cE0iG6rXnS2vB9mQpL3wYo', 'David Lee', 'user'),
('recruiter@jobportal.test', '$2b$10$Fg3hN9vRm2Ks8Tp1YaZ6xuP4oLd7cJ0iE5rXqS1vB6mQpN2wYoK9m', 'Priya Recruiter', 'recruiter');

-- ============================================================
-- 4. Least-privilege read-only role for the search feature
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'readonly_search_role') THEN
    CREATE ROLE readonly_search_role NOLOGIN;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO readonly_search_role;
GRANT SELECT ON jobs TO readonly_search_role;
REVOKE ALL ON users FROM readonly_search_role;

-- Required: the connecting role must be a member of readonly_search_role
-- for `SET ROLE readonly_search_role` to succeed. On Supabase, the
-- connection pooler authenticates as the underlying role "postgres"
-- (the "postgres.<project-ref>" you see in the connection string is a
-- pooler-level alias, not the actual Postgres role name).
GRANT readonly_search_role TO postgres;

-- ============================================================
-- 5. Sanity checks (uncomment to run manually after migration)
-- ============================================================

-- SELECT count(*) FROM jobs;      -- expect 20
-- SELECT count(*) FROM users;     -- expect 5
-- SET ROLE readonly_search_role;
-- SELECT * FROM jobs LIMIT 1;     -- should succeed
-- SELECT * FROM users;            -- should fail: permission denied for table users
-- RESET ROLE;
