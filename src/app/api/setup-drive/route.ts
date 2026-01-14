import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { googleService } from '@/lib/google';
import { supabase } from '@/lib/supabase';

export async function POST() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) {
            return new NextResponse('No email found', { status: 400 });
        }

        console.log(`Starting Google Drive setup for user: ${userId} (${email})`);

        // 1. Call Google Service to create folders and sheet
        const resources = await googleService.setupOnboarding(userId, email);

        console.log('Google Resources created:', resources);

        // 2. Update Supabase
        const { error } = await supabase
            .from('users')
            .update({
                drive_folder_id: resources.invoicesFolderId,
                sheet_id: resources.sheetId
            })
            .eq('clerk_id', userId);

        if (error) {
            console.error('Failed to update Supabase:', error);
            return new NextResponse('Database Update Failed', { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: resources
        });

    } catch (error: any) {
        console.error('Setup Drive Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
