"use client";

import { useState } from "react";
import { db } from "./lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function Home() {
const [showModal, setShowModal] = useState(false);
const [step, setStep] = useState<"email" | "password">("email");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [done, setDone] = useState(false);

const handleEmailNext = () => {
if (!email) return;
setStep("password");
};

const handleRegister = async () => {
if (!password || password.length < 6) return alert("Password must be at least 6 characters");
setLoading(true);
try {
const auth = getAuth();
await createUserWithEmailAndPassword(auth, email, password);
await addDoc(collection(db, "emails"), { email, trialDays: 6, createdAt: new Date() });
setDone(true);
setTimeout(() => {
window.location.href = "/dashboard";
}, 1500);
} catch (err: any) {
if (err.code === "auth/email-already-in-use") alert("This email is already registered");
else alert("Error: " + err.message);
} finally {
setLoading(false);
}
};

const resetModal = () => {
setShowModal(false);
setStep("email");
setEmail("");
setPassword("");
setDone(false);
};

return (
<div style={styles.container}>

{/* MODAL */}
{showModal && (
<div style={styles.overlay} onClick={resetModal}>
<div style={styles.modal} onClick={(e) => e.stopPropagation()}>

{done ? (
<div style={{ textAlign: "center" }}>
<div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
<h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Account created!</h2>
<p style={{ color: "#6b7280", fontSize: 14 }}>Redirecting to your dashboard...</p>
</div>
) : (
<>
{/* Progress */}
<div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
{["Email", "Password"].map((s, i) => (
<div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: (step === "email" && i === 0) || step === "password" ? "#111" : "#e5e7eb", transition: "background 0.3s" }} />
))}
</div>

{step === "email" && (
<>
<h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Start your free trial</h2>
<p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>6 days free · No credit card required</p>
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
<input
type="email"
placeholder="Enter your email"
value={email}
onChange={(e) => setEmail(e.target.value)}
onKeyDown={(e) => e.key === "Enter" && handleEmailNext()}
autoFocus
style={styles.modalInput}
/>
<button onClick={handleEmailNext} disabled={!email}
style={{ ...styles.modalBtn, opacity: !email ? 0.5 : 1 }}>
Continue →
</button>
<button onClick={resetModal} style={styles.cancelBtn}>Cancel</button>
</div>
</>
)}

{step === "password" && (
<>
<h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Create your password</h2>
<p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>{email}</p>
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
<input
type="password"
placeholder="Create a password (min. 6 characters)"
value={password}
onChange={(e) => setPassword(e.target.value)}
onKeyDown={(e) => e.key === "Enter" && handleRegister()}
autoFocus
style={styles.modalInput}
/>
<button onClick={handleRegister} disabled={!password || loading}
style={{ ...styles.modalBtn, opacity: !password || loading ? 0.5 : 1 }}>
{loading ? "Creating account..." : "Create account →"}
</button>
<button onClick={() => setStep("email")} style={styles.cancelBtn}>← Back</button>
</div>
</>
)}

<div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 20 }}>
{["✓ 6 days free", "✓ No credit card", "✓ Cancel anytime"].map((t) => (
<span key={t} style={{ fontSize: 12, color: "#9ca3af" }}>{t}</span>
))}
</div>
</>
)}
</div>
</div>
)}

{/* NAVBAR */}
<nav style={styles.nav}>
<h2 style={styles.logo}>Avelo</h2>
<div style={{ display: "flex", gap: "10px" }}>
<button onClick={() => window.location.href = "/login"} style={styles.navBtn}>Login</button>
<button onClick={() => setShowModal(true)} style={{ ...styles.navBtn, background: "#111", color: "#fff", border: "none" }}>Get Started</button>
</div>
</nav>

