"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { MapPin, Clock, Users, Car, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

interface RideOffer {
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
  userName: string;
  userEmail: string;
  userId: string;
  acceptedAt: string;
}

export default function CarpoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [ride, setRide] = useState<RideOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);
  const [acceptances, setAcceptances] = useState<Acceptance[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [params.id, user]);

  async function load() {
    try {
      // Load ride
      const snap = await getDoc(doc(db, "carpools", params.id as string));
      if (snap.exists()) {
        const rideData = { id: snap.id, ...snap.data() } as RideOffer;
        setRide(rideData);

        // Load acceptances
        const accSnap = await getDocs(collection(db, "carpools", params.id as string, "acceptances"));
        const accs = accSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Acceptance[];
        setAcceptances(accs);

        // Check if current user already accepted
        if (user) {
          const mine = accs.find(a => a.userId === user.uid);
          if (mine) setAlreadyAccepted(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!user || !ride) return;
    setCompleting(true);
    try {
      // Save acceptance
      await addDoc(collection(db, "carpools", ride.id, "acceptances"), {
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "FSC Student",
        userEmail: user.email,
        acceptedAt: new Date().toISOString(),
      });

      // Save notification for the ride poster
      await addDoc(collection(db, "carpool_notifications"), {
        toUserId: ride.userId,
        toUserEmail: ride.userEmail,
        fromUserName: user.displayName || user.email?.split("@")[0] || "FSC Student",
        fromUserEmail: user.email,
        rideId: ride.id,
        rideArea: ride.fromArea,
        type: "acceptance",
        message: `${user.displayName || user.email?.split("@")[0]} accepted your carpool ${ride.type} from ${ride.fromArea}!`,
        createdAt: new Date().toISOString(),
        read: false,
      });

      // Delete the carpool post after acceptance
      await deleteDoc(doc(db, "carpools", ride.id));

      setCompleted(true);
      setAlreadyAccepted(true);
      load();
    } catch (e) {
      console.error("Failed to complete:", e);
    } finally {
      setCompleting(false);
    }
  }

  function copyEmail(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d2818] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-[#0d2818] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p className="text-xl">Ride not found.</p>
          <Link href="/carpool" className="text-emerald-400 hover:underline">← Back to Carpool</Link>
        </div>
      </div>
    );
  }

  const isOffer = ride.type === "offer";
  const isOwner = user?.uid === ride.userId || user?.email === ride.userEmail;

  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-50">
      <div className="max-w-lg mx-auto px-6 py-12 space-y-6">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Carpool
        </button>

        {/* Ride Info */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
              isOffer ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
            }`}>
              {ride.userName?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{ride.userName}</h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isOffer ? "bg-emerald-900/40 text-emerald-400" : "bg-yellow-900/40 text-yellow-400"
              }`}>
                {isOffer ? "🚗 Offering a Ride" : "🙋 Looking for a Ride"}
              </span>
            </div>
          </div>

          <div className="border-t border-[#2a5438] pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400">From</span>
              <span className="text-white font-semibold">{ride.fromArea} → Farmingdale State College</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400">Departure</span>
              <span className="text-white font-semibold">{ride.departureTime}</span>
            </div>
            {isOffer && ride.seats && (
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400">Seats available</span>
                <span className="text-white font-semibold">{ride.seats}</span>
              </div>
            )}
            <div className="flex items-start gap-3 text-sm">
              <Car className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-400">Days</span>
              <div className="flex flex-wrap gap-1">
                {ride.days.map(d => (
                  <span key={d} className="bg-[#0d2818] border border-[#2a5438] text-emerald-300 px-2 py-0.5 rounded-full text-xs">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            {ride.notes && (
              <div className="bg-[#0d2818] border border-[#2a5438] rounded-xl p-3 text-sm text-slate-300 italic">
                "{ride.notes}"
              </div>
            )}
          </div>
        </div>

        {/* Contact + Complete — for non-owners */}
        {!isOwner && (
          <div className="bg-[#142a1e] border border-emerald-500/40 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              Contact Information
            </h2>

            <div className="bg-[#0d2818] border border-[#2a5438] rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">FSC Email</p>
                <p className="text-white font-semibold">{ride.userEmail}</p>
              </div>
              <button
                onClick={() => copyEmail(ride.userEmail)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  copiedEmail === ride.userEmail
                    ? "bg-emerald-500 text-slate-900"
                    : "bg-[#142a1e] border border-[#2a5438] text-emerald-400 hover:border-emerald-400"
                }`}
              >
                {copiedEmail === ride.userEmail ? <><CheckCircle className="w-3.5 h-3.5 inline mr-1" />Copied!</> : "Copy"}
              </button>
            </div>

            {completed || alreadyAccepted ? (
              <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 font-bold">
                <CheckCircle className="w-5 h-5" />
                {completed ? "Request Accepted! They've been notified." : "You already accepted this ride."}
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-bold transition-all"
              >
                {completing ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><CheckCircle className="w-5 h-5" /> Complete</>
                )}
              </button>
            )}
            <p className="text-xs text-slate-500 text-center">
              Clicking Complete notifies the poster that you accepted their carpool request
            </p>
          </div>
        )}

        {/* Owner view — see who accepted */}
        {isOwner && acceptances.length > 0 && (
          <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              People Who Accepted ({acceptances.length})
            </h2>
            <div className="space-y-3">
              {acceptances.map(acc => (
                <div key={acc.id} className="bg-[#0d2818] border border-[#2a5438] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      {acc.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{acc.userName}</p>
                      <p className="text-xs text-slate-400">{acc.userEmail}</p>
                    </div>
                    <button
                      onClick={() => copyEmail(acc.userEmail)}
                      className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        copiedEmail === acc.userEmail
                          ? "bg-emerald-500 text-slate-900"
                          : "bg-[#142a1e] border border-[#2a5438] text-emerald-400 hover:border-emerald-400"
                      }`}
                    >
                      {copiedEmail === acc.userEmail ? "Copied!" : "Copy Email"}
                    </button>
                  </div>
                  <a
                    href={`mailto:${acc.userEmail}?subject=RamPark Carpool - ${ride.fromArea} to FSC`}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold transition"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email {acc.userName}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {isOwner && acceptances.length === 0 && (
          <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl p-6 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No one has accepted yet. Share the carpool page!</p>
          </div>
        )}

      </div>
    </div>
  );
}