import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Leaf, Link2, Mic, MicOff, Menu, X, Bell, Search, MapPin, TrendingUp, TrendingDown,
  ShoppingCart, Package, Truck, ShieldCheck, LayoutDashboard, Sprout, Users, BarChart3,
  Route, ClipboardList, Settings, LogOut, CheckCircle2, AlertTriangle, Globe, ChevronRight,
  ChevronDown, Plus, Star, Clock, Navigation, Wallet, Award, Eye, FileText, Filter,
  ArrowRight, Play, Minus, ShieldAlert, UserCheck, PackageCheck, Factory, Sparkles
} from "lucide-react";

/* ============================= DESIGN TOKENS =============================
Primary (deep agri green): #16442E
Secondary (fresh green):   #3F9142
Background (warm neutral): #F7F4EC
Surface:                    #FFFFFF
Ink:                         #16231B
Muted ink:                   #5B6B5F
Gold/value accent:          #B4842A
Warning red:                #B3392C
Logistics blue:             #2A5C8A
Hairline:                   #E3DDCB
============================================================================ */

const COLORS = {
  primary: "#16442E",
  primaryDark: "#0E2E1E",
  secondary: "#3F9142",
  bg: "#F7F4EC",
  surface: "#FFFFFF",
  ink: "#16231B",
  mutedInk: "#5B6B5F",
  gold: "#B4842A",
  warn: "#B3392C",
  blue: "#2A5C8A",
  hairline: "#E3DDCB",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=Inter:wght@400;500;600;700;800&display=swap');`;

/* ============================= DEMO DATA =============================== */

const USERS = {
  farmer: { name: "Ramesh Kumar", org: "Hyderabad Farmers Collective", location: "Hyderabad", trust: 94 },
  consumer: { name: "Priya Sharma", location: "Hyderabad" },
  bulk: { name: "FreshMart Retail", location: "Hyderabad", trust: 91 },
  logistics: { name: "Suresh Transport", location: "Hyderabad" },
  admin: { name: "FarmLink Administrator", location: "Hyderabad" },
};

const CROPS = [
  { id: "tomato", name: "Tomatoes", teluguName: "టమాటా", ref: 28.5, rec: 31.0, demand: "HIGH", change: 18, grade: "A", stock: 500, organic: false, img: "🍅" },
  { id: "onion", name: "Onions", teluguName: "ఉల్లిపాయ", ref: 24.0, rec: 26.5, demand: "MEDIUM", change: 6, grade: "A", stock: 320, organic: false, img: "🧅" },
  { id: "potato", name: "Potatoes", teluguName: "బంగాళదుంప", ref: 19.0, rec: 20.0, demand: "MEDIUM", change: 3, grade: "B", stock: 610, organic: false, img: "🥔" },
  { id: "rice", name: "Rice", teluguName: "బియ్యం", ref: 42.0, rec: 44.0, demand: "LOW", change: -2, grade: "A", stock: 900, organic: true, img: "🌾" },
  { id: "chilli", name: "Chilli", teluguName: "మిర్చి", ref: 65.0, rec: 71.0, demand: "HIGH", change: 22, grade: "A", stock: 150, organic: false, img: "🌶️" },
  { id: "mango", name: "Mangoes", teluguName: "మామిడి", ref: 55.0, rec: 60.0, demand: "HIGH", change: 14, grade: "A", stock: 240, organic: true, img: "🥭" },
];

const forecastFor = (crop) => {
  const base = crop.stock * 2.4;
  return [
    { day: "-6d", historical: Math.round(base * 0.78), predicted: null },
    { day: "-4d", historical: Math.round(base * 0.84), predicted: null },
    { day: "-2d", historical: Math.round(base * 0.9), predicted: null },
    { day: "Today", historical: Math.round(base), predicted: Math.round(base) },
    { day: "+1d", historical: null, predicted: Math.round(base * 1.08) },
    { day: "+3d", historical: null, predicted: Math.round(base * 1.15) },
    { day: "+7d", historical: null, predicted: Math.round(base * 1.29) },
  ];
};

const priceHistoryFor = (crop) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
  return days.map((d, i) => ({
    day: d,
    reference: +(crop.ref * (0.94 + i * 0.01)).toFixed(1),
    farmlink: +(crop.rec * (0.93 + i * 0.012)).toFixed(1),
  }));
};

const BUYERS = [
  { id: 1, name: "FreshMart Retail", type: "Bulk Buyer", loc: "Gachibowli", trust: 91, match: 96, qty: 250, offer: 31 },
  { id: 2, name: "Kondapur Fresh Mart", type: "Consumer Co-op", loc: "Kondapur", trust: 88, match: 89, qty: 120, offer: 30 },
  { id: 3, name: "Green Basket Hyd.", type: "Retailer", loc: "Madhapur", trust: 85, match: 82, qty: 90, offer: 29.5 },
];

const INITIAL_LISTINGS = [
  { id: "L-101", crop: "Tomatoes", grade: "A", qty: 500, unit: "kg", price: 31, farmer: "Ramesh Kumar", org: "Hyderabad Farmers Collective", loc: "Hyderabad", verified: true, organic: false, match: 96 },
  { id: "L-102", crop: "Onions", grade: "A", qty: 320, unit: "kg", price: 26.5, farmer: "Lakshmi Devi", org: "Ranga Reddy FPO", loc: "Ranga Reddy", verified: true, organic: false, match: 88 },
  { id: "L-103", crop: "Mangoes", grade: "A", qty: 240, unit: "kg", price: 60, farmer: "Venkatesh Rao", org: "Chittoor Growers", loc: "Chittoor", verified: true, organic: true, match: 91 },
  { id: "L-104", crop: "Chilli", grade: "A", qty: 150, unit: "kg", price: 71, farmer: "Ramesh Kumar", org: "Hyderabad Farmers Collective", loc: "Hyderabad", verified: true, organic: false, match: 84 },
  { id: "L-105", crop: "Rice", grade: "A", qty: 900, unit: "kg", price: 44, farmer: "Anjali FPO", org: "Nalgonda Collective", loc: "Nalgonda", verified: false, organic: true, match: 76 },
];

const INITIAL_ORDERS = [
  { id: "AGRI-1024", product: "Tomatoes", qty: 250, unit: "kg", buyer: "FreshMart Retail", seller: "Ramesh Kumar", price: 31, status: "IN TRANSIT", eta: "1:30 PM", stage: 7 },
  { id: "AGRI-1025", product: "Tomatoes", qty: 20, unit: "kg", buyer: "Priya Sharma", seller: "Ramesh Kumar", price: 31, status: "ORDER CONFIRMED", eta: "Today, 6 PM", stage: 3 },
  { id: "AGRI-1019", product: "Onions", qty: 90, unit: "kg", buyer: "Green Basket Hyd.", seller: "Lakshmi Devi", price: 26.5, status: "DELIVERED", eta: "Completed", stage: 9 },
];

const STAGES = ["LISTING", "AI MATCH", "PRICE AGREEMENT", "ORDER CONFIRMED", "ORDER CLUSTERING", "LOGISTICS ASSIGNED", "PICKUP", "IN TRANSIT", "DELIVERY", "COMPLETED"];

const NOTIFICATIONS = [
  { id: 1, text: "New buyer match found for your tomatoes.", time: "2 min ago", type: "match" },
  { id: 2, text: "Demand for tomatoes increased by 18%.", time: "40 min ago", type: "demand" },
  { id: 3, text: "Order #AGRI-1024 is now in transit.", time: "1 hr ago", type: "order" },
  { id: 4, text: "Your produce listing was viewed by 12 buyers.", time: "3 hr ago", type: "view" },
  { id: 5, text: "AI recommends selling between ₹30–₹32/kg.", time: "5 hr ago", type: "price" },
];

const TRUST_PROFILES = [
  { name: "Ramesh Kumar", role: "Farmer / FPO", score: 94, checks: ["Identity verified", "FPO verified", "28 successful orders", "No disputes", "Payment history verified"] },
  { name: "FreshMart Retail", role: "Bulk Buyer", score: 91, checks: ["Business verified", "GST verified", "64 completed orders", "1 minor dispute (resolved)", "Payment history verified"] },
  { name: "Suresh Transport", role: "Logistics Partner", score: 88, checks: ["Vehicle registered", "Driver ID verified", "412 deliveries", "2 delayed deliveries", "Cold-chain certified"] },
];

const FRAUD_TXNS = [
  { id: "TXN-8234", amount: "₹7,750", risk: 8, level: "LOW", checks: ["Unusual pricing", "Account history", "Order frequency", "Location consistency", "Quantity anomaly"], flagged: [] },
  { id: "TXN-8235", amount: "₹42,000", risk: 61, level: "MEDIUM", checks: ["Unusual pricing", "Account history", "Order frequency", "Location consistency", "Quantity anomaly"], flagged: ["Unusual pricing", "Quantity anomaly"] },
  { id: "TXN-8236", amount: "₹1,25,000", risk: 87, level: "HIGH", checks: ["Unusual pricing", "Account history", "Order frequency", "Location consistency", "Quantity anomaly"], flagged: ["Account history", "Order frequency", "Location consistency"] },
];

const TRACE_STEPS = ["Farm", "Harvested", "Quality Verified", "Listed on FarmLink", "Buyer Matched", "Picked Up", "In Transit", "Delivered"];

const GMV_TREND = [
  { day: "Mon", gmv: 182000, orders: 41 }, { day: "Tue", gmv: 204000, orders: 47 },
  { day: "Wed", gmv: 195000, orders: 44 }, { day: "Thu", gmv: 231000, orders: 52 },
  { day: "Fri", gmv: 268000, orders: 61 }, { day: "Sat", gmv: 302000, orders: 70 },
  { day: "Today", gmv: 214000, orders: 49 },
];

