"use client";

import { useEffect, useState } from "react";
import "../lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useTheme } from "../lib/ThemeContext";

const menuItems = [
{ id: "overview", label: "Overview", icon: "⚡", href: "/dashboard" },
{ id: "orders", label: "Orders", icon: "📦", href: "/orders" },
{ id: "products", label: "Products", icon: "🛍️", href: "/products" },
{ id: "customers", label: "Customers", icon: "👥", href: "/customers" },
{ id: "reservations", label: "Reservations", icon: "📅", href: "/reservations" },
{ id: "analytics", label: "Analytics", icon: "📊", href: "/analytics" },
{ id: "settings", label: "Settings", icon: "⚙️", href: "/settings" },
];

export default function Customers() {
const [user, setUser] = useState<any>(null);
const [customers, setCustomers] = useState<any[]>([]);
const { dark, toggleTheme } = useTheme();

useEffect(() => {
const auth = getAuth();
onAuthStateChanged(auth, (u) => {
if (u) { setUser(u); fetchCustomers(); }
else window.location.href = "/login";
});
}, []);

const fetchCustomers = async () => {
const snap = await getDocs(collection(db, "emails"));
setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
};

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
...(item.id === "customers" ? { background: dark ? "#3a3a3a" : "#f0f0f5", color: dark ? "#fff" : "#1d1d1f" } : {}),
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
<h1 style={{ ...styles.pageTitle, color: dark ? "#fff" : "#1d1d1f" }}>Customers</h1>
<span style={{ ...styles.badge, background: dark ? "#3a3a3a" : "#f0f0f5", color: dark ? "#fff" : "#1d1d1f" }}>{customers.length} total</span>
</div>

<div style={{ ...styles.card, background: dark ? "#2a2a2a" : "#fff" }}>
<table style={styles.table}>
<thead>
<tr>
{["#", "Email", "Joined"].map((h) => (
<th key={h} style={{ ...styles.th, color: dark ? "#aaa" : "#6e6e73", borderColor: dark ? "#444" : "#e5e7eb" }}>{h}</th>
))}
</tr>
</thead>
<tbody>
{customers.length === 0 ? (
<tr>
<td colSpan={3} style={{ textAlign: "center", padding: "40px", color: "#6e6e73" }}>No customers yet</td>
</tr>
) : (
customers.map((c, i) => (
<tr key={c.id}>
<td style={{ ...styles.td, color: dark ? "#fff" : "#1d1d1f" }}>{i + 1}</td>
<td style={{ ...styles.td, color: dark ? "#fff" : "#1d1d1f" }}>{c.email}</td>
<td style={{ ...styles.td, color: dark ? "#fff" : "#1d1d1f" }}>{c.createdAt?.toDate?.()?.toLocaleDateString() ?? "-"}</td>
</tr>
))
)}
</tbody>
</table>
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
badge: { padding: "6px 14px", borderRadius: "20px", fontSize: "14px", fontWeight: "500" },
card: { borderRadius: "16px", padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
table: { width: "100%", borderCollapse: "collapse" },
th: { textAlign: "left", fontSize: "13px", fontWeight: "500", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" },
td: { padding: "14px 0", fontSize: "14px", borderBottom: "1px solid #f5f5f7" },
};