{/* HERO */}
<div style={styles.hero}>
<span style={styles.badge}>🚀 Now in Beta · 6-day free trial</span>
<h1 style={styles.title}>Build your online store<br />in minutes</h1>
<p style={styles.subtitle}>Start your business with Avelo — fast, simple, free.</p>
<button onClick={() => setShowModal(true)} style={styles.button}>Start free →</button>
<p style={styles.hint}>6-day free trial · No credit card required</p>

<div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
{[
{ num: "2,400+", label: "Stores created" },
{ num: "98%", label: "Satisfaction rate" },
{ num: "< 5 min", label: "Average setup time" },
].map((s) => (
<div key={s.label} style={{ textAlign: "center" }}>
<p style={{ fontSize: 24, fontWeight: 800, color: "#111", margin: 0 }}>{s.num}</p>
<p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{s.label}</p>
</div>
))}
</div>
</div>

{/* FEATURES */}
<div style={styles.features}>
<h2 style={styles.sectionTitle}>Why Avelo?</h2>
<div style={styles.featureGrid}>
{[
{ icon: "⚡", title: "Fast Setup", desc: "Launch your store in under 5 minutes." },
{ icon: "🎨", title: "Beautiful Design", desc: "Professional templates included." },
{ icon: "📦", title: "Easy Products", desc: "Add and manage products effortlessly." },
{ icon: "💳", title: "Payments Ready", desc: "Accept payments from day one." },
{ icon: "📱", title: "Mobile First", desc: "Looks great on every device." },
{ icon: "📊", title: "Analytics", desc: "Track your sales and growth." },
].map((f, i) => (
<div key={i} style={styles.featureCard}>
<div style={styles.featureIcon}>{f.icon}</div>
<h3 style={styles.featureCardTitle}>{f.title}</h3>
<p style={styles.featureCardDesc}>{f.desc}</p>
</div>
))}
</div>
</div>

{/* TESTIMONIALS */}
<div style={{ padding: "80px 60px", background: "#fff" }}>
<h2 style={styles.sectionTitle}>What our customers say</h2>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
{[
{ name: "Sarah M.", store: "MimiShop Fashion", text: "Setting up my store took less than 10 minutes. Sales tripled in the first month!", stars: 5 },
{ name: "James K.", store: "ChefVijai Restaurant", text: "The booking system is amazing. Customers book online easily and I never miss a reservation.", stars: 5 },
{ name: "Emily R.", store: "Beauty by Emily", text: "The templates are gorgeous. Customers always compliment how professional my store looks!", stars: 5 },
].map((t, i) => (
<div key={i} style={{ background: "#f9fafb", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb" }}>
<div style={{ marginBottom: 12 }}>{"⭐".repeat(t.stars)}</div>
<p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>"{t.text}"</p>
<p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: 0 }}>{t.name}</p>
<p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{t.store}</p>
</div>
))}
</div>
</div>

{/* PRICING */}
<div style={styles.pricing}>
<h2 style={styles.sectionTitle}>Simple Pricing</h2>
<p style={{ textAlign: "center", color: "#6b7280", fontSize: 15, marginTop: -32, marginBottom: 48 }}>
Try any plan free for 6 days. No credit card required.
</p>
<div style={styles.pricingGrid}>
{[
{ plan: "Starter", price: "€19.99", period: "/mo", features: ["1 store", "Up to 50 products", "Basic analytics", "Email support"], highlight: false },
{ plan: "Pro", price: "€69.99", period: "/mo", features: ["Unlimited stores", "Unlimited products", "Advanced analytics", "Priority support", "Custom domain", "Booking + Reviews"], highlight: true },
{ plan: "Enterprise", price: "Custom", period: "", features: ["Everything in Pro", "Dedicated server", "SLA 99.9%", "Dedicated support team"], highlight: false },
].map((p, i) => (
<div key={i} style={{ ...styles.pricingCard, ...(p.highlight ? styles.pricingCardHighlight : {}), position: "relative" }}>
{p.highlight && (
<div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#111", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>
⭐ Most Popular
</div>
)}
<h3 style={styles.planName}>{p.plan}</h3>
<div style={{ marginBottom: 4 }}>
<span style={styles.planPrice}>{p.price}</span>
<span style={{ fontSize: 14, color: "#6b7280" }}>{p.period}</span>
</div>
{p.highlight && <p style={{ fontSize: 12, color: "#4f6ef7", fontWeight: 600, marginBottom: 16 }}>🎉 6-day free trial</p>}
<ul style={styles.planFeatures}>
{p.features.map((f, j) => (
<li key={j} style={styles.planFeatureItem}>✓ {f}</li>
))}
</ul>
<button onClick={() => setShowModal(true)} style={p.highlight ? styles.planBtnHighlight : styles.planBtn}>
{p.price === "Custom" ? "Contact us" : "Get started"}
</button>
</div>
))}
</div>
</div>

