"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Car, Users, MapPin, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

interface CarpoolPost {
  id: string;
  type: "offer" | "request";
  userName: string;
  userEmail: string;
  userId: string;
  fromArea: string;
  days: string[];
  departureTime: string;
  seats?: number;
  notes: string;
  createdAt: string;
}

interface Acceptance {
  id: string;
  rideId: string;
  rideArea: string;
  rideType: string;
  fromUserName: string;
  fromUserEmail: string;
  acceptedAt: string;
}

export default function CarpoolHistoryPage() {
  const [user] = useAuthState(auth);
  const [myPosts, setMyPosts] = useState<CarpoolPost[]>([]);
  const [myAcceptances, setMyAcceptances] = useState<Acceptance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      // Load all carpool posts made by this user
      const postsSnap = await getDocs(collection(db, "carpools"));
      const posts = postsSnap.docs
        .map(d => ({ id: d.id, ...d.data() })) as CarpoolPost[];
      const mine = posts.filter(p =>
        p.userId === user.uid || p.userEmail?.toLowerCase() === user.email?.toLowerCase()
      ).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setMyPosts(mine);

      // Load carpool notifications where this user accepted someone else's ride
      const notifSnap = await getDocs(collection(db, "carpool_notifications"));
      const acceptances = notifSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((n: any) =>
          n.fromUserEmail?.toLowerCase() === user.email?.toLowerCase() ||
          n.fromUserId === user.uid
        )
        .map((n: any) => ({
          id: n.id,
          rideId: n.rideId,
          rideArea: n.rideArea,
          rideType: n.type,
          fromUserName: n.fromUserName,
          fromUserEmail: n.fromUserEmail,
          acceptedAt: n.createdAt,
        })) as Acceptance[];
      setMyAcceptances(acceptances.sort((a, b) => (b.acceptedAt || "").localeCompare(a.acceptedAt || "")));
    } catch (e) {
      console.error("Failed to load carpool history:", e);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      });
    } catch { return dateStr; }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d2818] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/theme-mode" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Settings
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Car className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Carpool History</h1>
            <p className="text-emerald-200/70">Your ride offers and acceptances</p>
          </div>
        </div>

        {/* My Posts */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a5438] flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-white">My Posts</h2>
            <span className="ml-auto text-xs text-emerald-300/60">{myPosts.length} post{myPosts.length !== 1 ? "s" : ""}</span>
          </div>

          {myPosts.length === 0 ? (
            <div className="px-6 py-8 text-center text-emerald-200/50">
              <Car className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>You haven't posted any rides yet.</p>
              <Link href="/carpool" className="text-emerald-400 text-sm hover:underline mt-2 block">
                Go to Carpool →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#2a5438]">
              {myPosts.map(post => (
                <div key={post.id} className="px-6 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        post.type === "offer"
                          ? "bg-emerald-900/40 text-emerald-400"
                          : "bg-yellow-900/40 text-yellow-400"
                      }`}>
                        {post.type === "offer" ? "🚗 Offered Ride" : "🙋 Requested Ride"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{post.fromArea} → Farmingdale</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{post.departureTime}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.days.map(d => (
                      <span key={d} className="text-xs bg-[#0d2818] border border-[#2a5438] text-emerald-300 px-2 py-0.5 rounded-full">
                        {d}
                      </span>
                    ))}
                  </div>
                  {post.type === "offer" && post.seats && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{post.seats} seat{post.seats > 1 ? "s" : ""} available</span>
                    </div>
                  )}
                  {post.notes && (
                    <p className="text-xs text-slate-400 italic">"{post.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rides I Accepted */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a5438] flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-white">Rides I Accepted</h2>
            <span className="ml-auto text-xs text-emerald-300/60">{myAcceptances.length} ride{myAcceptances.length !== 1 ? "s" : ""}</span>
          </div>

          {myAcceptances.length === 0 ? (
            <div className="px-6 py-8 text-center text-emerald-200/50">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>You haven't accepted any rides yet.</p>
              <Link href="/carpool" className="text-emerald-400 text-sm hover:underline mt-2 block">
                Browse rides →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#2a5438]">
              {myAcceptances.map(acc => (
                <div key={acc.id} className="px-6 py-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <p className="font-semibold text-white text-sm">
                        {acc.rideArea} → Farmingdale
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(acc.acceptedAt)}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-6">
                    You accepted this carpool request
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}