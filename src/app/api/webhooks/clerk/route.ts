import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { googleService } from '@/lib/google';

export async function POST(req: NextRequest) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400,
        });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as any;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', {
            status: 400,
        });
    }

    const eventType = evt.type;

    if (eventType === 'user.created') {
        const { id, email_addresses } = evt.data;
        const email = email_addresses[0]?.email_address;

        try {
            // Calculate trial period (14 days)
            const trialStart = new Date();
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 14);

            // Create user in Supabase
            const { data: user, error } = await supabase
                .from('users')
                .insert({
                    clerk_id: id,
                    email: email,
                    credits: 50,
                    usage_count: 0,
                    trial_start: trialStart.toISOString(),
                    trial_end: trialEnd.toISOString(),
                    subscription_status: 'trial',
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating user:', error);
                return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
            }

            /* 
            // NATIVE GOOGLE SETUP DISABLED
            // We now use OnboardingWizard + n8n webhook on the client side.
            try {
                // Trigger Native Google Setup
                console.log(`Setting up Google Drive for ${id}`);
                const resources = await googleService.setupOnboarding(id, email);

                // Update Supabase with resources
                if (resources) {
                    await supabase
                        .from('users')
                        .update({
                            sheet_id: resources.sheetId,
                            drive_folder_id: resources.invoicesFolderId
                        })
                        .eq('clerk_id', id);
                    console.log('Google resources created and linked');
                }
            } catch (setupError) {
                console.error('Failed to setup Google resources:', setupError);
            }
            */

            // Just return success after creating user in DB
            return NextResponse.json({ success: true, user });

            return NextResponse.json({ success: true, user });
        } catch (error) {
            console.error('Error in webhook handler:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    }

    return NextResponse.json({ success: true });
}
