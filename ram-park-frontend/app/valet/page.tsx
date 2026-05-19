"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  requestValet,
  getValetRequests,
  cancelValetRequest,
  requestVehicleReturn,
  getLots,
  type ParkingLot,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  Car,
  Clock3,
  DollarSign,
  CheckCircle2,
  UserRound,
  ShieldCheck,
  MapPin,
  Briefcase,
  Phone,
  RotateCcw,
} from "lucide-react";

const ADMIN_EMAILS = ["orelpm@farmingdale.edu", "hamzm@farmingdale.edu"];

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ValetPage() {
  const [user] = useAuthState(auth);

  const [form, setForm] = useState({
    userId: "demo-user-1",
    studentName: "",
    phoneNumber: "",
    pickupLocation: "",
    requestedTime: "",
    preferredLotId: "",
    preferredLotName: "",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(false);

  const [returnForms, setReturnForms] = useState<Record<string, { returnLocation: string; returnTime: string; returnMessage: string }>>({});

  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");

  // Load vehicle profile and pre-fill notes
  useEffect(() => {
    const loadVehicle = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const vehicles = data.vehicles || [];
          const idx = data.selectedVehicleIndex ?? 0;
          const v = vehicles[idx];
          if (v) {
            setForm(prev => ({
              ...prev,
              notes: `${v.color} ${v.make} ${v.model}`.trim()
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load vehicle:", e);
      }
    };
    loadVehicle();
  }, [user]);

  async function loadRequests() {
    try {
      const data = await getValetRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    const loadLots = async () => {
      try {
        const data = await getLots();
        setParkingLots(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Failed to load parking lots:", error);
      }
    };
    loadLots();
  }, []);

  const myRequests = useMemo(() => {
    let filtered = requests;
    if (user?.email) {
      filtered = requests.filter((item) => {
        const emailMatch = item.userEmail?.toLowerCase() === user.email?.toLowerCase();
        const nameMatch = item.studentName?.toLowerCase() === (user.displayName || "").toLowerCase();
        return emailMatch || nameMatch;
      });
    }
    return [...filtered].sort((a, b) => {
      const aDate = a.createdAt || "";
      const bDate = b.createdAt || "";
      return bDate.localeCompare(aDate);
    });
  }, [requests, user]);

  const handleSubmit = async () => {
    if (!form.studentName || !form.phoneNumber || !form.pickupLocation || !form.requestedTime) {
      setMessage("Please fill out all required fields.");
      return;
    }
    try {
      setLoading(true);
      const result = await requestValet({
        ...form,
        userId: user?.uid || "demo-user-1",
        userEmail: user?.email || "",
      });
      setMessage(`Valet request submitted. Status: ${result.status}. Service fee: $${result.serviceFee}.`);
      setForm({
        userId: "demo-user-1",
        studentName: "",
        phoneNumber: "",
        pickupLocation: "",
        requestedTime: "",
        preferredLotId: "",
        preferredLotName: "",
        notes: "",
      });
      loadRequests();
    } catch (error) {
      console.error(error);
      setMessage("Failed to submit valet request. Make sure the backend and Firebase are running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelValetRequest(id);
      setMessage("Valet request cancelled.");
      loadRequests();
    } catch (error) {
      console.error(error);
      setMessage("Failed to cancel valet request.");
    }
  };

  const handleReturnChange = (
    id: string,
    field: "returnLocation" | "returnTime" | "returnMessage",
    value: string
  ) => {
    setReturnForms((prev) => ({
      ...prev,
      [id]: {
        returnLocation: prev[id]?.returnLocation || "",
        returnTime: prev[id]?.returnTime || "",
        returnMessage: prev[id]?.returnMessage || "",
        [field]: value,
      },
    }));
  };

  const handleRequestReturn = async (id: string) => {
    const form = returnForms[id];
    if (!form?.returnLocation || !form?.returnTime) {
      setMessage("Please enter the return location and return time.");
      return;
    }
    try {
      await requestVehicleReturn(id, form);
      setMessage("Vehicle return requested successfully.");
      loadRequests();
    } catch (error) {
      console.error(error);
      setMessage("Failed to request your vehicle back.");
    }
  };

  const shortcutCards = [
    { title: "Request Valet", description: "Submit a valet request for campus drop-off service.", icon: Car, href: "#request-form" },
    { title: "Track Status", description: "Follow your valet request from approval to parked and return.", icon: Clock3, href: "#request-status" },
    { title: "Request Car Back", description: "Ask for your vehicle to be returned to a location at a specific time.", icon: RotateCcw, href: "#request-status" },
    { title: "Payment Info", description: "$5 per request. For now, pay at drop-off.", icon: DollarSign, href: "#payment-info" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7faf7] to-[#eef6ef] px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-[#163720]">Smart Campus Valet</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            RamPark valet lets you hand off your vehicle at a campus pickup location,
            track its status, and later request it back when you are ready to leave.
          </p>
          {isAdmin && (
            <div className="pt-2">
              <Link href="/admin/valet" className="inline-block px-4 py-2 rounded-xl bg-[#163720] text-white text-sm font-medium hover:bg-[#0f2616] transition">
                Go to Admin Valet Dashboard
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {shortcutCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <a key={index} href={card.href} className="rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 p-5">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{card.description}</p>
              </a>
            );
          })}
        </div>

        <section id="payment-info" className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
          <div className="flex items-center gap-2 text-green-700 text-xl font-semibold mb-4">
            <DollarSign className="w-5 h-5" /> Pricing & Payment
          </div>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-semibold">Valet Fee:</span> $5 per request</p>
            <p><span className="font-semibold">Payment:</span> Online payment is coming soon. For now, pay with cash, Zelle, or Venmo when you drop off your car.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
          <div className="flex items-center gap-2 text-blue-700 text-xl font-semibold mb-4">
            <CheckCircle2 className="w-5 h-5" /> How This Works
          </div>
          <div className="space-y-3 text-gray-700">
            <p>1. Enter your pickup location, phone number, and requested drop-off time.</p>
            <p>2. Submit the valet request and wait for approval.</p>
            <p>3. Once approved, you will see the valet's name, phone number, and assigned parking lot.</p>
            <p>4. After the valet parks your car, the status will update to parked.</p>
            <p>5. When you want your car back, submit a return request with where and when you want it delivered.</p>
            <p>6. The valet then returns the vehicle and the request is completed.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
          <div className="flex items-center gap-2 text-purple-700 text-xl font-semibold mb-4">
            <Phone className="w-5 h-5" /> Keys & Contact
          </div>
          <div className="space-y-3 text-gray-700">
            <p>The student gives the keys to the valet in person at the pickup location.</p>
            <p>Once the request is approved, the student can see the assigned valet's name and phone number.</p>
            <p>When the student is ready to leave, they can request the car back and choose the return location and time.</p>
          </div>
        </section>

        <section id="request-form" className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
          <div className="flex items-center gap-2 text-green-700 text-xl font-semibold mb-4">
            <UserRound className="w-5 h-5" /> Request Valet
          </div>

          <div className="space-y-4">
            <input
              className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
              placeholder="Student Name"
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            />
            <input
              className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            />
            <input
              className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
              placeholder="Pickup / Drop-off Location"
              value={form.pickupLocation}
              onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
            />
            <select
              className="w-full border border-gray-300 rounded-xl p-3 text-black bg-white"
              value={form.preferredLotId}
              onChange={(e) => {
                const selectedLot = parkingLots.find((lot) => lot.id === e.target.value);
                setForm({
                  ...form,
                  preferredLotId: selectedLot?.id || "",
                  preferredLotName: selectedLot?.name || "",
                });
              }}
            >
              <option value="">Preferred parking lot (optional)</option>
              {parkingLots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.name}
                </option>
              ))}
            </select>
            <input
              className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
              type="datetime-local"
              value={form.requestedTime}
              onChange={(e) => setForm({ ...form, requestedTime: e.target.value })}
            />

            {/* Notes field — pre-filled with vehicle profile */}
            <div>
              <textarea
                className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
                placeholder="Notes (optional) — your vehicle info will appear here if you have a vehicle profile"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              {form.notes && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Car className="w-3 h-3" />
                  Vehicle from your profile — you can edit this if needed
                </p>
              )}
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Request Valet"}
            </Button>

            {message && <p className="text-sm font-medium text-green-700">{message}</p>}
          </div>
        </section>

        <section id="request-status" className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
          <div className="flex items-center gap-2 text-[#163720] text-xl font-semibold mb-4">
            <MapPin className="w-5 h-5" /> My Valet Requests
          </div>
          <div className="space-y-4">
            {myRequests.length === 0 ? (
              <p className="text-gray-500">No valet requests yet.</p>
            ) : (
              myRequests.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="font-semibold text-lg">{item.studentName}</p>
                    <p className="text-sm font-medium text-blue-700 capitalize">{formatStatus(item.status)}</p>
                  </div>
                  <p className="text-sm text-gray-700"><span className="font-semibold">Phone:</span> {item.phoneNumber}</p>
                  <p className="text-sm text-gray-700"><span className="font-semibold">Pickup Location:</span> {item.pickupLocation}</p>
                  <p className="text-sm text-gray-700"><span className="font-semibold">Requested Time:</span> {item.requestedTime}</p>
                  {item.preferredLotName && <p className="text-sm text-purple-700"><span className="font-semibold">Preferred Parking Lot:</span> {item.preferredLotName}</p>}
                  <p className="text-sm text-gray-700"><span className="font-semibold">Fee:</span> ${item.serviceFee || 5}</p>
                  <p className="text-sm text-gray-700"><span className="font-semibold">Payment:</span> {item.paymentNote}</p>
                  {item.notes && <p className="text-sm text-gray-700"><span className="font-semibold">Vehicle:</span> {item.notes}</p>}
                  {item.assignedValet && <p className="text-sm text-green-700"><span className="font-semibold">Assigned Valet:</span> {item.assignedValet}</p>}
                  {item.assignedValetPhone && <p className="text-sm text-green-700"><span className="font-semibold">Valet Phone:</span> {item.assignedValetPhone}</p>}
                  {item.assignedLotName && <p className="text-sm text-green-700"><span className="font-semibold">Assigned Parking Lot:</span> {item.assignedLotName}</p>}
                  {item.returnLocation && <p className="text-sm text-orange-700"><span className="font-semibold">Return Location:</span> {item.returnLocation}</p>}
                  {item.returnTime && <p className="text-sm text-orange-700"><span className="font-semibold">Return Time:</span> {item.returnTime}</p>}
                  {item.returnMessage && <p className="text-sm text-orange-700"><span className="font-semibold">Return Message:</span> {item.returnMessage}</p>}

                  {item.status === "pending" && (
                    <div className="pt-2">
                      <Button onClick={() => handleCancel(item.id)} size="sm" variant="danger">Cancel Request</Button>
                    </div>
                  )}

                  {["approved", "vehicle_received", "parked"].includes(item.status) && (
                    <div className="pt-3 border-t border-gray-200 space-y-3">
                      <p className="text-sm font-semibold text-[#163720]">Request Car Back</p>
                      <input
                        className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
                        placeholder="Return Location"
                        value={returnForms[item.id]?.returnLocation || ""}
                        onChange={(e) => handleReturnChange(item.id, "returnLocation", e.target.value)}
                      />
                      <input
                        className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
                        type="datetime-local"
                        value={returnForms[item.id]?.returnTime || ""}
                        onChange={(e) => handleReturnChange(item.id, "returnTime", e.target.value)}
                      />
                      <textarea
                        className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
                        placeholder="Message to your valet (optional)"
                        value={returnForms[item.id]?.returnMessage || ""}
                        onChange={(e) => handleReturnChange(item.id, "returnMessage", e.target.value)}
                      />
                      <Button onClick={() => handleRequestReturn(item.id)} size="sm">Request Car Back</Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
          <div className="flex items-center gap-2 text-orange-600 text-xl font-semibold mb-4">
            <Briefcase className="w-5 h-5" /> Become a Valet Worker
          </div>
          <div className="space-y-2 text-gray-700">
            <p>Interested in helping students during peak parking hours?</p>
            <p>A future version of RamPark may let students or campus staff sign up as approved valet workers.</p>
            <p className="font-medium text-orange-600">Coming soon.</p>
          </div>
        </section>

        <div className="text-center">
          <Link href="/" className="inline-block px-5 py-3 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800 transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
