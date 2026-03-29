"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass p-8 md:p-10 w-full max-w-md">
        <h1 className="font-display text-3xl mb-2 text-center">Welcome Back</h1>
        <p className="text-[#b1b1ba] text-center mb-8">Sign in to your HOJ Hostel account</p>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff7a1a] transition-colors"
              required
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-[#111] font-bold py-3.5 rounded-xl shadow-[0_10px_30px_rgba(255,122,26,0.28)] hover:scale-[1.02] transition-transform mt-2">
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#b1b1ba]">
          Don't have an account? <Link href="/register" className="text-[#ff7a1a] hover:underline font-semibold">Create one</Link>
        </div>
      </div>
    </div>
  );
}
