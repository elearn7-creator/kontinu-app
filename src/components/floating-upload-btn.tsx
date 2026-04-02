'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export function FloatingUploadBtn() {
    const pathname = usePathname();
    
    if (pathname === '/upload') return null;

    return (
        <Link href="/upload">
            <Button
                className="fixed bottom-8 right-8 z-40 h-14 w-14 rounded-full shadow-[0_0_20px_rgba(163,230,53,0.3)] bg-lime-400 hover:bg-lime-500 text-black transition-all hover:scale-105 border border-lime-300"
                size="icon"
            >
                <Upload className="h-6 w-6" />
                <span className="sr-only">Upload Document</span>
            </Button>
        </Link>
    );
}
