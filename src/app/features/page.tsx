'use client';

import { Navbar } from '@/components/navbar';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    TrendingUp,
    Zap,
    Users,
    Layout,
    GraduationCap,
    RotateCcw,
    BarChart3,
    Link2
} from 'lucide-react';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden font-sans text-white selection:bg-lime-400 selection:text-black">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-lime-900/10 rounded-full blur-[120px]" />
            </div>

            <Navbar />

            <main className="relative z-10 container mx-auto px-4 pt-32 pb-20">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Complete Financial <span className="text-lime-400">Control</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        From automated bookkeeping to strategic insights, everyday tools to expert coaching.
                    </p>
                </div>

                <div className="space-y-32">

                    {/* Feature 1 */}
                    <FeatureSection
                        title="Accurate Financial Reporting & Compliance"
                        subtitle="Get reliable financial reports you can actually use for decisions — not just for filing."
                        icon={<ShieldCheck className="w-8 h-8 text-lime-400" />}
                        whatItDoes={[
                            "Structured bookkeeping with verified data",
                            "Automated Income Statement, Balance Sheet & Cash Flow",
                            "Compliance-ready financial records",
                            "AI-assisted processing with human verification"
                        ]}
                        whyItMatters={[
                            "Understand true profitability",
                            "Reduce compliance & audit risk",
                            "Build a solid foundation for funding or expansion"
                        ]}
                        align="left"
                    />

                    {/* Feature 2 */}
                    <FeatureSection
                        title="Proactive Cash Flow Management"
                        subtitle="Stay ahead of cash problems before they become business crises."
                        icon={<TrendingUp className="w-8 h-8 text-emerald-400" />}
                        whatItDoes={[
                            "Inflow & outflow tracking",
                            "Cash flow forecasting",
                            "Receivables & payables optimization",
                            "Early identification of liquidity gaps"
                        ]}
                        whyItMatters={[
                            "Avoid financial surprises",
                            "Maintain healthy working capital",
                            "Confidently seize growth opportunities"
                        ]}
                        align="right"
                    />

                    {/* Feature 3 */}
                    <FeatureSection
                        title="Financial Strategy & Risk Mitigation"
                        subtitle="Move beyond bookkeeping into strategic financial control."
                        icon={<BarChart3 className="w-8 h-8 text-purple-400" />}
                        whatItDoes={[
                            "Strategic financial planning",
                            "Smart tax planning & compliance",
                            "Risk identification & mitigation",
                            "Scenario analysis for growth decisions"
                        ]}
                        whyItMatters={[
                            "Make informed, data-driven decisions",
                            "Protect margins and cash position",
                            "Prepare your business for scale"
                        ]}
                        align="left"
                    />

                    {/* Feature 4 */}
                    <FeatureSection
                        title="Human + AI Financial Team"
                        subtitle="Technology that supports people — not replaces them."
                        icon={<Users className="w-8 h-8 text-blue-400" />}
                        whatItDoes={[
                            "AI speeds up data processing",
                            "Human experts validate and interpret results",
                            "Clear explanations, not just raw numbers",
                            "Continuous collaboration, not one-off reporting"
                        ]}
                        whyItMatters={[
                            "Higher accuracy than automation alone",
                            "Financial insights you can actually understand",
                            "Trusted partner, not just a tool"
                        ]}
                        align="right"
                    />

                    {/* Feature 5 */}
                    <FeatureSection
                        title="User-Friendly Financial Tools"
                        subtitle="Access your financial data anytime, without complexity."
                        icon={<Layout className="w-8 h-8 text-orange-400" />}
                        whatItDoes={[
                            "Centralized financial tools",
                            "24-hour access to reports",
                            "Clean, structured financial outputs",
                            "Designed for non-finance founders"
                        ]}
                        whyItMatters={[
                            "No dependency on spreadsheets chaos",
                            "Faster reviews and decisions",
                            "Transparency across stakeholders"
                        ]}
                        align="left"
                    />

                    {/* Feature 6 */}
                    <FeatureSection
                        title="Hands-On Coaching & Knowledge Transfer"
                        subtitle="We don’t just deliver reports — we build your financial capability."
                        icon={<GraduationCap className="w-8 h-8 text-pink-400" />}
                        whatItDoes={[
                            "Hands-on guidance and coaching",
                            "Finance literacy for founders & teams",
                            "Support for internal finance operations",
                            "Long-term capability building"
                        ]}
                        whyItMatters={[
                            "You understand your numbers, not just receive them",
                            "Stronger internal decision-making",
                            "Reduced long-term dependency"
                        ]}
                        align="right"
                    />

                    {/* Feature 7 - Centered Flow */}
                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10 max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-lime-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <RotateCcw className="w-8 h-8 text-lime-400" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Streamlined Working Flow</h2>
                            <p className="text-gray-400">A simple, structured process that saves time.</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 relative">
                            {['Upload invoices & documents', 'AI + team verification', 'Client submits bank statements', 'Financial reports delivered'].map((step, i) => (
                                <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5 text-center relative z-10">
                                    <div className="w-8 h-8 bg-lime-400 rounded-full text-black font-bold flex items-center justify-center mx-auto mb-3">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm">{step}</p>
                                </div>
                            ))}
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-[2rem] left-[10%] right-[10%] h-0.5 bg-white/10 z-0" />
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-lime-400 font-bold text-xl">Faster</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Turnaround</p>
                            </div>
                            <div>
                                <p className="text-lime-400 font-bold text-xl">Fewer</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Errors</p>
                            </div>
                            <div>
                                <p className="text-lime-400 font-bold text-xl">Consistent</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Reporting</p>
                            </div>
                        </div>
                    </div>

                    {/* Feature 8 - Impact */}
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-8">Kontinu Impact</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                "Clear understanding of business performance",
                                "More time to focus on operations & growth",
                                "Better strategic decisions based on reliable data",
                                "Reduced stress around accounting & tax",
                                "A financially resilient business ready for the future"
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-lime-400/30 transition-colors">
                                    <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-300">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature 9 - Integrations */}
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-3xl border border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <Link2 className="w-6 h-6 text-blue-400" />
                                <h3 className="text-xl font-bold">Strategic Integrations</h3>
                            </div>
                            <div className="space-y-4">
                                <IntegrationItem name="ESB POS" desc="Operational & financial data integration (F&B)" />
                                <IntegrationItem name="Accurate Online" desc="Cloud accounting automation" />
                                <IntegrationItem name="IWARE" desc="Reliable IT & hardware infrastructure" />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

function FeatureSection({ title, subtitle, icon, whatItDoes, whyItMatters, align }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`flex flex-col md:flex-row gap-12 items-start ${align === 'right' ? 'md:flex-row-reverse' : ''}`}
        >
            <div className={`flex-1 ${align === 'right' ? 'md:text-left' : 'md:text-left'}`}>
                <div className="mb-6 inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10">
                    {icon}
                </div>
                <h2 className="text-3xl font-bold mb-3">{title}</h2>
                <p className="text-gray-400 text-lg mb-8">{subtitle}</p>
            </div>

            <div className="flex-1 w-full grid gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-sm font-bold text-lime-400 uppercase tracking-widest mb-4">What it does</h3>
                    <ul className="space-y-3">
                        {whatItDoes.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50 mt-1.5" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">Why it matters</h3>
                    <ul className="space-y-3">
                        {whyItMatters.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50 mt-1.5" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.div>
    )
}

function IntegrationItem({ name, desc }: { name: string, desc: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <span className="font-bold text-white">{name}</span>
            <span className="text-sm text-gray-400">{desc}</span>
        </div>
    )
}
