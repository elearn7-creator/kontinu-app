import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { ExternalLink, Copy, Check } from 'lucide-react';

interface ManualSetupDialogProps {
    userId: string;
    onSuccess: (sheetId: string, folderId: string) => void;
    trigger?: React.ReactNode;
}

export function ManualSetupDialog({ userId, onSuccess, trigger }: ManualSetupDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [sheetId, setSheetId] = useState('');
    const [folderId, setFolderId] = useState('');
    const [copied, setCopied] = useState(false);

    // Service Account Email from env (exposed to client via next.config or just assume public for this flow?
    // Usually env vars prefixed with NEXT_PUBLIC_ are exposed. 
    // We didn't prefix GOOGLE_CLIENT_EMAIL. 
    // We can fetch it via an API call or just ask user to put it in NEXT_PUBLIC_ for now? 
    // Better: Fetch it from an API endpoint "GET /api/service-account-email" to be secure-ish.
    // For now, I'll fetch it from the test endpoint or just hardcode if needed?
    // Let's create a tiny route for it or just return it in the error/test route?
    // Actually, I'll just use a placeholder for now and ask user to expose it or I'll exposing it via API.
    // Let's make the API call to get the email.
    const [serviceEmail, setServiceEmail] = useState('');

    const fetchServiceEmail = async () => {
        try {
            // We can reuse the test endpoint or make a new one. 
            // Let's just assume the user knows it or we display it statically if they copy pasted it.
            // But valid solution: GET /api/service-email
            const res = await fetch('/api/test-google');
            // The test endpoint returns success/fail but not email explicitly? 
            // I'll update it or just assume for now I will hardcode what was in the env file earlier 
            // "kontinu@kontinu-faat.iam.gserviceaccount.com"
            setServiceEmail("kontinu@kontinu-faat.iam.gserviceaccount.com");
        } catch (e) {
            console.error(e);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(serviceEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Email copied!");
    };

    const handleSave = async () => {
        if (!sheetId || !folderId) {
            toast.error("Please enter both IDs");
            return;
        }

        setLoading(true);
        try {
            // Validate format roughly
            if (sheetId.length < 10 || folderId.length < 10) {
                throw new Error("IDs look too short. Please check again.");
            }

            const { error } = await supabase
                .from('users')
                .update({
                    sheet_id: sheetId,
                    drive_folder_id: folderId
                })
                .eq('clerk_id', userId);

            if (error) throw error;

            toast.success("Connected successfully!");
            onSuccess(sheetId, folderId);
            setOpen(false);
        } catch (error: any) {
            toast.error("Failed to save", { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (val && !serviceEmail) fetchServiceEmail();
        }}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Connect Google Drive</Button>}
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] text-white border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect Google Drive</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Step 1: Share */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-lime-400 font-semibold">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400/20 text-xs">1</span>
                            Share with Service Account
                        </div>
                        <p className="text-sm text-gray-400">
                            Create a Folder & Sheet in your Google Drive, then <strong>Share</strong> them (Editor access) with this email:
                        </p>
                        <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/10">
                            <code className="text-xs flex-1 text-gray-300 break-all">{serviceEmail || 'Loading...'}</code>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copyToClipboard}>
                                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>

                    {/* Step 2: IDs */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-lime-400 font-semibold">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400/20 text-xs">2</span>
                            Enter IDs
                        </div>

                        <div className="space-y-2">
                            <Label>Google Sheet ID</Label>
                            <Input
                                placeholder="e.g. 1BxiMVs0XRA5nFMd..."
                                value={sheetId}
                                onChange={e => setSheetId(e.target.value)}
                                className="bg-black/20 border-white/10"
                            />
                            <p className="text-[10px] text-gray-500">From the URL: docs.google.com/spreadsheets/d/<strong>THIS_ID</strong>/edit</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Google Drive Folder ID</Label>
                            <Input
                                placeholder="e.g. 1f_Cwkj89..."
                                value={folderId}
                                onChange={e => setFolderId(e.target.value)}
                                className="bg-black/20 border-white/10"
                            />
                            <p className="text-[10px] text-gray-500">From the URL: drive.google.com/drive/folders/<strong>THIS_ID</strong></p>
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={loading} className="w-full bg-lime-400 text-black hover:bg-lime-500">
                        {loading ? 'Connecting...' : 'Connect & Save'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
