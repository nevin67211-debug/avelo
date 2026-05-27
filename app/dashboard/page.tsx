"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useTheme } from "../lib/ThemeContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const menuItems = [
{ id: "overview", label: "Overview", icon: "⚡", href: "/dashboard" },
{ id: "orders", label: "Orders", icon: "📦", href: "/orders" },
{ id: "products", label: "Products", icon: "🛍️", href: "/products" },
{ id: "customers", label: "Customers", icon: "👥", href: "/customers" },
{ id: "reservations", label: "Reservations", icon: "📅", href: "/reservations" },
{ id: "analytics", label: "Analytics", icon: "📊", href: "/analytics" },
{ id: "settings", label: "Settings", icon: "⚙️", href: "/settings" },
];

export default function Dashboard() {
const [user, setUser] = useState<any>(null);
const { dark, toggleTheme } = useTheme();
const [stores, setStores] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
const auth = getAuth();
onAuthStateChanged(auth, async (u) => {
if (!u) { window.location.href = "/login"; return; }
setUser(u);
try {
const q = query(collection(db, "stores"), where("uid", "==", u.uid));
const snap = await getDocs(q);
setStores(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
} catch (err) {
console.error(err);
} finally {
setLoading(false);
}
});
}, []);

const handleLogout = async () => {
const auth = getAuth();
await signOut(auth);
window.location.href = "/login";
};

const handleDeleteStore = async (storeId: string, storeName: string) => {
if (!confirm(`ลบร้าน "${storeName}" ? ไม่สามารถกู้คืนได้`)) return;
await deleteDoc(doc(db, "stores", storeId));
setStores((prev) => prev.filter((s) => s.id !== storeId));
};

if (!user || loading) return <p style={{ textAlign: "center", marginTop: "100px", color: "#999" }}>Loading...</p>;

const stats = [
{ label: "Total Revenue", value: "$0.00", icon: "💰", change: "+0%" },
{ label: "Orders", value: "0", icon: "📦", change: "+0%" },
{ label: "Customers", value: "0", icon: "👥", change: "+0%" },
{ label: "Stores", value: stores.length.toString(), icon: "🏪", change: "" },
];

const chartData = [
{ month: "Jan", revenue: 0 },
{ month: "Feb", revenue: 0 },
{ month: "Mar", revenue: 0 },
{ month: "Apr", revenue: 0 },
{ month: "May", revenue: 0 },
{ month: "Jun", revenue: 0 },
];

