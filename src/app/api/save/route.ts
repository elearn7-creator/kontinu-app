import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const n8nUrl = process.env.NEXT_PUBLIC_N8N_SAVE_WEBHOOK;

        // 1. Extract and Save to Supabase (Primary Database)
        const userId = formData.get('userId') as string;
        const amountStr = formData.get('amount') as string;
        const amount = parseFloat(amountStr);
        const vendor = formData.get('vendor') as string;
        const date = formData.get('date') as string;
        const category = formData.get('category') as string;
        const notes = formData.get('notes') as string;
        const itemsRaw = formData.get('items') as string;
        const invoiceNumber = formData.get('invoiceNumber') as string;
        const type = formData.get('type') as string;
        const outlet = formData.get('outlet') as string;

        console.log('--- Save API Request ---');
        console.log('UserID:', userId);
        console.log('Amount:', amount, '(from:', amountStr, ')');
        console.log('Vendor:', vendor);
        console.log('Date:', date);

        if (isNaN(amount)) {
            console.error('Invalid amount received:', amountStr);
            return NextResponse.json({ success: false, error: 'Invalid amount value' }, { status: 400 });
        }

        let items: any[] = [];
        try {
            if (itemsRaw) items = JSON.parse(itemsRaw);
        } catch (e) {
            console.warn('Failed to parse items from formData');
        }

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
        }

        // 1. Extract and Save to Supabase (Primary Database)
        // Get internal user ID from clerk_id
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (userError || !userData) {
            console.error('User not found in Supabase:', userId, userError);
            return NextResponse.json({
                success: false,
                error: 'Account record not found. Please complete onboarding or refresh.',
                details: userError?.message
            }, { status: 404 });
        }

        const { error: dbError } = await supabase
            .from('transactions')
            .insert({
                user_id: userData.id,
                amount,
                vendor,
                date,
                category: category || (type === 'income' ? 'Income' : 'Expense'),
                notes,
                items,
                invoice_number: invoiceNumber,
                type,
                outlet
            });

        if (dbError) {
            console.error('Supabase DB Insert Error:', dbError);
            return NextResponse.json({
                success: false,
                error: 'Database save failed',
                details: dbError.message
            }, { status: 500 });
        }

        console.log('✅ Transaction saved to Supabase');

        // 2. Forward to n8n (Backup/Sheets Integration)
        if (!n8nUrl) {
            // If n8n not configured, we still return success because Supabase worked
            return NextResponse.json({
                success: true,
                message: 'Saved to Supabase. Google Sheets integration (n8n) skipped (missing URL).'
            });
        }

        const response = await fetch(n8nUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            console.error(`N8N responded with ${response.status}`);
            // Still returning success because Supabase worked
            return NextResponse.json({
                success: true,
                warning: 'n8n integration failed, but data saved to Supabase'
            });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Save API Proxy Error:', error);
        return NextResponse.json({
            success: false,
            error: `Server Error: ${error.message}`,
        }, { status: 500 });
    }
}
