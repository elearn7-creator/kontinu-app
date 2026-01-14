'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export default function BillingPage() {
    const { user } = useUser();
    const { t } = useLanguage();
    const [payments, setPayments] = useState<any[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const { data: uData } = await supabase
                .from('users')
                .select('*')
                .eq('clerk_id', user.id)
                .single();

            setUserData(uData);

            if (uData) {
                const { data: payData } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('user_id', uData.id)
                    .order('created_at', { ascending: false });

                setPayments(payData || []);
            }
            setLoading(false);
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400" /></div>;

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
            </div>

            <DashboardSidebar
                userCredits={userData?.credits}
                usageCount={userData?.usage_count}
                subscriptionStatus={userData?.subscription_status}
                subscriptionEnd={userData?.subscription_end || userData?.trial_end}
            />

            <main className="flex-1 md:ml-64 p-8 overflow-y-auto relative z-10">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t('billing')}</h1>
                        <p className="text-gray-400">{t('payment_history')}</p>
                    </div>

                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <CreditCard className="h-5 w-5 text-lime-400" />
                                {t('payment_history')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {payments.length > 0 ? (
                                <div className="rounded-md border border-white/10 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white/10">
                                            <tr>
                                                <th className="p-4 font-medium text-gray-300">{t('date')}</th>
                                                <th className="p-4 font-medium text-gray-300">{t('plan')}</th>
                                                <th className="p-4 font-medium text-gray-300">{t('amount')}</th>
                                                <th className="p-4 font-medium text-gray-300">{t('status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {payments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 text-gray-300">
                                                        {new Date(payment.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 font-medium capitalize text-white">
                                                        {payment.plan}
                                                    </td>
                                                    <td className="p-4 text-lime-400 font-bold">
                                                        Rp {Number(payment.amount).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant="outline" className="bg-lime-400/10 text-lime-400 border-lime-400/30 gap-1">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            {payment.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Belum ada riwayat pembayaran</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
