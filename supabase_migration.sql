-- Add business details columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS mobile_phone TEXT;