const LANGS = {
  en: { label: "English", tapToSpeak: "Tap to speak or ask a question", listening: "Listening...", paused: "Paused. Tap mic", prompts: ["Today's tomato price", "Demand forecast", "My orders", "Find buyers", "Add new crop"] },
  te: { label: "తెలుగు", tapToSpeak: "నొక్కండి & మాట్లాడండి", listening: "వింటోంది...", paused: "పాజ్ చేయబడింది. మైక్ నొక్కండి", prompts: ["నేటి టమాటా ధర", "డిమాండ్ అంచనా", "నా ఆర్డర్లు", "కొనుగోలుదారులు", "కొత్త పంట"] },
  hi: { label: "हिन्दी", tapToSpeak: "बोलने के लिए टैप करें", listening: "सुन रहा है...", paused: "रुका हुआ। माइक दबाएं", prompts: ["आज का टमाटर भाव", "मांग पूर्वानुमान", "मेरे ऑर्डर", "खरीदार खोजें", "नई फसल जोड़ें"] },
  ta: { label: "தமிழ்", tapToSpeak: "பேச தட்டவும்", listening: "கேட்கிறது...", paused: "இடைநிறுத்தப்பட்டது", prompts: ["இன்றைய தக்காளி விலை", "தேவை முன்னறிவிப்பு", "என் ஆர்டர்கள்", "வாங்குபவர்களை தேடு", "புதிய பயிர்"] },
  kn: { label: "ಕನ್ನಡ", tapToSpeak: "ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ", listening: "ಕೇಳುತ್ತಿದೆ...", paused: "ವಿರಾಮ. ಮೈಕ್ ಒತ್ತಿ", prompts: ["ಇಂದಿನ ಟೊಮೇಟೊ ಬೆಲೆ", "ಬೇಡಿಕೆ ಮುನ್ಸೂಚನೆ", "ನನ್ನ ಆರ್ಡರ್‌ಗಳು", "ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ", "ಹೊಸ ಬೆಳೆ"] },
};

/* ============================ SMALL PRIMITIVES ============================ */

const Card = ({ children, className = "", style = {} }) => (
  <div className={`rounded-2xl ${className}`} style={{ background: COLORS.surface, border: `1px solid ${COLORS.hairline}`, ...style }}>
    {children}
  </div>
);

const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: { bg: "#EFEBDD", fg: COLORS.mutedInk },
    good: { bg: "#E6F1E4", fg: COLORS.primary },
    gold: { bg: "#F5E9D3", fg: "#8A6318" },
    warn: { bg: "#F6E2DE", fg: COLORS.warn },
    blue: { bg: "#E1EAF2", fg: COLORS.blue },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: t.bg, color: t.fg }}>
      {children}
    </span>
  );
};

const Btn = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled }) => {
  const styles = {
    primary: { background: COLORS.primary, color: "#fff", border: "none" },
    secondary: { background: "#fff", color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` },
    gold: { background: COLORS.gold, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: COLORS.mutedInk, border: `1px solid ${COLORS.hairline}` },
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-40 ${className}`}
      style={styles[variant]}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
};

function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = (msg, tone = "good") => {
    setToast({ msg, tone });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  };
  const node = toast ? (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[999] rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl flex items-center gap-2"
      style={{ background: toast.tone === "warn" ? COLORS.warn : COLORS.primary }}>
      <CheckCircle2 size={16} /> {toast.msg}
    </div>
  ) : null;
  return [node, show];
}

const StatusBadge = ({ status }) => {
  const map = {
    "DELIVERED": "good", "COMPLETED": "good", "IN TRANSIT": "blue",
    "ORDER CONFIRMED": "gold", "PENDING": "neutral", "DISPATCHED": "blue",
  };
  return <Badge tone={map[status] || "neutral"}>{status}</Badge>;
};

const DemandBadge = ({ demand }) => (
  <Badge tone={demand === "HIGH" ? "gold" : demand === "MEDIUM" ? "blue" : "neutral"}>
    {demand === "HIGH" && <TrendingUp size={12} />} {demand}
  </Badge>
);

/* =============================== APP SHELL =============================== */

const NAV = {
  farmer: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "list-produce", label: "List Produce", icon: Sprout },
    { id: "marketplace", label: "Marketplace", icon: ShoppingCart },
    { id: "matching", label: "Buyer Matching", icon: Users },
    { id: "ai-intel", label: "AI Intelligence", icon: BarChart3 },
    { id: "price-intel", label: "Price Intelligence", icon: Wallet },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "trust", label: "Trust & Security", icon: ShieldCheck },
    { id: "voice", label: "Farmer Mitra AI", icon: Mic },
    { id: "notifications", label: "Notifications", icon: Bell },
  ],
  consumer: [
    { id: "dashboard", label: "Fresh Produce", icon: LayoutDashboard },
    { id: "marketplace", label: "Marketplace", icon: ShoppingCart },
    { id: "cart", label: "Cart & Checkout", icon: Package },
    { id: "orders", label: "My Orders", icon: ClipboardList },
    { id: "trust", label: "Trust & Security", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Bell },
  ],
  bulk: [
    { id: "dashboard", label: "Procurement Dashboard", icon: LayoutDashboard },
    { id: "requirement", label: "Create Requirement", icon: Plus },
    { id: "marketplace", label: "Marketplace", icon: ShoppingCart },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "trust", label: "Trust & Security", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Bell },
  ],
  logistics: [
    { id: "dashboard", label: "Logistics Dashboard", icon: LayoutDashboard },
    { id: "clustering", label: "Order Clustering", icon: Package },
    { id: "route", label: "Route Optimization", icon: Route },
    { id: "tracking", label: "Live Tracking", icon: Navigation },
    { id: "notifications", label: "Notifications", icon: Bell },
  ],
  admin: [
    { id: "dashboard", label: "Admin Overview", icon: LayoutDashboard },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "fraud", label: "Fraud Detection", icon: ShieldAlert },
    { id: "audit", label: "Audit Logs", icon: FileText },
    { id: "tracking", label: "Delivery Map", icon: MapPin },
  ],
};

const ROLE_META = {
  farmer: { label: "Farmer / FPO", emoji: "🌾" },
  consumer: { label: "Consumer", emoji: "🛒" },
  bulk: { label: "Bulk Buyer", emoji: "🏢" },
  logistics: { label: "Logistics", emoji: "🚚" },
  admin: { label: "Admin", emoji: "🛡️" },
};

export default function FarmLinkAI() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState("farmer");
  const [page, setPage] = useState("dashboard");
  const [lang, setLang] = useState("en");
  const [demoMode, setDemoMode] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [cart, setCart] = useState([]);
  const [toastNode, showToast] = useToast();
  const [judgeStep, setJudgeStep] = useState(null);

  const selectRole = (r) => { setRole(r); setPage("dashboard"); setAuthed(true); };

  const addOrder = (o) => setOrders((prev) => [{ ...o }, ...prev]);

  const runJudgeDemo = () => {
    const steps = [
      { role: "farmer", page: "dashboard", note: "01 — Farmer opens dashboard, sees demand & pricing signals." },
      { role: "farmer", page: "ai-intel", note: "02 — AI predicts demand is HIGH for tomatoes." },
      { role: "farmer", page: "price-intel", note: "03 — AI recommends ₹31/kg, above mandi reference." },
      { role: "farmer", page: "list-produce", note: "04 — Farmer lists 500kg Grade-A tomatoes." },
      { role: "farmer", page: "matching", note: "05 — AI finds 3 matching buyers instantly." },
      { role: "bulk", page: "dashboard", note: "06 — FreshMart accepts match, orders 250kg." },
      { role: "consumer", page: "marketplace", note: "07 — Consumer Priya orders 20kg directly." },
      { role: "logistics", page: "clustering", note: "08 — Orders are clustered into optimized routes." },
      { role: "logistics", page: "route", note: "09 — AI optimizes the delivery route, saving 13km." },
      { role: "logistics", page: "tracking", note: "10 — Delivery begins and is tracked live." },
      { role: "admin", page: "dashboard", note: "11 — Admin sees the transaction & platform impact." },
    ];
    setJudgeStep({ i: 0, steps });
    setRole(steps[0].role); setPage(steps[0].page); setAuthed(true);
  };
  const nextJudgeStep = () => {
    if (!judgeStep) return;
    const ni = judgeStep.i + 1;
    if (ni >= judgeStep.steps.length) { setJudgeStep(null); showToast("Judge demo complete — full farm-to-buyer journey shown."); return; }
    const s = judgeStep.steps[ni];
    setRole(s.role); setPage(s.page); setJudgeStep({ ...judgeStep, i: ni });
  };

  if (!authed) {
    return (
      <>
        <style>{FONT_IMPORT}</style>
        <LandingLogin onSelectRole={selectRole} demoMode={demoMode} setDemoMode={setDemoMode} />
      </>
    );
  }

  const navItems = NAV[role];
  const roleMeta = ROLE_META[role];

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: COLORS.bg, color: COLORS.ink, minHeight: "100vh" }}>
      <style>{FONT_IMPORT}{`
        .serif { font-family: 'Source Serif 4', serif; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.hairline}; border-radius: 8px; }
      `}</style>
      {toastNode}

      {/* Judge demo banner */}
      {judgeStep && (
        <div className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-2 text-sm text-white" style={{ background: COLORS.primaryDark }}>
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={15} className="shrink-0" />
            <span className="truncate">{judgeStep.steps[judgeStep.i].note}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="opacity-70 text-xs">{judgeStep.i + 1}/{judgeStep.steps.length}</span>
            <button onClick={nextJudgeStep} className="rounded-md px-2.5 py-1 text-xs font-semibold" style={{ background: COLORS.gold }}>Next step →</button>
            <button onClick={() => setJudgeStep(null)} className="opacity-70 hover:opacity-100"><X size={14} /></button>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 border-r" style={{ borderColor: COLORS.hairline, background: COLORS.surface }}>
          <SidebarBrand />
          <RoleSwitcher role={role} setRole={(r) => { setRole(r); setPage("dashboard"); }} />
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
            {navItems.map((n) => (
              <NavButton key={n.id} item={n} active={page === n.id} onClick={() => setPage(n.id)} />
            ))}
          </nav>
          <div className="p-3 border-t" style={{ borderColor: COLORS.hairline }}>
            <Btn variant="secondary" className="w-full" icon={Play} onClick={runJudgeDemo}>Judge Demo</Btn>
            <button onClick={() => setAuthed(false)} className="mt-2 w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium" style={{ color: COLORS.mutedInk }}>
              <LogOut size={15} /> Switch account
            </button>
          </div>
        </aside>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 flex flex-col" style={{ background: COLORS.surface }}>
              <div className="flex items-center justify-between px-4 pt-4">
                <SidebarBrand compact />
                <button onClick={() => setMobileNavOpen(false)}><X size={20} /></button>
              </div>
              <RoleSwitcher role={role} setRole={(r) => { setRole(r); setPage("dashboard"); setMobileNavOpen(false); }} />
              <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
                {navItems.map((n) => (
                  <NavButton key={n.id} item={n} active={page === n.id} onClick={() => { setPage(n.id); setMobileNavOpen(false); }} />
                ))}
              </nav>
              <div className="p-3 border-t" style={{ borderColor: COLORS.hairline }}>
                <Btn variant="secondary" className="w-full" icon={Play} onClick={() => { runJudgeDemo(); setMobileNavOpen(false); }}>Judge Demo</Btn>
              </div>
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="flex-1 min-w-0 pb-16 lg:pb-0">
          <TopBar
            role={role} roleMeta={roleMeta} lang={lang} setLang={setLang}
            demoMode={demoMode} onMenu={() => setMobileNavOpen(true)}
            notifOpen={notifOpen} setNotifOpen={setNotifOpen}
          />
          <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
            <PageRouter
              role={role} page={page} setPage={setPage}
              listings={listings} setListings={setListings}
              orders={orders} addOrder={addOrder}
              cart={cart} setCart={setCart}
              lang={lang} showToast={showToast}
              setRole={setRole}
            />
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav navItems={navItems} page={page} setPage={setPage} onMore={() => setMobileNavOpen(true)} />
    </div>
  );
}

