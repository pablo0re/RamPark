'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getValetRequests } from '@/lib/api';
import { Settings, Bell, LogOut, Trash2, MapPin, Car, X, ArrowLeft } from 'lucide-react';

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const isSettingsPage = pathname === '/theme-mode';

  const [user] = useAuthState(auth);
  const ADMIN_EMAILS = ["orelpm@farmingdale.edu", "hamzm@farmingdale.edu"];
  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [valetRequests, setValetRequests] = useState<any[]>([]);
  const [carpoolNotifications, setCarpoolNotifications] = useState<any[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  useEffect(() => {
    const key = `rampark_dismissed_notifications_${user?.email || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setDismissedNotifications(JSON.parse(saved)); }
      catch { setDismissedNotifications([]); }
    } else {
      setDismissedNotifications([]);
    }
  }, [user?.email]);

  const saveDismissedNotifications = (updated: string[]) => {
    const key = `rampark_dismissed_notifications_${user?.email || 'guest'}`;
    setDismissedNotifications(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const dismissNotification = (notificationId: string) => {
    if (dismissedNotifications.includes(notificationId)) return;
    saveDismissedNotifications([...dismissedNotifications, notificationId]);
  };

  const loadValetRequests = async () => {
    try {
      const data = await getValetRequests();
      setValetRequests(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Load carpool notifications for current user
  const loadCarpoolNotifications = async () => {
    if (!user) return;
    try {
      const snap = await getDocs(collection(db, 'carpool_notifications'));
      const mine = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((n: any) =>
          n.toUserId === user.uid || n.toUserEmail?.toLowerCase() === user.email?.toLowerCase()
        );
      setCarpoolNotifications(mine);
    } catch (e) {
      console.error('Failed to load carpool notifications:', e);
    }
  };

  useEffect(() => {
    router.prefetch('/');
    loadValetRequests();
    const interval = setInterval(loadValetRequests, 1800000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (user) loadCarpoolNotifications();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setProfileOpen(false);
    setSettingsOpen(false);
    setNotificationsOpen(false);
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
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email ? user.email[0].toUpperCase() : 'U';

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const allNotifications = useMemo(() => {
    if (!user?.email) return [];

    // Valet notifications
    let relevantRequests = valetRequests;
    if (!isAdmin) {
      relevantRequests = valetRequests.filter((item) => {
        const emailMatch = item.userEmail?.toLowerCase() === user.email?.toLowerCase();
        const nameMatch = item.studentName?.toLowerCase() === (user.displayName || '').toLowerCase();
        return emailMatch || nameMatch;
      });
    }
    const valetNotes = relevantRequests.flatMap((item) => {
      const notes: { id: string; text: string; createdAt: string }[] = [];
      if (isAdmin) {
        if (item.status === 'pending') notes.push({ id: `${item.id}-pending`, text: `New valet request from ${item.studentName} at ${item.pickupLocation}.`, createdAt: item.createdAt || '' });
        if (item.status === 'return_requested') notes.push({ id: `${item.id}-return_requested`, text: `${item.studentName} requested the car back at ${item.returnLocation} for ${item.returnTime}.`, createdAt: item.returnRequestedAt || item.createdAt || '' });
      } else {
        if (item.status === 'pending') notes.push({ id: `${item.id}-pending`, text: 'Your valet request is pending review.', createdAt: item.createdAt || '' });
        else if (item.status === 'approved') notes.push({ id: `${item.id}-approved`, text: `Your valet request was approved. Assigned valet: ${item.assignedValet || 'Valet assigned'}.`, createdAt: item.approvedAt || item.createdAt || '' });
        else if (item.status === 'vehicle_received') notes.push({ id: `${item.id}-vehicle_received`, text: 'Your vehicle has been received by the valet.', createdAt: item.vehicleReceivedAt || item.createdAt || '' });
        else if (item.status === 'parked') notes.push({ id: `${item.id}-parked`, text: `Your vehicle is parked${item.assignedLotName ? ` in ${item.assignedLotName}` : ''}.`, createdAt: item.parkedAt || item.createdAt || '' });
        else if (item.status === 'return_requested') notes.push({ id: `${item.id}-return_requested`, text: 'Your return request was sent to the valet.', createdAt: item.returnRequestedAt || item.createdAt || '' });
        else if (item.status === 'return_in_progress') notes.push({ id: `${item.id}-return_in_progress`, text: 'Your vehicle return is in progress.', createdAt: item.returnInProgressAt || item.createdAt || '' });
        else if (item.status === 'completed') notes.push({ id: `${item.id}-completed`, text: 'Your valet request has been completed.', createdAt: item.completedAt || item.createdAt || '' });
        else if (item.status === 'cancelled') notes.push({ id: `${item.id}-cancelled`, text: 'Your valet request was cancelled.', createdAt: item.cancelledAt || item.createdAt || '' });
        else if (item.status === 'rejected') notes.push({ id: `${item.id}-rejected`, text: 'Your valet request was rejected.', createdAt: item.rejectedAt || item.createdAt || '' });
      }
      return notes;
    });

    // Carpool notifications
    const carpoolNotes = carpoolNotifications.map((n: any) => ({
      id: `carpool-${n.id}`,
      text: `🚗 ${n.message}`,
      createdAt: n.createdAt || '',
    }));

    return [...valetNotes, ...carpoolNotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [valetRequests, carpoolNotifications, user, isAdmin]);

  const unreadNotifications = useMemo(() => {
    return allNotifications.filter((note) => !dismissedNotifications.includes(note.id));
  }, [allNotifications, dismissedNotifications]);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-[#2a5438] bg-[#0d2818]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/theme-mode"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a5438] bg-[#142a1e] text-emerald-200 hover:border-[#3a7a50] hover:text-emerald-100 transition"
          >
            <Settings className="h-4 w-4" />
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#142a1e] border border-[#2a5438] shadow">
              <span className="text-sm font-extrabold text-[#e0b83a]">RP</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-slate-50">RamPark</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">FSC Smart Parking</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="relative">
              <button
                onClick={() => { setNotificationsOpen((o) => !o); setSettingsOpen(false); setProfileOpen(false); }}
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#142a1e] border border-[#2a5438] text-emerald-200 hover:border-[#3a7a50] transition"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#e0b83a] text-[9px] font-bold text-[#132217]">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#2a5438] bg-[#142a1e] shadow-2xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-[#2a5438]">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Notifications</div>
                    <div className="mt-1 text-[11px] text-emerald-200/80">Valet & carpool updates</div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {unreadNotifications.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-emerald-200/80">No new notifications.</div>
                    ) : (
                      unreadNotifications.map((note) => (
                        <div key={note.id} className="flex items-start justify-between gap-3 px-4 py-3 text-xs text-slate-50 border-b border-[#23452f] last:border-b-0">
                          <div className="flex-1">{note.text}</div>
                          <button onClick={() => dismissNotification(note.id)} className="mt-0.5 text-emerald-300 hover:text-white transition" title="Dismiss">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
                <span className="hidden text-xs font-medium text-slate-50 sm:inline">{displayName}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#2a5438] bg-[#142a1e] shadow-2xl py-2 z-50">
                  <div className="px-3 pb-2 text-xs text-emerald-200/80">
                    Signed in as
                    <div className="truncate text-[11px] font-semibold text-emerald-100">{user.email}</div>
                  </div>
                  <div className="my-1 border-t border-[#2a5438]" />
                  {isSettingsPage ? (
                    <button
                      onClick={() => { setProfileOpen(false); router.push('/'); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-emerald-200 hover:bg-[#1a3d28]"
                    >
                      <ArrowLeft className="h-4 w-4 text-emerald-300" />
                      Go Back
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-300 hover:bg-red-900/40"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-900/40"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}