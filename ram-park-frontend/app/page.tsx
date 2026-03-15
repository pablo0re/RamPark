"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Users, Camera, Clock, Shield, MapPin, ChevronRight, Zap } from "lucide-react";

const C = {
  bg:          "#0d2818",
  bgCard:      "#142a1e",
  bgPanel:     "#1a3d28",
  border:      "#2a5438",
  borderHover: "#3a7a50",
  green:       "#3a8a52",
  greenBright: "#4caf6e",
  gold:        "#c9a227",
  goldLight:   "#e0b83a",
  text:        "#eef4f0",
  muted:       "#7a9e88",
  dimmed:      "#4a6e58",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────

type BadgeVariant = "default" | "gold" | "outline";
type BtnVariant   = "primary" | "secondary" | "ghost";
type BtnSize      = "sm" | "md" | "lg";
type OccColor     = "green" | "yellow" | "orange" | "red";

interface BadgeProps   { children: React.ReactNode; variant?: BadgeVariant; }
interface BtnProps     extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; variant?: BtnVariant; size?: BtnSize;
}
interface RingProps    { percent: number; color: OccColor; }
interface LotCardProps { name: string; percent: number; capacity: number; occupied: number; color: OccColor; delay?: number; }
interface FeatureCardProps {icon: React.ElementType;title: string;desc: string;iconBg: string;index: number;href?: string;}
interface StatProps    { value: string; label: string; }
interface StepProps    { num: string; title: string; desc: string; active?: boolean; }

// ── Badge ──────────────────────────────────────────────────────────────────

const Badge: React.FC<BadgeProps> = ({ children, variant = "default" }) => {
  const styles: Record<BadgeVariant, React.CSSProperties> = {
    default: { background: C.bgPanel,      color: C.greenBright, border: `1px solid ${C.border}` },
    gold:    { background: "#2a1f08",      color: C.gold,        border: "1px solid #4a3510"      },
    outline: { background: "transparent",  color: C.gold,        border: `1px solid ${C.gold}55`  },
  };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px",
      borderRadius:999, fontSize:11, fontWeight:700, letterSpacing:"0.06em", ...styles[variant] }}>
      {children}
    </span>
  );
};

// ── Button ─────────────────────────────────────────────────────────────────

const Btn: React.FC<BtnProps> = ({ children, variant = "primary", size = "md", style: extra = {}, ...rest }) => {
  const [hover, setHover] = useState(false);
  const sizeMap: Record<BtnSize, React.CSSProperties> = {
    sm: { padding:"8px 16px",  fontSize:13 },
    md: { padding:"11px 22px", fontSize:14 },
    lg: { padding:"14px 28px", fontSize:15 },
  };
  const variantMap: Record<BtnVariant, React.CSSProperties> = {
    primary:   { background: C.gold,        color:"#0d1f0f", boxShadow: hover ? `0 0 24px ${C.gold}55` : `0 0 8px ${C.gold}22` },
    secondary: { background: hover ? C.bgPanel : "transparent", color: C.text, border:`1px solid ${C.border}` },
    ghost:     { background: "transparent", color: C.muted, padding:"8px 14px", fontSize:13 },
  };
  return (
    <button
      style={{ display:"inline-flex", alignItems:"center", gap:8, fontWeight:700,
        borderRadius:10, cursor:"pointer", border:"none", transition:"all 0.18s ease",
        transform: hover ? "scale(1.02)" : "scale(1)",
        ...sizeMap[size], ...variantMap[variant], ...extra }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...rest}
    >
      {children}
    </button>
  );
};

// ── Occupancy Ring ─────────────────────────────────────────────────────────

