import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const n8nUrl = process.env.NEXT_PUBLIC_N8N_REPORT_WEBHOOK;

        if (!n8nUrl) {
            return NextResponse.json({ success: false, error: 'Configuration Error' }, { status: 500 });
        }

        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`N8N responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate report' }, { status: 500 });
    }
}
