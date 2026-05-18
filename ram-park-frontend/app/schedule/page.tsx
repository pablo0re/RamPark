"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { ArrowRight, CalendarDays, CloudRain, Clock3, FileText, Image as ImageIcon, MapPin, Sparkles, Upload, Wand2, Calendar } from "lucide-react";
import { auth, db } from "@/lib/firebase";

const C = {
  bg: "#0d2818", bgCard: "#142a1e", bgPanel: "#1a3d28", border: "#2a5438",
  borderHover: "#3a7a50", green: "#3a8a52", greenBright: "#4caf6e",
  gold: "#c9a227", goldLight: "#e0b83a", text: "#eef4f0", muted: "#7a9e88", dimmed: "#4a6e58",
} as const;

type BadgeVariant = "default" | "gold" | "outline";
type BtnVariant = "primary" | "secondary" | "ghost";
type BtnSize = "sm" | "md" | "lg";
type OccColor = "green" | "yellow" | "orange" | "red";
type DayCode = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type UploadedClass = { id: string; course: string; building: string; room?: string; startTime: string; endTime: string; days: DayCode[]; };
type ScheduleJson = { uploadedAt: string; sourceType: "detail-schedule" | "image" | "manual"; term?: string; classes: UploadedClass[]; };
type RecommendationLot = { id: string; name: string; distance: string; occupancyPercent: number; color: OccColor; reason: string; warning?: string; };

interface BadgeProps { children: React.ReactNode; variant?: BadgeVariant; }
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { children: React.ReactNode; variant?: BtnVariant; size?: BtnSize; }
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; hint?: string; }
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label: string; options: string[]; }
interface LotCardProps { lot: RecommendationLot; rank: number; }

const dayOptions: DayCode[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const buildingOptions = [
  "Campus Center", "Gleeson Hall", "Dewey Hall", "Knapp Hall", "Lupton Hall",
  "Thompson Hall", "Ward Hall", "School of Business", "Orchard Hall", "Quintyne Hall",
  "Horton Hall", "Whitman Hall", "Hooper Hall", "Laffin Hall",
];

const Badge: React.FC<BadgeProps> = ({ children, variant = "default" }) => {
  const styles: Record<BadgeVariant, React.CSSProperties> = {
    default: { background: C.bgPanel, color: C.greenBright, border: `1px solid ${C.border}` },
    gold: { background: "#2a1f08", color: C.gold, border: "1px solid #4a3510" },
    outline: { background: "transparent", color: C.gold, border: `1px solid ${C.gold}55` },
  };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", ...styles[variant] }}>{children}</span>;
};

const Btn: React.FC<BtnProps> = ({ children, variant = "primary", size = "md", style: extra = {}, ...rest }) => {
  const sizeMap: Record<BtnSize, React.CSSProperties> = { sm: { padding: "8px 16px", fontSize: 13 }, md: { padding: "11px 22px", fontSize: 14 }, lg: { padding: "14px 28px", fontSize: 15 } };
  const variantMap: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: C.gold, color: "#0d1f0f", boxShadow: `0 0 12px ${C.gold}22` },
    secondary: { background: C.bgPanel, color: C.text, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.muted, padding: "8px 14px", fontSize: 13 },
  };
  return <button style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, borderRadius: 10, cursor: "pointer", border: variant === "secondary" ? `1px solid ${C.border}` : "none", transition: "all 0.18s ease", ...sizeMap[size], ...variantMap[variant], ...extra }} {...rest}>{children}</button>;
};

const Field: React.FC<InputProps> = ({ label, hint, style, ...rest }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{label}</span>
    <input {...rest} style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", outline: "none", fontSize: 14, ...style }} />
    {hint ? <span style={{ fontSize: 11, color: C.dimmed }}>{hint}</span> : null}
  </label>
);

const SelectField: React.FC<SelectProps> = ({ label, options, style, ...rest }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{label}</span>
    <select {...rest} style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", outline: "none", fontSize: 14, ...style }}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>
);