return (
<div style={{ ...styles.container, background: dark ? "#1a1a1a" : "#f5f5f7", color: dark ? "#fff" : "#1d1d1f" }}>
{/* SIDEBAR */}
<div style={{ ...styles.sidebar, background: dark ? "#2a2a2a" : "#fff", borderColor: dark ? "#333" : "#e5e7eb" }}>
<h2 style={{ ...styles.logo, color: dark ? "#fff" : "#1d1d1f" }}>Avelo</h2>
<nav style={styles.nav}>
{menuItems.map((item) => (
<button key={item.id} onClick={() => { window.location.href = item.href; }}
style={{ ...styles.navItem, color: dark ? "#ccc" : "#6e6e73", ...(item.id === "overview" ? { background: dark ? "#3a3a3a" : "#f0f0f5", color: dark ? "#fff" : "#1d1d1f" } : {}) }}>
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
<button onClick={handleLogout} style={{ ...styles.logoutBtn, background: dark ? "#3a3a3a" : "#fff", color: dark ? "#fff" : "#1d1d1f", borderColor: dark ? "#555" : "#e5e7eb" }}>
Sign out
</button>
</div>
</div>

{/* MAIN */}
<div style={styles.main}>
<div style={styles.topbar}>
<h1 style={{ ...styles.pageTitle, color: dark ? "#fff" : "#1d1d1f" }}>Overview</h1>
<button style={styles.createBtn} onClick={() => { window.location.href = "/create-store"; }}>+ Create Store</button>
</div>

{/* STATS */}
<div style={styles.statsGrid}>
{stats.map((s, i) => (
<div key={i} style={{ ...styles.statCard, background: dark ? "#2a2a2a" : "#fff" }}>
<div style={styles.statTop}>
<span style={styles.statIcon}>{s.icon}</span>
{s.change && <span style={styles.statChange}>{s.change}</span>}
</div>
<p style={{ ...styles.statValue, color: dark ? "#fff" : "#1d1d1f" }}>{s.value}</p>
<p style={styles.statLabel}>{s.label}</p>
</div>
))}
</div>

{/* CHART */}
<div style={{ ...styles.chartCard, background: dark ? "#2a2a2a" : "#fff" }}>
<h3 style={{ ...styles.cardTitle, color: dark ? "#fff" : "#1d1d1f" }}>Revenue Overview</h3>
<ResponsiveContainer width="100%" height={250}>
<LineChart data={chartData}>
<CartesianGrid strokeDasharray="3 3" stroke={dark ? "#444" : "#f0f0f0"} />
<XAxis dataKey="month" tick={{ fontSize: 13, fill: dark ? "#aaa" : "#6e6e73" }} />
<YAxis tick={{ fontSize: 13, fill: dark ? "#aaa" : "#6e6e73" }} />
<Tooltip />
<Line type="monotone" dataKey="revenue" stroke={dark ? "#fff" : "#1d1d1f"} strokeWidth={2} dot={{ fill: dark ? "#fff" : "#1d1d1f", r: 4 }} />
</LineChart>
</ResponsiveContainer>
</div>

{/* BOTTOM GRID */}
<div style={styles.bottomGrid}>
<div style={{ ...styles.card, background: dark ? "#2a2a2a" : "#fff" }}>
<h3 style={{ ...styles.cardTitle, color: dark ? "#fff" : "#1d1d1f" }}>Recent Orders</h3>
<table style={styles.table}>
<thead>
<tr>
<th style={{ ...styles.th, color: dark ? "#aaa" : "#6e6e73" }}>Order</th>
<th style={{ ...styles.th, color: dark ? "#aaa" : "#6e6e73" }}>Customer</th>
<th style={{ ...styles.th, color: dark ? "#aaa" : "#6e6e73" }}>Status</th>
<th style={{ ...styles.th, color: dark ? "#aaa" : "#6e6e73" }}>Amount</th>
</tr>
</thead>
<tbody>
<tr>
<td style={styles.td} colSpan={4}>
<p style={styles.empty}>No orders yet</p>
</td>
</tr>
</tbody>
</table>
</div>

<div style={{ ...styles.card, background: dark ? "#2a2a2a" : "#fff" }}>
<h3 style={{ ...styles.cardTitle, color: dark ? "#fff" : "#1d1d1f" }}>My Stores</h3>
{stores.length === 0 ? (
<>
<p style={styles.empty}>No stores yet</p>
<button style={styles.addBtn} onClick={() => { window.location.href = "/create-store"; }}>+ Create Store</button>
</>
) : (
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
{stores.map((store) => (
<div key={store.id} style={{ ...styles.storeItem, background: dark ? "#3a3a3a" : "#f5f5f7" }}>
<div>
<p style={{ ...styles.storeName, color: dark ? "#fff" : "#1d1d1f" }}>{store.name}</p>
<p style={styles.storeSlug}>avelo.com/{store.slug}</p>
</div>
<div style={{ display: "flex", gap: 8 }}>
<button style={styles.visitBtn} onClick={() => { window.location.href = `/store/${store.slug}`; }}>เข้าร้าน →</button>
<button
onClick={() => handleDeleteStore(store.id, store.name)}
style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #fee2e2", background: dark ? "#3a3a3a" : "#fff", color: "#ef4444", fontSize: "13px", cursor: "pointer" }}>
🗑️
</button>
</div>
</div>
))}
<button style={styles.addBtn} onClick={() => { window.location.href = "/create-store"; }}>+ Add Store</button>
</div>
)}
</div>
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
createBtn: { padding: "10px 20px", borderRadius: "10px", border: "none", background: "#1d1d1f", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
statCard: { borderRadius: "16px", padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
statTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
statIcon: { fontSize: "24px" },
statChange: { fontSize: "13px", color: "#34c759", fontWeight: "600" },
statValue: { fontSize: "28px", fontWeight: "700", margin: "0 0 4px" },
statLabel: { fontSize: "13px", color: "#6e6e73", margin: 0 },
chartCard: { borderRadius: "16px", padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: "24px" },
bottomGrid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" },
card: { borderRadius: "16px", padding: "24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
cardTitle: { fontSize: "17px", fontWeight: "600", marginBottom: "16px" },
table: { width: "100%", borderCollapse: "collapse" },
th: { textAlign: "left", fontSize: "13px", fontWeight: "500", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" },
td: { padding: "12px 0", fontSize: "14px" },
empty: { color: "#6e6e73", fontSize: "14px", textAlign: "center", padding: "20px 0" },
addBtn: { width: "100%", padding: "10px", borderRadius: "10px", border: "1px dashed #d2d2d7", background: "transparent", color: "#6e6e73", fontSize: "14px", cursor: "pointer", marginTop: "12px" },
storeItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: "12px" },
storeName: { fontSize: "14px", fontWeight: "600", margin: "0 0 2px" },
storeSlug: { fontSize: "12px", color: "#6e6e73", margin: 0 },
visitBtn: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", color: "#1d1d1f", fontSize: "13px", fontWeight: "500", cursor: "pointer" },
};
