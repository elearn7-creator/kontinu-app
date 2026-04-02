import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming you have this or will use Input
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { n8nService } from '@/lib/n8n';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingWizardProps {
    userId: string;
    email: string;
    onSuccess: () => void;
    open: boolean;
}

export function OnboardingWizard({ userId, email, onSuccess, open }: OnboardingWizardProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'details' | 'processing'>('details');

    // Form State
    const [businessName, setBusinessName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = async () => {
        if (!businessName || !address || !phone) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            // 1. Save Business Details to Supabase
            // 1. Save Business Details to Supabase (Use upsert to handle missing rows)
            const { error: dbError } = await supabase
                .from('users')
                .upsert({
                    clerk_id: userId,
                    email: email,
                    business_name: businessName,
                    business_address: address,
                    mobile_phone: phone,
                    // Ensure defaults for new rows if they were deleted
                    credits: 5,
                    usage_count: 0,
                    subscription_status: 'trial',
                    trial_start: new Date().toISOString(),
                    // simple way to set trial_end to +14 days
                    trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                }, { onConflict: 'clerk_id', ignoreDuplicates: false })
                .select();

            if (dbError) throw new Error("Failed to save business details: " + dbError.message);

            // 2. Trigger n8n Webhook for setup
            setStep('processing');

            // We use the n8n service now
            const result = await n8nService.triggerOnboarding({
                userId,
                email,
                businessName,
                businessAddress: address,
                mobilePhone: phone
            });

            if (result.success) {
                toast.success("Account setup complete!");
                onSuccess(); // Parent handles redirect or whatever
            } else {
                throw new Error("Setup failed. Please try again.");
            }

        } catch (error: any) {
            console.error('Onboarding Wizard Error:', error);
            // Log full error for debugging
            console.dir(error, { depth: null });

            const msg = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            toast.error("Setup Failed", { description: msg });
            setStep('details'); // Go back to form on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="bg-[#1a1a1a] text-white border-white/10 max-w-md" hideCloseButton>
                <DialogHeader>
                    <DialogTitle>
                        {step === 'details' ? 'Complete Your Profile' : 'Setting up your account...'}
                    </DialogTitle>
                </DialogHeader>

                {step === 'details' ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input
                                placeholder="e.g. Acme Corp"
                                value={businessName}
                                onChange={e => setBusinessName(e.target.value)}
                                className="bg-black/20 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Business Address</Label>
                            <Input
                                placeholder="Full business address"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                className="bg-black/20 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Mobile Phone</Label>
                            <Input
                                placeholder="+62..."
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="bg-black/20 border-white/10"
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-lime-400 text-black hover:bg-lime-500 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                            {loading ? 'Saving...' : 'Continue'}
                        </Button>
                    </div>
                ) : (
                    <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-lime-400" />
                        <div className="text-gray-400 text-sm">
                            <p>Creating your Google Drive folders...</p>
                            <p>This may take a few seconds.</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
