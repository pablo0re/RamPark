'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Settings, Bell, LogOut, History, User as UserIcon, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function TopBar() {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const close = () => {
      setSettingsOpen(false);
      setProfileOpen(false);
    };
    router.prefetch('/');
    return () => close();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    setProfileOpen(false);
    setSettingsOpen(false);
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmed) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("http://127.0.0.1:8000/user/account", {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Account deleted successfully.");
        router.push("/sign-in");
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : 'U';

  const displayName =
    user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a5438] bg-[#0d2818]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a5438] bg-[#142a1e] text-emerald-200 hover:border-[#3a7a50] hover:text-emerald-100 transition"
          >
            <Settings className="h-4 w-4" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#142a1e] border border-[#2a5438] shadow">
              <span className="text-sm font-extrabold text-[#e0b83a]">RP</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-slate-50">RamPark</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
                FSC Smart Parking
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#142a1e] border border-[#2a5438] text-emerald-200 hover:border-[#3a7a50] transition">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e0b83a] text-[9px] font-bold text-[#132217]">
                3
              </span>
            </button>
          )}

          {!user && (
            <Link href="/sign-in">
              <button className="inline-flex items-center rounded-xl bg-[#e0b83a] px-4 py-2 text-xs font-semibold text-[#132217] shadow hover:bg-[#f0c94d] transition">
                Sign In
              </button>
            </Link>
          )}

          {user && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full bg-[#142a1e] px-2 py-1 pl-1 pr-3 border border-[#2a5438] hover:border-[#3a7a50] transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-300 text-[#02140a] font-bold text-xs shadow">
                  {initials}
                </div>
                <span className="hidden text-xs font-medium text-slate-50 sm:inline">
                  {displayName}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#2a5438] bg-[#142a1e] shadow-2xl py-2 z-50">
                  <div className="px-3 pb-2 text-xs text-emerald-200/80">
                    Signed in as
                    <div className="truncate text-[11px] font-semibold text-emerald-100">
                      {user.email}
                    </div>
                  </div>
                  <div className="my-1 border-t border-[#2a5438]" />
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-50 hover:bg-[#1a3d28]">
                    <UserIcon className="h-4 w-4 text-emerald-300" />
                    Profile
                  </button>
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-50 hover:bg-[#1a3d28]">
                    <History className="h-4 w-4 text-emerald-300" />
                    Parking history
                  </button>
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-50 hover:bg-[#1a3d28]">
                    <ImageIcon className="h-4 w-4 text-emerald-300" />
                    Add profile picture
                  </button>
                  <div className="my-1 border-t border-[#2a5438]" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-300 hover:bg-red-900/40"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-black hover:bg-red-900/40"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {settingsOpen && (
        <div className="absolute left-4 top-16 z-40 w-72 rounded-2xl border border-[#2a5438] bg-[#142a1e] shadow-2xl">
          <div className="px-4 py-3 border-b border-[#2a5438]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Settings
            </div>
            <div className="mt-1 text-[11px] text-emerald-200/80">
              Manage notifications, history, and account.
            </div>
          </div>
          <div className="py-1">
            <button className="flex w-full items-center gap-3 px-4 py-2 text-xs text-slate-50 hover:bg-[#1a3d28]">
              <Bell className="h-4 w-4 text-emerald-300" />
              Notifications
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-2 text-xs text-slate-50 hover:bg-[#1a3d28]">
              <History className="h-4 w-4 text-emerald-300" />
              Parking history
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-2 text-xs text-slate-50 hover:bg-[#1a3d28]">
              <ImageIcon className="h-4 w-4 text-emerald-300" />
              Add profile picture
            </button>
          </div>
          <div className="border-t border-[#2a5438] py-1">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2 text-xs text-red-300 hover:bg-red-900/40"
              >
                <LogOut className="h-4 w-4" />
                Log off
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="flex w-full items-center gap-3 px-4 py-2 text-xs text-emerald-200 hover:bg-[#1a3d28]"
              >
                <UserIcon className="h-4 w-4 text-emerald-300" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}