"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DollarSign, CheckCircle, Clock, CreditCard, History, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ValetRequest {
  id: string;
  studentName: string;
  pickupLocation: string;
  requestedTime: string;
  serviceFee: number;
  status: string;
  paymentStatus?: string;
  paidAt?: string;
  createdAt?: string;
  notes?: string;
}

export default function PaymentsPage() {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState<ValetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const unpaid = requests.filter(r => r.paymentStatus !== "paid");
  const paid = requests.filter(r => r.paymentStatus === "paid");

  useEffect(() => {
    loadRequests();
  }, [user]);

  async function loadRequests() {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "valet_requests"));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ValetRequest[];
      const mine = all.filter((r: any) =>
        r.userEmail?.toLowerCase() === user.email?.toLowerCase() ||
        r.userId === user.uid
      ).sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setRequests(mine);
    } catch (e) {
      console.error("Failed to load requests:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePay(requestId: string) {
    setPaying(requestId);
    setMessage("");
    try {
      await updateDoc(doc(db, "valet_requests", requestId), {
        paymentStatus: "paid",
        paidAt: new Date().toISOString(),
      });
      setMessage("Payment confirmed successfully!");
      loadRequests();
    } catch (e) {
      console.error("Payment failed:", e);
      setMessage("Payment failed. Please try again.");
    } finally {
      setPaying(null);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
      });
    } catch { return dateStr; }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d2818] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Payments</h1>
            <p className="text-emerald-200/70">Manage your valet service payments</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            message.includes("success")
              ? "bg-emerald-900/40 border-emerald-500/40 text-emerald-300"
              : "bg-red-900/40 border-red-500/40 text-red-300"
          }`}>
            <CheckCircle className="w-5 h-5" />
            {message}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl p-4 text-center">
            <p className="text-xs text-emerald-200/60 uppercase tracking-wider mb-1">Total Requests</p>
            <p className="text-3xl font-bold text-white">{requests.length}</p>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 text-center">
            <p className="text-xs text-red-300/70 uppercase tracking-wider mb-1">Unpaid</p>
            <p className="text-3xl font-bold text-red-400">{unpaid.length}</p>
          </div>
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-4 text-center">
            <p className="text-xs text-emerald-300/70 uppercase tracking-wider mb-1">Paid</p>
            <p className="text-3xl font-bold text-emerald-400">{paid.length}</p>
          </div>
        </div>

        {/* Unpaid section */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a5438] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h2 className="font-bold text-lg text-white">Pending Payments</h2>
            {unpaid.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unpaid.length}
              </span>
            )}
          </div>

          {unpaid.length === 0 ? (
            <div className="px-6 py-8 text-center text-emerald-200/50">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
              <p>All payments are up to date!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2a5438]">
              {unpaid.map((request) => (
                <div key={request.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{request.pickupLocation || "Campus Valet"}</p>
                      <span className="text-xs bg-[#1a3d28] text-emerald-300 px-2 py-0.5 rounded-full">
                        {request.status}
                      </span>
                    </div>
                    {request.notes && (
                      <p className="text-sm text-emerald-200/60 mb-1">🚗 {request.notes}</p>
                    )}
                    <p className="text-xs text-slate-400">{formatDate(request.createdAt || "")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-[#e0b83a]">${request.serviceFee || 5}</span>
                    <button
                      onClick={() => handlePay(request.id)}
                      disabled={paying === request.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-bold text-sm transition-all"
                    >
                      {paying === request.id ? (
                        <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <DollarSign className="w-4 h-4" />
                      )}
                      {paying === request.id ? "Processing..." : "Pay Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a5438] flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-300" />
            <h2 className="font-bold text-lg text-white">Payment History</h2>
          </div>

          {paid.length === 0 ? (
            <div className="px-6 py-8 text-center text-emerald-200/50">
              <Clock className="w-10 h-10 mx-auto mb-3" />
              <p>No payment history yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2a5438]">
              {paid.map((request) => (
                <div key={request.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{request.pickupLocation || "Campus Valet"}</p>
                      <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Paid
                      </span>
                    </div>
                    {request.notes && (
                      <p className="text-sm text-emerald-200/60 mb-1">🚗 {request.notes}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      Paid on {formatDate(request.paidAt || "")}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-emerald-400">${request.serviceFee || 5}</span>
                </div>
              ))}

              {/* Total */}
              <div className="px-6 py-4 bg-[#1a3d28] flex items-center justify-between">
                <p className="font-bold text-white">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-400">
                  ${paid.reduce((sum, r) => sum + (r.serviceFee || 5), 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/theme-mode" className="text-sm text-emerald-400 hover:text-emerald-300 transition">
            ← Back to Settings
          </Link>
        </div>
      </div>
    </div>
  );
}