/* =============================== SHELL PARTS =============================== */

function SidebarBrand({ compact }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-5">
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ background: COLORS.primary }}>
        <Leaf size={18} color="#fff" />
        <Link2 size={11} color={COLORS.gold} className="absolute -bottom-1 -right-1" />
      </div>
      {!compact && (
        <div>
          <div className="serif font-semibold leading-tight" style={{ fontSize: 17, color: COLORS.primary }}>FarmLink AI</div>
          <div className="text-[10px] tracking-wide" style={{ color: COLORS.mutedInk }}>Connect · Predict · Deliver</div>
        </div>
      )}
    </div>
  );
}

function RoleSwitcher({ role, setRole }) {
  return (
    <div className="px-3 pb-2">
      <div className="text-[11px] font-semibold px-1 mb-1.5" style={{ color: COLORS.mutedInk }}>SWITCH ROLE</div>
      <div className="grid grid-cols-5 gap-1">
        {Object.entries(ROLE_META).map(([key, m]) => (
          <button
            key={key}
            onClick={() => setRole(key)}
            title={m.label}
            className="flex items-center justify-center rounded-lg py-2 text-base transition"
            style={{
              background: role === key ? COLORS.primary : COLORS.bg,
              border: `1px solid ${role === key ? COLORS.primary : COLORS.hairline}`,
            }}
          >
            {m.emoji}
          </button>
        ))}
      </div>
      <div className="text-xs font-semibold mt-1.5 px-1" style={{ color: COLORS.primary }}>{ROLE_META[role].label}</div>
    </div>
  );
}

function NavButton({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition"
      style={{
        background: active ? "#E6F1E4" : "transparent",
        color: active ? COLORS.primary : COLORS.ink,
      }}
    >
      <Icon size={16} /> {item.label}
    </button>
  );
}

function TopBar({ role, roleMeta, lang, setLang, demoMode, onMenu, notifOpen, setNotifOpen }) {
  const user = USERS[role];
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3 border-b backdrop-blur" style={{ borderColor: COLORS.hairline, background: "rgba(247,244,236,0.9)" }}>
      <button className="lg:hidden" onClick={onMenu}><Menu size={22} /></button>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <MapPin size={14} style={{ color: COLORS.mutedInk }} />
        <span className="text-sm truncate" style={{ color: COLORS.mutedInk }}>{user.location} · {roleMeta.label}</span>
        {demoMode && <Badge tone="gold">Demo Mode</Badge>}
      </div>
      <div className="hidden sm:flex items-center gap-1.5 rounded-lg border px-2 py-1.5" style={{ borderColor: COLORS.hairline }}>
        <Globe size={14} style={{ color: COLORS.mutedInk }} />
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="text-xs font-medium bg-transparent outline-none">
          {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div className="relative">
        <button onClick={() => setNotifOpen((v) => !v)} className="relative rounded-lg p-2" style={{ background: COLORS.surface, border: `1px solid ${COLORS.hairline}` }}>
          <Bell size={17} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: COLORS.warn }}>5</span>
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl z-40 overflow-hidden" style={{ background: COLORS.surface, border: `1px solid ${COLORS.hairline}` }}>
            <div className="px-4 py-3 text-sm font-semibold border-b" style={{ borderColor: COLORS.hairline }}>Notifications</div>
            <div className="max-h-80 overflow-y-auto">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="px-4 py-3 text-sm border-b cursor-pointer hover:bg-black/[0.02]" style={{ borderColor: COLORS.hairline }}>
                  <div>{n.text}</div>
                  <div className="text-xs mt-1" style={{ color: COLORS.mutedInk }}>{n.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="hidden sm:flex items-center gap-2 pl-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: COLORS.secondary }}>
          {user.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
        </div>
        <div className="text-sm font-semibold leading-tight">{user.name}</div>
      </div>
    </header>
  );
}

function MobileBottomNav({ navItems, page, setPage, onMore }) {
  const shown = navItems.slice(0, 4);
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t" style={{ background: COLORS.surface, borderColor: COLORS.hairline }}>
      {shown.map((n) => {
        const Icon = n.icon;
        const active = page === n.id;
        return (
          <button key={n.id} onClick={() => setPage(n.id)} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium" style={{ color: active ? COLORS.primary : COLORS.mutedInk }}>
            <Icon size={18} /> {n.label.split(" ")[0]}
          </button>
        );
      })}
      <button onClick={onMore} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium" style={{ color: COLORS.mutedInk }}>
        <Menu size={18} /> More
      </button>
    </nav>
  );
}

/* =============================== PAGE ROUTER =============================== */

function PageRouter(props) {
  const { role, page } = props;
  const key = `${role}:${page}`;
  switch (key) {
    case "farmer:dashboard": return <FarmerDashboard {...props} />;
    case "farmer:list-produce": return <ListProduceForm {...props} />;
    case "farmer:matching": return <MatchingPage {...props} />;
    case "farmer:ai-intel": return <AIIntelligencePage {...props} />;
    case "farmer:price-intel": return <PriceIntelPage {...props} />;
    case "farmer:voice": return <VoiceCopilotPage {...props} />;
    case "consumer:dashboard": return <ConsumerDashboard {...props} />;
    case "consumer:cart": return <CartCheckoutPage {...props} />;
    case "bulk:dashboard": return <BulkDashboard {...props} />;
    case "bulk:requirement": return <BulkRequirementForm {...props} />;
    case "logistics:dashboard": return <LogisticsDashboard {...props} />;
    case "logistics:clustering": return <ClusteringPage {...props} />;
    case "logistics:route": return <RouteOptimizationPage {...props} />;
    case "logistics:tracking": return <TrackingPage {...props} />;
    case "admin:dashboard": return <AdminDashboard {...props} />;
    case "admin:users": return <AdminUsersPage {...props} />;
    case "admin:fraud": return <FraudPage {...props} />;
    case "admin:audit": return <AuditLogPage {...props} />;
    case "admin:tracking": return <TrackingPage {...props} />;
    default:
      if (page === "marketplace") return <MarketplacePage {...props} />;
      if (page === "orders") return <OrdersPage {...props} />;
      if (page === "trust") return <TrustPage {...props} />;
      if (page === "notifications") return <NotificationsPage {...props} />;
      return <div>Page not found</div>;
  }
}

/* =============================== LANDING / LOGIN =============================== */

