'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.toLowerCase().endsWith('@farmingdale.edu')) {
        throw new Error('Only FSC email addresses are allowed.');
      }

      await signInWithEmailAndPassword(auth, email, password);
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d2818] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#142a1e] border border-[#2a5438] flex items-center justify-center shadow-lg">
            <span className="text-[#e0b83a] font-extrabold text-xl">RP</span>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-emerald-400">
              System Access · Farmingdale State College
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-white">
              Sign in to RamPark
            </h1>
            <p className="mt-2 text-sm text-emerald-200/80">
              Use your <span className="font-semibold">@farmingdale.edu</span> credentials.
            </p>
          </div>
        </div>

        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl px-6 py-8 shadow-2xl">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200 mb-2">
                Email address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-300/70">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-[#0d2014] border border-[#2a5438] px-9 py-2.5 text-sm text-emerald-50 placeholder:text-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-[#e0b83a] focus:border-[#e0b83a] transition"
                  placeholder="student@farmingdale.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-300/70">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-[#0d2014] border border-[#2a5438] px-9 py-2.5 text-sm text-emerald-50 placeholder:text-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-[#e0b83a] focus:border-[#e0b83a] transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e0b83a] px-4 py-2.5 text-sm font-semibold text-[#132217] shadow-[0_0_20px_rgba(224,184,58,0.4)] hover:bg-[#f0c94d] transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-xs text-center text-emerald-200/70">
            Don&apos;t have an account?{' '}
            <Link
              href="/sign-up"
              className="font-semibold text-[#e0b83a] hover:text-yellow-300 underline-offset-2 hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>

        <p className="text-[10px] text-center text-emerald-400/60">
          Access restricted to FSC accounts.
        </p>
      </div>
    </div>
  );
}