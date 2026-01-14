'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { supabase, User } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';
import {
    Upload,
    FileText,
    FolderOpen,
    ExternalLink,
    TrendingUp,
    Receipt,
    Clock,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { FloatingUploadBtn } from '@/components/floating-upload-btn';
import { useLanguage } from '@/components/language-provider';

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();

    const [userData, setUserData] = useState<User | null>(null);
    const [stats, setStats] = useState({ totalExpenses: 0, totalEntries: 0 });
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            // 1. Fetch User Data
            const { data: uData, error: uError } = await supabase
                .from('users')
                .select('*')
                .eq('clerk_id', user.id)
                .single();

            if (uError) {
                console.error('Error fetching user:', uError);
                router.push('/onboarding');
                return;
            }
            setUserData(uData);

            // 2. Fetch Transactions Stats
            const { data: transactions, error: tError } = await supabase
                .from('transactions')
                .select('amount, date, vendor')
                .eq('user_id', uData.id)
                .order('date', { ascending: false });

            if (!tError && transactions) {
                const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
                setStats({
                    totalExpenses: total,
                    totalEntries: transactions.length
                });
                setRecentTransactions(transactions.slice(0, 5));
            }

            setLoading(false);
        };

        const checkPayment = async () => {
            const paymentStatus = searchParams.get('payment');
            if (paymentStatus === 'success') {
                try {
                    toast.info('Memverifikasi pembayaran...');
                    const response = await axios.post('/api/check-payment', { userId: user.id });
                    if (response.data.success) {
                        toast.success('Pembayaran berhasil!', { description: response.data.message });
                        fetchData();
                    }
                    router.replace('/dashboard');
                } catch (e) { console.error(e); fetchData(); }
            } else {
                fetchData();
            }
        };

        checkPayment();
    }, [user, router, searchParams]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400" /></div>;
    }

    if (!userData) return null;

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime-900/10 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar */}
            <DashboardSidebar
                userCredits={userData.credits}
                usageCount={userData.usage_count}
                subscriptionStatus={userData.subscription_status}
                subscriptionEnd={userData.subscription_end || userData.trial_end}
            />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto relative z-10">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Welcome Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">
                                {t('welcome')}, {user?.firstName} 👋
                            </h1>
                            <p className="text-gray-400 mt-1">
                                {t('upload_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Total Expenses Card */}
                        <Card className="bg-gradient-to-br from-lime-400 to-emerald-500 text-black border-none shadow-[0_0_30px_rgba(132,204,22,0.2)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <TrendingUp className="h-24 w-24" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    {t('total_expenses')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    Rp {stats.totalExpenses.toLocaleString('id-ID')}
                                </div>
                                <p className="text-xs font-semibold mt-1 opacity-80">
                                    {stats.totalEntries} {t('total_entries')}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Recent Activity Card */}
                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <Receipt className="h-4 w-4" />
                                    {t('recent_activity')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentTransactions.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentTransactions.map((t, i) => (
                                            <div key={i} className="flex justify-between items-center border-b border-white/5 last:border-0 pb-2 last:pb-0">
                                                <div>
                                                    <p className="font-medium text-sm text-white">{t.vendor}</p>
                                                    <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                                                </div>
                                                <span className="font-bold text-sm text-lime-400">
                                                    Rp {Number(t.amount).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                                        <Clock className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-sm">{t('no_activity')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Quick Links */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="bg-white/5 border-white/10 group hover:border-lime-500 transition-all cursor-pointer">
                            <Link
                                href={userData.sheet_id ? `https://docs.google.com/spreadsheets/d/${userData.sheet_id}` : '#'}
                                target="_blank"
                                className={!userData.sheet_id ? 'pointer-events-none opacity-50' : ''}
                            >
                                <CardHeader>
                                    <div className="h-10 w-10 bg-lime-400/10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <FileText className="h-5 w-5 text-lime-400" />
                                    </div>
                                    <CardTitle className="text-base flex items-center gap-2 text-white">
                                        Google Sheet <ExternalLink className="h-3 w-3 opacity-50" />
                                    </CardTitle>
                                    <CardDescription className="text-xs text-gray-400">
                                        {t('sheets_desc')}
                                    </CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>

                        <Card className="bg-white/5 border-white/10 group hover:border-blue-500 transition-all cursor-pointer">
                            <Link
                                href={userData.drive_folder_id ? `https://drive.google.com/drive/folders/${userData.drive_folder_id}` : '#'}
                                target="_blank"
                                className={!userData.drive_folder_id ? 'pointer-events-none opacity-50' : ''}
                            >
                                <CardHeader>
                                    <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <FolderOpen className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <CardTitle className="text-base flex items-center gap-2 text-white">
                                        Invoices Folder <ExternalLink className="h-3 w-3 opacity-50" />
                                    </CardTitle>
                                    <CardDescription className="text-xs text-gray-400">
                                        View your uploaded files
                                    </CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>

                        <Card className="bg-white/5 border-white/10 group hover:border-orange-500 transition-all cursor-pointer">
                            <Link href="/reports">
                                <CardHeader>
                                    <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <ArrowUpRight className="h-5 w-5 text-orange-400" />
                                    </div>
                                    <CardTitle className="text-base text-white">
                                        {t('reports')}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-gray-400">
                                        {t('create_report')}
                                    </CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>
                    </div>

                </div>
            </main>

            {/* Floating Action Button */}
            <FloatingUploadBtn />
        </div>
    );
}
