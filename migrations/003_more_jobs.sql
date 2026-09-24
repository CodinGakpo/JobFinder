-- Job Portal SQLi case study — additional seed jobs (20 rows, 3 new companies).
-- Run this manually in the Supabase SQL Editor after 001_init.sql.
--
-- Additive and idempotent: it never drops or alters anything, and rows that
-- already exist (same title + company + location) are skipped, so re-running
-- it will not create duplicates. After 001 + 003 the jobs table holds 40 rows.

INSERT INTO jobs (title, company, location, description, salary, posted_at)
SELECT v.title, v.company, v.location, v.description, v.salary, now() - v.age
FROM (VALUES
  ('Cloud Architect', 'Initech', 'Austin, TX', 'Design multi-region cloud architecture for billing services.', 138000, interval '3 days'),
  ('UX Designer', 'Globex Corporation', 'New York, NY', 'Design the checkout flow for the payments product line.', 102000, interval '4 days'),
  ('Security Analyst', 'Globex Corporation', 'Chicago, IL', 'Monitor alerts and triage security incidents.', 108000, interval '6 days'),
  ('Penetration Tester', 'Umbrella Corp', 'Raccoon City, MI', 'Run authorized red-team engagements against internal apps.', 125000, interval '2 days'),
  ('Data Scientist', 'Umbrella Corp', 'Remote', 'Model outbreak-risk scenarios from lab telemetry.', 138000, interval '8 days'),
  ('Robotics Engineer', 'Stark Industries', 'Malibu, CA', 'Develop control software for autonomous assembly robots.', 148000, interval '5 days'),
  ('Solutions Architect', 'Wayne Enterprises', 'Gotham, NJ', 'Scope and design integrations for enterprise clients.', 142000, interval '7 days'),
  ('Security Engineer', 'Wayne Enterprises', 'Remote', 'Harden the internal identity and access platform.', 133000, interval '1 days'),
  ('Product Manager', 'Wonka Industries', 'Remote', 'Own the roadmap for the online ordering experience.', 128000, interval '9 days'),
  ('UX Designer', 'Wonka Industries', 'Chicago, IL', 'Prototype and test new storefront experiences.', 96000, interval '10 days'),
  ('Embedded Software Engineer', 'Aperture Science', 'Cleveland, OH', 'Write firmware for portal-gun prototypes.', 132000, interval '3 days'),
  ('Technical Writer', 'Aperture Science', 'Remote', 'Document lab automation APIs and safety procedures.', 82000, interval '12 days'),
  ('Machine Learning Engineer', 'Cyberdyne Systems', 'Sunnyvale, CA', 'Train perception models for autonomous systems.', 155000, interval '2 days'),
  ('Software Engineer', 'Cyberdyne Systems', 'Remote', 'Build the fleet-management backend.', 130000, interval '5 days'),
  ('DevOps Engineer', 'Cyberdyne Systems', 'Sunnyvale, CA', 'Run Kubernetes clusters for model training workloads.', 127000, interval '11 days'),
  ('Data Engineer', 'Soylent Corp', 'New York, NY', 'Build supply-chain data pipelines.', 119000, interval '4 days'),
  ('Sales Engineer', 'Soylent Corp', 'Remote', 'Run technical demos and proofs of concept for prospects.', 110000, interval '6 days'),
  ('Software Engineer', 'Pied Piper', 'Palo Alto, CA', 'Work on the distributed compression engine.', 126000, interval '1 days'),
  ('Backend Engineer', 'Pied Piper', 'Remote', 'Scale the peer-to-peer storage service.', 123000, interval '8 days'),
  ('Engineering Manager', 'Pied Piper', 'Palo Alto, CA', 'Lead the platform team of 6 engineers.', 150000, interval '14 days')
) AS v(title, company, location, description, salary, age)
WHERE NOT EXISTS (
  SELECT 1 FROM jobs j
  WHERE j.title = v.title AND j.company = v.company AND j.location = v.location
);

-- Sanity check (optional): SELECT count(*) FROM jobs;  -- expect 40
