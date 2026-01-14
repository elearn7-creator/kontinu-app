import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const xenditSecretKey = process.env.XENDIT_SECRET_KEY;
        if (!xenditSecretKey) {
            return NextResponse.json({ error: 'Xendit not configured' }, { status: 500 });
        }

        // 1. Fetch Invoices from Xendit
        // Filter by external_id prefix matching the user
        // Note: Xendit API doesn't support 'contains' filter on external_id easily via list params
        // But we can filter by status='PAID' and client-side filter
        const response = await axios.get('https://api.xendit.co/v2/invoices', {
            params: {
                status: 'PAID',
                limit: 20, // Check last 20 paid invoices
            },
            auth: {
                username: xenditSecretKey,
                password: '',
            },
        });

        const invoices = response.data;

        // Find the latest invoice for this user
        // external_id format: kontinu-{userId}-{timestamp}
        const userInvoice = invoices.find((inv: any) =>
            inv.external_id.startsWith(`kontinu-${userId}`) &&
            inv.status === 'PAID'
        );

        if (!userInvoice) {
            return NextResponse.json({ message: 'No new paid invoice found' });
        }

        // 2. Check if already processed
        // Logic: Checks if subscription_end is already consistent with this payment
        // (Assuming 30 days period)
        const paidAt = new Date(userInvoice.paid_at);
        const expectedEnd = new Date(paidAt);
        expectedEnd.setDate(expectedEnd.getDate() + 30);

        // Get current user data
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Robust check: 
        // If current subscription_end is close to expectedEnd (within 1 day), assume processed.
        const currentEnd = user.subscription_end ? new Date(user.subscription_end) : new Date(0);
        const diffTime = Math.abs(currentEnd.getTime() - expectedEnd.getTime());
        const oneDay = 1000 * 60 * 60 * 24;

        if (diffTime < oneDay) {
            return NextResponse.json({ message: 'Payment already processed' });
        }

        // 3. Update User
        // Determine credits based on plan (metadata or amount)
        // Since we didn't store plan in external_id securely, we trust the metadata or infer from amount
        // But metadata might not be searchable.
        // Let's use amount.
        let addedCredits = 0;
        let planName = 'unknown';

        if (userInvoice.amount === 10000) {
            addedCredits = 100;
            planName = 'bronze';
        } else if (userInvoice.amount === 25000) {
            addedCredits = 300;
            planName = 'silver';
        } else if (userInvoice.amount === 45000) {
            addedCredits = 600;
            planName = 'gold';
        }

        // Reset usage count on new subscription? Or just add credits?
        // Usually reset usage, set credits to plan limit.

        // ... existing update logic ...

        await supabase
            .from('users')
            .update({
                credits: addedCredits,
                usage_count: 0,
                subscription_status: planName,
                subscription_end: expectedEnd.toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('clerk_id', userId);

        // 4. Record Payment
        const { data: paymentRecord, error: payError } = await supabase
            .from('payments')
            .insert({
                user_id: user.id,
                amount: userInvoice.amount,
                plan: planName,
                status: 'PAID',
                external_id: userInvoice.external_id,
                payment_method: 'XENDIT',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (payError) {
            console.error('Error saving payment record:', payError);
        }

        // 5. Trigger n8n Invoice
        const userEmail = userInvoice.payer_email || user.email;

        try {
            // Import n8nService dynamically
            const { n8nService } = await import('@/lib/n8n');
            await n8nService.triggerInvoice({
                email: userEmail,
                name: `User ${userId}`,
                plan: planName,
                amount: userInvoice.amount,
                date: new Date().toISOString(),
                paymentId: paymentRecord?.id || userInvoice.external_id
            });
        } catch (e) {
            console.error('n8n error:', e);
        }

        return NextResponse.json({
            success: true,
            message: `Upgraded to ${planName}`,
            credits: addedCredits
        });

    } catch (error: any) {
        console.error('Check payment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
