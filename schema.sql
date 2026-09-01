-- Schema Definition for Kings Heritage Chapel (KHC) Church Management System
-- Database Target: PostgreSQL / Aiven PostgreSQL

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(100) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  date_of_birth DATE,
  join_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'Active',
  role VARCHAR(50) DEFAULT 'Member',
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Giving Records Table
CREATE TABLE IF NOT EXISTS giving_records (
  id VARCHAR(100) PRIMARY KEY,
  member_id VARCHAR(100) REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(100) NOT NULL DEFAULT 'Tithes',
  payment_method VARCHAR(100) DEFAULT 'Cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performant lookups and ordering
CREATE INDEX IF NOT EXISTS idx_members_name ON members (last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_members_email ON members (email);
CREATE INDEX IF NOT EXISTS idx_giving_member_id ON giving_records (member_id);
CREATE INDEX IF NOT EXISTS idx_giving_date ON giving_records (date DESC);

-- 3. Initial Seed Records (Optional: Run in Aiven SQL Query Editor to populate default directory)
INSERT INTO members (id, first_name, last_name, email, phone, address, date_of_birth, join_date, status, role, notes)
VALUES 
  ('elijah-manning-1111', 'Elijah', 'Manning', 'elijah.m@email.com', '024 019 2834', '124 Grace Ave, Graceville', '1982-04-12', '2018-05-10', 'Active', 'Pastor', 'Senior Pastor of KHC. Dedicated to community outreach and youth ministries.'),
  ('sarah-jenkins-2222', 'Sarah', 'Jenkins', 'sarah.j@email.com', '020 021 9876', '45 Redemption St, Graceville', '1990-11-23', '2020-01-15', 'Active', 'Ministry Leader', 'Worship director. Organizes weekly musical rehearsals and audio setup.'),
  ('david-koffi-3333', 'David', 'Koffi', 'david.k@email.com', '055 098 1122', '777 Glory Rd, Graceville', '1975-08-05', '2015-09-01', 'Active', 'Elder', 'Church Board Treasurer. Manages financial logs and regulatory checks.'),
  ('hannah-peterson-4444', 'Hannah', 'Peterson', 'hannah.p@email.com', '027 045 3344', '32 Trinity Lane, Graceville', '1995-02-18', '2022-03-10', 'Active', 'Volunteer', 'Sunday school curriculum developer and assistant teacher.'),
  ('james-ocampo-5555', 'James', 'Ocampo', 'james.o@email.com', '050 012 7788', '89 Hope Blvd, Graceville', '1988-06-30', '2021-08-20', 'Visitor', 'Member', 'Regular attendee looking to transition into a formal ministry volunteer role.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO giving_records (id, member_id, amount, date, category, payment_method, notes)
VALUES 
  ('rec-1', 'elijah-manning-1111', 500.00, CURRENT_DATE - INTERVAL '15 days', 'Tithes', 'Bank Transfer', 'Monthly tithe'),
  ('rec-2', 'elijah-manning-1111', 100.00, CURRENT_DATE - INTERVAL '5 days', 'Missions', 'Online', 'Support for overseas mission trips'),
  ('rec-3', 'sarah-jenkins-2222', 250.00, CURRENT_DATE - INTERVAL '12 days', 'Tithes', 'Online', 'Worship leader tithe'),
  ('rec-4', 'david-koffi-3333', 1000.00, CURRENT_DATE - INTERVAL '20 days', 'Building Fund', 'Check', 'Sanctuary remodeling donation'),
  ('rec-5', 'hannah-peterson-4444', 50.00, CURRENT_DATE - INTERVAL '3 days', 'Offering', 'Cash', 'Sunday morning offering')
ON CONFLICT (id) DO NOTHING;