const OccupancyRing: React.FC<RingProps> = ({ percent, color }) => {
  const colorMap: Record<OccColor, { stroke: string; track: string; label: string }> = {
    green:  { stroke: C.greenBright, track: "#0f3320", label: C.greenBright },
    yellow: { stroke: C.gold,        track: "#2a1f08", label: C.gold        },
    orange: { stroke: "#e07830",     track: "#2a1008", label: "#e07830"     },
    red:    { stroke: "#e04040",     track: "#2a0808", label: "#e04040"     },
  };
  const c = colorMap[color];
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div style={{ position:"relative", width:72, height:72, flexShrink:0 }}>
      <svg style={{ width:72, height:72, transform:"rotate(-90deg)" }} viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke={c.track} strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={c.stroke} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
        justifyContent:"center", fontSize:12, fontWeight:900, color:c.label }}>
        {percent}%
      </span>
    </div>
  );
};

// ── Lot Card ───────────────────────────────────────────────────────────────

const LotCard: React.FC<LotCardProps> = ({ name, percent, capacity, occupied, color, delay = 0 }) => {
  const [anim,  setAnim]  = useState(false);
  const [hover, setHover] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), delay); return () => clearTimeout(t); }, [delay]);
  const borderColor: Record<OccColor, string> = { green: C.green, yellow: C.gold, orange:"#c06020", red:"#c03030" };
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? C.bgPanel : C.bgCard,
        border:`1px solid ${hover ? borderColor[color] : C.border}`,
        borderRadius:16, padding:"16px 18px", display:"flex", alignItems:"center",
        justifyContent:"space-between", gap:12, cursor:"pointer",
        transition:"all 0.2s ease", transform: hover ? "scale(1.01)" : "scale(1)" }}>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:11, color:C.dimmed, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Parking Lot</p>
        <h4 style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>{name}</h4>
        <p style={{ fontSize:12, color:C.muted }}>{capacity - occupied} of {capacity} spots free</p>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <OccupancyRing percent={anim ? percent : 0} color={color} />
        <ChevronRight size={16} color={hover ? C.gold : C.dimmed} style={{ transition:"color 0.2s" }} />
      </div>
    </div>
  );
};

