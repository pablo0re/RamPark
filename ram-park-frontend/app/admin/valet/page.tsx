"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import {
  getValetRequests,
  approveValetRequest,
  rejectValetRequest,
  markVehicleReceived,
  markVehicleParked,
  markReturnInProgress,
  completeValetRequest,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Phone, MapPin, CarFront } from "lucide-react";

const ADMIN_EMAILS = ["orelpm@farmingdale.edu", "hamzm@farmingdale.edu"];
function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AdminValetPage() {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [approvalForms, setApprovalForms] = useState<Record<string, { valetName: string; valetPhone: string }>>({});
  const [parkedForms, setParkedForms] = useState<Record<string, { assignedLotName: string }>>({});
  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");

  async function loadRequests() {
    try {
      const data = await getValetRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load valet requests.");
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

const statusPriority: Record<string, number> = {
  pending: 1,
  approved: 2,
  vehicle_received: 3,
  parked: 4,
  return_requested: 5,
  return_in_progress: 6,
  completed: 7,
  cancelled: 8,
  rejected: 9,
};

const sortedRequests = useMemo(() => {
  return [...requests].sort((a, b) => {
    const aPriority = statusPriority[a.status] ?? 99;
    const bPriority = statusPriority[b.status] ?? 99;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    const aDate = a.createdAt || "";
    const bDate = b.createdAt || "";
    return bDate.localeCompare(aDate);
  });
}, [requests]);

  const handleApprovalChange = (
  id: string,
  field: "valetName" | "valetPhone",
  value: string
) => {
  setApprovalForms((prev) => ({
    ...prev,
    [id]: {
      valetName: prev[id]?.valetName || "",
      valetPhone: prev[id]?.valetPhone || "",
      [field]: value,
    },
  }));
};

const handleParkedChange = (id: string, value: string) => {
  setParkedForms((prev) => ({
    ...prev,
    [id]: {
      assignedLotName: value,
    },
  }));
};

  const handleApprove = async (id: string) => {
    const form = approvalForms[id];

    if (!form?.valetName || !form?.valetPhone) {
      setMessage("Please enter the valet name and valet phone before approving.");
      return;
    }

    try {
      await approveValetRequest(id, form);
      setMessage("Request approved.");
      loadRequests();
    } catch (error) {
      console.error(error);
      setMessage("Failed to approve request.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectValetRequest(id);
      setMessage("Request rejected.");
      loadRequests();
    } catch (error) {
      console.error(error);
      setMessage("Failed to reject request.");
    }
  };

  const handleVehicleReceived = async (id: string) => {
    try {
      await markVehicleReceived(id);
      setMessage("Vehicle marked as received.");
      loadRequests();
    } catch (error) {
      console.error(error);
      setMessage("Failed to update status.");
    }
  };

  const handleParked = async (id: string) => {
  const form = parkedForms[id];

  if (!form?.assignedLotName) {
    setMessage("Please enter the parking lot before marking the vehicle as parked.");
    return;
  }

  try {
    await markVehicleParked(id, form);
    setMessage("Vehicle marked as parked.");
    loadRequests();
  } catch (error) {
    console.error(error);
    setMessage("Failed to update status.");
  }
};

  const handleReturnInProgress = async (id: string) => {
    try {
      await markReturnInProgress(id);
      setMessage("Return marked in progress.");
      loadRequests();
    } catch (error) {
      console.error(error);
      setMessage("Failed to update status.");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeValetRequest(id);
      setMessage("Request marked completed.");
      loadRequests();
    } catch (error) {
      console.error(error);
      setMessage("Failed to complete request.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf7] px-6">
        <div className="max-w-xl w-full rounded-2xl border border-gray-200 bg-white shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-[#163720] mb-3">Admin Access Only</h1>
          <p className="text-gray-600 mb-6">
            This page is only available to the valet administrator account.
          </p>
          <Link
            href="/valet"
            className="inline-block px-5 py-3 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800 transition"
          >
            Back to Valet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7faf7] to-[#eef6ef] px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-[#163720]">Valet Admin Dashboard</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Manage valet pickups, parking updates, and vehicle return requests.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6">
          <div className="flex items-center gap-2 text-[#163720] text-xl font-semibold mb-4">
            <ShieldCheck className="w-5 h-5" />
            All Valet Requests
          </div>

          {message && <p className="text-sm font-medium text-green-700 mb-4">{message}</p>}

          <div className="space-y-4">
            {sortedRequests.length === 0 ? (
              <p className="text-gray-500">No valet requests found.</p>
            ) : (
              sortedRequests.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-2"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="font-semibold text-lg">{item.studentName}</p>
                    <p className="text-sm font-medium text-blue-700 capitalize">
                      Status: {formatStatus(item.status)}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Email:</span> {item.userEmail || "Not provided"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Phone:</span> {item.phoneNumber || "Not provided"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Pickup Location:</span> {item.pickupLocation}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Requested Time:</span> {item.requestedTime}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Fee:</span> ${item.serviceFee || 5}
                  </p>

                  {item.notes && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Notes:</span> {item.notes}
                    </p>
                  )}

                  {item.assignedValet && (
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">Assigned Valet:</span> {item.assignedValet}
                    </p>
                  )}

                  {item.assignedValetPhone && (
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">Valet Phone:</span> {item.assignedValetPhone}
                    </p>
                  )}

                  {item.assignedLotName && (
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">Assigned Parking Lot:</span> {item.assignedLotName}
                    </p>
                  )}

                  {item.returnLocation && (
                    <p className="text-sm text-orange-700">
                      <span className="font-semibold">Return Location:</span> {item.returnLocation}
                    </p>
                  )}

                  {item.returnTime && (
                    <p className="text-sm text-orange-700">
                      <span className="font-semibold">Return Time:</span> {item.returnTime}
                    </p>
                  )}

                  {item.returnMessage && (
                    <p className="text-sm text-orange-700">
                      <span className="font-semibold">Message to Valet:</span> {item.returnMessage}
                    </p>
                  )}

                  {item.status === "pending" && (
                    <div className="pt-3 border-t border-gray-200 space-y-3">
                      <p className="text-sm font-semibold text-[#163720]">Approval Details</p>

                      <input
                        className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
                        placeholder="Valet Name"
                        value={approvalForms[item.id]?.valetName || ""}
                        onChange={(e) =>
                          handleApprovalChange(item.id, "valetName", e.target.value)
                        }
                      />

                      <input
                        className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
                        placeholder="Valet Phone Number"
                        value={approvalForms[item.id]?.valetPhone || ""}
                        onChange={(e) =>
                          handleApprovalChange(item.id, "valetPhone", e.target.value)
                        }
                      />        

                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => handleApprove(item.id)} size="sm">
                          Approve
                      </Button>
                        <Button onClick={() => handleReject(item.id)} size="sm" variant="danger">
                          Reject
                        </Button>
                      </div>
                    </div>
                    )}

                  {item.status === "approved" && (
                    <div className="pt-2">
                      <Button onClick={() => handleVehicleReceived(item.id)} size="sm">
                        Mark Vehicle Received
                      </Button>
                    </div>
                  )}

                  {item.status === "vehicle_received" && (
                    <div className="pt-3 border-t border-gray-200 space-y-3">
                      <p className="text-sm font-semibold text-[#163720]">Parking Details</p>

                      <input
                        className="w-full border border-gray-300 rounded-xl p-3 text-black placeholder:text-gray-500"
                         placeholder="Assigned Parking Lot"
                         value={parkedForms[item.id]?.assignedLotName || ""}
                         onChange={(e) => handleParkedChange(item.id, e.target.value)}
                      />

                      <Button onClick={() => handleParked(item.id)} size="sm" variant="secondary">
                       Mark Parked
                      </Button>
                     </div>
                    )}

                  {item.status === "return_requested" && (
                    <div className="pt-2">
                      <Button onClick={() => handleReturnInProgress(item.id)} size="sm">
                        Mark Return In Progress
                      </Button>
                    </div>
                  )}

                  {item.status === "return_in_progress" && (
                    <div className="pt-2">
                      <Button onClick={() => handleComplete(item.id)} size="sm" variant="secondary">
                        Mark Completed
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/valet"
            className="inline-block px-5 py-3 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800 transition"
          >
            Back to Student Valet Page
          </Link>
        </div>
      </div>
    </div>
  );
}