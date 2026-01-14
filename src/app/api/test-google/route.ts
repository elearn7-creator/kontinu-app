import { NextResponse } from 'next/server';
import { googleService } from '@/lib/google';

export async function GET() {
    try {
        console.log('Testing Google Service...');

        // Try to create a simple folder as a test
        const testFolderId = await googleService.createFolder('Kontinu Test Folder');

        console.log('Test folder created successfully:', testFolderId);

        return NextResponse.json({
            success: true,
            message: 'Google Service is working!',
            testFolderId
        });
    } catch (error: any) {
        console.error('Google Service Test Failed:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            status: error.status,
            errors: error.errors
        });

        return NextResponse.json({
            success: false,
            error: error.message,
            details: {
                code: error.code,
                status: error.status,
                errors: error.errors
            }
        }, { status: 500 });
    }
}
