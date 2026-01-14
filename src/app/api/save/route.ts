import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const n8nUrl = process.env.NEXT_PUBLIC_N8N_SAVE_WEBHOOK;

        if (!n8nUrl) {
            console.error('Missing env var: NEXT_PUBLIC_N8N_SAVE_WEBHOOK');
            return NextResponse.json({ success: false, error: 'Configuration Error: Missing Webhook URL' }, { status: 500 });
        }

        const response = await fetch(n8nUrl, {
            method: 'POST',
            body: formData, // Forward the multipart form data directly
        });

        if (!response.ok) {
            throw new Error(`N8N responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Proxy Error Details:', error);
        return NextResponse.json({
            success: false,
            error: `Server Error: ${error.message}`,
            details: error.toString()
        }, { status: 500 });
    }
}
