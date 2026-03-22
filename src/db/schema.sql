-- Crown Zapier Bridge - Database Schema
-- Target: Neon/Postgres

CREATE TABLE IF NOT EXISTS command_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id VARCHAR(64) NOT NULL,
  raw_text TEXT NOT NULL,
  intent VARCHAR(64),
  target_repo VARCHAR(128),
  target_pr INTEGER,
  assigned_agent VARCHAR(64),
  channel VARCHAR(64),
  requested_by VARCHAR(64),
  payload_json JSONB DEFAULT '{}',
  status VARCHAR(32) NOT NULL DEFAULT 'received',
  github_evidence_url TEXT,
  zapier_run_ref TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (
    status IN ('received', 'dedup_blocked', 'executed', 'failed', 'pending')
  )
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_command_events_trace_id ON command_events(trace_id);
CREATE INDEX IF NOT EXISTS idx_command_events_intent ON command_events(intent);
CREATE INDEX IF NOT EXISTS idx_command_events_status ON command_events(status);
CREATE INDEX IF NOT EXISTS idx_command_events_created_at ON command_events(created_at);

-- Idempotency: query pattern
-- SELECT * FROM command_events
-- WHERE trace_id = $1 AND created_at > NOW() - INTERVAL '24 hours';
