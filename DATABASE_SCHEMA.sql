-- Database Schema: HUT IBI Activity Management
-- Location: Supabase (PostgreSQL)

-- 1. Profiles & Authentication
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('Admin', 'Panitia')) DEFAULT 'Panitia',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Events & Activities
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    location TEXT,
    status TEXT CHECK (status IN ('Planned', 'On Progress', 'Completed')) DEFAULT 'Planned',
    pic_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Committees (Kepanitiaan)
CREATE TABLE committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    division TEXT NOT NULL,
    phone TEXT,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL
);

-- 4. Financial Management (RKA & Realisasi)
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    pagu_budget DECIMAL(15, 2) NOT NULL DEFAULT 0
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Sponsorship', 'Konsumsi', 'Perlengkapan'
    amount DECIMAL(15, 2) NOT NULL,
    note TEXT,
    proof_url TEXT, -- Link to uploaded receipts/docs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- 5. Documentation & Gallery
CREATE TABLE galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES profiles(id)
);