{/* FOOTER */}
<footer style={styles.footer}>
<p>© 2026 Avelo. All rights reserved.</p>
</footer>
</div>
);
}

const styles: { [key: string]: React.CSSProperties } = {
container: { minHeight: "100vh", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#f9fafb", color: "#111" },
overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
modal: { background: "#fff", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
modalInput: { padding: "14px 18px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" as const },
modalBtn: { padding: "14px", borderRadius: 10, border: "none", background: "#111", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%" },
cancelBtn: { background: "none", border: "none", color: "#9ca3af", fontSize: 14, cursor: "pointer", width: "100%", padding: "8px" },
nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 60px", borderBottom: "1px solid #e5e7eb", background: "#fff" },
logo: { fontSize: "22px", fontWeight: "700", letterSpacing: "0.5px" },
navBtn: { padding: "8px 20px", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: "500" },
hero: { textAlign: "center", padding: "100px 20px 80px", background: "#fff" },
badge: { display: "inline-block", background: "#f0f4ff", color: "#4f6ef7", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "20px" },
title: { fontSize: "56px", fontWeight: "800", lineHeight: "1.2", marginBottom: "16px", color: "#111" },
subtitle: { fontSize: "18px", color: "#6b7280", marginBottom: "32px" },
button: { padding: "14px 32px", borderRadius: "10px", border: "none", background: "#111", color: "#fff", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
hint: { color: "#9ca3af", fontSize: "13px", marginTop: "12px" },
features: { padding: "80px 60px", background: "#f9fafb" },
sectionTitle: { textAlign: "center", fontSize: "36px", fontWeight: "700", marginBottom: "48px" },
featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", maxWidth: "1100px", margin: "0 auto" },
featureCard: { background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid #e5e7eb" },
featureIcon: { fontSize: "32px", marginBottom: "12px" },
featureCardTitle: { fontSize: "17px", fontWeight: "700", marginBottom: "8px" },
featureCardDesc: { fontSize: "14px", color: "#6b7280" },
pricing: { padding: "80px 60px", background: "#f9fafb" },
pricingGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", maxWidth: "900px", margin: "0 auto" },
pricingCard: { border: "1px solid #e5e7eb", borderRadius: "16px", padding: "32px", textAlign: "center", background: "#fff" },
pricingCardHighlight: { border: "2px solid #111", background: "#f0f4ff" },
planName: { fontSize: "20px", fontWeight: "700", marginBottom: "8px" },
planPrice: { fontSize: "36px", fontWeight: "800", marginBottom: "4px" },
planFeatures: { listStyle: "none", padding: 0, marginBottom: "24px", textAlign: "left" },
planFeatureItem: { fontSize: "14px", color: "#374151", marginBottom: "8px" },
planBtn: { padding: "12px 24px", borderRadius: "10px", border: "1px solid #111", background: "#fff", cursor: "pointer", fontWeight: "600", width: "100%" },
planBtnHighlight: { padding: "12px 24px", borderRadius: "10px", border: "none", background: "#111", color: "#fff", cursor: "pointer", fontWeight: "600", width: "100%" },
footer: { textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: "14px", borderTop: "1px solid #e5e7eb" },
};
