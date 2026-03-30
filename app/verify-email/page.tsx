"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMsg("No verification token found in the link.");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/verify-email?token=${token}`);
                const data = await res.json();

                if (res.ok) {
                    if (data.message === "already_verified") {
                        setStatus("already");
                    } else {
                        setStatus("success");
                        // Auto-redirect to login after 3 seconds
                        setTimeout(() => router.push("/login?verified=true"), 3000);
                    }
                } else {
                    setStatus("error");
                    setErrorMsg(data.error || "Verification failed.");
                }
            } catch {
                setStatus("error");
                setErrorMsg("An unexpected error occurred. Please try again.");
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <div className="glass p-10 w-full max-w-md text-center">
                {status === "loading" && (
                    <>
                        <Loader2 className="animate-spin text-[#ff7a1a] mx-auto mb-6" size={48} />
                        <h1 className="font-display text-2xl text-white mb-2">Verifying your email...</h1>
                        <p className="text-[#b1b1ba] text-sm">Please wait a moment.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-green-400" size={40} />
                        </div>
                        <h1 className="font-display text-3xl text-white mb-3">Email Verified!</h1>
                        <p className="text-[#b1b1ba] mb-8">
                            Your email has been verified successfully. You can now sign in to your HOJ Hostel account.
                        </p>
                        <p className="text-xs text-[#b1b1ba] mb-6">Redirecting you to login in 3 seconds...</p>
                        <Link
                            href="/login?verified=true"
                            className="inline-block bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold py-3 px-8 rounded-xl shadow-[0_10px_30px_rgba(255,122,26,0.28)] hover:scale-[1.02] transition-all"
                        >
                            Sign In Now
                        </Link>
                    </>
                )}

                {status === "already" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-[#ff7a1a]" size={40} />
                        </div>
                        <h1 className="font-display text-3xl text-white mb-3">Already Verified</h1>
                        <p className="text-[#b1b1ba] mb-8">
                            Your email address has already been verified. Just sign in to your account.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold py-3 px-8 rounded-xl shadow-[0_10px_30px_rgba(255,122,26,0.28)] hover:scale-[1.02] transition-all"
                        >
                            Go to Sign In
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
                            <XCircle className="text-red-400" size={40} />
                        </div>
                        <h1 className="font-display text-3xl text-white mb-3">Verification Failed</h1>
                        <p className="text-[#b1b1ba] mb-8">{errorMsg}</p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/register"
                                className="inline-block bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold py-3 px-8 rounded-xl shadow-[0_10px_30px_rgba(255,122,26,0.28)] hover:scale-[1.02] transition-all"
                            >
                                Register Again
                            </Link>
                            <Link href="/" className="text-[#b1b1ba] hover:text-white text-sm transition-colors">
                                Back to Home
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

import { Suspense } from "react";

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[80vh] flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#ff7a1a]" size={40} />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
