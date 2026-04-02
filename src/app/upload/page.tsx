'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Camera,
    Upload as UploadIcon,
    FileText,
    Loader2,
    ArrowLeft,
    Save,
    X,
    Sparkles,
    Trash2,
    Plus,
    Minus,
    RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { n8nService, AnalyzedItem } from '@/lib/n8n';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/components/language-provider';


interface AnalyzedData {
    amount: number;
    vendor: string;
    date: string;
    category?: string;
    notes?: string;
    invoiceNumber?: string;
    outlet?: string;
    items?: AnalyzedItem[];
}

export default function UploadPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const { t } = useLanguage();



    // State
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
    const [zoom, setZoom] = useState(1);
    const [userData, setUserData] = useState<any | null>(null); // Use 'any' or import User type
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Fetch User Data
    useEffect(() => {
        if (!user) return;
        const fetchUser = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('clerk_id', user.id)
                .single();

            if (data) setUserData(data);
            if (error) console.error("Error fetching user:", error);
        };
        fetchUser();
    }, [user]);

    // Additional UI State
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

    // Form Data
    const [formData, setFormData] = useState<AnalyzedData & { journalId?: string }>({
        amount: 0,
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        notes: '',
        invoiceNumber: '',
        outlet: '',
        items: [],
        journalId: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Reset zoom when file changes
    useEffect(() => {
        setZoom(1);
    }, [file]);

    // Calculate total from items if they exist
    useEffect(() => {
        if (formData.items && formData.items.length > 0) {
            const total = formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            setFormData(prev => ({ ...prev, amount: total }));
        }
    }, [formData.items]);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
                <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
            </div>
        );
    }

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setAnalyzed(false);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = async () => {
            setPreview(reader.result as string);
            // Auto-analyze after preview is loaded
            if (user) {
                await handleAnalyze();
            }
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setZoom(1);

    const handleAnalyze = async () => {
        if (!file || !user) return;

        setAnalyzing(true);

        try {
            // Call n8n analyze endpoint
            const response = await n8nService.analyzeDocument(file);

            if (response.success && response.data) {
                // Update form with analyzed data
                setFormData({
                    amount: response.data.amount,
                    vendor: response.data.vendor,
                    date: response.data.date,
                    category: response.data.category || '',
                    notes: response.data.notes || '',
                    invoiceNumber: response.data.invoiceNumber || '',
                    outlet: response.data.outlet || '',
                    items: response.data.items || [],
                    journalId: (response.data as any).journalId || ''
                });

                if (response.data.transactionType?.toLowerCase().includes('income')) {
                    setTransactionType('income');
                }

                const { data: userData } = await supabase
                    .from('users')
                    .select('usage_count, credits')
                    .eq('clerk_id', user.id)
                    .single();

                if (userData) {
                    await supabase
                        .from('users')
                        .update({ usage_count: userData.usage_count + 1 })
                        .eq('clerk_id', user.id);
                }

                setAnalyzed(true);
                toast.success(t('analyzing') + ' Done!');
            } else {
                toast.error(t('analyzing') + ' Failed', {
                    description: response.error || 'Please try again',
                });
            }
        } catch (error) {
            console.error('Error analyzing document:', error);
            toast.error('Error', {
                description: 'Please try again later',
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!user || !analyzed) return;

        setSaving(true);

        try {
            const { data: userData } = await supabase
                .from('users')
                .select('id, sheet_id, drive_folder_id, business_name')
                .eq('clerk_id', user.id)
                .single();

            // Setup check moved to OnboardingWizard
            if (!userData?.sheet_id || !userData?.drive_folder_id) {
                // Should be blocked by Wizard overlay, but double check
                toast.error("Please complete account setup first.");
                setSaving(false);
                return;
            }

            const payload: any = {
                userId: user.id,
                businessName: userData.business_name,
                sheetId: userData.sheet_id,
                folderId: userData.drive_folder_id,
                file: file,
                ...formData,
                type: transactionType,
                timestamp: new Date().toISOString(),
                author: user.emailAddresses[0]?.emailAddress,
            };

            if (transactionType === 'expense') {
                payload.debit = formData.amount;
                payload.credit = 0;
            } else {
                payload.debit = 0;
                payload.credit = formData.amount;
            }

            const response = await n8nService.saveEntry(payload);

            if (response.success) {
                toast.success('Transaction Added!');
                router.push('/dashboard');
            } else {
                toast.error('Failed to save', {
                    description: response.error || 'Please try again',
                });
            }
        } catch (error) {
            console.error('Error saving entry:', error);
            toast.error('Error', {
                description: 'Please try again later',
            });
        } finally {
            setSaving(false);
        }
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...(formData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const deleteItem = (index: number) => {
        const newItems = [...(formData.items || [])].filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...(formData.items || []), { itemNumber: (formData.items?.length || 0) + 1, itemName: '', quantity: 1, uom: 'unit', amount: 0 }]
        });
    };

    const toggleCheck = (index: number) => {
        setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-lime-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                <Link href="/dashboard">
                    <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white hover:bg-white/10">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('back_dashboard')}
                    </Button>
                </Link>

                <h1 className="text-3xl font-bold mb-8">{t('upload')}</h1>

                {/* Onboarding Wizard - Appears if no sheet_id or business_name */}


                {!file ? (
                    <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        <Card
                            className="cursor-pointer bg-white/5 border-white/10 hover:border-lime-400/50 hover:bg-white/10 transition-all"
                            onClick={() => cameraInputRef.current?.click()}
                        >
                            <CardHeader className="text-center">
                                <div className="h-16 w-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Camera className="h-8 w-8 text-lime-400" />
                                </div>
                                <CardTitle className="text-white">{t('camera')}</CardTitle>
                            </CardHeader>
                        </Card>
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        />

                        <Card
                            className="cursor-pointer bg-white/5 border-white/10 hover:border-blue-400/50 hover:bg-white/10 transition-all"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CardHeader className="text-center">
                                <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UploadIcon className="h-8 w-8 text-blue-400" />
                                </div>
                                <CardTitle className="text-white">{t('gallery')}</CardTitle>
                            </CardHeader>
                        </Card>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        />

                        <Card
                            className="cursor-pointer bg-white/5 border-white/10 hover:border-orange-400/50 hover:bg-white/10 transition-all"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'application/pdf';
                                input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) handleFileSelect(file);
                                };
                                input.click();
                            }}
                        >
                            <CardHeader className="text-center">
                                <div className="h-16 w-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-8 w-8 text-orange-400" />
                                </div>
                                <CardTitle className="text-white">{t('pdf')}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                ) : (
                    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 min-h-[calc(100vh-200px)]">
                        {/* LEFT COLUMN: Preview & Controls */}
                        <Card className="bg-white/5 border-white/10 flex flex-col min-h-[400px] lg:h-full overflow-hidden">
                            <CardHeader className="border-b border-white/10 pb-4 shrink-0">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-white text-lg">{t('preview')}</CardTitle>
                                    <div className="flex gap-2">
                                        {/* Zoom Controls (Images Only) */}
                                        {file.type.startsWith('image/') && (
                                            <>
                                                <Button size="icon" variant="ghost" onClick={handleZoomOut} className="text-gray-400 hover:text-white h-9 w-9"><Minus className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={handleResetZoom} className="text-gray-400 hover:text-white h-9 w-9"><RotateCcw className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={handleZoomIn} className="text-gray-400 hover:text-white h-9 w-9"><Plus className="h-4 w-4" /></Button>
                                                <div className="w-px h-6 bg-white/10 mx-2 self-center" />
                                            </>
                                        )}

                                        <Button
                                            size="icon"
                                            className="bg-lime-400 hover:bg-lime-500 text-black h-9 w-9"
                                            onClick={handleAnalyze}
                                            disabled={analyzing}
                                            title={t('analyze_ai')}
                                        >
                                            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setFile(null);
                                                setPreview('');
                                                setAnalyzed(false);
                                            }}
                                            className="text-gray-400 hover:text-white hover:bg-white/10 h-9 w-9"
                                            title={t('change_file')}
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 relative overflow-auto bg-black/40 flex items-center justify-center">
                                {preview && file?.type.startsWith('image/') ? (
                                    <div className="overflow-auto w-full h-full flex items-center justify-center p-4">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
                                            className="max-w-none origin-center rounded-lg"
                                        />
                                    </div>
                                ) : file?.type === 'application/pdf' ? (
                                    <embed src={preview} type="application/pdf" className="w-full h-full rounded-b-lg" />
                                ) : (
                                    <div className="text-center p-8">
                                        <FileText className="h-16 w-16 mx-auto text-lime-400 mb-2" />
                                        <p className="text-sm text-gray-300">{file.name}</p>
                                    </div>
                                )}

                                {analyzing && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                        <div className="text-center">
                                            <Loader2 className="h-12 w-12 text-lime-400 animate-spin mx-auto mb-4" />
                                            <p className="text-lime-400 font-semibold">{t('analyzing')}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* RIGHT COLUMN: Data Form (Same as before) */}
                        <Card className="bg-white/5 border-white/10 flex flex-col min-h-[500px] lg:h-full overflow-hidden">
                            <CardHeader className="border-b border-white/10 pb-4 shrink-0">
                                <CardTitle className="text-white text-lg">{t('verify_data')}</CardTitle>
                                <div className="mt-4 flex bg-black/40 rounded-lg p-1 border border-white/10">
                                    <button
                                        onClick={() => setTransactionType('expense')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${transactionType === 'expense'
                                            ? 'bg-red-500/20 text-red-400 shadow-sm border border-red-500/20'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {t('expense')}
                                    </button>
                                    <button
                                        onClick={() => setTransactionType('income')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${transactionType === 'income'
                                            ? 'bg-lime-400/20 text-lime-400 shadow-sm border border-lime-400/20'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {t('income')}
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto p-4 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-300 text-xs uppercase tracking-wider">{t('date')}</Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="bg-black/40 border-white/10 text-white focus:border-lime-400 [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300 text-xs uppercase tracking-wider">{t('vendor')}</Label>
                                        <Input
                                            value={formData.vendor}
                                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                            className="bg-black/40 border-white/10 text-white focus:border-lime-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-gray-300 text-xs uppercase tracking-wider">{t('items')}</Label>
                                        <Button variant="ghost" size="sm" onClick={addItem} className="h-6 text-lime-400 hover:text-lime-300 hover:bg-lime-400/10 text-xs">
                                            <Plus className="h-3 w-3 mr-1" /> {t('add_item')}
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-2">
                                            <div className="col-span-1 text-center">#</div>
                                            <div className="col-span-1 text-center">{t('team_check')}</div>
                                            <div className="col-span-4">{t('item_name')}</div>
                                            <div className="col-span-2 text-center">{t('qty')}</div>
                                            <div className="col-span-3 text-right">{t('price')}</div>
                                            <div className="col-span-1"></div>
                                        </div>

                                        {formData.items?.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 rounded-lg border border-white/5">
                                                <div className="col-span-1 text-center text-gray-500 text-xs">{index + 1}</div>
                                                <div className="col-span-1 flex justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!checkedItems[index]}
                                                        onChange={() => toggleCheck(index)}
                                                        className="rounded border-white/20 bg-black/40 text-lime-400 w-4 h-4"
                                                    />
                                                </div>
                                                <div className="col-span-4 space-y-1">
                                                    <Input
                                                        placeholder={t('item_name')}
                                                        value={item.itemName}
                                                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                                                        className="h-7 text-sm bg-transparent border-0 border-b border-white/10 rounded-none px-0 focus:border-lime-400 focus:ring-0"
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="Qty"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                        className="h-7 text-sm bg-transparent border-0 border-b border-white/10 rounded-none px-0 focus:border-lime-400 focus:ring-0 text-center"
                                                    />
                                                </div>
                                                <div className="col-span-3 space-y-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="Amt"
                                                        value={item.amount}
                                                        onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value))}
                                                        className="h-7 text-sm bg-transparent border-0 border-b border-white/10 rounded-none px-0 focus:border-lime-400 focus:ring-0 text-right"
                                                    />
                                                </div>
                                                <div className="col-span-1 text-center">
                                                    <Button variant="ghost" size="icon" onClick={() => deleteItem(index)} className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10 space-y-4 mt-auto">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span className="text-white">{t('total')}</span>
                                        <span className="text-lime-400">Rp {formData.amount.toLocaleString('id-ID')}</span>
                                    </div>

                                    <Button
                                        onClick={handleSave}
                                        className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold h-12"
                                        disabled={saving || !analyzed}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t('saving')}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                {t('add_transaction')}
                                            </>
                                        )}
                                    </Button>

                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
