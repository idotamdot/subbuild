CREATE TABLE IF NOT EXISTS inquiries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'assigned', 'clarification_needed', 'contact_scheduled', 'closed')),
  assigned_staff_email text,
  encrypted_payload bytea NOT NULL,
  encryption_iv bytea NOT NULL,
  encryption_tag bytea NOT NULL,
  reference_key_digest bytea,
  consultation_contact_consent boolean NOT NULL,
  marketing_consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  response_due_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS inquiries_status_created_idx
  ON inquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_assigned_status_created_idx
  ON inquiries (assigned_staff_email, status, created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_overdue_idx
  ON inquiries (response_due_at)
  WHERE status <> 'closed';
CREATE INDEX IF NOT EXISTS inquiries_reference_key_idx ON inquiries (reference, reference_key_digest)
  WHERE reference_key_digest IS NOT NULL;

CREATE TABLE IF NOT EXISTS intake_rate_limits (
  address_digest bytea PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count >= 1)
);

CREATE TABLE IF NOT EXISTS technical_claims (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  claim_text text NOT NULL CHECK (length(claim_text) BETWEEN 1 AND 4000),
  standard_reference text NOT NULL CHECK (length(standard_reference) <= 500),
  verification_status text NOT NULL DEFAULT 'preliminary'
    CHECK (verification_status IN ('verified', 'preliminary', 'custom', 'site_dependent', 'under_review')),
  reviewer text,
  last_reviewed_at timestamptz,
  expires_at timestamptz NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (verification_status <> 'verified' OR (reviewer IS NOT NULL AND last_reviewed_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS technical_claims_public_expiry_idx
  ON technical_claims (expires_at)
  WHERE is_published AND verification_status <> 'under_review';

CREATE TABLE IF NOT EXISTS case_studies (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  summary text NOT NULL CHECK (length(summary) BETWEEN 1 AND 4000),
  disclosure_cleared boolean NOT NULL DEFAULT false,
  metadata_sanitized boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT is_published OR (disclosure_cleared AND metadata_sanitized))
);

CREATE TABLE IF NOT EXISTS case_study_assets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_study_id bigint NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('image/webp')),
  image_data bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS case_study_assets_case_id_idx ON case_study_assets (case_study_id);

CREATE TABLE IF NOT EXISTS engaged_site_assessments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  inquiry_id bigint NOT NULL UNIQUE REFERENCES inquiries(id) ON DELETE CASCADE,
  assigned_staff_email text NOT NULL,
  nda_reference text NOT NULL CHECK (length(nda_reference) BETWEEN 1 AND 200),
  nda_confirmed_by text NOT NULL,
  nda_confirmed_at timestamptz NOT NULL DEFAULT now(),
  encrypted_site_payload bytea NOT NULL,
  site_encryption_iv bytea NOT NULL,
  site_encryption_tag bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS engaged_site_assessments_assigned_idx
  ON engaged_site_assessments (assigned_staff_email, created_at DESC);

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