const OccupancyPill = ({ color, value }: { color: OccColor; value: number }) => {
  const colors: Record<OccColor, React.CSSProperties> = {
    green: { background: "#123320", color: C.greenBright, border: `1px solid ${C.green}66` },
    yellow: { background: "#2a1f08", color: C.gold, border: `1px solid ${C.gold}66` },
    orange: { background: "#2d1708", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.4)" },
    red: { background: "#2a0f10", color: "#f87171", border: "1px solid rgba(248,113,113,0.4)" },
  };
  return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 72, padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800, ...colors[color] }}>{value}% full</span>;
};

const LotCard: React.FC<LotCardProps> = ({ lot, rank }) => (
  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Badge variant="gold">Rank #{rank}</Badge>
      <OccupancyPill color={lot.color} value={lot.occupancyPercent} />
    </div>
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>{lot.name}</h3>
      <p style={{ fontSize: 13, color: C.gold }}>{lot.distance}</p>
    </div>
    <div style={{ height: 8, borderRadius: 999, background: C.bg, overflow: "hidden" }}>
      <div style={{ width: `${lot.occupancyPercent}%`, height: "100%", background: lot.color === "green" ? C.greenBright : lot.color === "yellow" ? C.gold : lot.color === "orange" ? "#f59e0b" : "#ef4444" }} />
    </div>
    <div>
      <p style={{ fontSize: 12, color: C.dimmed, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Why this lot</p>
      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65 }}>{lot.reason}</p>
    </div>
    {lot.warning ? <div style={{ borderRadius: 14, background: "#2a1f08", border: "1px solid #4a3510", padding: "12px 14px", fontSize: 13, color: C.goldLight, lineHeight: 1.6 }}>{lot.warning}</div> : null}
  </div>
);

function classifyOccupancy(percent: number): OccColor {
  if (percent >= 80) return "red";
  if (percent >= 61) return "orange";
  if (percent >= 36) return "yellow";
  return "green";
}

function parseDays(value: string): DayCode[] {
  const map: Record<string, DayCode> = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri", S: "Sat", Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun" };
  return value.split(/[^A-Za-z]+/).map((part) => part.trim()).filter(Boolean).flatMap((part) => {
    if (part.length > 1 && /^[MTWRFSU]+$/.test(part)) return part.split("").map((letter) => map[letter]).filter(Boolean);
    return map[part] ? [map[part]] : [];
  });
}

