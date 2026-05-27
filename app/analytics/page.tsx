"use client";

import { useEffect, useState } from "react";
import "../lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useTheme } from "../lib/ThemeContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const menuItems = [
{ id: "overview", label: "Overview", icon: "⚡", href: "/dashboard" },
{ id: "orders", label: "Orders", icon: "📦", href: "/orders" },
{ id: "products", label: "Products", icon: "🛍️", href: "/products" },
{ id: "customers", label: "Customers", icon: "👥", href: "/customers" },
{ id: "reservations", label: "Reservations", icon: "📅", href: "/reservations" },
{ id: "analytics", label: "Analytics", icon: "📊", href: "/analytics" },
{ id: "settings", label: "Settings", icon: "⚙️", href: "/settings" },
];

export default function Analytics() {
const [user, setUser] = useState<any>(null);
const [customers, setCustomers] = useState(0);
const [products, setProducts] = useState(0);
const [reservations, setReservations] = useState(0);
const { dark, toggleTheme } = useTheme();

useEffect(() => {
const auth = getAuth();
onAuthStateChanged(auth, async (u) => {
if (u) {
setUser(u);
const cSnap = await getDocs(collection(db, "emails"));
setCustomers(cSnap.size);
const pSnap = await getDocs(collection(db, "products"));
setProducts(pSnap.size);
const rSnap = await getDocs(collection(db, "reservations"));
setReservations(rSnap.size);
} else {
window.location.href = "/login";
}
});
}, []);

const revenueData = [
{ month: "Jan", revenue: 0 },
{ month: "Feb", revenue: 0 },
{ month: "Mar", revenue: 0 },
{ month: "Apr", revenue: 0 },
{ month: "May", revenue: 0 },
{ month: "Jun", revenue: 0 },
];

const ordersData = [
{ day: "Mon", orders: 0 },
{ day: "Tue", orders: 0 },
{ day: "Wed", orders: 0 },
{ day: "Thu", orders: 0 },
{ day: "Fri", orders: 0 },
{ day: "Sat", orders: 0 },
{ day: "Sun", orders: 0 },
];

if (!user) return <p style={{ textAlign: "center", marginTop: "100px", color: "#999" }}>Loading...</p>;

return (
<div style={{ ...styles.container, background: dark ? "#1a1a1a" : "#f5f5f7", color: dark ? "#fff" : "#1d1d1f" }}>
<div style={{ ...styles.sidebar, background: dark ? "#2a2a2a" : "#fff", borderColor: dark ? "#333" : "#e5e7eb" }}>
<h2 style={{ ...styles.logo, color: dark ? "#fff" : "#1d1d1f" }}>Avelo</h2>
<nav style={styles.nav}>
{menuItems.map((item) => (
<button
key={item.id}
onClick={() => { window.location.href = item.href; }}
style={{
...styles.navItem,
color: dark ? "#ccc" : "#6e6e73",
...(item.id === "analytics" ? { background: dark ? "#3a3a3a" : "#f0f0f5", color: dark ? "#fff" : "#1d1d1f" } : {}),
}}
>
<span style={styles.navIcon}>{item.icon}</span>
{item.label}
</button>
))}
</nav>
<div style={{ ...styles.sidebarBottom, borderColor: dark ? "#333" : "#e5e7eb" }}>
<p style={{ ...styles.userEmail, color: dark ? "#aaa" : "#6e6e73" }}>{user.email}</p>
<button onClick={toggleTheme} style={{ ...styles.logoutBtn, background: dark ? "#3a3a3a" : "#fff", color: dark ? "#fff" : "#1d1d1f", borderColor: dark ? "#555" : "#e5e7eb", marginBottom: "8px" }}>
{dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>
<button onClick={() => window.location.href = "/login"} style={{ ...styles.logoutBtn, background: dark ? "#3a3a3a" : "#fff", color: dark ? "#fff" : "#1d1d1f", borderColor: dark ? "#555" : "#e5e7eb" }}>
Sign out
</button>
</div>
</div>

<div style={styles.main}>
<div style={styles.topbar}>
<h1 style={{ ...styles.pageTitle, color: dark ? "#fff" : "#1d1d1f" }}>Analytics</h1>
</div>

<div style={styles.statsGrid}>
{[
{ label: "Total Customers", value: customers, icon: "👥" },
{ label: "Total Products", value: products, icon: "🛍️" },
{ label: "Total Reservations", value: reservations, icon: "📅" },
{ label: "Total Revenue", value: "$0", icon: "💰" },
].map((s, i) => (
<div key={i} style={{ ...styles.statCard, background: dark ? "#2a2a2a" : "#fff" }}>
<span style={styles.statIcon}>{s.icon}</span>
<p style={{ ...styles.statValue, color: dark ? "#fff" : "#1d1d1f" }}>{s.value}</p>
<p style={styles.statLabel}>{s.label}</p>
</div>
))}
</div>

<div style={{ ...styles.chartCard, background: dark ? "#2a2a2a" : "#fff" }}>
<h3 style={{ ...styles.cardTitle, color: dark ? "#fff" : "#1d1d1f" }}>Revenue Overview</h3>
<ResponsiveContainer width="100%" height={250}>
<LineChart data={revenueData}>
<CartesianGrid strokeDasharray="3 3" stroke={dark ? "#444" : "#f0f0f0"} />
<XAxis dataKey="month" tick={{ fontSize: 13, fill: dark ? "#aaa" : "#6e6e73" }} />
<YAxis tick={{ fontSize: 13, fill: dark ? "#aaa" : "#6e6e73" }} />
<Tooltip />
<Line type="monotone" dataKey="revenue" stroke={dark ? "#fff" : "#1d1d1f"} strokeWidth={2} dot={{ fill: dark ? "#fff" : "#1d1d1f", r: 4 }} />
</LineChart>
</ResponsiveContainer>
</div>

<div style={{ ...styles.chartCard, background: dark ? "#2a2a2a" : "#fff" }}>
<h3 style={{ ...styles.cardTitle, color: dark ? "#fff" : "#1d1d1f" }}>Orders This Week</h3>
<ResponsiveContainer width="100%" height={250}>
<BarChart data={ordersData}>
<CartesianGrid strokeDasharray="3 3" stroke={dark ? "#444" : "#f0f0f0"} />
<XAxis dataKey="day" tick={{ fontSize: 13, fill: dark ? "#aaa" : "#6e6e73" }} />
<YAxis tick={{ fontSize: 13, fill: dark ? "#aaa" : "#6e6e73" }} />
<Tooltip />
<Bar dataKey="orders" fill={dark ? "#fff" : "#1d1d1f"} radius={[6, 6, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
</div>
</div>
);
}

const styles: { [key: string]: React.CSSProperties } = {
container: { display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" },
sidebar: { width: "240px", display: "flex", flexDirection: "column", padding: "24px 16px", position: "fixed", height: "100vh", borderRight: "1px solid #e5e7eb" },
logo: { fontSize: "22px", fontWeight: "700", marginBottom: "32px", paddingLeft: "12px" },
nav: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: "none", background: "transparent", fontSize: "15px", fontWeight: "500", cursor: "pointer", textAlign: "left", width: "100%" },
navIcon: { fontSize: "18px" },
sidebarBottom: { borderTop: "1px solid #e5e7eb", paddingTop: "16px" },
userEmail: { fontSize: "13px", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
logoutBtn: { width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", fontWeight: "500", cursor: "pointer" },
main: { marginLeft: "240px", flex: 1, padding: "40px" },
topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
pageTitle: { fontSize: "28px", fontWeight: "700" },
statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
statCard: { borderRadius: "16px", padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", textAlign: "center" },
statIcon: { fontSize: "32px", display: "block", marginBottom: "12px" },
statValue: { fontSize: "32px", fontWeight: "700", margin: "0 0 4px" },
statLabel: { fontSize: "13px", color: "#6e6e73", margin: 0 },
chartCard: { borderRadius: "16px", padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: "24px" },
cardTitle: { fontSize: "17px", fontWeight: "600", marginBottom: "16px" },
};
