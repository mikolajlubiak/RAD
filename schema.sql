-- Schema for RAD D1 database
CREATE TABLE IF NOT EXISTS readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  clicks REAL NOT NULL
);

-- Index for faster time-range queries
CREATE INDEX IF NOT EXISTS idx_readings_ts ON readings(ts);

-- Backfill safety: remove duplicate timestamps before enforcing uniqueness.
-- Keeps the earliest inserted row for each timestamp.
DELETE FROM readings
WHERE id NOT IN (
  SELECT MIN(id)
  FROM readings
  GROUP BY ts
);

-- Ensures timestamp-based upserts are deterministic and deduplicated
CREATE UNIQUE INDEX IF NOT EXISTS idx_readings_ts_unique ON readings(ts);
