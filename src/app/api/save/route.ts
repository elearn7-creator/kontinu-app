import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    console.log('--- 🚀 START Save API ---');
    try {
        const formData = await request.formData();
        const n8nUrl = process.env.NEXT_PUBLIC_N8N_SAVE_WEBHOOK;

        // Extract fields
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

        console.log('📦 PAYLOAD:', { 
            userId, amount, vendor, date, category, notes, 
            hasItems: !!itemsRaw, invoiceNumber, type, outlet 
        });

        if (isNaN(amount)) {
            console.error('❌ DISQUALIFIED: Invalid amount received:', amountStr);
            return NextResponse.json({ success: false, error: 'Invalid amount value' }, { status: 400 });
        }

        if (!userId) {
            console.error('❌ DISQUALIFIED: Missing userId');
            return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
        }

        if (!date) {
            console.error('❌ DISQUALIFIED: Missing date');
            return NextResponse.json({ success: false, error: 'Missing date (required for database)' }, { status: 400 });
        }

        let items: any[] = [];
        try {
            if (itemsRaw) items = JSON.parse(itemsRaw);
        } catch (e) {
            console.warn('⚠️ WARNING: Failed to parse items from formData');
        }

        // 1. Get internal user ID from clerk_id
        console.log('🔍 Looking up user:', userId);
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (userError || !userData) {
            console.error('❌ ERROR: User lookup failed:', userId, userError);
            return NextResponse.json({
                success: false,
                error: 'Account record not found. Please complete onboarding or refresh.',
                details: userError?.message
            }, { status: 404 });
        }

        console.log('✅ Found internal ID:', userData.id);

        // 2. Insert into Supabase
        console.log('💾 Inserting into Supabase...');
        const insertData = {
            user_id: userData.id,
            amount,
            vendor: vendor || 'Unknown',
            date,
            category: category || (type === 'income' ? 'Income' : 'Expense'),
            notes: notes || '',
            items,
            invoice_number: invoiceNumber || '',
            type: type || 'expense',
            outlet: outlet || ''
        };

        const { error: dbError } = await supabase
            .from('transactions')
            .insert(insertData);

        if (dbError) {
            console.error('❌ DATABASE ERROR:', dbError);
            return NextResponse.json({
                success: false,
                error: 'Database save failed',
                details: dbError.message,
                hint: dbError.hint,
                code: dbError.code
            }, { status: 500 });
        }

        console.log('✅ Supabase success!');

        // 3. Forward to n8n
        if (!n8nUrl) {
            console.log('ℹ️ n8n integration skipped (URL not configured)');
            return NextResponse.json({
                success: true,
                message: 'Saved to Supabase. Google Sheets integration (n8n) skipped.'
            });
        }

        try {
            console.log('📤 Forwarding to n8n:', n8nUrl);
            const n8nResponse = await fetch(n8nUrl, {
                method: 'POST',
                body: formData,
            });

            if (!n8nResponse.ok) {
                const errorText = await n8nResponse.text();
                console.error(`❌ N8N ERROR (${n8nResponse.status}):`, errorText);
                return NextResponse.json({
                    success: true,
                    warning: 'n8n integration failed, but data saved to Supabase',
                    n8n_status: n8nResponse.status,
                    n8n_error: errorText
                });
            }

            const n8nData = await n8nResponse.json();
            console.log('✅ N8N Success:', n8nData);

            return NextResponse.json({
                ...n8nData,
                success: true,
                database: 'saved'
            });
        } catch (n8nError: any) {
            console.error('⚠️ FORWARDING FAILED:', n8nError.message);
            return NextResponse.json({
                success: true,
                warning: 'Internal record saved, but integration failed.',
                details: n8nError.message
            });
        }
    } catch (error: any) {
        console.error('🛑 CRITICAL SERVER ERROR:', error);
        return NextResponse.json({
            success: false,
            error: 'Server Error',
            details: error.message,
        }, { status: 500 });
    }
}
