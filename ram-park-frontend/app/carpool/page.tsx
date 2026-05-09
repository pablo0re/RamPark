"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy
} from "firebase/firestore";
import { Car, MapPin, Clock, Users, Plus, Trash2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RideOffer {
  id: string;
  type: "offer" | "request";
  userId: string;
  userEmail: string;
  userName: string;
  fromArea: string;
  days: string[];
  departureTime: string;
  seats?: number;
  notes: string;
  createdAt: string;
}

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LONG_ISLAND_AREAS = [
  "Syosset", "Hicksville", "Farmingdale", "Bethpage", "Levittown",
  "Plainview", "Melville", "Huntington", "Commack", "Amityville",
  "Babylon", "Bay Shore", "Islip", "Brentwood", "Central Islip",
  "Deer Park", "Dix Hills", "East Northport", "Elmont", "Floral Park",
  "Garden City", "Great Neck", "Hempstead", "Jericho", "Lynbrook",
  "Massapequa", "Mineola", "New Hyde Park", "Oceanside", "Rockville Centre",
  "Seaford", "Valley Stream", "Westbury", "Woodbury", "Other"
];

export default function CarpoolPage() {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<"browse" | "offer" | "request">("browse");
  const [rides, setRides] = useState<RideOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterType, setFilterType] = useState<"all" | "offer" | "request">("all");

  const [form, setForm] = useState({
    type: "offer" as "offer" | "request",
    fromArea: "",
    days: [] as string[],
    departureTime: "",
    seats: 1,
    notes: "",
  });

  useEffect(() => {
    loadRides();
  }, []);

  async function loadRides() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "carpools"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as RideOffer[];
      setRides(data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")));
    } catch (e) {
      console.error("Failed to load rides:", e);
    } finally {
      setLoading(false);
    }
  }

  function toggleDay(day: string) {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  }

  async function handleSubmit() {
    if (!user) { setMessage("Please sign in first."); return; }
    if (!form.fromArea || form.days.length === 0 || !form.departureTime) {
      setMessage("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      await addDoc(collection(db, "carpools"), {
        type: activeTab === "offer" ? "offer" : "request",
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split("@")[0] || "FSC Student",
        fromArea: form.fromArea,
        days: form.days,
        departureTime: form.departureTime,
        seats: activeTab === "offer" ? form.seats : null,
        notes: form.notes,
        createdAt: new Date().toISOString(),
      });
      setMessage(activeTab === "offer" ? "Ride offer posted!" : "Ride request posted!");
      setForm({ type: "offer", fromArea: "", days: [], departureTime: "", seats: 1, notes: "" });
      loadRides();
      setActiveTab("browse");
    } catch (e) {
      console.error("Failed to post:", e);
      setMessage("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this post?")) return;
    try {
      await deleteDoc(doc(db, "carpools", id));
      loadRides();
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  }

  const filtered = rides.filter(r => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterArea && r.fromArea !== filterArea) return false;
    if (filterDay && !r.days.includes(filterDay)) return false;
    return true;
  });

  const offers = filtered.filter(r => r.type === "offer");
  const requests = filtered.filter(r => r.type === "request");

  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/30 rounded-full px-4 py-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">FSC Carpool Network</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Campus Carpool</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Connect with fellow FSC students to share rides to campus. Save money, reduce traffic, and meet people from your area!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[#142a1e] border border-[#2a5438] rounded-2xl p-1.5">
          {[
            { key: "browse", label: "Browse Rides", icon: Search },
            { key: "offer", label: "Offer a Ride", icon: Car },
            { key: "request", label: "Request a Ride", icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key as any); setMessage(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? "bg-emerald-500 text-slate-900"
                  : "text-emerald-200/70 hover:text-emerald-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Browse Tab */}
        {activeTab === "browse" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl p-4 flex flex-wrap gap-3">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className="bg-[#0d2818] border border-[#2a5438] text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
              >
                <option value="all">All Posts</option>
                <option value="offer">Offers Only</option>
                <option value="request">Requests Only</option>
              </select>
              <select
                value={filterArea}
                onChange={e => setFilterArea(e.target.value)}
                className="bg-[#0d2818] border border-[#2a5438] text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
              >
                <option value="">All Areas</option>
                {LONG_ISLAND_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select
                value={filterDay}
                onChange={e => setFilterDay(e.target.value)}
                className="bg-[#0d2818] border border-[#2a5438] text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
              >
                <option value="">All Days</option>
                {DAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="ml-auto text-xs text-slate-400 self-center">
                {filtered.length} post{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl p-12 text-center">
                <Car className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No carpool posts yet.</p>
                <button
                  onClick={() => setActiveTab("offer")}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl text-sm transition"
                >
                  Be the first to post!
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Offers */}
                {offers.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Car className="w-5 h-5 text-emerald-400" /> Ride Offers ({offers.length})
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {offers.map(ride => (
                        <RideCard key={ride.id} ride={ride} user={user} onDelete={handleDelete} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Requests */}
                {requests.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-yellow-400" /> Ride Requests ({requests.length})
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {requests.map(ride => (
                        <RideCard key={ride.id} ride={ride} user={user} onDelete={handleDelete} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Offer / Request Form */}
        {(activeTab === "offer" || activeTab === "request") && (
          <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl p-6 space-y-5">
            <h2 className="text-xl font-bold text-white">
              {activeTab === "offer" ? "Post a Ride Offer" : "Post a Ride Request"}
            </h2>
            <p className="text-sm text-slate-400">
              {activeTab === "offer"
                ? "Let other FSC students know you have seats available on your commute."
                : "Let drivers know you're looking for a ride to campus."}
            </p>

            {!user && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-300 text-sm">
                You need to be signed in to post. <Link href="/sign-in" className="underline">Sign in here</Link>
              </div>
            )}

            {/* From Area */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1 text-emerald-400" />
                From Area *
              </label>
              <select
                value={form.fromArea}
                onChange={e => setForm(prev => ({ ...prev, fromArea: e.target.value }))}
                className="w-full bg-[#0d2818] border border-[#2a5438] text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
              >
                <option value="">Select your area</option>
                {LONG_ISLAND_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Days */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Days Available *
              </label>
              <div className="flex gap-2 flex-wrap">
                {DAY_OPTIONS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl border font-semibold text-sm transition-all ${
                      form.days.includes(day)
                        ? "bg-emerald-500 border-emerald-400 text-slate-900"
                        : "bg-[#0d2818] border-[#2a5438] text-slate-300 hover:border-emerald-400"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Departure Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1 text-emerald-400" />
                Departure Time *
              </label>
              <input
                type="time"
                value={form.departureTime}
                onChange={e => setForm(prev => ({ ...prev, departureTime: e.target.value }))}
                className="w-full bg-[#0d2818] border border-[#2a5438] text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Seats (only for offers) */}
            {activeTab === "offer" && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  <Users className="w-4 h-4 inline mr-1 text-emerald-400" />
                  Available Seats
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, seats: n }))}
                      className={`flex-1 py-2 rounded-xl border font-bold text-sm transition-all ${
                        form.seats === n
                          ? "bg-emerald-500 border-emerald-400 text-slate-900"
                          : "bg-[#0d2818] border-[#2a5438] text-slate-300 hover:border-emerald-400"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={activeTab === "offer"
                  ? "e.g. I leave from Syosset LIRR station, flexible on time"
                  : "e.g. Need a ride on MWF, can meet anywhere in Hicksville"}
                className="w-full bg-[#0d2818] border border-[#2a5438] text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 resize-none h-24"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-sm font-semibold ${
                message.includes("posted") || message.includes("!")
                  ? "bg-emerald-900/40 border border-emerald-500/30 text-emerald-300"
                  : "bg-red-900/40 border border-red-500/30 text-red-300"
              }`}>
                {message}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !user}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-bold transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  {activeTab === "offer" ? "Post Ride Offer" : "Post Ride Request"}
                </>
              )}
            </button>
          </div>
        )}

        {/* Info section */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl p-6">
          <h3 className="font-bold text-white mb-3">How Carpool Works</h3>
          <div className="space-y-2 text-sm text-slate-400">
            <p>1. Post a ride offer (if you drive) or ride request (if you need a ride)</p>
            <p>2. Browse posts from other FSC students going the same direction</p>
            <p>3. Contact them via your FSC email to coordinate details</p>
            <p>4. Only @farmingdale.edu accounts can post — keeping it safe and verified</p>
          </div>
        </div>

      </div>
    </div>
  );
}

function RideCard({ ride, user, onDelete }: { ride: RideOffer; user: any; onDelete: (id: string) => void }) {
  const isOwner = user?.uid === ride.userId || user?.email === ride.userEmail;
  const isOffer = ride.type === "offer";

  return (
    <div className={`bg-[#0d2818] border rounded-2xl p-5 space-y-3 ${
      isOffer ? "border-emerald-500/30" : "border-yellow-500/30"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isOffer ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
          }`}>
            {ride.userName?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{ride.userName}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isOffer
                ? "bg-emerald-900/40 text-emerald-400"
                : "bg-yellow-900/40 text-yellow-400"
            }`}>
              {isOffer ? "🚗 Offering Ride" : "🙋 Needs Ride"}
            </span>
          </div>
        </div>
        {isOwner && (
          <button onClick={() => onDelete(ride.id)} className="text-red-400 hover:text-red-300 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>From <strong className="text-white">{ride.fromArea}</strong> → Farmingdale</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Departs at <strong className="text-white">{ride.departureTime}</strong></span>
        </div>
        {isOffer && ride.seats && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span><strong className="text-white">{ride.seats}</strong> seat{ride.seats > 1 ? "s" : ""} available</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {ride.days.map(d => (
          <span key={d} className="text-xs bg-[#142a1e] border border-[#2a5438] text-emerald-300 px-2 py-0.5 rounded-full">
            {d}
          </span>
        ))}
      </div>

      {ride.notes && (
        <p className="text-xs text-slate-400 italic">"{ride.notes}"</p>
      )}

{!isOwner && (
  <Link
    href={`/carpool/${ride.id}`}
    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-sm font-bold transition"
  >
    Accept <ArrowRight className="w-3.5 h-3.5" />
  </Link>
)}
    </div>
  );
}