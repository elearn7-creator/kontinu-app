import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const n8nUrl = process.env.NEXT_PUBLIC_N8N_ANALYZE_WEBHOOK;

        if (!n8nUrl) {
            console.error('Missing env var: NEXT_PUBLIC_N8N_ANALYZE_WEBHOOK');
            return NextResponse.json({ success: false, error: 'Configuration Error: Missing Webhook URL' }, { status: 500 });
        }

        const response = await fetch(n8nUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`N8N responded with ${response.status}`);
        }

        const rawData = await response.json();

        // --- Transformation Logic ---
        let transformedData = {
            amount: 0,
            vendor: 'Unknown Vendor',
            date: new Date().toISOString().split('T')[0],
            category: '',
            notes: '',
            invoiceNumber: '',
            outlet: '',
            items: [] as any[],
            transactionType: ''
        };

        if (Array.isArray(rawData) && rawData.length > 0) {
            // 1. Calculate Total Amount
            const totalAmount = rawData.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);

            // 2. Extract Header Info (Vendor, Date, Invoice No)
            const mainItem = rawData[0];
            const vendorName = mainItem.bankAccountName || (mainItem.brand !== 'UNKNOWN' ? mainItem.brand : '') || mainItem.outlet || 'Unknown Vendor';
            const invoiceNumber = mainItem.invoiceNumber || '';
            const outlet = mainItem.outlet || '';
            const transactionType = mainItem.transactionType || '';

            // 3. Extract Date (Parse DD/MM/YYYY to YYYY-MM-DD)
            let formattedDate = new Date().toISOString().split('T')[0];
            if (mainItem.journalDate) {
                const parts = mainItem.journalDate.split('/');
                if (parts.length === 3) {
                    // parts[0] = DD, parts[1] = MM, parts[2] = YYYY
                    formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }

            // 4. Map Items
            const items = rawData.map((item: any) => ({
                itemNumber: item.itemNumber || 0,
                itemName: item.itemName || 'Unknown Item',
                quantity: item.quantity || 1,
                uom: item.uom || 'unit',
                amount: Number(item.amount) || 0
            }));

            // 5. Notes (Concatenate items for backward compatibility/summary)
            const itemNotes = items
                .map((item: any) => `${item.itemName} (${item.quantity} ${item.uom})`)
                .join(', ');

            transformedData = {
                amount: totalAmount,
                vendor: vendorName,
                date: formattedDate,
                category: mainItem.transactionType || mainItem.recordType || 'Expense',
                notes: itemNotes,
                invoiceNumber,
                outlet,
                items,
                transactionType
            };

        } else if (typeof rawData === 'object' && rawData !== null) {
            // Single object fallback
            transformedData = {
                amount: Number(rawData.amount) || 0,
                vendor: rawData.vendor || rawData.bankAccountName || 'Unknown',
                date: rawData.date || new Date().toISOString().split('T')[0],
                category: rawData.category || '',
                notes: rawData.notes || '',
                invoiceNumber: rawData.invoiceNumber || '',
                outlet: rawData.outlet || '',
                items: [],
                transactionType: rawData.transactionType || ''
            };
        }

        return NextResponse.json({
            success: true,
            data: transformedData
        });

    } catch (error: any) {
        console.error('Proxy Error Details:', error);
        const errorMessage = error.message || 'Unknown error';
        return NextResponse.json({
            success: false,
            error: `Server Error: ${errorMessage}`,
            details: error.toString()
        }, { status: 500 });
    }
}