function LandingLogin({ onSelectRole, demoMode, setDemoMode }) {
  const [showRoles, setShowRoles] = useState(false);
  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: COLORS.bg, color: COLORS.ink, minHeight: "100vh" }}>
      <style>{`.serif { font-family: 'Source Serif 4', serif; }`}</style>
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-[1300px] mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: COLORS.primary }}>
            <Leaf size={19} color="#fff" />
            <Link2 size={12} color={COLORS.gold} className="absolute -bottom-1 -right-1" />
          </div>
          <div>
            <div className="serif font-semibold" style={{ fontSize: 19, color: COLORS.primary }}>FarmLink AI</div>
            <div className="text-[10px] tracking-wide" style={{ color: COLORS.mutedInk }}>Connect · Predict · Deliver</div>
          </div>
        </div>
        <Btn variant="secondary" onClick={() => setShowRoles(true)}>Sign in</Btn>
      </header>

      {/* Hero */}
      <section className="px-6 sm:px-10 max-w-[1300px] mx-auto pt-8 pb-14 grid lg:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
        <div>
          <Badge tone="gold">SIH 2026 · Problem Statement 26033</Badge>
          <h1 className="serif mt-4 leading-[1.05]" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", color: COLORS.primary }}>
            Cutting the Chain,<br />Growing the Gain.
          </h1>
          <p className="mt-5 text-base sm:text-lg max-w-xl" style={{ color: COLORS.mutedInk }}>
            An AI-powered digital marketplace connecting farmers and FPOs directly with consumers and bulk buyers — with transparent pricing, demand prediction and smart logistics.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Btn onClick={() => setShowRoles(true)} icon={ShoppingCart}>Explore Marketplace</Btn>
            <Btn variant="secondary" onClick={() => setShowRoles(true)} icon={BarChart3}>View AI Intelligence</Btn>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm">
            <button onClick={() => setDemoMode((v) => !v)} className="flex items-center gap-2">
              <span className="w-9 h-5 rounded-full relative transition" style={{ background: demoMode ? COLORS.secondary : COLORS.hairline }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition" style={{ left: demoMode ? 18 : 2 }} />
              </span>
              <span style={{ color: COLORS.mutedInk }}>Demo Mode {demoMode ? "on" : "off"} — seeded Hyderabad data, no external APIs required</span>
            </button>
          </div>
        </div>
        <Card className="p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Tomatoes · Hyderabad Collective</div>
            <DemandBadge demand="HIGH" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MiniStat label="Reference price" value="₹28.50/kg" />
            <MiniStat label="FarmLink price" value="₹31.00/kg" tone="gold" />
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={forecastFor(CROPS[0])}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.secondary} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLORS.secondary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="historical" stroke={COLORS.mutedInk} fill="none" strokeWidth={1.5} />
              <Area type="monotone" dataKey="predicted" stroke={COLORS.secondary} fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs" style={{ color: COLORS.mutedInk }}>AI demand forecast · 94% confidence · demo model</div>
        </Card>
      </section>

      {/* How it works */}
      <section className="px-6 sm:px-10 max-w-[1300px] mx-auto py-10 border-t" style={{ borderColor: COLORS.hairline }}>
        <h2 className="serif" style={{ fontSize: 26, color: COLORS.primary }}>How it works</h2>
        <div className="mt-6 grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {["Farmer lists produce", "AI predicts demand", "AI matches buyers", "Buyer places order", "AI optimizes logistics", "Produce delivered"].map((t, i) => (
            <div key={t} className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: COLORS.primary }}>{i + 1}</div>
              <div className="text-sm font-medium">{t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Value cards */}
      <section className="px-6 sm:px-10 max-w-[1300px] mx-auto py-10 grid md:grid-cols-3 gap-4">
        {[
          { icon: Link2, title: "Direct market access", body: "Connect farmers directly with consumers and bulk buyers." },
          { icon: BarChart3, title: "AI demand forecasting", body: "Predict demand before deciding when and where to sell." },
          { icon: Route, title: "Smart logistics", body: "Cluster orders and optimize routes to reduce transportation costs." },
        ].map((v) => (
          <Card key={v.title} className="p-6">
            <v.icon size={22} style={{ color: COLORS.primary }} />
            <div className="mt-3 font-semibold">{v.title}</div>
            <div className="mt-1.5 text-sm" style={{ color: COLORS.mutedInk }}>{v.body}</div>
          </Card>
        ))}
      </section>

      {/* Impact */}
      <section className="px-6 sm:px-10 max-w-[1300px] mx-auto py-10 border-t" style={{ borderColor: COLORS.hairline }}>
        <h2 className="serif" style={{ fontSize: 26, color: COLORS.primary }}>Impact</h2>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { who: "Farmers", pts: ["Better price discovery", "More buyer access", "Demand visibility"] },
            { who: "Consumers", pts: ["Competitive prices", "Fresher produce", "Transparent information"] },
            { who: "Bulk Buyers", pts: ["Easier procurement", "Verified suppliers", "Better price discovery"] },
            { who: "Society", pts: ["Farmer empowerment", "Efficient procurement", "Reduced supply-chain friction"] },
          ].map((c) => (
            <Card key={c.who} className="p-5">
              <div className="font-semibold" style={{ color: COLORS.primary }}>{c.who}</div>
              <ul className="mt-2 space-y-1.5 text-sm" style={{ color: COLORS.mutedInk }}>
                {c.pts.map((p) => <li key={p} className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: COLORS.secondary }} />{p}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Role picker / login */}
      {showRoles && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="serif" style={{ fontSize: 20, color: COLORS.primary }}>Choose your role</div>
              <button onClick={() => setShowRoles(false)}><X size={18} /></button>
            </div>
            <div className="text-sm mb-4" style={{ color: COLORS.mutedInk }}>Demo credentials are pre-filled — just pick a role to sign in.</div>
            <div className="space-y-2.5">
              {Object.entries(ROLE_META).map(([key, m]) => {
                const u = USERS[key];
                return (
                  <button key={key} onClick={() => onSelectRole(key)} className="w-full flex items-center gap-3 rounded-xl p-3.5 text-left transition hover:border-[#16442E]" style={{ border: `1.5px solid ${COLORS.hairline}` }}>
                    <div className="text-2xl">{m.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{m.label}</div>
                      <div className="text-xs truncate" style={{ color: COLORS.mutedInk }}>{u.name}{u.org ? ` · ${u.org}` : ""} · {u.location}</div>
                    </div>
                    <ChevronRight size={17} style={{ color: COLORS.mutedInk }} />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div>
      <div className="text-[11px]" style={{ color: COLORS.mutedInk }}>{label}</div>
      <div className="font-bold" style={{ fontSize: 18, color: tone === "gold" ? COLORS.gold : COLORS.ink }}>{value}</div>
    </div>
  );
}

/* =============================== SHARED WIDGETS =============================== */

function MetricCard({ label, value, sub, icon: Icon, tone }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium" style={{ color: COLORS.mutedInk }}>{label}</div>
        {Icon && <Icon size={16} style={{ color: tone === "gold" ? COLORS.gold : COLORS.secondary }} />}
      </div>
      <div className="mt-1.5 font-bold serif" style={{ fontSize: 26, color: COLORS.ink }}>{value}</div>
      {sub && <div className="mt-1 text-xs" style={{ color: COLORS.mutedInk }}>{sub}</div>}
    </Card>
  );
}

function ProductCard({ item, onBuy, onOffer, onView }) {
  return (
    <Card className="p-4 flex flex-col">
      <div className="flex items-start justify-between">
        <div className="text-3xl">{CROPS.find((c) => c.name === item.crop)?.img || "🌱"}</div>
        <Badge tone="gold">AI MATCH: {item.match}%</Badge>
      </div>
      <div className="mt-3 font-semibold">{item.crop} <span className="text-xs font-normal" style={{ color: COLORS.mutedInk }}>Grade {item.grade}</span></div>
      <div className="text-xs mt-0.5" style={{ color: COLORS.mutedInk }}>{item.qty} {item.unit} available · {item.loc}</div>
      <div className="mt-2 flex items-center gap-1">
        <span className="font-bold serif" style={{ fontSize: 20, color: COLORS.gold }}>₹{item.price}</span>
        <span className="text-xs" style={{ color: COLORS.mutedInk }}>/{item.unit}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: COLORS.mutedInk }}>
        {item.verified && <span className="flex items-center gap-1" style={{ color: COLORS.primary }}><ShieldCheck size={12} /> Verified</span>}
        {item.organic && <Badge tone="good">Organic</Badge>}
      </div>
      <div className="mt-3 text-xs" style={{ color: COLORS.mutedInk }}>{item.org} · {item.farmer}</div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Btn className="!px-2 !text-xs" onClick={() => onBuy(item)}>Buy Now</Btn>
        <Btn variant="secondary" className="!px-2 !text-xs" onClick={() => onOffer(item)}>Offer</Btn>
        <Btn variant="ghost" className="!px-2 !text-xs" onClick={() => onView(item)}>Details</Btn>
      </div>
    </Card>
  );
}

function ProcessTimeline({ stage }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STAGES.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <span className="rounded-full px-2 py-1 text-[10px] font-semibold" style={{
            background: i < stage ? "#E6F1E4" : i === stage ? "#F5E9D3" : COLORS.bg,
            color: i < stage ? COLORS.primary : i === stage ? "#8A6318" : COLORS.mutedInk,
            border: `1px solid ${i <= stage ? "transparent" : COLORS.hairline}`,
          }}>{s}</span>
          {i < STAGES.length - 1 && <ChevronRight size={11} style={{ color: COLORS.hairline }} />}
        </div>
      ))}
    </div>
  );
}

