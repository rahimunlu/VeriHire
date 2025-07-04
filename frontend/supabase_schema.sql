-- Supabase schema for Trust Match candidate user flow

-- Table: resumes
DROP TABLE IF EXISTS resumes;
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL, -- World ID nullifier or user identifier
  work_experience jsonb, -- Array of work experience objects
  education jsonb,       -- Array of education objects
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- Table: verification_requests
CREATE TABLE IF NOT EXISTS verification_requests (
  id serial PRIMARY KEY,
  candidate_id text NOT NULL, -- World ID nullifier or user identifier
  employer_email text NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  verification_id text UNIQUE NOT NULL, -- UUID for tracking
  status text NOT NULL DEFAULT 'pending', -- pending/completed/failed
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_verification_requests_candidate_id ON verification_requests(candidate_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_verification_id ON verification_requests(verification_id);

-- Table: verifications
CREATE TABLE IF NOT EXISTS verifications (
  id text PRIMARY KEY, -- verification_id (UUID)
  candidate_id text NOT NULL,
  candidate_name text,
  candidate_email text,
  employer_email text,
  company text,
  position text,
  start_date text,
  end_date text,
  verified boolean NOT NULL,
  employer_world_id text,
  comments text,
  verification_proof text,
  timestamp timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'completed'
);
CREATE INDEX IF NOT EXISTS idx_verifications_candidate_id ON verifications(candidate_id);

-- Table: credentials
CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id text NOT NULL, -- World ID nullifier or user identifier
  credential_hash text NOT NULL,
  zk_proof text,
  trust_score integer NOT NULL,
  verification_count integer NOT NULL,
  issuance_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credentials_candidate_id ON credentials(candidate_id); 