// ── Feature Card ───────────────────────────────────────────────────────────

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, desc, iconBg, href }) => {
  const [hover, setHover] = useState(false);

  const content = (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? C.bgPanel : C.bgCard,
        border: `1px solid ${hover ? C.borderHover : C.border}`,
        borderRadius: 18,
        padding: 24,
        transition: "all 0.25s ease",
        transform: hover ? "translateY(-3px)" : "none",
        boxShadow: hover ? "0 12px 40px rgba(0,0,0,0.5)" : "none",
        cursor: href ? "pointer" : "default",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon size={20} color="white" />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{desc}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

// ── Stat ───────────────────────────────────────────────────────────────────

const Stat: React.FC<StatProps> = ({ value, label }) => (
  <div style={{ textAlign:"center" }}>
    <div style={{ fontSize:28, fontWeight:800, color:C.gold, lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:10, color:C.dimmed, marginTop:4, textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600 }}>{label}</div>
  </div>
);

// ── Step ───────────────────────────────────────────────────────────────────

const Step: React.FC<StepProps> = ({ num, title, desc, active }) => (
  <div style={{ display:"flex", gap:16, alignItems:"flex-start", padding:16, borderRadius:14,
    background: active ? C.bgPanel : "transparent",
    border: active ? `1px solid ${C.border}` : "1px solid transparent" }}>
    <span style={{ fontSize:22, fontWeight:800, color: active ? C.gold : C.dimmed, minWidth:36, lineHeight:1 }}>{num}</span>
    <div>
      <h4 style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>{title}</h4>
      <p style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{desc}</p>
    </div>
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const i = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(i);
  }, []);

  const features: Omit<FeatureCardProps, "index">[] = [
  {
    icon: Users,
    title: "Real-Time Occupancy",
    desc: "Live spot counts across all campus lots, updated every minute.",
    iconBg: "#0f3d20",
    href: "/status",
  },
  {
    icon: Camera,
    title: "AI Photo Detection",
    desc: "Computer vision scans lot images to detect open spots automatically.",
    iconBg: "#0f1f3d",
    href: "/ai",
  },
  {
    icon: Clock,
    title: "Schedule-Based Recs",
    desc: "Recommends the best lot based on your class times and walking distance.",
    iconBg: "#2a1f08",
    href: "/schedule",
  },
  {
    icon: Shield,
    title: "FSC Secured",
    desc: "Only @farmingdale.edu accounts can access the system.",
    iconBg: "#1f0f30",
    href: "/login",
  },
];

  const steps: StepProps[] = [
    { num:"01", title:"Sign in with @farmingdale.edu", desc:"Secure authentication — no new account needed.",        active:true  },
    { num:"02", title:"Add your class schedule",       desc:"We predict lot demand around your class times.",        active:false },
    { num:"03", title:"Get a parking recommendation",  desc:"Arrive on time with the best spot already found.",     active:false },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .anim-float  { animation: float  7s ease-in-out infinite; }
        .anim-fadeUp { animation: fadeUp 0.7s ease-out both; }
        .gold-shimmer {
          background: linear-gradient(90deg, ${C.gold}, ${C.goldLight}, #fff8e0, ${C.gold});
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C.bg}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
        background:`${C.bg}ee`, backdropFilter:"blur(16px)",
        borderBottom:`1px solid ${C.border}44`, padding:"0 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", height:64,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:C.bgPanel,
              border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <MapPin size={16} color={C.gold} />
            </div>
            <span style={{ fontWeight:800, fontSize:17, color:C.text }}>RamPark</span>
            <Badge variant="gold">FSC</Badge>
          </div>
          <div style={{ display:"flex", gap:6 }}>
        <Link href="/status">
        <Btn variant="ghost">Status</Btn>
      </Link>
      <Link href="/schedule">
      <Btn variant="ghost">Schedule</Btn>
    </Link>
    <Link href="/map">
    <Btn variant="ghost">Map</Btn>
    </Link>
    <Link href="/ai">
    <Btn variant="ghost">AI Demo</Btn>
    </Link>
          </div>
          <Btn variant="primary" size="sm">Sign In <ArrowRight size={14} /></Btn>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex",
        alignItems:"center", paddingTop:80, overflow:"hidden" }}>
        {/* BG decorations */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"20%", left:"5%", width:500, height:500,
            background:`radial-gradient(circle, ${C.bgPanel}cc 0%, transparent 70%)`, borderRadius:"50%" }} />
          <div style={{ position:"absolute", bottom:"10%", right:"5%", width:350, height:350,
            background:`radial-gradient(circle, #1a2d0f88 0%, transparent 70%)`, borderRadius:"50%" }} />
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.05 }}>
            <defs>
              <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill={C.green} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
            background:`linear-gradient(90deg, transparent, ${C.gold}66, transparent)` }} />
        </div>

        <div className="anim-fadeUp"
          style={{ position:"relative", maxWidth:1100, margin:"0 auto", padding:"80px 24px",
            display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>

          {/* Left */}
          <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
            {/* Live pill */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:C.greenBright,
                opacity: pulse ? 1 : 0.3, transition:"opacity 0.7s ease",
                boxShadow: pulse ? `0 0 12px ${C.greenBright}` : "none" }} />
              <span style={{ fontSize:13, color:C.greenBright, fontWeight:600, letterSpacing:"0.04em" }}>
                System Live · Farmingdale State College
              </span>
            </div>

            {/* Hero heading — Inter, normal tracking, no stretch */}
            <div>
              <h1 style={{ fontSize:"clamp(42px,5vw,64px)", fontWeight:800,
                lineHeight:1.08, letterSpacing:"-0.01em", color:C.text }}>
                Campus<br />
                <span className="gold-shimmer">Parking</span><br />
                Reimagined
              </h1>
            </div>

            <p style={{ fontSize:17, color:C.muted, lineHeight:1.7, maxWidth:420 }}>
              Real-time occupancy, AI-powered spot detection, and schedule-aware lot recommendations — built exclusively for FSC students and staff.
            </p>

            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <Link href="/status">
            <Btn variant="primary" size="lg">
            View Live Status <ArrowRight size={16} />
            </Btn>
            </Link>
            <Link href="/ai">
            <Btn variant="secondary" size="lg">
            <Zap size={15} color={C.gold} /> Try AI Demo
            </Btn>
            </Link>
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:32, paddingTop:16, borderTop:`1px solid ${C.border}55` }}>
              <Stat value="2"   label="Lots"    />
              <div style={{ width:1, background:C.border }} />
              <Stat value="97"  label="Spots"   />
              <div style={{ width:1, background:C.border }} />
              <Stat value="<1m" label="Refresh" />
            </div>
          </div>

          {/* Right — floating card */}
          <div className="anim-float">
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`,
              borderRadius:24, padding:24,
              boxShadow:`0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${C.border}22` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <div>
                  <p style={{ fontSize:10, color:C.dimmed, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>Live Overview</p>
                  <h3 style={{ fontSize:17, fontWeight:700, color:C.text }}>Campus Lots</h3>
                </div>
                <Badge>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:C.greenBright,
                    display:"inline-block", boxShadow:`0 0 6px ${C.greenBright}` }} />
                  Updated now
                </Badge>
              </div>
              <div style={{ height:1, background:`linear-gradient(90deg, ${C.gold}44, transparent)`, marginBottom:16 }} />
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <LotCard name="Lot 15 — Student" percent={32} capacity={51} occupied={17} color="green"  delay={300} />
                <LotCard name="Lot 15A — Staff"  percent={68} capacity={46} occupied={31} color="orange" delay={550} />
              </div>
              <a href="/status" style={{ display:"flex", alignItems:"center", justifyContent:"center",
                gap:6, fontSize:13, color:C.gold, fontWeight:700, textDecoration:"none",
                marginTop:16, paddingTop:14, borderTop:`1px solid ${C.border}44` }}>
                View all lots <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 96px" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <Badge variant="gold">Features</Badge>
          <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:C.text, marginTop:16, marginBottom:12 }}>
            Everything you need
          </h2>
          <p style={{ fontSize:16, color:C.muted, maxWidth:480, margin:"0 auto", lineHeight:1.6 }}>
            A complete parking intelligence platform, purpose-built for Farmingdale State College.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 112px" }}>
        <div style={{ background:C.bgCard, border:`1px solid ${C.border}`,
          borderRadius:28, padding:"56px 64px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:240, height:240,
            background:`radial-gradient(circle, ${C.gold}0f 0%, transparent 70%)`,
            borderRadius:"50%", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2,
            background:`linear-gradient(90deg, transparent, ${C.gold}44, transparent)` }} />

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
            <div>
              <Badge variant="gold">How it works</Badge>
              <h2 style={{ fontSize:"clamp(24px,3vw,38px)", fontWeight:800, color:C.text,
                marginTop:16, marginBottom:16, lineHeight:1.15 }}>
                Smarter parking starts with your schedule
              </h2>
              <p style={{ fontSize:15, color:C.muted, lineHeight:1.7, marginBottom:28 }}>
                Sign in with your FSC account, add your class schedule, and RamPark predicts the best lot — before you even leave home.
              </p>
              <Btn variant="primary" size="lg">Get Started <ArrowRight size={16} /></Btn>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {steps.map(s => <Step key={s.num} {...s} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${C.border}44`, padding:"28px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex",
          alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.dimmed }}>
            <MapPin size={14} color={C.gold} />
            <span>RamPark · Farmingdale State College · State University of New York</span>
          </div>
          <p style={{ fontSize:12, color:C.dimmed }}>@farmingdale.edu access only</p>
        </div>
      </footer>
    </div>
  );
}