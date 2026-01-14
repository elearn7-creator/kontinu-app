'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    id: {
        dashboard: 'Dashboard',
        reports: 'Laporan',
        billing: 'Tagihan',
        settings: 'Pengaturan',
        upload: 'Upload Dokumen',
        credits_remaining: 'Kredit Tersisa',
        credits_used: 'Kredit Terpakai',
        subscription: 'Langganan',
        valid_until: 'Berlaku sampai',
        upgrade: 'Upgrade',
        logout: 'Keluar',
        welcome: 'Selamat Datang',
        recent_activity: 'Aktivitas Terbaru',
        total_expenses: 'Total Pengeluaran',
        total_entries: 'Total Entri',
        no_activity: 'Belum ada aktivitas',
        download_report: 'Download Laporan',
        create_report: 'Buat Laporan',
        upload_desc: 'Scan atau upload struk/invoice baru',
        sheets_desc: 'Lihat data di Google Sheet',
        drive_desc: 'Akses folder dokumen',
        payment_history: 'Riwayat Pembayaran',
        invoice: 'Invoice',
        status: 'Status',
        amount: 'Jumlah',
        date: 'Tanggal',
        plan: 'Paket',
        download: 'Download',
        camera: 'Kamera',
        gallery: 'Galeri',
        pdf: 'PDF',
        preview: 'Preview',
        change_file: 'Ganti File',
        analyze_ai: 'Analisis dengan AI',
        analyzing: 'Menganalisis...',
        verify_data: 'Verifikasi Data',
        income: 'Pemasukan',
        expense: 'Pengeluaran',
        items: 'Item',
        item_name: 'Nama Item',
        qty: 'Qty',
        price: 'Harga',
        total: 'Total',
        vendor: 'Vendor/Toko',
        notes: 'Catatan',
        save_sheet: 'Simpan ke Google Sheet',
        saving: 'Menyimpan...',
        back_dashboard: 'Kembali ke Dashboard',
        add_item: 'Tambah Item',
        subtotal: 'Subtotal',
        tax: 'Pajak',
        add_transaction: 'Tambah Transaksi',
        team_check: 'Cek',
        setup_incomplete: 'Akun Belum Siap',
        setup_running: 'Sedang menyiapkan akun...',
        setup_failed: 'Gagal menyiapkan. Silakan coba lagi.',
    },
    en: {
        dashboard: 'Dashboard',
        reports: 'Reports',
        billing: 'Billing',
        settings: 'Settings',
        upload: 'Upload Document',
        credits_remaining: 'Credits Remaining',
        credits_used: 'Credits Used',
        subscription: 'Subscription',
        valid_until: 'Valid until',
        upgrade: 'Upgrade',
        logout: 'Log Out',
        welcome: 'Welcome',
        recent_activity: 'Recent Activity',
        total_expenses: 'Total Expenses',
        total_entries: 'Total Entries',
        no_activity: 'No activity yet',
        download_report: 'Download Report',
        create_report: 'Create Report',
        upload_desc: 'Scan or upload new receipt/invoice',
        sheets_desc: 'View data in Google Sheet',
        drive_desc: 'Access document folder',
        payment_history: 'Payment History',
        invoice: 'Invoice',
        status: 'Status',
        amount: 'Amount',
        date: 'Date',
        plan: 'Plan',
        download: 'Download',
        camera: 'Camera',
        gallery: 'Gallery',
        pdf: 'PDF',
        preview: 'Preview',
        change_file: 'Change File',
        analyze_ai: 'Analyze with AI',
        analyzing: 'Analyzing...',
        verify_data: 'Verify Data',
        income: 'Income',
        expense: 'Expense',
        items: 'Items',
        item_name: 'Item Name',
        qty: 'Qty',
        price: 'Price',
        total: 'Total',
        vendor: 'Vendor',
        notes: 'Notes',
        save_sheet: 'Save to Google Sheet',
        saving: 'Saving...',
        back_dashboard: 'Back to Dashboard',
        add_item: 'Add Item',
        subtotal: 'Subtotal',
        tax: 'Tax',
        add_transaction: 'Add Transaction',
        team_check: 'Check',
        setup_incomplete: 'Setup Incomplete',
        setup_running: 'Setting up your account...',
        setup_failed: 'Setup failed. Please try again.',
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('id');

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'id' || saved === 'en')) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        const langMap = translations[language] || translations['id'];
        return langMap[key as keyof typeof translations['id']] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
