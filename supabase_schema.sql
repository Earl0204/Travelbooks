-- ==========================================
-- TRAVELBOOKS PH DATABASE SCHEMA
-- Copy and paste this script into your Supabase SQL Editor
-- ==========================================

-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  fb_link VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(100),
  destination VARCHAR(255) NOT NULL,
  travel_dates VARCHAR(255),
  pax INTEGER DEFAULT 1,
  total_amount NUMERIC(12, 2) DEFAULT 0.00,
  amount_paid NUMERIC(12, 2) DEFAULT 0.00,
  balance NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at DATE DEFAULT CURRENT_DATE
);

-- Index for booking lookups
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_client_name ON bookings(client_name);

-- 2. Tasks Table (Kanban Board)
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  booking_ref VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'todo',
  due_date DATE,
  created_at DATE DEFAULT CURRENT_DATE
);

-- Index for task lookups
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_booking_ref ON tasks(booking_ref);

-- 3. Conversations Table (Messenger Hub)
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unread BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'Ready',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id VARCHAR(50) REFERENCES conversations(id) ON DELETE CASCADE,
  sender VARCHAR(50) NOT NULL, -- 'client' or 'agent'
  text TEXT NOT NULL,
  timestamp_label VARCHAR(50), -- e.g. "10:30 AM" for UI alignment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Optional Row Level Security (RLS) Setup
-- Since this is an admin-only tool, you can enable RLS and write policies 
-- that restrict read/write operations to authenticated users.
-- For example:
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated users access to bookings" ON bookings TO authenticated USING (true) WITH CHECK (true);
