'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/language-provider';
import { UserButton } from '@clerk/nextjs';
import { Sparkles, LayoutDashboard, FileText, CreditCard, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface SidebarProps {
    userCredits?: number;
    usageCount?: number;
    subscriptionStatus?: string;
    subscriptionEnd?: string;
}

export function DashboardSidebar({ userCredits = 0, usageCount = 0, subscriptionStatus = 'trial', subscriptionEnd }: SidebarProps) {
    const pathname = usePathname();
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const creditPercentage = userCredits > 0 ? (usageCount / userCredits) * 100 : 0;

    const routes = [
        {
            href: '/dashboard',
            label: t('dashboard'),
            icon: LayoutDashboard,
            active: pathname === '/dashboard',
        },
        {
            href: '/reports',
            label: t('reports'),
            icon: FileText,
            active: pathname === '/reports',
        },
        {
            href: '/billing',
            label: t('billing'),
            icon: CreditCard,
            active: pathname === '/billing',
        },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full py-4 text-white bg-black border-r border-white/10">
            <div className="px-6 mb-8 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-lime-400" />
                <span className="text-xl font-bold">Kontinu</span>
            </div>

            <div className="flex-1 px-4 space-y-2">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            route.active
                                ? "bg-lime-400/10 text-lime-400 border border-lime-400/20"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <route.icon className="h-5 w-5" />
                        {route.label}
                    </Link>
                ))}
            </div>

            <div className="px-6 mt-auto space-y-6">
                {/* Language Toggle */}
                <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10">
                    <button
                        onClick={() => setLanguage('id')}
                        className={cn(
                            "flex-1 text-xs py-1 rounded-md transition-all",
                            language === 'id' ? "bg-lime-400 text-black font-bold shadow" : "text-gray-400 hover:text-white"
                        )}
                    >
                        ID
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={cn(
                            "flex-1 text-xs py-1 rounded-md transition-all",
                            language === 'en' ? "bg-lime-400 text-black font-bold shadow" : "text-gray-400 hover:text-white"
                        )}
                    >
                        EN
                    </button>
                </div>

                {/* Credits & Sub Info */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-gray-300">
                            <span>{t('credits_remaining')}</span>
                            <span>{userCredits - usageCount}</span>
                        </div>
                        {/* Custom Progress Color */}
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-lime-400 transition-all duration-500"
                                style={{ width: `${100 - creditPercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                            {usageCount} / {userCredits} {t('credits_used')}
                        </p>
                    </div>

                    <div className="bg-lime-400/5 p-3 rounded-lg border border-lime-400/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">{subscriptionStatus}</span>
                            <Link href="/pricing" className="text-xs text-lime-400 underline hover:text-lime-300">
                                {t('upgrade')}
                            </Link>
                        </div>
                        {subscriptionEnd && (
                            <p className="text-[10px] text-gray-400">
                                {t('valid_until')} {new Date(subscriptionEnd).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <UserButton
                        afterSignOutUrl="/"
                        showName
                        appearance={{
                            elements: {
                                userButtonBox: "flex-row-reverse",
                                userButtonOuterIdentifier: "text-lime-400",
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-black">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden bg-black border border-white/10 text-white shadow-sm hover:bg-white/10">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r border-white/10 bg-black">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
