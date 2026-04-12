"use client";

import { useEffect, useState } from "react";
import { getValetLeaderboard } from "@/lib/api";
import { Trophy, Car, Medal, Crown } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  studentName: string;
  valetCount: number;
  lastUsed: string;
}

const podiumColors = {
  1: { bg: "from-yellow-500/20 to-yellow-600/10", border: "border-yellow-500/50", text: "text-yellow-400", icon: "text-yellow-400", height: "h-36" },
  2: { bg: "from-slate-400/20 to-slate-500/10", border: "border-slate-400/50", text: "text-slate-300", icon: "text-slate-300", height: "h-28" },
  3: { bg: "from-orange-600/20 to-orange-700/10", border: "border-orange-600/50", text: "text-orange-400", icon: "text-orange-400", height: "h-24" },
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getValetLeaderboard();
        setEntries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Reorder podium: 2nd, 1st, 3rd
  const podiumOrder = [
    top3[1] ?? null,
    top3[0] ?? null,
    top3[2] ?? null,
  ];
  const podiumRanks = [2, 1, 3];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="text-yellow-400 w-8 h-8" />
            <h1 className="text-4xl font-black text-white">Valet Leaderboard</h1>
            <Trophy className="text-yellow-400 w-8 h-8" />
          </div>
          <p className="text-slate-400 text-base">Top students by valet usage at Farmingdale State College</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-full px-4 py-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Live · refreshes every 30s
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16">

        {entries.length === 0 ? (
          <div className="text-center py-24">
            <Car className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No valet rides yet. Be the first!</p>
          </div>
        ) : (
          <>
            {/* PODIUM — Top 3 */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-4 mb-12 mt-4">
                {podiumOrder.map((entry, i) => {
                  const rank = podiumRanks[i];
                  const colors = podiumColors[rank as 1 | 2 | 3];
                  if (!entry) return <div key={i} className="w-40" />;
                  return (
                    <div key={entry.userId} className="flex flex-col items-center gap-3 w-40">
                      {/* Crown for #1 */}
                      {rank === 1 && <Crown className="text-yellow-400 w-7 h-7 animate-bounce" />}

                      {/* Avatar */}
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
                        <span className={`text-2xl font-black ${colors.text}`}>
                          {entry.studentName.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="text-center">
                        <p className="font-bold text-white text-sm leading-tight">{entry.studentName}</p>
                        <p className={`text-xs font-semibold mt-1 ${colors.text}`}>
                          {entry.valetCount} {entry.valetCount === 1 ? "ride" : "rides"}
                        </p>
                      </div>

                      {/* Podium block */}
                      <div className={`w-full ${colors.height} rounded-t-xl bg-gradient-to-b ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                        <span className={`text-3xl font-black ${colors.text}`}>#{rank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TABLE — Ranks 4–10 */}
            {rest.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-4 px-6 py-3 border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Rank</span>
                  <span className="col-span-2">Student</span>
                  <span className="text-right">Rides</span>
                </div>
                {rest.map((entry) => (
                  <div key={entry.userId} className="grid grid-cols-4 px-6 py-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors items-center">
                    <div className="flex items-center gap-2">
                      <Medal className="w-4 h-4 text-slate-600" />
                      <span className="font-bold text-slate-300">#{entry.rank}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                        {entry.studentName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-white text-sm">{entry.studentName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-yellow-400">{entry.valetCount}</span>
                      <span className="text-slate-500 text-xs ml-1">rides</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}