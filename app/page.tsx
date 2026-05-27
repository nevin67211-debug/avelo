"use client";

import { useState } from "react";
import { db } from "./lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Home() {
const [email, setEmail] = useState("");
const [submitted, setSubmitted] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setSubmitted(true);
try {
await addDoc(collection(db, "emails"), {
email: email,
createdAt: new Date(),
});
alert("Saved!");
setTimeout(() => {
setEmail("");
setSubmitted(false);
}, 500);
} catch (error) {
console.log(error);
alert("Error saving email");
setSubmitted(false);
}
};

return (
<div style={styles.container}>

{/* NAVBAR */}
<nav style={styles.nav}>
<h2 style={styles.logo}>Avelo</h2>
<div style={{ display: "flex", gap: "10px" }}>
<button onClick={() => window.location.href = "/login"} style={styles.navBtn}>Login</button>
<button onClick={() => window.location.href = "/register"} style={{ ...styles.navBtn, background: "#111", color: "#fff", border: "none" }}>Get Started</button>
</div>
</nav>

{/* HERO */}
<div style={styles.hero}>
<span style={styles.badge}>🚀 Now in Beta</span>
<h1 style={styles.title}>Build your online store<br />in minutes</h1>
<p style={styles.subtitle}>Start your business with Avelo — fast, simple, free.</p>

<form onSubmit={handleSubmit} style={styles.form}>
<input
type="email"
placeholder="Enter your email"
value={email}
onChange={(e) => setEmail(e.target.value)}
style={styles.input}
required
/>
<button type="submit" style={styles.button}>
{submitted ? "Sending →" : "Start free →"}
</button>
</form>
<p style={styles.hint}>No credit card required</p>
</div>

{/* FEATURES */}
<div style={styles.features}>
<h2 style={styles.featuresTitle}>Why Avelo?</h2>
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

{/* PRICING */}
<div style={styles.pricing}>
<h2 style={styles.featuresTitle}>Simple Pricing</h2>
<div style={styles.pricingGrid}>
{[
{ plan: "Free", price: "$0", features: ["1 store", "10 products", "Basic analytics"] },
{ plan: "Pro", price: "$12/mo", features: ["Unlimited stores", "Unlimited products", "Advanced analytics", "Priority support"], highlight: true },
{ plan: "Enterprise", price: "Custom", features: ["Everything in Pro", "Custom domain", "Dedicated support"] },
].map((p, i) => (
<div key={i} style={{ ...styles.pricingCard, ...(p.highlight ? styles.pricingCardHighlight : {}) }}>
<h3 style={styles.planName}>{p.plan}</h3>
<p style={styles.planPrice}>{p.price}</p>
<ul style={styles.planFeatures}>
{p.features.map((f, j) => (
<li key={j} style={styles.planFeatureItem}>✓ {f}</li>
))}
</ul>
<button style={p.highlight ? styles.planBtnHighlight : styles.planBtn}>
Get started
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
container: {
minHeight: "100vh",
fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
background: "#f9fafb",
color: "#111",
},
nav: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
padding: "20px 60px",
borderBottom: "1px solid #e5e7eb",
background: "#fff",
},
logo: { fontSize: "22px", fontWeight: "700", letterSpacing: "0.5px" },
navBtn: {
padding: "8px 20px",
borderRadius: "8px",
border: "1px solid #ddd",
background: "#fff",
cursor: "pointer",
fontWeight: "500",
},
hero: {
textAlign: "center",
padding: "100px 20px 80px",
background: "#fff",
},
badge: {
display: "inline-block",
background: "#f0f4ff",
color: "#4f6ef7",
padding: "6px 14px",
borderRadius: "20px",
fontSize: "13px",
fontWeight: "600",
marginBottom: "20px",
},
title: {
fontSize: "56px",
fontWeight: "800",
lineHeight: "1.2",
marginBottom: "16px",
color: "#111",
},
subtitle: {
fontSize: "18px",
color: "#6b7280",
marginBottom: "32px",
},
form: {
display: "flex",
justifyContent: "center",
gap: "10px",
flexWrap: "wrap",
},
input: {
padding: "14px 18px",
width: "300px",
borderRadius: "10px",
border: "1px solid #e5e7eb",
fontSize: "15px",
outline: "none",
},
button: {
padding: "14px 24px",
borderRadius: "10px",
border: "none",
background: "#111",
color: "#fff",
fontSize: "15px",
fontWeight: "600",
cursor: "pointer",
},
hint: { color: "#9ca3af", fontSize: "13px", marginTop: "12px" },
features: { padding: "80px 60px", background: "#f9fafb" },
featuresTitle: {
textAlign: "center",
fontSize: "36px",
fontWeight: "700",
marginBottom: "48px",
},
featureGrid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "24px",
maxWidth: "1100px",
margin: "0 auto",
},
featureCard: {
background: "#fff",
borderRadius: "16px",
padding: "28px",
border: "1px solid #e5e7eb",
},
featureIcon: { fontSize: "32px", marginBottom: "12px" },
featureCardTitle: { fontSize: "17px", fontWeight: "700", marginBottom: "8px" },
featureCardDesc: { fontSize: "14px", color: "#6b7280" },
pricing: { padding: "80px 60px", background: "#fff" },
pricingGrid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
gap: "24px",
maxWidth: "900px",
margin: "0 auto",
},
pricingCard: {
border: "1px solid #e5e7eb",
borderRadius: "16px",
padding: "32px",
textAlign: "center",
},
pricingCardHighlight: {
border: "2px solid #111",
background: "#f0f4ff",
},
planName: { fontSize: "20px", fontWeight: "700", marginBottom: "8px" },
planPrice: { fontSize: "36px", fontWeight: "800", marginBottom: "20px" },
planFeatures: { listStyle: "none", padding: 0, marginBottom: "24px", textAlign: "left" },
planFeatureItem: { fontSize: "14px", color: "#374151", marginBottom: "8px" },
planBtn: {
padding: "12px 24px",
borderRadius: "10px",
border: "1px solid #111",
background: "#fff",
cursor: "pointer",
fontWeight: "600",
width: "100%",
},
planBtnHighlight: {
padding: "12px 24px",
borderRadius: "10px",
border: "none",
background: "#111",
color: "#fff",
cursor: "pointer",
fontWeight: "600",
width: "100%",
},
footer: {
textAlign: "center",
padding: "32px",
color: "#9ca3af",
fontSize: "14px",
borderTop: "1px solid #e5e7eb",
},
};