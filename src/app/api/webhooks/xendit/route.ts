import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-callback-token');

        console.log('📩 Xendit Webhook Received:');
        console.log('Signature:', signature);
        console.log('Body:', body);

        // Verify webhook signature
        const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
        if (webhookToken && signature !== webhookToken) {
            console.error('❌ Invalid signature. Expected:', webhookToken, 'Received:', signature);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const data = JSON.parse(body);
        console.log('Event type:', data.event || 'No event field (probably invoice)');
        console.log('Parsed data status:', data.status);
        console.log('Metadata:', data.metadata);

        // Reject non-invoice events
        if (data.event && !data.event.startsWith('invoice.')) {
            console.warn(`⚠️ Received non-invoice event: ${data.event} - Ignoring`);
            return NextResponse.json({
                success: true,
                message: `Event ${data.event} ignored - only invoice events are processed`
            });
        }

        // Check if payment is successful (PAID or SETTLED for invoices)
        if (data.status === 'PAID' || data.status === 'SETTLED') {
            // Parse external_id to extract user info
            // Format: kontinu-{userId}-{planCode}-{timestamp}
            const externalId = data.external_id;
            console.log('External ID:', externalId);

            if (!externalId || !externalId.startsWith('kontinu-')) {
                console.error('❌ Invalid external_id format:', externalId);
                return NextResponse.json({ error: 'Invalid external_id' }, { status: 400 });
            }

            // Parse: kontinu-user_xxx-bronze-1234567890
            const parts = externalId.split('-');
            if (parts.length < 4) {
                console.error('❌ External ID missing parts:', parts);
                return NextResponse.json({ error: 'Malformed external_id' }, { status: 400 });
            }

            // Reconstruct userId (might have hyphens in it, e.g., user_2abc-def)
            // Last part is timestamp, second-to-last is planCode
            const timestamp = parts[parts.length - 1];
            const planCode = parts[parts.length - 2]; // bronze, silver, gold
            const userId = parts.slice(1, parts.length - 2).join('-'); // Everything between 'kontinu' and planCode

            console.log('Parsed - User ID:', userId, 'Plan Code:', planCode);

            if (!userId || !planCode) {
                console.error('❌ Failed to parse user_id or plan_code from external_id');
                return NextResponse.json({ error: 'Missing user or plan data' }, { status: 400 });
            }

            // Determine credits based on plan (Updated values)
            // 'bronze', 'silver', 'gold'
            const creditsMap: Record<string, number> = {
                bronze: 100,
                silver: 250,
                gold: 500,
            };

            const credits = creditsMap[planCode] || 10; // Default to 10 (Free) if unknown

            // Calculate subscription end date (30 days from now)
            const subscriptionEnd = new Date();
            subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

            // Update user in Supabase
            const { error } = await supabase
                .from('users')
                .update({
                    subscription_status: planCode,
                    subscription_end: subscriptionEnd.toISOString(),
                    credits: credits,
                    usage_count: 0, // Reset usage count
                })
                .eq('clerk_id', userId);

            if (error) {
                console.error('❌ Error updating user subscription:', error);
                return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
            }

            console.log(`✅ Successfully updated user ${userId} with ${credits} credits (plan: ${planCode})`);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: true, message: 'Payment not completed' });
    } catch (error) {
        console.error('Error processing Xendit webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
