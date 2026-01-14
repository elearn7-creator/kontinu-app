'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Download, Loader2, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { n8nService } from '@/lib/n8n';
import { supabase } from '@/lib/supabase';

export default function ReportsPage() {
    const { user } = useUser();
    const router = useRouter();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (!user || !startDate || !endDate) {
            toast.error('Lengkapi tanggal');
            return;
        }

        setLoading(true);

        try {
            // Get user's sheet ID
            const { data: userData } = await supabase
                .from('users')
                .select('sheet_id')
                .eq('clerk_id', user.id)
                .single();

            if (!userData?.sheet_id) {
                toast.error('Sheet tidak ditemukan');
                return;
            }

            // Call n8n to generate report
            const response = await n8nService.generateReport({
                sheetId: userData.sheet_id,
                startDate,
                endDate,
                format,
            });

            if (response.success && response.downloadUrl) {
                // Trigger download
                window.open(response.downloadUrl, '_blank');
                toast.success('Laporan berhasil dibuat!');
            } else {
                toast.error('Gagal membuat laporan', {
                    description: response.error || 'Silakan coba lagi',
                });
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Terjadi kesalahan', {
                description: 'Silakan coba lagi nanti',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-lime-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
                <Link href="/dashboard">
                    <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white hover:bg-white/10">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Dashboard
                    </Button>
                </Link>

                <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                    Laporan Pembukuan
                    <Sparkles className="h-6 w-6 text-lime-400" />
                </h1>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Download Laporan</CardTitle>
                        <CardDescription className="text-gray-400">
                            Pilih rentang tanggal dan format file untuk laporan Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-gray-300">Tanggal Mulai</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white focus:border-lime-400 [color-scheme:dark]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="text-gray-300">Tanggal Akhir</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white focus:border-lime-400 [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="format" className="text-gray-300">Format File</Label>
                            <Select value={format} onValueChange={(value: 'pdf' | 'csv') => setFormat(value)}>
                                <SelectTrigger className="bg-black/40 border-white/10 text-white focus:border-lime-400">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black border-white/10 text-white">
                                    <SelectItem value="pdf">PDF (Laporan Resmi)</SelectItem>
                                    <SelectItem value="csv">CSV (Excel)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleDownload}
                            className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold"
                            disabled={loading || !startDate || !endDate}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Membuat Laporan...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Laporan
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="mt-6 bg-blue-500/10 border-blue-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-400">
                            <FileText className="h-5 w-5" />
                            Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-300 space-y-2">
                        <p>• <strong>PDF</strong>: Cocok untuk laporan resmi yang siap dicetak</p>
                        <p>• <strong>CSV</strong>: Cocok untuk diolah lebih lanjut di Excel/Google Sheets</p>
                        <p>• Data diambil dari Google Sheet Anda berdasarkan rentang tanggal yang dipilih</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
