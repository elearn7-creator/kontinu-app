const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length > 1) env[parts[0].trim()] = parts[1].trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- Database Diagnostic ---');
    
    // 1. Check a sample transaction
    const { data: row, error: rowError } = await supabase.from('transactions').select('*').limit(1);
    if (rowError) {
        console.error('Error fetching sample row:', rowError);
    } else {
        console.log('Sample Row Found:', !!row[0]);
        if (row[0]) {
            console.log('Column Names:', Object.keys(row[0]));
        }
    }
    
    // 2. Try a "Dry Run" insertion
    const { data: userData } = await supabase.from('users').select('id').limit(1).single();
    if (!userData) {
        console.log('No users found in database');
        return;
    }
    
    console.log('Test inserting for user ID:', userData.id);
    const testData = {
        user_id: userData.id,
        amount: 99.99,
        vendor: 'DIAGNOSTIC TEST',
        date: new Date().toISOString().split('T')[0],
        category: 'Test',
        type: 'expense'
    };
    
    const { data: insertResult, error: insertError } = await supabase
        .from('transactions')
        .insert(testData)
        .select();
        
    if (insertError) {
        console.error('❌ Insert FAILED:', insertError.message);
        console.error('Error Details:', insertError);
    } else {
        console.log('✅ Insert SUCCESSFUL:', insertResult[0].id);
        // Delete it immediately
        await supabase.from('transactions').delete().eq('id', insertResult[0].id);
        console.log('🗑️ Test row cleaned up.');
    }
}

check();
