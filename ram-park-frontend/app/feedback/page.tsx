"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { getLots, ParkingLot, submitFeedback } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { MessageSquare, Loader2, ThumbsUp, Minus, ThumbsDown } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_OPTIONS: {
  value: Difficulty;
  label: string;
  desc: string;
  icon: React.ReactNode;
  className: string;
}[] = [
  {
    value: "easy",
    label: "Easy",
    desc: "Found parking quickly",
    icon: <ThumbsUp className="w-4 h-4" />,
    className: "border-emerald-400 bg-emerald-500/10 text-emerald-300",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Took some time",
    icon: <Minus className="w-4 h-4" />,
    className: "border-yellow-400 bg-yellow-500/10 text-yellow-300",
  },
  {
    value: "hard",
    label: "Hard",
    desc: "Very difficult to park",
    icon: <ThumbsDown className="w-4 h-4" />,
    className: "border-red-400 bg-red-500/10 text-red-300",
  },
];

export default function FeedbackPage() {
  const [user] = useAuthState(auth);
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLotId, setSelectedLotId] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [experienceText, setExperienceText] = useState("");
  const [loadingLots, setLoadingLots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLots = async () => {
      try {
        setLoadingLots(true);
        const data = await getLots();
        const safeLots = Array.isArray(data) ? data : [];
        setLots(safeLots);
        if (safeLots.length > 0 && !selectedLotId) {
          setSelectedLotId(safeLots[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load parking lots.");
      } finally {
        setLoadingLots(false);
      }
    };

    loadLots();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!user) {
      setError("Please sign in to submit feedback.");
      return;
    }

    if (!selectedLotId) {
      setError("Please select a parking lot.");
      return;
    }

    if (!experienceText.trim()) {
      setError("Please type your experience before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const token = await user.getIdToken();

      await submitFeedback(token, {
        lotId: selectedLotId,
        difficulty,
        experienceText: experienceText.trim(),
      });

      setSuccess("Thanks for your feedback!");
      setExperienceText("");
      setDifficulty("easy");
    } catch (err) {
      console.error(err);
      setError("Could not submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d2818] text-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Card className="border border-[#2a5438] bg-[#142a1e] shadow-2xl">
          <CardHeader className="border-b border-[#2a5438]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/30">
                <MessageSquare className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-50">Parking Feedback</h1>
                <p className="text-sm text-emerald-200/70">
                  Tell us how easy or hard it was to park, and share what your experience was.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {!user && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                Please sign in to submit parking feedback.
              </div>
            )}

            {loadingLots ? (
              <div className="flex items-center gap-3 text-slate-300">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
                Loading parking lots...
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Select Lot</label>
                <select
                  value={selectedLotId}
                  onChange={(e) => setSelectedLotId(e.target.value)}
                  className="w-full rounded-xl border border-[#2a5438] bg-[#0d2818] px-4 py-3 text-slate-50 outline-none focus:border-emerald-400"
                >
                  {lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-200">Difficulty</label>
              <div className="grid gap-3 md:grid-cols-3">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDifficulty(opt.value)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      difficulty === opt.value
                        ? opt.className
                        : "border-[#2a5438] bg-[#0d2818] text-slate-300 hover:border-emerald-400/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                    <p className="mt-1 text-sm opacity-80">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">
                Tell us what your experience was
              </label>
              <textarea
                value={experienceText}
                onChange={(e) => setExperienceText(e.target.value)}
                rows={5}
                placeholder="Example: It was hard to find a spot near my building, but the lot was clean and the signs were clear."
                className="w-full rounded-xl border border-[#2a5438] bg-[#0d2818] px-4 py-3 text-slate-50 outline-none focus:border-emerald-400 resize-none"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting || loadingLots || !selectedLotId}
              className="w-full bg-emerald-500 text-[#02140a] hover:bg-emerald-400"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}