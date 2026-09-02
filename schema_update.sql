-- Database Index & Performance Migration for Kings Heritage Chapel (KHC)
-- Database Target: Aiven PostgreSQL

-- 1. Search index on members full name
CREATE INDEX IF NOT EXISTS idx_members_full_name ON members (first_name, last_name);

-- 2. Performance indexes for monthly giving queries and aggregations
CREATE INDEX IF NOT EXISTS idx_giving_member_date ON giving_records (member_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_giving_member_category ON giving_records (member_id, category);

-- 3. Composite index for duplicate detection on email and phone
CREATE INDEX IF NOT EXISTS idx_members_phone ON members (phone);

-- 4. Make email column optional
ALTER TABLE members ALTER COLUMN email DROP NOT NULL;
