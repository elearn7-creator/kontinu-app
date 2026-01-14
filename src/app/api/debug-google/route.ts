import { NextResponse } from 'next/server';
import { googleService } from '@/lib/google';
import { google } from 'googleapis';

export async function GET() {
    const results: any = {
        credentials_check: false,
        drive_check: false,
        sheets_check: false,
        logs: []
    };

    try {
        // 1. Check Credentials
        if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            results.credentials_check = true;
            results.logs.push(`Client Email: ${process.env.GOOGLE_CLIENT_EMAIL}`);
            results.logs.push(`Private Key Length: ${process.env.GOOGLE_PRIVATE_KEY.length}`);
        } else {
            throw new Error("Missing credentials in .env.local");
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
        });

        const drive = google.drive({ version: 'v3', auth });
        const sheets = google.sheets({ version: 'v4', auth });

        // 2. Test Drive (Create Folder)
        results.logs.push("Attempting to create generic folder...");
        const folder = await drive.files.create({
            requestBody: {
                name: 'Kontinu Debug Folder',
                mimeType: 'application/vnd.google-apps.folder'
            }
        });
        results.drive_check = true;
        results.logs.push(`Folder created: ${folder.data.id}`);

        // 3. Test Sheets (Create Sheet)
        results.logs.push("Attempting to create generic spreadsheet...");
        const sheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: { title: 'Kontinu Debug Sheet' }
            }
        });
        results.sheets_check = true;
        results.logs.push(`Sheet created: ${sheet.data.spreadsheetId}`);

        // Cleanup (optional, but polite)
        // await drive.files.delete({ fileId: folder.data.id! });
        // await drive.files.delete({ fileId: sheet.data.spreadsheetId! });

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('Debug failed:', error);
        return NextResponse.json({
            success: false,
            results,
            error: {
                message: error.message,
                code: error.code || error.status,
                details: error.errors || error.response?.data
            }
        }, { status: 500 });
    }
}
