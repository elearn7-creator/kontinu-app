'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { useState, useEffect } from 'react';

const AnimatedBalance = () => {
  const [balance, setBalance] = useState(5790.70);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 200; // Random change between -100 and +100
      setBalance(prev => prev + change);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-3xl font-bold mt-1 transition-all duration-500">
      ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden font-sans text-white selection:bg-lime-400 selection:text-black">



      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-lime-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[50%] translate-x-[-50%] w-[40%] h-[40%] bg-lime-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-40 pb-20 text-center">

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto space-y-6"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
            Optimize the management <br />
            of your <span className="text-lime-400 inline-block relative">
              finances
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-lime-400" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Efficient Financial Mastery: Optimizing Your Wealth Management with AI-powered bookkeeping.
          </p>

          <div className="pt-8 flex justify-center">
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center justify-center rounded-full bg-white text-black px-8 py-4 text-lg font-semibold transition-transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* Visuals / Floating Elements */}
        <div className="relative mt-20 h-[500px] md:h-[600px] max-w-6xl mx-auto">

          {/* Center Phone/Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[500px] bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-6 shadow-2xl"
          >
            <div className="w-full h-full bg-black/40 rounded-[2.5rem] overflow-hidden relative">
              {/* Abstract Card */}
              <div className="absolute top-10 left-6 right-6 h-48 bg-gradient-to-br from-lime-400 to-emerald-600 rounded-2xl p-6 text-black">
                <div className="flex justify-between items-start opacity-50">
                  <div className="w-8 h-8 bg-black/20 rounded-full" />
                  <div className="text-xs font-mono">**** 5678</div>
                </div>
                <div className="mt-8">
                  <div className="text-sm opacity-70">Total Balance</div>
                  <AnimatedBalance />
                </div>
              </div>

              {/* Transaction List */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-white/5 backdrop-blur-md rounded-t-3xl p-6 space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="h-2 w-20 bg-white/20 rounded" />
                      <div className="h-2 w-12 bg-white/10 rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Glowing Circle Button (Moved Inside) */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-6 bottom-52 w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.5)] z-20"
              >
                <div className="w-4 h-4 bg-white rounded-full" />
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Elements - Left */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[10%] top-[20%] hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-full pr-6"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 overflow-hidden">
              <img src="https://i.pravatar.cc/100?img=33" alt="User" />
            </div>
            <div>
              <div className="text-sm font-bold">James Smith</div>
              <div className="text-xs text-lime-400">+$357.0</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute left-[5%] bottom-[30%] hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-full pr-6"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500 overflow-hidden">
              <img src="https://i.pravatar.cc/100?img=47" alt="User" />
            </div>
            <div>
              <div className="text-sm font-bold">Sonia Salieva</div>
              <div className="text-xs text-lime-400">+$1,980.0</div>
            </div>
          </motion.div>

          {/* Floating Elements - Right (Charts) */}
          <div className="absolute right-[10%] top-[30%] hidden md:flex gap-2 items-end h-32">
            {[40, 70, 45, 90, 60].map((h, i) => (
              <div key={i} className="w-8 bg-white/10 rounded-t-lg relative group transition-all hover:bg-lime-400 hover:scale-110 cursor-pointer" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Partners Section */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50">
            {/* Simulated Logos */}
            <span className="text-2xl font-bold font-serif text-white hover:text-lime-400 transition-colors cursor-pointer">Evernote</span>
            <span className="text-2xl font-bold font-sans tracking-tight text-white hover:text-lime-400 transition-colors cursor-pointer flex items-center gap-1">
              <span className="text-3xl">▲</span> Adobe
            </span>
            <span className="text-2xl font-bold font-sans italic text-white hover:text-lime-400 transition-colors cursor-pointer">PayPal</span>
            <span className="text-2xl font-bold font-sans text-white hover:text-lime-400 transition-colors cursor-pointer">amazon</span>
            <span className="text-2xl font-bold font-mono text-white hover:text-lime-400 transition-colors cursor-pointer flex items-center gap-2">
              <div className="flex gap-0.5">
                <div className="w-2 h-2 rounded-full bg-current" />
                <div className="w-2 h-2 rounded-full bg-current" />
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>
              asana
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