function SectionHead({ title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-5 flex-wrap">
      <div>
        <h1 className="serif" style={{ fontSize: 24, color: COLORS.primary }}>{title}</h1>
        {subtitle && <div className="text-sm mt-1" style={{ color: COLORS.mutedInk }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

function MockMap({ markers = [], routeSaved }) {
  // A stylised deterministic mock map (no external map API required)
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: "#E7EEF4", height: 260, border: `1px solid ${COLORS.hairline}` }}>
      <svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#D3E0EA" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="260" fill="url(#grid)" />
        {routeSaved && <path d="M 40 210 C 120 150, 160 190, 220 110 S 320 60, 360 50" stroke={COLORS.blue} strokeWidth="3" fill="none" strokeDasharray="0" />}
        {markers.map((m, i) => (
          <g key={i} transform={`translate(${m.x},${m.y})`}>
            <circle r="7" fill={m.color || COLORS.primary} stroke="#fff" strokeWidth="2" />
            <text x="10" y="4" fontSize="10" fill={COLORS.ink} fontWeight="600">{m.label}</text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-2 right-2 text-[10px] px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.85)", color: COLORS.mutedInk }}>Simulated map view · demo mode</div>
    </div>
  );
}

/* =============================== FARMER PAGES =============================== */

function FarmerDashboard({ setPage, listings, showToast }) {
  const myListings = listings.filter((l) => l.farmer === "Ramesh Kumar");
  return (
    <div>
      <SectionHead title="Good morning, Ramesh 👋" subtitle="Hyderabad Farmers Collective" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Today's sales" value="₹18,450" icon={Wallet} tone="gold" />
        <MetricCard label="Active listings" value={myListings.length} icon={Package} />
        <MetricCard label="Pending orders" value="7" icon={ClipboardList} />
        <MetricCard label="Demand" value="HIGH ↑18%" icon={TrendingUp} tone="gold" />
      </div>

      <div className="mt-8">
        <SectionHead title="Market opportunities" />
        <div className="grid md:grid-cols-2 gap-3">
          {CROPS.slice(0, 4).map((c) => (
            <Card key={c.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-3xl">{c.img}</div>
                <div className="min-w-0">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs" style={{ color: COLORS.mutedInk }}>Market ₹{c.ref}/kg · Recommended ₹{c.rec}/kg</div>
                  <div className="mt-1"><DemandBadge demand={c.demand} /> <span className="text-xs ml-1" style={{ color: COLORS.mutedInk }}>{BUYERS.length} potential buyers</span></div>
                </div>
              </div>
              <Btn variant="gold" onClick={() => { showToast(`Listing prepared at ₹${c.rec}/kg for ${c.name}`); setPage("list-produce"); }}>List at ₹{c.rec}/kg</Btn>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <QuickLink icon={BarChart3} title="AI Intelligence" desc="Demand forecast for your crops" onClick={() => setPage("ai-intel")} />
        <QuickLink icon={Users} title="Buyer Matching" desc="3 new AI-matched buyers" onClick={() => setPage("matching")} />
        <QuickLink icon={Mic} title="Farmer Mitra AI" desc="Ask in Telugu, Hindi & more" onClick={() => setPage("voice")} />
      </div>
    </div>
  );
}

function QuickLink({ icon: Icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="text-left">
      <Card className="p-4 flex items-center gap-3 hover:border-[#16442E] transition">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#E6F1E4" }}>
          <Icon size={18} style={{ color: COLORS.primary }} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs truncate" style={{ color: COLORS.mutedInk }}>{desc}</div>
        </div>
        <ChevronRight size={16} className="ml-auto shrink-0" style={{ color: COLORS.mutedInk }} />
      </Card>
    </button>
  );
}

function ListProduceForm({ setListings, setPage, showToast }) {
  const [form, setForm] = useState({
    crop: "Hybrid Tomato", variety: "Hybrid", qty: 500, unit: "kg", grade: "A",
    harvest: "2026-09-08", expected: 31, min: 28, loc: "Hyderabad", from: "2026-09-10",
    organic: "conventional", packaging: "Crates",
  });
  const [submitted, setSubmitted] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    const id = `L-${Math.floor(100 + Math.random() * 900)}`;
    setListings((prev) => [{ id, crop: form.crop, grade: form.grade, qty: +form.qty, unit: form.unit, price: +form.expected, farmer: "Ramesh Kumar", org: "Hyderabad Farmers Collective", loc: form.loc, verified: true, organic: form.organic === "organic", match: 90 + Math.floor(Math.random() * 8) }, ...prev]);
    setSubmitted(true);
    showToast("Listing added to marketplace — AI is generating buyer matches");
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-14">
        <CheckCircle2 size={40} style={{ color: COLORS.secondary }} className="mx-auto" />
        <h2 className="serif mt-4" style={{ fontSize: 22, color: COLORS.primary }}>Listing published</h2>
        <p className="mt-2 text-sm" style={{ color: COLORS.mutedInk }}>{form.qty}{form.unit} of {form.crop} is now live on the marketplace. AI has started matching it with buyers.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Btn onClick={() => setPage("matching")} icon={Users}>View AI matches</Btn>
          <Btn variant="secondary" onClick={() => { setSubmitted(false); setPage("marketplace"); }}>Go to marketplace</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <SectionHead title="List produce" subtitle="Fill in details — AI will recommend pricing and match buyers automatically" />
      <Card className="p-5 grid sm:grid-cols-2 gap-4">
        <Field label="Crop / Product"><input className="input" value={form.crop} onChange={set("crop")} /></Field>
        <Field label="Variety"><input className="input" value={form.variety} onChange={set("variety")} /></Field>
        <Field label="Quantity"><input type="number" className="input" value={form.qty} onChange={set("qty")} /></Field>
        <Field label="Unit"><select className="input" value={form.unit} onChange={set("unit")}><option>kg</option><option>quintal</option><option>tonnes</option></select></Field>
        <Field label="Quality / Grade"><select className="input" value={form.grade} onChange={set("grade")}><option>A</option><option>B</option><option>C</option></select></Field>
        <Field label="Harvest date"><input type="date" className="input" value={form.harvest} onChange={set("harvest")} /></Field>
        <Field label="Expected price (₹/unit)"><input type="number" className="input" value={form.expected} onChange={set("expected")} /></Field>
        <Field label="Minimum acceptable price"><input type="number" className="input" value={form.min} onChange={set("min")} /></Field>
        <Field label="Location"><input className="input" value={form.loc} onChange={set("loc")} /></Field>
        <Field label="Available from"><input type="date" className="input" value={form.from} onChange={set("from")} /></Field>
        <Field label="Organic / conventional"><select className="input" value={form.organic} onChange={set("organic")}><option value="conventional">Conventional</option><option value="organic">Organic</option></select></Field>
        <Field label="Packaging type"><select className="input" value={form.packaging} onChange={set("packaging")}><option>Crates</option><option>Jute bags</option><option>Cold-chain boxes</option></select></Field>
        <div className="sm:col-span-2">
          <div className="text-xs font-medium mb-1.5" style={{ color: COLORS.mutedInk }}>Produce images</div>
          <div className="rounded-lg border-2 border-dashed flex items-center justify-center py-6 text-xs" style={{ borderColor: COLORS.hairline, color: COLORS.mutedInk }}>Drop images here (demo — not required)</div>
        </div>
        <div className="sm:col-span-2 rounded-lg p-3 flex items-center gap-2 text-sm" style={{ background: "#F5E9D3" }}>
          <Sparkles size={15} style={{ color: "#8A6318" }} />
          <span style={{ color: "#8A6318" }}>AI recommends ₹31/kg for Grade-A tomatoes in Hyderabad — demand is HIGH.</span>
        </div>
      </Card>
      <div className="mt-4 flex gap-3">
        <Btn onClick={submit} icon={Sprout}>Publish listing</Btn>
        <Btn variant="ghost" onClick={() => setPage("dashboard")}>Cancel</Btn>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs font-medium mb-1.5" style={{ color: COLORS.mutedInk }}>{label}</div>
      {children}
      <style>{`.input { width:100%; border-radius:8px; border:1px solid ${COLORS.hairline}; padding:8px 10px; font-size:14px; background:#fff; outline:none; } .input:focus { border-color:${COLORS.primary}; }`}</style>
    </label>
  );
}

function MatchingPage({ showToast, addOrder }) {
  const [accepted, setAccepted] = useState({});
  return (
    <div>
      <SectionHead title="AI Buyer–Seller Matching" subtitle="FarmLink AI matches buyers and sellers using crop, quantity, quality, location and price." />
      <div className="text-sm font-semibold mb-3">Ramesh's Tomato Listing (500kg, Grade A)</div>
      <div className="grid md:grid-cols-3 gap-4">
        {BUYERS.map((b) => {
          const isAccepted = accepted[b.id];
          const factors = ["Product", "Quantity", "Quality", "Location", "Price"];
          return (
            <Card key={b.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{b.name}</div>
                <Badge tone="gold">{b.match}% Match</Badge>
              </div>
              <div className="text-xs mt-0.5" style={{ color: COLORS.mutedInk }}>{b.type} · {b.loc}</div>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {factors.map((f, i) => (
                  <div key={f} className="flex items-center gap-1 text-xs" style={{ color: i < 4 || b.match > 90 ? COLORS.primary : COLORS.mutedInk }}>
                    <CheckCircle2 size={12} /> {f}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg px-3 py-2" style={{ background: COLORS.bg }}>
                <span className="text-xs" style={{ color: COLORS.mutedInk }}>Potential order</span>
                <span className="font-bold" style={{ color: COLORS.gold }}>₹{(b.qty * b.offer).toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <Btn variant="ghost" className="!text-xs !px-1.5" onClick={() => showToast(`Viewing ${b.name} profile`)}>View</Btn>
                <Btn variant="secondary" className="!text-xs !px-1.5" onClick={() => showToast(`Negotiation opened with ${b.name}`)}>Negotiate</Btn>
                <Btn className="!text-xs !px-1.5" disabled={isAccepted} onClick={() => {
                  setAccepted((a) => ({ ...a, [b.id]: true }));
                  addOrder({ id: `AGRI-${1030 + b.id}`, product: "Tomatoes", qty: b.qty, unit: "kg", buyer: b.name, seller: "Ramesh Kumar", price: b.offer, status: "ORDER CONFIRMED", eta: "Pending pickup", stage: 3 });
                  showToast(`Match accepted with ${b.name} — order created`);
                }}>{isAccepted ? "Accepted" : "Accept"}</Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AIIntelligencePage() {
  const [crop, setCrop] = useState(CROPS[0]);
  const data = forecastFor(crop);
  return (
    <div>
      <SectionHead title="AI Intelligence" subtitle="Demo forecasting model — architecture is Scikit-learn-ready for production data" right={
        <select className="input !w-auto" value={crop.id} onChange={(e) => setCrop(CROPS.find((c) => c.id === e.target.value))} style={{ borderRadius: 8, border: `1px solid ${COLORS.hairline}`, padding: "8px 10px", fontSize: 14 }}>
          {CROPS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      } />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Demand forecast — {crop.name}</div>
            <DemandBadge demand={crop.demand} />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid stroke={COLORS.hairline} strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="historical" name="Historical demand" stroke={COLORS.mutedInk} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="predicted" name="Predicted demand" stroke={COLORS.secondary} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs mt-1" style={{ color: COLORS.mutedInk }}>Shaded confidence range applies to the predicted series (demo data).</div>
        </Card>
        <div className="space-y-4">
          <MetricCard label="AI confidence" value="94%" icon={Sparkles} tone="gold" />
          <MetricCard label="Expected demand growth" value={`+${crop.change}%`} icon={TrendingUp} />
          <Card className="p-4">
            <div className="font-semibold text-sm mb-2">Why is demand increasing?</div>
            <ul className="space-y-1.5 text-sm" style={{ color: COLORS.mutedInk }}>
              {["Seasonal demand", "Local buyer activity", "Historical order trends", "Current supply shortage"].map((r) => (
                <li key={r} className="flex items-start gap-1.5"><CheckCircle2 size={13} className="mt-0.5" style={{ color: COLORS.secondary }} />{r}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PriceIntelPage({ setPage, showToast }) {
  const [crop, setCrop] = useState(CROPS[0]);
  const hist = priceHistoryFor(crop);
  return (
    <div>
      <SectionHead title="Price Intelligence" subtitle="Compare mandi reference prices with FarmLink recommendations" right={
        <select className="input !w-auto" value={crop.id} onChange={(e) => setCrop(CROPS.find((c) => c.id === e.target.value))} style={{ borderRadius: 8, border: `1px solid ${COLORS.hairline}`, padding: "8px 10px", fontSize: 14 }}>
          {CROPS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      } />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-3xl mb-2">{crop.img}</div>
          <div className="font-semibold">{crop.name.toUpperCase()}</div>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Reference" value={`₹${crop.ref}/kg`} />
            <Row label="FarmLink recommended" value={`₹${crop.rec}/kg`} tone="gold" />
            <Row label="Demand" valueNode={<DemandBadge demand={crop.demand} />} />
            <Row label="Potential improvement" value={`+₹${(crop.rec - crop.ref).toFixed(2)}/kg`} tone="good" />
          </div>
          <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: "#E6F1E4", color: COLORS.primary }}>
            <b>Best time to sell:</b> Demand is expected to increase over the next 3 days.
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Btn onClick={() => { showToast(`Listed ${crop.name} at ₹${crop.rec}/kg`); setPage("list-produce"); }}>List at recommended price</Btn>
            <Btn variant="ghost">View price history</Btn>
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <div className="font-semibold mb-2">7-day price trend</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hist}>
              <CartesianGrid stroke={COLORS.hairline} strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="reference" name="Reference / mandi" stroke={COLORS.mutedInk} strokeWidth={2} />
              <Line type="monotone" dataKey="farmlink" name="FarmLink price" stroke={COLORS.gold} strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, valueNode, tone }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: COLORS.mutedInk }}>{label}</span>
      {valueNode || <span className="font-semibold" style={{ color: tone === "gold" ? COLORS.gold : tone === "good" ? COLORS.secondary : COLORS.ink }}>{value}</span>}
    </div>
  );
}

function VoiceCopilotPage({ lang, setPage, showToast }) {
  const L = LANGS[lang];
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([
    { from: "ai", text: lang === "te" ? "నమస్కారం రమేష్! నేను మీకు ఎలా సహాయం చేయగలను?" : "Hello Ramesh! How can I help you today?" },
  ]);
  const recRef = useRef(null);

  const respond = (prompt) => {
    let reply, extra = null;
    const p = prompt.toLowerCase();
    if (p.includes("price") || p.includes("ధర") || p.includes("भाव") || p.includes("விலை") || p.includes("ಬೆಲೆ")) {
      reply = lang === "te" ? "మీ గ్రేడ్-A హైబ్రిడ్ టమాటాలకు ₹30–₹32/kg మంచి ధరగా కనిపిస్తోంది." : "Grade-A hybrid tomatoes are recommended at ₹30–₹32/kg right now.";
      extra = { type: "price" };
    } else if (p.includes("order") || p.includes("ఆర్డర్") || p.includes("ऑर्डर") || p.includes("ஆர்டர்") || p.includes("ಆರ್ಡರ್")) {
      reply = lang === "te" ? "మీ 250 kg టమాటాల ఆర్డర్ #AGRI-1024 ప్రస్తుతం గచ్చిబౌలి హబ్‌కు వెళ్తోంది." : "Your 250kg tomato order #AGRI-1024 is on its way to the Gachibowli hub.";
      extra = { type: "order" };
    } else if (p.includes("demand") || p.includes("అంచనా") || p.includes("मांग") || p.includes("தேவை") || p.includes("ಬೇಡಿಕೆ")) {
      reply = lang === "te" ? "టమాటాలకు డిమాండ్ అధికంగా ఉంది, వచ్చే 3 రోజుల్లో 18% పెరుగుతుంది." : "Tomato demand is HIGH and expected to grow 18% over the next 3 days.";
      extra = { type: "demand" };
    } else if (p.includes("buyer") || p.includes("కొనుగోలు") || p.includes("खरीदार") || p.includes("வாங்கு") || p.includes("ಖರೀದಿ")) {
      reply = lang === "te" ? "మీ టమాటాలకు 3 మంది కొనుగోలుదారులు లభించారు." : "3 buyers are matched with your tomato listing right now.";
      extra = { type: "buyers" };
    } else {
      reply = lang === "te" ? "కొత్త పంటను జోడించడానికి 'కొత్త పంట' ఫారమ్‌ను తెరుస్తున్నాను." : "Opening the new crop listing form for you.";
      extra = { type: "listing" };
    }
    setMessages((m) => [...m, { from: "user", text: prompt }, { from: "ai", text: reply, extra }]);
  };

  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!listening) {
      setListening(true);
      if (SR) {
        try {
          const rec = new SR();
          rec.lang = lang === "te" ? "te-IN" : lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : lang === "kn" ? "kn-IN" : "en-IN";
          rec.onresult = (e) => { respond(e.results[0][0].transcript); setListening(false); };
          rec.onerror = () => { setListening(false); showToast("Voice input unavailable — try a quick prompt", "warn"); };
          rec.onend = () => setListening(false);
          recRef.current = rec;
          rec.start();
        } catch { setListening(false); showToast("Voice input unavailable in this browser — try a quick prompt", "warn"); }
      } else {
        setTimeout(() => { respond(L.prompts[0]); setListening(false); }, 1400);
      }
    } else {
      recRef.current?.stop?.();
      setListening(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <SectionHead title="రైతు మిత్ర AI · Farmer Mitra AI" subtitle="Voice-first agricultural assistant" />
      <Card className="p-6 flex flex-col items-center text-center">
        <button onClick={toggleMic} className="relative w-20 h-20 rounded-full flex items-center justify-center transition" style={{ background: listening ? COLORS.warn : COLORS.primary }}>
          {listening ? <MicOff size={28} color="#fff" /> : <Mic size={28} color="#fff" />}
          {listening && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: COLORS.warn, opacity: 0.35 }} />}
        </button>
        <div className="mt-3 font-medium">{listening ? L.listening : L.paused}</div>
        <div className="text-xs mt-1" style={{ color: COLORS.mutedInk }}>{L.tapToSpeak}</div>
        {listening && (
          <div className="flex items-end gap-1 mt-4 h-8">
            {[6, 14, 22, 12, 18, 9, 16].map((h, i) => (
              <span key={i} className="w-1.5 rounded-full animate-pulse" style={{ height: h, background: COLORS.secondary, animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {L.prompts.map((p) => (
            <button key={p} onClick={() => respond(p)} className="rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: COLORS.bg, border: `1px solid ${COLORS.hairline}` }}>{p}</button>
          ))}
        </div>
      </Card>

      <div className="mt-5 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%]">
              <div className="rounded-2xl px-4 py-2.5 text-sm" style={{ background: m.from === "user" ? COLORS.primary : "#fff", color: m.from === "user" ? "#fff" : COLORS.ink, border: m.from === "user" ? "none" : `1px solid ${COLORS.hairline}` }}>
                {m.text}
              </div>
              {m.extra?.type === "price" && (
                <Card className="p-3 mt-2">
                  <div className="text-xs" style={{ color: COLORS.mutedInk }}>AI Price Recommendation</div>
                  <div className="font-bold text-xl" style={{ color: COLORS.gold }}>₹31/kg</div>
                  <div className="flex items-center gap-2 mt-1"><DemandBadge demand="HIGH" /><Badge tone="good">Confidence 94%</Badge></div>
                  <Btn className="mt-2" onClick={() => setPage("list-produce")}>List at ₹31/kg</Btn>
                </Card>
              )}
              {m.extra?.type === "order" && (
                <Card className="p-3 mt-2">
                  <StatusBadge status="IN TRANSIT" />
                  <div className="text-sm mt-1.5">18.4 km remaining · ETA 1:30 PM</div>
                  <Btn className="mt-2" onClick={() => setPage("orders")}>View live map</Btn>
                </Card>
              )}
              {m.extra?.type === "buyers" && (
                <Card className="p-3 mt-2">
                  <div className="text-sm font-semibold">3 buyers matched</div>
                  <Btn className="mt-2" onClick={() => setPage("matching")}>View matches</Btn>
                </Card>
              )}
              {m.extra?.type === "listing" && (
                <Btn className="mt-2" onClick={() => setPage("list-produce")}>Open listing form</Btn>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =============================== MARKETPLACE (shared) =============================== */

function MarketplacePage({ listings, cart, setCart, role, showToast }) {
  const [filters, setFilters] = useState({ product: "All", loc: "All", organic: false });
  const products = useMemo(() => [...new Set(listings.map((l) => l.crop))], [listings]);
  const locs = useMemo(() => [...new Set(listings.map((l) => l.loc))], [listings]);
  const filtered = listings.filter((l) =>
    (filters.product === "All" || l.crop === filters.product) &&
    (filters.loc === "All" || l.loc === filters.loc) &&
    (!filters.organic || l.organic)
  );

  const onBuy = (item) => {
    if (role === "consumer") { setCart((c) => [...c, { ...item, orderQty: 1 }]); showToast(`Added ${item.crop} to cart`); }
    else showToast(`Purchase order opened for ${item.crop} (${item.qty}${item.unit})`);
  };
  const onOffer = (item) => showToast(`Offer form opened for ${item.crop} · ${item.farmer}`);
  const onView = (item) => showToast(`Viewing full listing for ${item.crop} · ${item.id}`);

  return (
    <div>
      <SectionHead title="Marketplace" subtitle="Direct listings from verified farmers and FPOs" />
      <Card className="p-3 mb-5 flex flex-wrap items-center gap-3">
        <Filter size={16} style={{ color: COLORS.mutedInk }} />
        <select className="text-sm bg-transparent outline-none" value={filters.product} onChange={(e) => setFilters((f) => ({ ...f, product: e.target.value }))}>
          <option>All</option>{products.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="text-sm bg-transparent outline-none" value={filters.loc} onChange={(e) => setFilters((f) => ({ ...f, loc: e.target.value }))}>
          <option>All</option>{locs.map((l) => <option key={l}>{l}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={filters.organic} onChange={(e) => setFilters((f) => ({ ...f, organic: e.target.checked }))} /> Organic only</label>
        <span className="text-xs ml-auto" style={{ color: COLORS.mutedInk }}>{filtered.length} listings</span>
      </Card>
      {filtered.length === 0 ? (
        <EmptyState title="No listings match your filters" desc="Try clearing a filter to see more produce." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => <ProductCard key={item.id} item={item} onBuy={onBuy} onOffer={onOffer} onView={onView} />)}
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, desc, icon: Icon = Package }) {
  return (
    <Card className="p-10 text-center">
      <Icon size={30} className="mx-auto" style={{ color: COLORS.mutedInk }} />
      <div className="mt-3 font-semibold">{title}</div>
      <div className="text-sm mt-1" style={{ color: COLORS.mutedInk }}>{desc}</div>
    </Card>
  );
}

/* =============================== CONSUMER PAGES =============================== */

function ConsumerDashboard({ setPage, listings, cart, setCart, showToast }) {
  return (
    <div>
      <SectionHead title="Fresh produce. Direct from farms." subtitle="Priya Sharma · Hyderabad" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.slice(0, 6).map((item) => (
          <Card key={item.id} className="p-4">
            <div className="text-3xl">{CROPS.find((c) => c.name === item.crop)?.img}</div>
            <div className="mt-2 font-semibold">{item.crop}</div>
            <div className="font-bold serif" style={{ fontSize: 20, color: COLORS.gold }}>₹{item.price}/{item.unit}</div>
            <div className="text-xs mt-1" style={{ color: COLORS.mutedInk }}>Direct from: {item.org}</div>
            <div className="text-xs" style={{ color: COLORS.mutedInk }}>Distance: {6 + (item.id.charCodeAt(2) % 20)} km · Harvested: Today</div>
            <div className="text-xs mt-1 flex items-center gap-1" style={{ color: COLORS.primary }}><ShieldCheck size={12} /> Verified</div>
            <Btn className="mt-3 w-full" icon={ShoppingCart} onClick={() => { setCart((c) => [...c, { ...item, orderQty: 1 }]); showToast(`${item.crop} added to cart`); }}>Add to cart</Btn>
          </Card>
        ))}
      </div>
      {cart.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 z-30">
          <Btn icon={ShoppingCart} onClick={() => setPage("cart")}>{cart.length} in cart</Btn>
        </div>
      )}
    </div>
  );
}

function CartCheckoutPage({ cart, setCart, addOrder, showToast, setPage }) {
  const [placed, setPlaced] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.orderQty, 0);
  const updateQty = (idx, delta) => setCart((c) => c.map((i, ix) => ix === idx ? { ...i, orderQty: Math.max(1, i.orderQty + delta) } : i));

  if (placed) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <CheckCircle2 size={40} style={{ color: COLORS.secondary }} className="mx-auto" />
        <h2 className="serif mt-4" style={{ fontSize: 22, color: COLORS.primary }}>Order confirmed</h2>
        <p className="mt-2 text-sm" style={{ color: COLORS.mutedInk }}>Your order is confirmed and will be clustered with nearby deliveries for efficient routing.</p>
        <Btn className="mt-6" onClick={() => setPage("orders")}>Track my order</Btn>
      </div>
    );
  }

  if (cart.length === 0) return <EmptyState title="Your cart is empty" desc="Add fresh produce from the marketplace." icon={ShoppingCart} />;

  return (
    <div className="max-w-2xl">
      <SectionHead title="Cart & checkout" />
      <div className="space-y-3">
        {cart.map((item, idx) => (
          <Card key={idx} className="p-3 flex items-center gap-3">
            <div className="text-2xl">{CROPS.find((c) => c.name === item.crop)?.img}</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{item.crop}</div>
              <div className="text-xs" style={{ color: COLORS.mutedInk }}>₹{item.price}/{item.unit}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(idx, -1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ border: `1px solid ${COLORS.hairline}` }}><Minus size={12} /></button>
              <span className="text-sm w-5 text-center">{item.orderQty}</span>
              <button onClick={() => updateQty(idx, 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ border: `1px solid ${COLORS.hairline}` }}><Plus size={12} /></button>
            </div>
            <div className="font-semibold text-sm w-16 text-right">₹{(item.price * item.orderQty).toFixed(0)}</div>
          </Card>
        ))}
      </div>
      <Card className="p-4 mt-4 flex items-center justify-between">
        <span className="font-semibold">Total</span>
        <span className="font-bold serif" style={{ fontSize: 20, color: COLORS.gold }}>₹{total.toFixed(0)}</span>
      </Card>
      <Btn className="mt-4 w-full" onClick={() => {
        cart.forEach((item, i) => addOrder({ id: `AGRI-${1050 + i}`, product: item.crop, qty: item.orderQty, unit: item.unit, buyer: "Priya Sharma", seller: item.farmer, price: item.price, status: "ORDER CONFIRMED", eta: "Today, evening", stage: 3 }));
        setCart([]); setPlaced(true); showToast("Order placed");
      }}>Place order</Btn>
    </div>
  );
}

/* =============================== BULK BUYER PAGES =============================== */

function BulkDashboard({ setPage }) {
  return (
    <div>
      <SectionHead title="Procurement dashboard" subtitle="FreshMart Retail · Hyderabad" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Active requests" value="4" icon={ClipboardList} />
        <MetricCard label="Matched suppliers" value="11" icon={Users} />
        <MetricCard label="Pending orders" value="6" icon={Package} />
        <MetricCard label="Estimated savings" value="₹38,200" icon={Wallet} tone="gold" />
      </div>
      <div className="mt-8">
        <QuickLink icon={Plus} title="Create bulk requirement" desc="Post a new procurement request" onClick={() => setPage("requirement")} />
      </div>
    </div>
  );
}

function BulkRequirementForm({ showToast, addOrder, setPage }) {
  const [form, setForm] = useState({ product: "Tomatoes", qty: 2000, quality: "A", target: 30, loc: "Hyderabad", date: "2026-09-12" });
  const [matched, setMatched] = useState(false);
  const suppliers = [
    { name: "Ramesh Kumar / Hyderabad Farmers Collective", qty: 1000, price: 29.5, match: 96 },
    { name: "Lakshmi Devi / Ranga Reddy FPO", qty: 700, price: 30, match: 92 },
    { name: "Venkatesh Rao / Chittoor Growers", qty: 500, price: 30.5, match: 89 },
  ];
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (matched) {
    return (
      <div>
        <SectionHead title={`${suppliers.length} suppliers found`} subtitle={`AI-matched suppliers for ${form.qty}kg of ${form.product}`} />
        <div className="grid md:grid-cols-3 gap-4">
          {suppliers.map((s, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">Supplier {i + 1}</div>
                <Badge tone="gold">{s.match}% match</Badge>
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.mutedInk }}>{s.name}</div>
              <div className="mt-2 text-sm">{s.qty} kg · ₹{s.price}/kg</div>
              <Btn className="mt-3 w-full" onClick={() => { addOrder({ id: `AGRI-${1060 + i}`, product: form.product, qty: s.qty, unit: "kg", buyer: "FreshMart Retail", seller: s.name.split(" / ")[0], price: s.price, status: "ORDER CONFIRMED", eta: "Pending pickup", stage: 3 }); showToast(`Order placed with ${s.name.split(" / ")[0]}`); }}>Select supplier</Btn>
            </Card>
          ))}
        </div>
        <Btn variant="ghost" className="mt-5" onClick={() => setPage("orders")}>View orders</Btn>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <SectionHead title="Create bulk requirement" />
      <Card className="p-5 grid sm:grid-cols-2 gap-4">
        <Field label="Product"><input className="input" value={form.product} onChange={set("product")} /></Field>
        <Field label="Quantity (kg)"><input type="number" className="input" value={form.qty} onChange={set("qty")} /></Field>
        <Field label="Quality"><select className="input" value={form.quality} onChange={set("quality")}><option>A</option><option>B</option></select></Field>
        <Field label="Target price (₹/kg)"><input type="number" className="input" value={form.target} onChange={set("target")} /></Field>
        <Field label="Delivery location"><input className="input" value={form.loc} onChange={set("loc")} /></Field>
        <Field label="Required date"><input type="date" className="input" value={form.date} onChange={set("date")} /></Field>
      </Card>
      <Btn className="mt-4" onClick={() => setMatched(true)}>Find AI-matched suppliers</Btn>
    </div>
  );
}

/* =============================== LOGISTICS PAGES =============================== */

function LogisticsDashboard({ setPage }) {
  return (
    <div>
      <SectionHead title="Logistics dashboard" subtitle="Suresh Transport · Hyderabad" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Pending pickups" value="5" icon={Package} />
        <MetricCard label="Active deliveries" value="8" icon={Truck} />
        <MetricCard label="Completed today" value="21" icon={PackageCheck} />
        <MetricCard label="Available vehicles" value="4" icon={Factory} />
      </div>
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <QuickLink icon={Package} title="Order clustering" desc="Group nearby orders into routes" onClick={() => setPage("clustering")} />
        <QuickLink icon={Route} title="AI route optimization" desc="3 nearby orders detected" onClick={() => setPage("route")} />
        <QuickLink icon={Navigation} title="Live delivery tracking" desc="Track order #AGRI-1024" onClick={() => setPage("tracking")} />
      </div>
    </div>
  );
}

function ClusteringPage({ orders, showToast }) {
  const [clustered, setClustered] = useState(false);
  const pending = orders.filter((o) => o.status !== "DELIVERED");
  const groupA = pending.slice(0, 3);
  const groupB = pending.slice(3);
  return (
    <div>
      <SectionHead title="Order clustering" subtitle={`${pending.length} nearby orders detected`} right={<Btn icon={Sparkles} onClick={() => { setClustered(true); showToast("AI clustering complete — routes optimized"); }}>Run AI clustering</Btn>} />
      {!clustered ? (
        <div className="grid gap-2">
          {pending.map((o) => (
            <Card key={o.id} className="p-3 flex items-center justify-between">
              <div className="text-sm font-medium">#{o.id} · {o.product} ({o.qty}{o.unit})</div>
              <span className="text-xs" style={{ color: COLORS.mutedInk }}>{o.buyer}</span>
            </Card>
          ))}
          <div className="text-xs mt-2" style={{ color: COLORS.mutedInk }}>Instead of {pending.length} separate vehicle trips, AI can group these by location, delivery window, product and vehicle capacity.</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {[{ name: "Route Group A", items: groupA, color: COLORS.primary }, { name: "Route Group B", items: groupB, color: COLORS.blue }].map((g) => (
            <Card key={g.name} className="p-4">
              <div className="flex items-center gap-2 font-semibold"><span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />{g.name}</div>
              <div className="text-xs mt-1" style={{ color: COLORS.mutedInk }}>Grouped by location & delivery window · 1 vehicle</div>
              <div className="mt-3 space-y-1.5">
                {g.items.length === 0 ? <div className="text-xs" style={{ color: COLORS.mutedInk }}>No orders in this group</div> : g.items.map((o) => (
                  <div key={o.id} className="text-sm flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: COLORS.bg }}>
                    <span>#{o.id} · {o.product}</span><span style={{ color: COLORS.mutedInk }}>{o.qty}{o.unit}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RouteOptimizationPage({ showToast }) {
  const [optimized, setOptimized] = useState(false);
  return (
    <div>
      <SectionHead title="AI route optimization" subtitle="3 nearby orders detected — combine into one efficient route" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm font-semibold mb-2">Route</div>
          <div className="flex flex-col gap-1.5 text-sm">
            {["Farm Collection Hub", "Kondapur", "Gachibowli", "Central Buyer Hub"].map((s, i, arr) => (
              <div key={s} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS.blue }} /> {s}
                {i < arr.length - 1 && <ChevronDown size={12} className="ml-auto" style={{ color: COLORS.mutedInk }} />}
              </div>
            ))}
          </div>
          <MockMap routeSaved={optimized} markers={[
            { x: 40, y: 210, label: "Hub", color: COLORS.primary },
            { x: 220, y: 110, label: "Gachibowli", color: COLORS.blue },
            { x: 360, y: 50, label: "Buyer", color: COLORS.gold },
          ]} />
          {!optimized ? (
            <Btn className="mt-3 w-full" icon={Sparkles} onClick={() => { setOptimized(true); showToast("Route optimized — 13km saved"); }}>Optimize route</Btn>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Btn variant="secondary" className="!text-xs">Assign driver</Btn>
              <Btn className="!text-xs">Start delivery</Btn>
              <Btn variant="ghost" className="!text-xs">Re-run</Btn>
            </div>
          )}
        </Card>
        <div className="space-y-3">
          <Card className="p-4 grid grid-cols-2 gap-3">
            <MiniStat label="Original distance" value="42 km" />
            <MiniStat label="Optimized distance" value={optimized ? "29 km" : "—"} tone="gold" />
            <MiniStat label="Distance saved" value={optimized ? "13 km" : "—"} />
            <MiniStat label="Cost saved" value={optimized ? "₹420" : "—"} tone="gold" />
          </Card>
          {optimized && (
            <Card className="p-4 flex items-center gap-3">
              <Leaf size={18} style={{ color: COLORS.secondary }} />
              <div className="text-sm">Estimated carbon reduction from route consolidation <b>(simulated estimate)</b>.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TrackingPage({ orders }) {
  const order = orders.find((o) => o.id === "AGRI-1024") || orders[0];
  const steps = ["Pickup", "Dispatched", "In Transit", "Delivered"];
  const activeIdx = order?.status === "DELIVERED" ? 3 : order?.status === "IN TRANSIT" ? 2 : 1;
  return (
    <div>
      <SectionHead title={`Order #${order?.id}`} subtitle="Live delivery tracking" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <MockMap markers={[
            { x: 40, y: 210, label: "Pickup", color: COLORS.primary },
            { x: 210, y: 120, label: "Vehicle", color: COLORS.warn },
            { x: 360, y: 45, label: "Destination", color: COLORS.blue },
          ]} routeSaved />
          <div className="mt-3 flex items-center justify-between text-sm">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1 flex-1">
                <span className="w-3 h-3 rounded-full" style={{ background: i <= activeIdx ? COLORS.primary : COLORS.hairline }} />
                <span className="text-[10px]" style={{ color: i <= activeIdx ? COLORS.primary : COLORS.mutedInk }}>{s}{i === activeIdx ? " ●" : i < activeIdx ? " ✓" : " ○"}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-3">
          <Card className="p-4 space-y-2 text-sm">
            <Row label="Status" valueNode={<StatusBadge status={order?.status} />} />
            <Row label="Driver" value="Suresh" />
            <Row label="Vehicle" value="Reefer Truck" />
            <Row label="Temperature" value="12.4°C" />
            <Row label="Distance remaining" value="18.4 km" />
            <Row label="ETA" value={order?.eta} tone="gold" />
          </Card>
          <Card className="p-4">
            <div className="text-sm font-semibold mb-2">Traceability</div>
            <div className="space-y-2">
              {TRACE_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 size={13} style={{ color: i <= 5 ? COLORS.secondary : COLORS.hairline }} />
                  <span style={{ color: i <= 5 ? COLORS.ink : COLORS.mutedInk }}>{s}</span>
                  <span className="ml-auto" style={{ color: COLORS.mutedInk }}>{i <= 5 ? `Sep ${8 + i}, 2026` : ""}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =============================== ORDERS (shared) =============================== */

function OrdersPage({ orders }) {
  return (
    <div>
      <SectionHead title="Orders" />
      <div className="space-y-3">
        {orders.map((o) => (
          <Card key={o.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-sm">#{o.id} · {o.product}</div>
                <div className="text-xs" style={{ color: COLORS.mutedInk }}>{o.qty}{o.unit} · {o.buyer} ← {o.seller} · ₹{o.price}/{o.unit} = ₹{(o.qty * o.price).toLocaleString("en-IN")}</div>
              </div>
              <div className="flex items-center gap-2"><StatusBadge status={o.status} /><span className="text-xs" style={{ color: COLORS.mutedInk }}>{o.eta}</span></div>
            </div>
            <div className="mt-3 overflow-x-auto"><ProcessTimeline stage={o.stage} /></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* =============================== TRUST / FRAUD / ADMIN =============================== */

function TrustPage() {
  return (
    <div>
      <SectionHead title="Trust & security" subtitle="Verification, trust scores and transaction traceability" />
      <div className="grid md:grid-cols-3 gap-4">
        {TRUST_PROFILES.map((p) => (
          <Card key={p.name} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-xs" style={{ color: COLORS.mutedInk }}>{p.role}</div>
              </div>
              <div className="text-right">
                <div className="font-bold serif" style={{ fontSize: 22, color: COLORS.secondary }}>{p.score}</div>
                <div className="text-[10px]" style={{ color: COLORS.mutedInk }}>/100</div>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              {p.checks.map((c) => (
                <li key={c} className="flex items-start gap-1.5" style={{ color: c.toLowerCase().includes("dispute") || c.toLowerCase().includes("delay") ? COLORS.warn : COLORS.ink }}>
                  {c.toLowerCase().includes("dispute") || c.toLowerCase().includes("delay") ? <AlertTriangle size={12} className="mt-0.5" /> : <CheckCircle2 size={12} className="mt-0.5" style={{ color: COLORS.secondary }} />} {c}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FraudPage({ showToast }) {
  const [checked, setChecked] = useState({});
  return (
    <div>
      <SectionHead title="Fraud detection" subtitle="AI transaction risk monitoring" />
      <div className="space-y-3">
        {FRAUD_TXNS.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold text-sm">Transaction #{t.id} · {t.amount}</div>
              <Badge tone={t.level === "LOW" ? "good" : t.level === "MEDIUM" ? "gold" : "warn"}>Risk score: {t.level} — {t.risk}%</Badge>
            </div>
            <div className="mt-2 grid sm:grid-cols-5 gap-1.5 text-xs">
              {t.checks.map((c) => (
                <div key={c} className="flex items-center gap-1" style={{ color: t.flagged.includes(c) ? COLORS.warn : COLORS.secondary }}>
                  {t.flagged.includes(c) ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />} {c}
                </div>
              ))}
            </div>
            <Btn variant="ghost" className="mt-3 !text-xs" onClick={() => { setChecked((c) => ({ ...c, [t.id]: true })); showToast(`Inspection opened for ${t.id}`); }}>{checked[t.id] ? "Inspected ✓" : "Inspect transaction"}</Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminUsersPage({ showToast }) {
  const users = [
    { name: "Ramesh Kumar", role: "Farmer/FPO", status: "Verified", trust: 94 },
    { name: "Lakshmi Devi", role: "Farmer/FPO", status: "Verified", trust: 90 },
    { name: "FreshMart Retail", role: "Bulk Buyer", status: "Verified", trust: 91 },
    { name: "Priya Sharma", role: "Consumer", status: "Verified", trust: 82 },
    { name: "Anjali FPO", role: "Farmer/FPO", status: "Pending", trust: 76 },
    { name: "Suresh Transport", role: "Logistics", status: "Verified", trust: 88 },
  ];
  return (
    <div>
      <SectionHead title="Manage users" />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: COLORS.bg }}>
            <tr className="text-left text-xs" style={{ color: COLORS.mutedInk }}>
              <th className="px-4 py-2.5 font-medium">Name</th><th className="px-4 py-2.5 font-medium">Role</th><th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 font-medium">Trust</th><th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.name} className="border-t" style={{ borderColor: COLORS.hairline }}>
                <td className="px-4 py-2.5 font-medium">{u.name}</td>
                <td className="px-4 py-2.5" style={{ color: COLORS.mutedInk }}>{u.role}</td>
                <td className="px-4 py-2.5"><Badge tone={u.status === "Verified" ? "good" : "gold"}>{u.status}</Badge></td>
                <td className="px-4 py-2.5">{u.trust}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => showToast(`${u.name} verification updated`)} className="text-xs font-semibold flex items-center gap-1 ml-auto" style={{ color: COLORS.primary }}><UserCheck size={13} /> Verify</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AuditLogPage() {
  const logs = [
    { t: "10:42 AM", a: "Admin verified farmer Ramesh Kumar", type: "verify" },
    { t: "10:15 AM", a: "Order #AGRI-1024 status changed to IN TRANSIT", type: "order" },
    { t: "09:58 AM", a: "Fraud check run on TXN-8236 — flagged HIGH risk", type: "fraud" },
    { t: "09:30 AM", a: "Listing L-105 published by Anjali FPO", type: "listing" },
    { t: "08:55 AM", a: "Route optimized for cluster #RC-22 (13km saved)", type: "route" },
  ];
  return (
    <div>
      <SectionHead title="Audit logs" subtitle="System-wide activity trail" />
      <Card className="divide-y" style={{ borderColor: COLORS.hairline }}>
        {logs.map((l, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3 text-sm">
            <span className="text-xs w-20 shrink-0" style={{ color: COLORS.mutedInk }}>{l.t}</span>
            <FileText size={14} style={{ color: COLORS.mutedInk }} />
            <span>{l.a}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AdminDashboard({ orders, setPage }) {
  const pie = [
    { name: "Farmers", value: 320 }, { name: "Consumers", value: 540 }, { name: "Bulk Buyers", value: 64 },
  ];
  const pieColors = [COLORS.primary, COLORS.secondary, COLORS.gold];
  return (
    <div>
      <SectionHead title="Admin overview" subtitle="Platform-wide analytics" right={<Btn variant="secondary" icon={Play} onClick={() => setPage("dashboard")}>Refresh</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Total farmers" value="320" icon={Sprout} />
        <MetricCard label="Total buyers" value="604" icon={Users} />
        <MetricCard label="Active listings" value="186" icon={Package} />
        <MetricCard label="Orders today" value="49" icon={ClipboardList} />
        <MetricCard label="Transaction value" value="₹2.14L" icon={Wallet} tone="gold" />
        <MetricCard label="Deliveries" value="112" icon={Truck} />
        <MetricCard label="AI matches" value="418" icon={Sparkles} />
        <MetricCard label="Flagged transactions" value="3" icon={ShieldAlert} />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <div className="font-semibold text-sm mb-2">GMV & orders — last 7 days</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={GMV_TREND}>
              <CartesianGrid stroke={COLORS.hairline} strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="gmv" name="GMV (₹)" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <div className="font-semibold text-sm mb-2">User mix</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                {pie.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-1 justify-center text-xs">
            {pie.map((p, i) => <span key={p.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: pieColors[i] }} />{p.name}</span>)}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="font-semibold text-sm mb-3">Recent transactions</div>
          <div className="space-y-2">
            {orders.slice(0, 4).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <span>#{o.id} · {o.product}</span>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <div className="font-semibold text-sm mb-2">Active deliveries — Hyderabad</div>
          <MockMap markers={[
            { x: 60, y: 190, label: "Kondapur", color: COLORS.blue },
            { x: 180, y: 120, label: "Gachibowli", color: COLORS.blue },
            { x: 300, y: 70, label: "Madhapur", color: COLORS.blue },
          ]} />
        </Card>
      </div>
    </div>
  );
}

function NotificationsPage() {
  return (
    <div>
      <SectionHead title="Notifications" />
      <div className="space-y-2.5">
        {NOTIFICATIONS.map((n) => (
          <Card key={n.id} className="p-3.5 flex items-center gap-3 cursor-pointer hover:border-[#16442E]">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#E6F1E4" }}><Bell size={14} style={{ color: COLORS.primary }} /></div>
            <div className="flex-1 text-sm">{n.text}</div>
            <div className="text-xs shrink-0" style={{ color: COLORS.mutedInk }}>{n.time}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
