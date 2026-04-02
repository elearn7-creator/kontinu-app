import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
    id: string;
    clerk_id: string;
    email: string;
    credits: number;
    usage_count: number;
    trial_start: string;
    trial_end: string;
    subscription_status: 'trial' | 'bronze' | 'silver' | 'gold' | 'expired';
    subscription_end?: string;
    drive_folder_id?: string;
    sheet_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    vendor: string;
    date: string;
    category?: string;
    notes?: string;
    file_url?: string;
    items?: any[];
    invoice_number?: string;
    type?: string;
    outlet?: string;
    created_at: string;
}
