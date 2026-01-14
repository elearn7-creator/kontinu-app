'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OnboardingWizard } from '@/components/onboarding-wizard';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) {
            router.push('/sign-in');
            return;
        }

        const checkStatus = async () => {
            // Check if user already setup
            const { data } = await supabase
                .from('users')
                .select('drive_folder_id, sheet_id, business_name')
                .eq('clerk_id', user.id)
                .single();

            if (data?.drive_folder_id && data?.sheet_id && data?.business_name) {
                // Already setup, go to dashboard
                router.replace('/dashboard');
            } else {
                setChecking(false);
            }
        };

        checkStatus();
    }, [user, isLoaded, router]);

    if (!isLoaded || checking) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <OnboardingWizard
                    userId={user!.id}
                    email={user!.emailAddresses[0].emailAddress}
                    open={true}
                    onSuccess={() => {
                        window.location.href = '/dashboard';
                    }}
                />
            </div>
        </div>
    );
}
