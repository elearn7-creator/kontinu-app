import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { planName, planCode, price, userId, email } = body;

        if (!planName || !price || !userId || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const xenditSecretKey = process.env.XENDIT_SECRET_KEY;
        if (!xenditSecretKey) {
            return NextResponse.json({ error: 'Xendit not configured' }, { status: 500 });
        }

        // Create Xendit invoice
        const response = await axios.post(
            'https://api.xendit.co/v2/invoices',
            {
                external_id: `kontinu-${userId}-${planCode}-${Date.now()}`,
                amount: price,
                payer_email: email,
                description: `Kontinu ${planName} Plan - Monthly Subscription`,
                invoice_duration: 86400, // 24 hours
                success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
                failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=failed`,
                currency: 'IDR',
                metadata: {
                    user_id: userId,
                    plan_name: planName, // Description
                    plan_code: body.planCode, // raw code e.g. 'bronze'
                },
            },
            {
                auth: {
                    username: xenditSecretKey,
                    password: '',
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return NextResponse.json({ invoiceUrl: response.data.invoice_url });
    } catch (error: any) {
        console.error('Error creating Xendit invoice:', error.response?.data || error);
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
