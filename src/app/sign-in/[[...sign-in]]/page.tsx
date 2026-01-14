import { SignIn } from '@clerk/nextjs';
import { Navbar } from '@/components/navbar';

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-lime-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="absolute top-0 w-full z-50">
                <Navbar />
            </div>

            <div className="relative z-10 mt-20">
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl",
                            headerTitle: "text-white",
                            headerSubtitle: "text-gray-400",
                            socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                            socialButtonsBlockButtonText: "text-white",
                            dividerLine: "bg-white/10",
                            dividerText: "text-gray-500",
                            formFieldLabel: "text-gray-300",
                            formFieldInput: "bg-black/40 border-white/10 text-white",
                            footer: "text-gray-400",
                            footerActionLink: "text-lime-400 hover:text-lime-300",
                            identityPreviewText: "text-white",
                            formButtonPrimary: "bg-lime-400 hover:bg-lime-500 text-black font-bold",
                        },
                    }}
                />
            </div>
        </div>
    );
}
