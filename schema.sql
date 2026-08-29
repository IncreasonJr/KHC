-- Database schema for KHC - Church Management System
-- Run this in your Supabase SQL Editor to set up tables

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    date_of_birth DATE,
    join_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Visitor', 'Archived')),
    role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Member', 'Pastor', 'Elder', 'Deacon', 'Ministry Leader', 'Volunteer', 'Staff')),
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. GIVING/FINANCIAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.giving_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    category TEXT NOT NULL DEFAULT 'Tithes' CHECK (category IN ('Tithes', 'Offering', 'Building Fund', 'Missions', 'Charity', 'Special Event', 'Other')),
    payment_method TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Check', 'Bank Transfer', 'Online', 'Card')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS (Row Level Security) on tables
-- Since we are building a single-admin system, you can define standard RLS policies, 
-- or for starting simple, configure authenticated/service role access.
-- Here we'll configure RLS to allow read/write access to authenticated users.

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giving_records ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for authorized client access (anon keys can access if configured, 
-- but in production we restrict to authenticated admin users).
CREATE POLICY "Allow read access to everyone" ON public.members 
    FOR SELECT USING (true);

CREATE POLICY "Allow write access to everyone" ON public.members 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access to everyone" ON public.giving_records 
    FOR SELECT USING (true);

CREATE POLICY "Allow write access to everyone" ON public.giving_records 
    FOR ALL USING (true) WITH CHECK (true);

-- Trigger to auto-update the updated_at timestamp on members
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_member_update
    BEFORE UPDATE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert Sample Dummy Data for testing
INSERT INTO public.members (first_name, last_name, email, phone, address, date_of_birth, join_date, status, role, notes)
VALUES
('Elijah', 'Manning', 'elijah.m@email.com', '(555) 019-2834', '124 Grace Ave, Graceville', '1982-04-12', '2018-05-10', 'Active', 'Pastor', 'Senior Pastor of KHC'),
('Sarah', 'Jenkins', 'sarah.j@email.com', '(555) 021-9876', '45 Redemption St, Graceville', '1990-11-23', '2020-01-15', 'Active', 'Ministry Leader', 'Worship team lead'),
('David', 'Koffi', 'david.k@email.com', '(555) 098-1122', '777 Glory Rd, Graceville', '1975-08-05', '2015-09-01', 'Active', 'Elder', 'Church treasurer'),
('Hannah', 'Peterson', 'hannah.p@email.com', '(555) 045-3344', '32 Trinity Lane, Graceville', '1995-02-18', '2022-03-10', 'Active', 'Volunteer', 'Sunday school helper'),
('James', 'Ocampo', 'james.o@email.com', '(555) 012-7788', '89 Hope Blvd, Graceville', '1988-06-30', '2021-08-20', 'Visitor', 'Member', 'Regular visitor looking to join formally');

-- Insert Sample Giving Records matching Elijah and Sarah
-- Elijah giving (first entry in members)
INSERT INTO public.giving_records (member_id, amount, date, category, payment_method, notes)
SELECT id, 500.00, CURRENT_DATE - INTERVAL '15 days', 'Tithes', 'Bank Transfer', 'Monthly Tithe'
FROM public.members WHERE email = 'elijah.m@email.com';

INSERT INTO public.giving_records (member_id, amount, date, category, payment_method, notes)
SELECT id, 100.00, CURRENT_DATE - INTERVAL '5 days', 'Missions', 'Online', 'Missions fund'
FROM public.members WHERE email = 'elijah.m@email.com';

-- Sarah giving
INSERT INTO public.giving_records (member_id, amount, date, category, payment_method, notes)
SELECT id, 250.00, CURRENT_DATE - INTERVAL '12 days', 'Tithes', 'Online', 'Tithe'
FROM public.members WHERE email = 'sarah.j@email.com';

-- David giving
INSERT INTO public.giving_records (member_id, amount, date, category, payment_method, notes)
SELECT id, 1000.00, CURRENT_DATE - INTERVAL '20 days', 'Building Fund', 'Check', 'Building campaign contribution'
FROM public.members WHERE email = 'david.k@email.com';
