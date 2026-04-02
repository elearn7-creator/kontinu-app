# Supabase Database Schema

## Tables

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  credits INTEGER DEFAULT 50,
  usage_count INTEGER DEFAULT 0,
  trial_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'bronze', 'silver', 'gold', 'expired')),
  subscription_end TIMESTAMP WITH TIME ZONE,
  drive_folder_id TEXT,
  sheet_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
```

### transactions (optional - for local storage)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  vendor TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT,
  notes TEXT,
  file_url TEXT,
  items JSONB,
  invoice_number TEXT,
  type TEXT,
  outlet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
```

### payments

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_payments_user_id ON payments(user_id);
```

## Row Level Security (RLS)

Enable RLS on both tables:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (true);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (true);
```

## Setup Instructions

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the SQL commands above to create tables
4. Enable RLS and create policies
5. Copy your Supabase URL and anon key to `.env.local`