function parseBannerFormat(rawText: string): UploadedClass[] {
  const dayMap: Record<string, DayCode> = {
    Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
    Friday: "Fri", Saturday: "Sat", Sunday: "Sun"
  };
  function to24(t: string): string {
    const m = t.trim().match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
    if (!m) return t;
    let h = parseInt(m[1]);
    const min = m[2];
    const period = m[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${min}`;
  }
  const lines = rawText.split("\n").map((l: string) => l.trim()).filter(Boolean);
  const joined: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^\d{1,2}$/.test(l) && lines[i + 1] === ":" && /^\d{2}$/.test(lines[i + 2])) {
      joined.push(`${l}:${lines[i + 2]} ${lines[i + 3]}`);
      i += 4;
    } else { joined.push(l); i++; }
  }
  const collapsed: string[] = [];
  let j = 0;
  while (j < joined.length) {
    const l = joined[j];
    if (/^\d{1,2}:\d{2}\s*[AP]M$/i.test(l) && joined[j + 1] === "-" && /^\d{1,2}:\d{2}\s*[AP]M$/i.test(joined[j + 2])) {
      collapsed.push(`${l} - ${joined[j + 2]}`); j += 3;
    } else { collapsed.push(l); j++; }
  }
  const courseCodeRegex = /^([A-Z]{2,4}\s+\d{3}[A-Z0-9]*\s+[A-Z0-9]+)$/;
  const dateRangeRegex = /^\d{2}\/\d{2}\/\d{4}\s*-\s*\d{2}\/\d{2}\/\d{4}$/;
  const daysLineRegex = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(,\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))*$/;
  const timeLineRegex = /^(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)$/i;
  const locationRegex = /^Farmingdale,\s+(.+?),\s+(.+)$/;
  const results: UploadedClass[] = [];
  let idx = 1;
  for (let i = 0; i < collapsed.length; i++) {
    const line = collapsed[i];
    const nextLine = collapsed[i + 1] || "";
    const codeMatch = nextLine.match(courseCodeRegex);
    if (!codeMatch) continue;
    const title = line.trim();
    const code = codeMatch[1].trim();
    if (title === "Title" || !title || /^\d/.test(title)) continue;
    let days: DayCode[] = [], startTime = "", endTime = "", building = "", room = "";
    for (let j = i + 2; j < Math.min(i + 15, collapsed.length); j++) {
      const next = collapsed[j];
      if (dateRangeRegex.test(next)) continue;
      if (!days.length && daysLineRegex.test(next)) { days = next.split(",").map((d: string) => dayMap[d.trim()]).filter(Boolean) as DayCode[]; continue; }
      if (!startTime && timeLineRegex.test(next)) { const tm = next.match(timeLineRegex); if (tm) { startTime = to24(tm[1]); endTime = to24(tm[2]); continue; } }
      if (!building && locationRegex.test(next)) { const loc = next.match(locationRegex); if (loc) { building = loc[1].trim(); room = loc[2].trim(); break; } }
    }
    if (!startTime || !building || building.includes("Online") || !days.length) continue;
    results.push({ id: `banner-${idx++}`, course: `${code} · ${title}`, building, room, startTime, endTime, days });
  }
  return results;
}

function parseDetailScheduleText(text: string): UploadedClass[] {
  const normalized = text.replace(/\r/g, "");
  const blocks = normalized.split(/(?=[A-Z][A-Za-z&/\- ]+\s-\s[A-Z]{2,4}\s\d{3})/g).map((block) => block.trim()).filter(Boolean);
  const parsed: UploadedClass[] = [];
  blocks.forEach((block, index) => {
    const titleMatch = block.match(/^(.+?)\s-\s([A-Z]{2,4}\s\d{3})\s-\s([A-Z0-9]+)/m);
    const meetingMatch = block.match(/Class\s+(\d{1,2}:\d{2}\s?[ap]m)\s-\s(\d{1,2}:\d{2}\s?[ap]m)\s+([A-Z]+)\s+(.+?)\s+(Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul)\s+\d{1,2},\s+\d{4}\s-\s(.+?)(?:\n|$)/i);
    if (!titleMatch || !meetingMatch) return;
    const rawDays = meetingMatch[3];
    const whereParts = meetingMatch[4].trim().split(/\s+/);
    const building = whereParts.slice(0, -1).join(" ") || meetingMatch[4].trim();
    const room = whereParts.length > 1 ? whereParts[whereParts.length - 1] : "";
    parsed.push({ id: `detail-${index + 1}`, course: `${titleMatch[2]} · ${titleMatch[1].trim()}`, building, room, startTime: to24Hour(meetingMatch[1]), endTime: to24Hour(meetingMatch[2]), days: parseDays(rawDays) });
  });
  return parsed;
}

function to24Hour(time: string): string {
  const match = time.trim().match(/(\d{1,2}):(\d{2})\s*([ap]m)/i);
  if (!match) return time;
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3].toLowerCase();
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

// ── One-Time Visit Tab ────────────────────────────────────────────────────────
function OneDemandTab() {
  const [visitForm, setVisitForm] = useState({
    date: "",
    time: "",
    building: "Gleeson Hall",
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationLot[]>([]);

  async function analyzeVisit() {
    if (!visitForm.date || !visitForm.time || !visitForm.building) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    setAnalyzing(true);
    setErrorMsg("");
    setRecommendations([]);

    try {
      const user = auth.currentUser;
      if (!user) { setErrorMsg("Please sign in to get recommendations."); setAnalyzing(false); return; }

      // Build a one-time class from the form
      const visitDate = new Date(visitForm.date + "T12:00:00-05:00");
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayCode = dayNames[visitDate.getDay()] as DayCode;

      // Save this one-time visit as a temporary class and call the recommend endpoint
      const { doc, setDoc, deleteDoc, collection, getDocs } = await import("firebase/firestore");

      const tempId = `ondemand-${Date.now()}`;
      const tempClass: UploadedClass = {
        id: tempId,
        course: "One-Time Visit",
        building: visitForm.building,
        room: "",
        startTime: visitForm.time,
        endTime: visitForm.time,
        days: [dayCode],
      };

      // Temporarily save to Firestore so backend can read it
      await setDoc(doc(collection(db, "schedules", user.uid, "classes"), tempId), tempClass);

      const token = await user.getIdToken();
      const res = await fetch("http://127.0.0.1:8000/recommend/suggest", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      });

      // Remove temp class after fetch
      await deleteDoc(doc(collection(db, "schedules", user.uid, "classes"), tempId));

      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data = await res.json();

      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations.map((r: any) => ({
          id: r.id, name: r.name || r.id,
          distance: `${r.distance_m}m from ${visitForm.building}`,
          occupancyPercent: r.occupancy_percent || 0,
          color: classifyOccupancy(r.occupancy_percent || 0),
          reason: r.reason, warning: r.warning || undefined,
        })));
      } else {
        setErrorMsg(data.message || "No recommendations available.");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Could not get recommendations. Make sure you are signed in and the backend is running.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, alignItems: "start" }}>
      {/* Form */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <Badge variant="gold">One-Time Visit</Badge>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 12, color: C.text }}>Plan a single trip</h2>
          <p style={{ fontSize: 14, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>
            Not part of your regular schedule? Enter the date, time, and building you're heading to — we'll find the best lot for that visit.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field
            label="Date"
            type="date"
            value={visitForm.date}
            onChange={e => setVisitForm(prev => ({ ...prev, date: e.target.value }))}
            min={new Date().toISOString().split("T")[0]}
          />
          <Field
            label="Arrival Time"
            type="time"
            value={visitForm.time}
            onChange={e => setVisitForm(prev => ({ ...prev, time: e.target.value }))}
          />
          <SelectField
            label="Building / Destination"
            value={visitForm.building}
            options={buildingOptions}
            onChange={e => setVisitForm(prev => ({ ...prev, building: e.target.value }))}
          />
        </div>

        {visitForm.date && visitForm.time && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: C.bg, border: `1px solid ${C.border}`, fontSize: 13, color: C.muted }}>
            📅 {(() => { const [y,m,d] = visitForm.date.split("-").map(Number); return new Date(y, m-1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); })()} at {visitForm.time} → {visitForm.building}
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "#2a0f10", border: "1px solid #f87171", color: "#f87171", fontSize: 13 }}>
            {errorMsg}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <Btn variant="primary" size="lg" onClick={analyzeVisit} disabled={analyzing}>
            <Sparkles size={16} /> {analyzing ? "Finding best lots..." : "Find Parking"}
          </Btn>
        </div>
      </div>

      {/* Results */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <Badge variant="gold">Top 3 Lots</Badge>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 12, color: C.text }}>Recommended Lots</h2>
        </div>

        {analyzing && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, color: C.muted, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>🤖</div>
            Finding the best lots for your visit...
          </div>
        )}

        {!analyzing && recommendations.length === 0 && (
          <div style={{ background: C.bg, border: `1px dashed ${C.border}`, borderRadius: 16, padding: 24, color: C.muted, lineHeight: 1.75 }}>
            Fill in the date, time, and building on the left, then click <strong style={{ color: C.gold }}>Find Parking</strong> to get lot recommendations for your one-time visit.
          </div>
        )}

        {!analyzing && recommendations.length > 0 && (
          <div style={{ display: "grid", gap: 14 }}>
            {recommendations.map((lot, index) => <LotCard key={lot.id} lot={lot} rank={index + 1} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<"schedule" | "ondemand">("schedule");
  const [form, setForm] = useState({ course: "CSC 329", building: "Gleeson Hall", room: "101", startTime: "09:25", endTime: "10:40" });
  const [selectedDays, setSelectedDays] = useState<DayCode[]>(["Tue", "Thu"]);
  const [classes, setClasses] = useState<UploadedClass[]>([]);
  const [scheduleJson, setScheduleJson] = useState<ScheduleJson | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationLot[]>([]);
  const [weather, setWeather] = useState("Light rain likely before noon");
  const [busyTime, setBusyTime] = useState("09:00-11:00");
  const [detailScheduleText, setDetailScheduleText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const totalClasses = classes.length;
  const primaryBuilding = useMemo(() => {
    if (!classes.length) return "None yet";
    const counts = classes.reduce<Record<string, number>>((acc, item) => { acc[item.building] = (acc[item.building] || 0) + 1; return acc; }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [classes]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) { setLoadingSchedule(false); return; }
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const snap = await getDocs(collection(db, "schedules", user.uid, "classes"));
        if (!snap.empty) {
          const loaded = snap.docs.map(d => d.data() as UploadedClass);
          setClasses(loaded);
        }
      } catch (e) {
        console.error("Failed to load schedule:", e);
      } finally {
        setLoadingSchedule(false);
      }
    });
    return () => unsubscribe();
  }, []);

  function toggleDay(day: DayCode) {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]);
  }

  function addClass() {
    if (!form.course.trim() || !form.building.trim() || selectedDays.length === 0) return;
    const next: UploadedClass = { id: `${Date.now()}`, course: form.course.trim(), building: form.building, room: form.room.trim(), startTime: form.startTime, endTime: form.endTime, days: selectedDays };
    setClasses((prev) => [...prev, next]);
    setForm({ ...form, course: "", room: "", startTime: "09:25", endTime: "10:40" });
    setSelectedDays(["Mon", "Wed"]);
  }

  async function removeClass(id: string) {
    setClasses((prev) => prev.filter((item) => item.id !== id));
    try {
      const { doc, deleteDoc, collection } = await import("firebase/firestore");
      const user = auth.currentUser;
      if (user) await deleteDoc(doc(collection(db, "schedules", user.uid, "classes"), id));
    } catch (e) { console.error("Failed to delete class from Firestore:", e); }
  }

  async function handleScheduleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setErrorMsg("");
    const isTextLike = file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".html") || file.name.endsWith(".htm");
    if (isTextLike) {
      const text = await file.text();
      setDetailScheduleText(text);
      const parsed = parseDetailScheduleText(text);
      if (parsed.length) setClasses(parsed);
      return;
    }
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    if (isPdf) {
      setAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Server PDF parse failed");
        const { text: fullText, error } = await res.json();
        if (error) throw new Error(error);
        setDetailScheduleText(fullText);
        let parsed = parseBannerFormat(fullText);
        if (parsed.length === 0) parsed = parseDetailScheduleText(fullText);
        if (parsed.length > 0) { setClasses(parsed); setErrorMsg(""); }
        else setErrorMsg("Could not parse classes from this PDF. Try pasting the schedule text manually instead.");
      } catch (e) { console.error("PDF extraction error:", e); setErrorMsg("Failed to read the PDF. Try pasting the schedule text instead."); }
      finally { setAnalyzing(false); }
      return;
    }
    if (file.type.startsWith("image/")) setErrorMsg("Image upload is not supported. Please upload a PDF or paste your schedule text.");
  }

  function loadSampleDetailSchedule() {
    const sample = `Student Detail Schedule:
Web Development Frameworks - BCS 377 - 001
Associated Term: Fall 2025
Scheduled Meeting Times
Class 8:00 am - 9:15 am TR Whitman Hall 208 Aug 25, 2025 - Dec 20, 2025 Lecture

Computer Architecture and Organization - CSC 243 - 001
Associated Term: Fall 2025
Scheduled Meeting Times
Class 1:40 pm - 2:55 pm TR Whitman Hall 242 Aug 25, 2025 - Dec 20, 2025 Lecture

Advanced Programming - CSC 311 - 002
Associated Term: Fall 2025
Scheduled Meeting Times
Class 9:25 am - 10:40 am TR Whitman Hall 209 Aug 25, 2025 - Dec 20, 2025 Lecture`;
    setUploadedFileName("Student Detail Schedule.pdf");
    setDetailScheduleText(sample);
    setClasses(parseDetailScheduleText(sample));
  }

  function buildScheduleJson() {
    const payload: ScheduleJson = {
      uploadedAt: new Date().toISOString(),
      sourceType: detailScheduleText ? "detail-schedule" : "manual",
      term: "Fall 2025",
      classes: classes.map((item) => ({ ...item, days: [...item.days].sort((a, b) => dayOptions.indexOf(a) - dayOptions.indexOf(b)) })),
    };
    setScheduleJson(payload);
  }

  async function analyzeSchedule() {
    if (classes.length === 0) { setErrorMsg("Please add at least one class first!"); return; }
    setAnalyzing(true);
    setErrorMsg("");
    try {
      const { doc, setDoc, collection, getDocs, deleteDoc } = await import("firebase/firestore");
      const user = auth.currentUser;
      if (user) {
        const oldSnap = await getDocs(collection(db, "schedules", user.uid, "classes"));
        for (const d of oldSnap.docs) await deleteDoc(d.ref);
        for (const cls of classes) await setDoc(doc(collection(db, "schedules", user.uid, "classes"), cls.id), cls);
      }
    } catch (e) { console.error("Failed to save schedule:", e); }
    try {
      const user = auth.currentUser;
      if (!user) { setErrorMsg("Please sign in to get AI recommendations."); setAnalyzing(false); return; }
      const token = await user.getIdToken();
      const res = await fetch("http://127.0.0.1:8000/recommend/suggest", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data = await res.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations.map((r: any) => ({
          id: r.id, name: r.name || r.id,
          distance: `${r.distance_m}m from ${data.firstClass?.building || "your building"}`,
          occupancyPercent: r.occupancy_percent || 0,
          color: classifyOccupancy(r.occupancy_percent || 0),
          reason: r.reason, warning: r.warning || undefined,
        })));
        buildScheduleJson();
      } else { setErrorMsg(data.message || "No recommendations available for today."); }
    } catch (e: any) {
      console.error("Recommendation error:", e);
      setErrorMsg("Could not get recommendations. Make sure you are signed in and the backend is running.");
    } finally { setAnalyzing(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        .schedule-top-grid, .schedule-middle-grid, .schedule-bottom-grid { display: grid; gap: 26px; align-items: stretch; }
        .schedule-top-grid { grid-template-columns: 1.1fr 0.9fr; margin-bottom: 28px; }
        .schedule-middle-grid { grid-template-columns: 1fr 1fr; margin-bottom: 28px; }
        .schedule-bottom-grid { grid-template-columns: 0.95fr 1.05fr; }
        .schedule-card { height: 100%; display: flex; flex-direction: column; }
        .schedule-action-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px; }
        .schedule-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 24px; }
        @media (max-width: 1100px) { .schedule-top-grid, .schedule-middle-grid, .schedule-bottom-grid, .ondemand-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 700px) { .schedule-stats-grid { grid-template-columns: 1fr; } .schedule-manual-grid { grid-template-columns: 1fr !important; } .schedule-time-grid { grid-template-columns: 1fr !important; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: `${C.bg}ee`, backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}44`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: C.bgPanel, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={16} color={C.gold} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: C.text }}>RamPark</span>
            <Badge variant="gold">Schedule AI</Badge>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Link href="/"><Btn variant="ghost">Home</Btn></Link>
            <Link href="/status"><Btn variant="ghost">Status</Btn></Link>
            <Link href="/map"><Btn variant="ghost">Map</Btn></Link>
            <Link href="/ai"><Btn variant="ghost">AI Demo</Btn></Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "42px 24px 96px" }}>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 4, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 6, marginBottom: 32, maxWidth: 420 }}>
          <button
            onClick={() => setActiveTab("schedule")}
            style={{
              flex: 1, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "all 0.18s",
              background: activeTab === "schedule" ? C.gold : "transparent",
              color: activeTab === "schedule" ? "#0d1f0f" : C.muted,
            }}
          >
            📅 My Schedule
          </button>
          <button
            onClick={() => setActiveTab("ondemand")}
            style={{
              flex: 1, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "all 0.18s",
              background: activeTab === "ondemand" ? C.gold : "transparent",
              color: activeTab === "ondemand" ? "#0d1f0f" : C.muted,
            }}
          >
            ⚡ One-Time Visit
          </button>
        </div>

        {/* One-Time Visit Tab */}
        {activeTab === "ondemand" && <OneDemandTab />}

        {/* My Schedule Tab */}
        {activeTab === "schedule" && (
          <>
            <section className="schedule-top-grid">
              <div className="schedule-card" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 28, padding: 32, boxShadow: "0 28px 80px rgba(0,0,0,0.32)" }}>
                <Badge variant="gold">Upload + Analyze</Badge>
                <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.06, marginTop: 18, marginBottom: 14 }}>
                  Turn your class schedule into <span style={{ color: C.goldLight }}>parking predictions</span>
                </h1>
                <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, maxWidth: 640 }}>
                  Add classes manually, paste a student detail schedule, or upload your FSC schedule PDF. RamPark extracts your classes and ranks the top 3 closest parking lots.
                </p>
                <div className="schedule-action-row">
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 12, background: C.bgPanel, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontWeight: 700 }}>
                    <Upload size={16} color={C.gold} />
                    Upload FSC Schedule PDF
                    <input type="file" accept=".pdf,.txt,.html" onChange={handleScheduleUpload} style={{ display: "none" }} />
                  </label>
                  <Btn variant="secondary" size="md" onClick={loadSampleDetailSchedule}><FileText size={16} color={C.gold} /> Use Sample Schedule</Btn>
                  <Btn variant="secondary" size="md" onClick={buildScheduleJson}><CalendarDays size={16} color={C.gold} /> Preview Extracted Data</Btn>
                  <Btn variant="primary" size="md" onClick={analyzeSchedule} disabled={analyzing}><Wand2 size={16} /> {analyzing ? "Analyzing..." : "Analyze Schedule"}</Btn>
                </div>
                {errorMsg && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "#2a0f10", border: "1px solid #f87171", color: "#f87171", fontSize: 13 }}>{errorMsg}</div>}
                {analyzing && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "#1a2d0f", border: `1px solid ${C.border}`, color: C.muted, fontSize: 13 }}>🤖 Processing your schedule...</div>}
                <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <ImageIcon size={16} color={C.gold} />
                  <p style={{ fontSize: 13, color: C.muted }}>{uploadedFileName ? `Selected: ${uploadedFileName}` : "Upload your schedule PDF from OASIS — classes will be extracted automatically, no API key needed!"}</p>
                </div>
                <div className="schedule-stats-grid">
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
                    <p style={{ fontSize: 11, color: C.dimmed, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Classes</p>
                    <h3 style={{ fontSize: 28, fontWeight: 800 }}>{loadingSchedule ? "..." : totalClasses}</h3>
                  </div>
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
                    <p style={{ fontSize: 11, color: C.dimmed, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Primary Building</p>
                    <h3 style={{ fontSize: 18, fontWeight: 800 }}>{loadingSchedule ? "..." : primaryBuilding}</h3>
                  </div>
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
                    <p style={{ fontSize: 11, color: C.dimmed, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Busy Window</p>
                    <h3 style={{ fontSize: 18, fontWeight: 800 }}>{busyTime}</h3>
                  </div>
                </div>
              </div>

              <div className="schedule-card" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 28, padding: 28, boxShadow: "0 24px 60px rgba(0,0,0,0.28)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div><Badge>AI Factors</Badge><h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>Prediction Context</h2></div>
                  <Sparkles size={18} color={C.gold} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><CloudRain size={16} color={C.gold} /><p style={{ fontSize: 13, fontWeight: 700 }}>Weather signal</p></div>
                    <input value={weather} onChange={(e) => setWeather(e.target.value)} style={{ width: "100%", background: "transparent", border: "none", color: C.muted, fontSize: 14, outline: "none" }} />
                  </div>
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><Clock3 size={16} color={C.gold} /><p style={{ fontSize: 13, fontWeight: 700 }}>Busy campus window</p></div>
                    <input value={busyTime} onChange={(e) => setBusyTime(e.target.value)} style={{ width: "100%", background: "transparent", border: "none", color: C.muted, fontSize: 14, outline: "none" }} />
                  </div>
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                    <p style={{ fontSize: 12, color: C.dimmed, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Paste student detail schedule text</p>
                    <textarea value={detailScheduleText} onChange={(e) => setDetailScheduleText(e.target.value)} placeholder="Paste the copied text from a student detail schedule here..." style={{ width: "100%", minHeight: 220, resize: "vertical", background: "transparent", border: "none", color: C.muted, fontSize: 12, lineHeight: 1.7, outline: "none", fontFamily: "inherit" }} />
                    <div style={{ marginTop: 12 }}>
                      <Btn variant="secondary" size="sm" onClick={() => { let parsed = parseBannerFormat(detailScheduleText); if (parsed.length === 0) parsed = parseDetailScheduleText(detailScheduleText); if (parsed.length) setClasses(parsed); }}>Parse Schedule Text</Btn>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="schedule-middle-grid">
              <div className="schedule-card" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div><Badge>Manual Schedule Entry</Badge><h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 12 }}>Add classes</h2></div>
                  <CalendarDays size={18} color={C.gold} />
                </div>
                <div className="schedule-manual-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Course" value={form.course} placeholder="CSC 329" onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value }))} />
                  <SelectField label="Building" value={form.building} options={buildingOptions} onChange={(e) => setForm((prev) => ({ ...prev, building: e.target.value }))} />
                  <Field label="Room" value={form.room} placeholder="101" onChange={(e) => setForm((prev) => ({ ...prev, room: e.target.value }))} />
                  <div className="schedule-time-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Start" type="time" value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))} />
                    <Field label="End" type="time" value={form.endTime} onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginTop: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Days</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {dayOptions.map((day) => { const active = selectedDays.includes(day); return <button key={day} type="button" onClick={() => toggleDay(day)} style={{ minWidth: 58, padding: "10px 14px", borderRadius: 12, border: `1px solid ${active ? C.gold : C.border}`, background: active ? "#2a1f08" : C.bg, color: active ? C.goldLight : C.muted, fontWeight: 800, cursor: "pointer" }}>{day}</button>; })}
                  </div>
                </div>
                <div style={{ marginTop: 22 }}><Btn variant="primary" size="md" onClick={addClass}>Add Class <ArrowRight size={15} /></Btn></div>
              </div>

              <div className="schedule-card" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div><Badge>Schedule Preview</Badge><h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 12 }}>Uploaded classes</h2></div>
                  <p style={{ fontSize: 13, color: C.gold }}>{classes.length} entries</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 380, overflowY: "auto", paddingRight: 6 }}>
                  {loadingSchedule ? (
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, color: C.muted, textAlign: "center" }}>Loading your saved schedule...</div>
                  ) : classes.length === 0 ? (
                    <div style={{ background: C.bg, border: `1px dashed ${C.border}`, borderRadius: 16, padding: 24, color: C.muted, lineHeight: 1.7 }}>No classes added yet. Upload your FSC schedule PDF, add them manually, or paste schedule text.</div>
                  ) : (
                    classes.map((item) => (
                      <div key={item.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "start", justifyContent: "space-between", gap: 14 }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{item.course}</h3>
                          <p style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>{item.building}{item.room ? ` · Room ${item.room}` : ""}</p>
                          <p style={{ fontSize: 13, color: C.gold }}>{item.startTime} - {item.endTime} · {item.days.join(", ")}</p>
                        </div>
                        <button type="button" onClick={() => removeClass(item.id)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}>Remove</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="schedule-bottom-grid">
              <div className="schedule-card" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div><Badge variant="gold">Structured Output</Badge><h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 12 }}>Extracted Schedule Data</h2></div>
                  <Btn variant="secondary" size="sm" onClick={buildScheduleJson}>Preview Extracted Data</Btn>
                </div>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, minHeight: 360, overflowX: "auto" }}>
                  <pre style={{ fontSize: 12, color: C.muted, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                    {scheduleJson ? JSON.stringify(scheduleJson, null, 2) : `{\n  "uploadedAt": "",\n  "sourceType": "detail-schedule",\n  "term": "",\n  "classes": []\n}`}
                  </pre>
                </div>
              </div>

              <div className="schedule-card" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 24, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div><Badge variant="gold">Top 3 Lots</Badge><h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 12 }}>AI Parking Recommendations</h2></div>
                  <Btn variant="primary" size="sm" onClick={analyzeSchedule} disabled={analyzing}><Sparkles size={15} /> {analyzing ? "Loading..." : "Run Analysis"}</Btn>
                </div>
                {analyzing && <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, color: C.muted, textAlign: "center" as const }}><div style={{ fontSize: 24, marginBottom: 12 }}>🤖</div>Asking AI to find the best lots for your schedule...</div>}
                {!analyzing && recommendations.length === 0 && <div style={{ background: C.bg, border: `1px dashed ${C.border}`, borderRadius: 16, padding: 24, color: C.muted, lineHeight: 1.75 }}>Add your classes and click <strong style={{ color: C.gold }}>Analyze Schedule</strong> to get AI-powered lot recommendations.</div>}
                {!analyzing && recommendations.length > 0 && <div style={{ display: "grid", gap: 14 }}>{recommendations.map((lot, index) => <LotCard key={lot.id} lot={lot} rank={index + 1} />)}</div>}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}