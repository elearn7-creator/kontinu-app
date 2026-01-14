'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 w-full z-50 px-6 py-6 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/5 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
                <div className="flex items-center gap-2">
                    <Link href="/" className="text-xl font-bold tracking-tight text-white">Kontinu</Link>
                </div>

                <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
                    <Link
                        href="/"
                        className={cn("hover:text-white transition-colors", isActive('/') && "text-white font-semibold")}
                    >
                        Home
                    </Link>
                    <Link
                        href="/features"
                        className={cn("hover:text-white transition-colors", isActive('/features') && "text-white font-semibold")}
                    >
                        Features
                    </Link>
                    <Link
                        href="/pricing"
                        className={cn("hover:text-white transition-colors", isActive('/pricing') && "text-white font-semibold")}
                    >
                        Pricing
                    </Link>
                </div>

                <div className="flex gap-4">
                    <Link
                        href="/sign-in"
                        className="hidden md:block text-sm font-medium text-white hover:text-lime-400 transition-colors py-2"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/sign-up"
                        className="hidden md:block rounded-full bg-lime-400 hover:bg-lime-500 text-black font-semibold px-6 py-2 text-sm transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_30px_rgba(132,204,22,0.5)]"
                    >
                        Create an account
                    </Link>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:text-lime-400">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-[#0a0a0a] border-white/10 text-white w-[300px]">
                                <SheetHeader>
                                    <SheetTitle className="text-white text-left">Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 mt-8">
                                    <Link href="/" className="text-lg font-semibold hover:text-lime-400">Home</Link>
                                    <Link href="/features" className="text-lg font-semibold hover:text-lime-400">Features</Link>
                                    <Link href="/pricing" className="text-lg font-semibold hover:text-lime-400">Pricing</Link>
                                    <Separator className="bg-white/10" />
                                    <Link href="/sign-in" className="text-lg font-semibold hover:text-lime-400">Sign In</Link>
                                    <Link href="/sign-up" className="text-lg font-semibold text-lime-400">Create Account</Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}
