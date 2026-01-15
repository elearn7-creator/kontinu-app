'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Check, Loader2, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { Navbar } from '@/components/navbar';

const plans = [
    {
        name: 'Free',
        basePrice: 0,
        credits: 10,
        features: [
            '10 kredit analisis AI',
            'Google Sheet & Drive sync',
            'Community support',
        ],
    },
    {
        name: 'Bronze',
        basePrice: 2500000,
        credits: 100,
        features: [
            '100 kredit analisis AI',
            'Google Sheet & Drive sync',
            'Download laporan PDF/CSV',
            'Support email',
        ],
    },
    {
        name: 'Silver',
        basePrice: 3500000,
        credits: 250,
        features: [
            '250 kredit analisis AI',
            'Google Sheet & Drive sync',
            'Download laporan PDF/CSV',
            'Priority support',
            'Bulk upload (coming soon)',
        ],
        popular: true,
    },
    {
        name: 'Gold',
        basePrice: 5500000,
        credits: 500,
        features: [
            '500 kredit analisis AI',
            'Google Sheet & Drive sync',
            'Download laporan PDF/CSV',
            'Priority support',
            'Bulk upload (coming soon)',
            'Custom categories',
        ],
    },
    {
        name: 'Enterprise',
        basePrice: 'Hubungi Kami',
        credits: 'Unlimited',
        features: [
            'Unlimited kredit',
            'Dedicated Account Manager',
            'Custom Integration (API)',
            'On-premise deployment option',
            'SLA Support'
        ],
        isEnterprise: true,
    },
];

export default function PricingPage() {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [userData, setUserData] = useState<any>(null);

    // Fetch user data to check current subscription
    useEffect(() => {
        if (!user) return;

        const fetchUserData = async () => {
            const { data } = await supabase
                .from('users')
                .select('subscription_status, credits')
                .eq('clerk_id', user.id)
                .single();

            if (data) setUserData(data);
        };

        fetchUserData();
    }, [user]);

    const handleSubscribe = async (planName: string, basePrice: number | string) => {
        if (!user) {
            router.push('/sign-in?redirect_url=' + encodeURIComponent('/pricing'));
            return;
        }

        // Check if user is trying to downgrade to Free plan
        if (planName === 'free' && userData) {
            const paidPlans = ['bronze', 'silver', 'gold'];
            if (paidPlans.includes(userData.subscription_status)) {
                toast.error('Cannot downgrade to Free plan', {
                    description: 'You are currently on a paid plan. Please contact support to manage your subscription.',
                });
                return;
            }
        }

        if (typeof basePrice === 'string') {
            toast.info('Silakan hubungi tim sales kami untuk paket Enterprise.');
            return;
        }

        setLoading(planName);

        // Calculate final price based on billing cycle
        let finalPrice = basePrice;
        let planDescription = `${planName} (Monthly)`;

        if (billingCycle === 'annual') {
            // Annual price = (Monthly * 12) * 0.9 (10% discount)
            finalPrice = (basePrice * 12) * 0.9;
            planDescription = `${planName} (Annual - 10% Off)`;
        }

        try {
            // Call API to create Xendit invoice
            const response = await axios.post('/api/create-invoice', {
                planName: planDescription,
                planCode: planName, // This is the lowercase 'bronze', 'silver'
                price: finalPrice,
                userId: user.id,
                email: user.emailAddresses[0]?.emailAddress,
                cycle: billingCycle
            });

            if (response.data.invoiceUrl) {
                window.location.href = response.data.invoiceUrl;
            } else {
                toast.error('Gagal membuat invoice');
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error('Terjadi kesalahan', {
                description: 'Silakan coba lagi nanti',
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden font-sans text-white selection:bg-lime-400 selection:text-black">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-lime-900/10 rounded-full blur-[120px]" />
            </div>

            <Navbar />

            <div className="relative z-10 container mx-auto px-4 py-32">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Invest in Your <span className="text-lime-400">Growth</span>
                    </h1>
                    <p className="text-gray-400 text-lg mb-8">
                        Choose the plan that fits your business stage. No hidden fees.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 bg-white/5 inline-flex p-1 rounded-full border border-white/10">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly'
                                ? 'bg-lime-400 text-black shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'annual'
                                ? 'bg-lime-400 text-black shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Annual
                            <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                                -10%
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan) => {
                        // Calculate display price
                        let displayPrice = plan.basePrice;
                        let period = '/bulan';

                        if (billingCycle === 'annual' && typeof plan.basePrice === 'number') {
                            // Show equated monthly price if paid annually? Or total annual?
                            // Usually showing discounted monthly rate is better marketing.
                            // Price with 10% discount:
                            displayPrice = plan.basePrice * 0.9;
                        }

                        return (
                            <Card
                                key={plan.name}
                                className={`relative border-white/10 bg-white/5 backdrop-blur-sm hover:border-lime-400/50 transition-colors ${plan.popular ? 'border-lime-400 shadow-[0_0_30px_rgba(132,204,22,0.1)]' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-400 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                                    <div className="mt-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-white">
                                                {typeof displayPrice === 'number'
                                                    ? `Rp ${displayPrice.toLocaleString('id-ID')}`
                                                    : plan.basePrice
                                                }
                                            </span>
                                            {typeof displayPrice === 'number' && (
                                                <span className="text-gray-400 text-sm">/bulan</span>
                                            )}
                                        </div>
                                        {billingCycle === 'annual' && typeof plan.basePrice === 'number' && (
                                            <p className="text-xs text-lime-400 mt-1">
                                                *Billed Rp {((plan.basePrice * 12) * 0.9).toLocaleString('id-ID')} yearly
                                            </p>
                                        )}
                                    </div>
                                    <CardDescription className="text-gray-400 mt-2">
                                        {typeof plan.credits === 'number' ? plan.credits.toLocaleString() : plan.credits} kredit/bulan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                <Check className="h-4 w-4 text-lime-400 mt-0.5 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className={`w-full font-semibold ${plan.popular
                                            ? 'bg-lime-400 hover:bg-lime-500 text-black'
                                            : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                        onClick={() => handleSubscribe(plan.name.toLowerCase(), plan.basePrice)}
                                        disabled={loading === plan.name.toLowerCase()}
                                    >
                                        {loading === plan.name.toLowerCase() ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : plan.isEnterprise ? (
                                            'Contact Sales'
                                        ) : (
                                            'Get Started'
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
