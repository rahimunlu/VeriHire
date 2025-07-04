-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS verification_requests CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS trust_scores CASCADE;
DROP TABLE IF EXISTS credentials CASCADE;
DROP TABLE IF EXISTS nft_credentials CASCADE;

-- Create candidates table
CREATE TABLE candidates (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    resume_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resumes table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES candidates(id),
    work_experience JSONB,
    education JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification_requests table
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id TEXT NOT NULL,
    candidate_name TEXT,
    candidate_email TEXT,
    employer_email TEXT NOT NULL,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    magic_link_token TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 days')
);

-- Create verifications table
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id TEXT NOT NULL,
    verifier_id TEXT,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    verified BOOLEAN NOT NULL,
    verifier_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trust_scores table
CREATE TABLE trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id TEXT NOT NULL UNIQUE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    analysis TEXT,
    breakdown JSONB,
    recommendations TEXT[],
    risk_factors TEXT[],
    strengths TEXT[],
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credentials table
CREATE TABLE credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id TEXT NOT NULL REFERENCES candidates(id),
    credential_hash TEXT NOT NULL,
    zk_proof TEXT,
    trust_score INTEGER NOT NULL,
    verification_count INTEGER NOT NULL,
    issuance_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nft_credentials table
CREATE TABLE nft_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id TEXT NOT NULL UNIQUE,
    token_id TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    trust_score INTEGER NOT NULL,
    verification_count INTEGER NOT NULL DEFAULT 0,
    transaction_hash TEXT NOT NULL,
    credential_hash TEXT NOT NULL,
    token_uri TEXT,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_candidates_created_at ON candidates(created_at);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_verification_requests_candidate_id ON verification_requests(candidate_id);
CREATE INDEX idx_verification_requests_token ON verification_requests(magic_link_token);
CREATE INDEX idx_verifications_candidate_id ON verifications(candidate_id);
CREATE INDEX idx_trust_scores_candidate_id ON trust_scores(candidate_id);
CREATE INDEX idx_trust_scores_score ON trust_scores(score);
CREATE INDEX idx_trust_scores_calculated_at ON trust_scores(calculated_at);
CREATE INDEX idx_credentials_candidate_id ON credentials(candidate_id);
CREATE INDEX idx_nft_credentials_candidate_id ON nft_credentials(candidate_id);
CREATE INDEX idx_nft_credentials_token_id ON nft_credentials(token_id);
CREATE INDEX idx_nft_credentials_wallet ON nft_credentials(wallet_address);

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Anyone can read candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert candidates" ON candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update candidates" ON candidates FOR UPDATE USING (true);

CREATE POLICY "Anyone can read verification_requests" ON verification_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert verification_requests" ON verification_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update verification_requests" ON verification_requests FOR UPDATE USING (true);

CREATE POLICY "Anyone can read verifications" ON verifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert verifications" ON verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update verifications" ON verifications FOR UPDATE USING (true);

CREATE POLICY "Anyone can read trust_scores" ON trust_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert trust_scores" ON trust_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update trust_scores" ON trust_scores FOR UPDATE USING (true);

CREATE POLICY "Anyone can read nft_credentials" ON nft_credentials FOR SELECT USING (true);
CREATE POLICY "Anyone can insert nft_credentials" ON nft_credentials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update nft_credentials" ON nft_credentials FOR UPDATE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_scores_updated_at
    BEFORE UPDATE ON trust_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 