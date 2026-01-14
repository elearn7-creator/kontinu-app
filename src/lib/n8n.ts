import axios from 'axios';
import { supabase } from '@/lib/supabase';

// n8n API client calling internal API routes (proxies)
const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface AnalyzedItem {
    itemNumber: number;
    itemName: string;
    quantity: number;
    uom: string;
    amount: number;
}

export interface AnalyzeResponse {
    success: boolean;
    data?: {
        amount: number;
        vendor: string;
        date: string;
        category?: string;
        notes?: string;
        invoiceNumber?: string;
        outlet?: string;
        items?: AnalyzedItem[];
        transactionType?: string;
    };
    error?: string;
}

export interface SaveResponse {
    success: boolean;
    fileUrl?: string;
    error?: string;
}

export interface ReportResponse {
    success: boolean;
    downloadUrl?: string;
    error?: string;
}

export const n8nService = {
    async triggerOnboarding(data: {
        userId: string;
        email: string;
        businessName: string;
        businessAddress: string;
        mobilePhone: string;
    }) {
        try {
            const webhookUrl = process.env.NEXT_PUBLIC_N8N_ONBOARDING_WEBHOOK;
            if (!webhookUrl) throw new Error('Missing n8n Onboarding Webhook URL');

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('n8n Webhook failed');

            const result = await response.json();

            // Update Supabase with the returned IDs
            const { error } = await supabase
                .from('users')
                .update({
                    drive_folder_id: result.invoicesFolderId || result.mainFolderId, // Handle variation
                    sheet_id: result.sheetId
                })
                .eq('clerk_id', data.userId);

            if (error) console.error("Failed to update IDs in Supabase:", error);

            return { success: true, ...result };
        } catch (error) {
            console.error('Onboarding Error:', error);
            return { success: false, error };
        }
    },

    // Analyze document with AI
    async analyzeDocument(file: File): Promise<AnalyzeResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Analyze Document Error:', error);
            if (error.response?.data?.error) {
                return { success: false, error: error.response.data.error };
            }
            return { success: false, error: error.message || 'Failed to analyze document' };
        }
    },

    // Save verified data to Google Sheet & Drive (via n8n)
    async saveEntry(data: {
        userId: string;
        sheetId: string;
        folderId: string;
        file: File | null;
        amount: number;
        vendor: string;
        date: string;
        category?: string;
        notes?: string;
        invoiceNumber?: string;
        outlet?: string;
        items?: AnalyzedItem[];
        type: 'income' | 'expense';
        debit?: number;
        credit?: number;
        journalId?: string;
        author?: string;
        businessName?: string;
    }): Promise<SaveResponse> {
        try {
            const formData = new FormData();

            // Append File if exists
            if (data.file) {
                formData.append('data', data.file);
            }

            // Append all other data as JSON string or individual fields
            // For n8n convenience, individual fields are often better if using Multipart
            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'file' && value !== undefined) {
                    if (typeof value === 'object') {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            const response = await fetch('/api/save', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error: any) {
            console.error('Save Entry Error:', error);
            return { success: false, error: error.message || 'Failed to save entry' };
        }
    },

    // Generate report
    // Now calls internal API route
    async generateReport(data: {
        sheetId: string;
        startDate: string;
        endDate: string;
        format: 'pdf' | 'csv';
    }): Promise<ReportResponse> {
        const response = await apiClient.post(
            '/api/report', // Internal Proxy
            data
        );
        return response.data;
    },

    // Trigger Invoice Webhook
    async triggerInvoice(data: {
        email: string;
        name: string;
        plan: string;
        amount: number;
        date: string;
        paymentId: string;
        cycle?: 'monthly' | 'annual';
    }): Promise<void> {
        try {
            // This is likely server-side too (Xendit webhook or check-payment API)
            // Logic: src/app/api/check-payment calls this? No, check-payment calls triggerInvoice.
            // check-payment is an API route (server). So direct call is OK.
            // But consistency is good.
            // For now, assume triggerInvoice is server-side.
            const n8nUrl = process.env.NEXT_PUBLIC_N8N_INVOICE_WEBHOOK || 'https://primary-production-4705.up.railway.app/webhook/generate-invoice';
            // Hardcoding or env? The user had a webhook.
            // I'll assume usage of existing axios/client is fine if server-side.
            // But wait, n8nClient was defined at top with base URL? No, it wasn't.
            // Previous code: n8nClient.post('/generate-invoice', ...) 
            // That implied n8nClient had a baseURL set? 
            // Let's check the previous file content again.
            // "const n8nClient = axios.create..." - no baseURL.
            // So '/generate-invoice' would have failed if it was relative to... nothing? 
            // Ah, previous code: await n8nClient.post('/generate-invoice', data);
            // If no baseURL, this hits http://localhost:3000/generate-invoice? No.
            // This method might have been broken or I missed the env var usage.
            // I will use absolute URL from env if available or fix it.
            // But let's not break it if it wasn't broken.
            // Effectively, for invoice, I'll direct it to the full URL.

            await axios.post(n8nUrl, data);
        } catch (error) {
            console.error('Error triggering invoice webhook:', error);
        }
    }
};
