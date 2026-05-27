"use client";

import { useEffect, useState } from "react";
import "../lib/firebase";
import { getAuth, onAuthStateChanged, updatePassword, deleteUser, updateProfile } from "firebase/auth";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
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

const FONTS = ["SF Pro Display", "Georgia", "Courier New", "Arial", "Trebuchet MS"];

const SECTIONS = [
{ id: "hero", label: "🖼️ Hero Banner" },
{ id: "products", label: "🛍️ Products" },
{ id: "banner", label: "📣 Promo Banner" },
{ id: "about", label: "ℹ️ About" },
{ id: "contact", label: "📞 Contact" },
];

export default function Settings() {
const [user, setUser] = useState<any>(null);
const [store, setStore] = useState<any>(null);
const [storeId, setStoreId] = useState("");
const { dark, toggleTheme } = useTheme();

// Profile
const [name, setName] = useState("");
const [photoURL, setPhotoURL] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [msg, setMsg] = useState("");
const [error, setError] = useState("");

// Store customization
const [storeName, setStoreName] = useState("");
const [heroText, setHeroText] = useState("");
const [heroSub, setHeroSub] = useState("");
const [bgColor, setBgColor] = useState("#f8f8f8");
const [accentColor, setAccentColor] = useState("#1d1d1f");
const [textColor, setTextColor] = useState("#1d1d1f");
const [font, setFont] = useState("SF Pro Display");
const [enabledSections, setEnabledSections] = useState<string[]>(["hero", "products", "contact"]);
const [storeMsg, setStoreMsg] = useState("");
const [tab, setTab] = useState<"profile" | "store" | "password" | "danger">("store");

useEffect(() => {
const auth = getAuth();
onAuthStateChanged(auth, async (u) => {
if (!u) { window.location.href = "/login"; return; }
setUser(u);
setName(u.displayName || "");
setPhotoURL(u.photoURL || "");
// fetch store
const q = query(collection(db, "stores"), where("uid", "==", u.uid));
const snap = await getDocs(q);
if (!snap.empty) {
const d = snap.docs[0];
const data = d.data();
setStore(data);
setStoreId(d.id);
setStoreName(data.name || "");
setHeroText(data.heroText || "");
setHeroSub(data.heroSub || "");
setBgColor(data.bgColor || "#f8f8f8");
setAccentColor(data.accentColor || "#1d1d1f");
setTextColor(data.textColor || "#1d1d1f");
setFont(data.font || "SF Pro Display");
setEnabledSections(data.sections || ["hero", "products", "contact"]);
}
});
}, []);

const handleUpdateProfile = async () => {
try {
await updateProfile(user, { displayName: name, photoURL });
setMsg("Profile updated!"); setError("");
} catch (err: any) { setError(err.message); }
};

const handleUpdatePassword = async () => {
if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }
try {
await updatePassword(user, newPassword);
setMsg("Password updated!"); setNewPassword(""); setConfirmPassword(""); setError("");
} catch { setError("Please login again before changing password"); }
};

const handleDeleteAccount = async () => {
if (!confirm("Are you sure? This cannot be undone.")) return;
try { await deleteUser(user); window.location.href = "/"; }
catch { setError("Please login again before deleting account"); }
};

const handleSaveStore = async () => {
if (!storeId) return;
await updateDoc(doc(db, "stores", storeId), {
name: storeName,
heroText,
heroSub,
bgColor,
accentColor,
textColor,
font,
sections: enabledSections,
});
setStoreMsg("บันทึกแล้ว ✓");
setTimeout(() => setStoreMsg(""), 3000);
};

const toggleSection = (id: string) => {
setEnabledSections((prev) =>
prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
);
};

if (!user) return <p style={{ textAlign: "center", marginTop: 100, color: "#999" }}>Loading...</p>;

const s = {
bg: dark ? "#1a1a1a" : "#f5f5f7",
sidebarBg: dark ? "#2a2a2a" : "#fff",
cardBg: dark ? "#2a2a2a" : "#fff",
text: dark ? "#fff" : "#1d1d1f",
sub: dark ? "#aaa" : "#6e6e73",
border: dark ? "#333" : "#e5e7eb",
inputBg: dark ? "#3a3a3a" : "#fff",
};

return (
<div style={{ display: "flex", minHeight: "100vh", background: s.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", color: s.text }}>
{/* SIDEBAR */}
<div style={{ width: 240, background: s.sidebarBg, borderRight: `1px solid ${s.border}`, display: "flex", flexDirection: "column", padding: "24px 16px", position: "fixed", height: "100vh" }}>
<h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32, paddingLeft: 12, color: s.text }}>Avelo</h2>
<nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
{menuItems.map((item) => (
<button key={item.id} onClick={() => { window.location.href = item.href; }}
style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: item.id === "settings" ? (dark ? "#3a3a3a" : "#f0f0f5") : "transparent", color: item.id === "settings" ? s.text : s.sub, fontSize: 15, fontWeight: 500, cursor: "pointer", textAlign: "left", width: "100%" }}>
<span style={{ fontSize: 18 }}>{item.icon}</span>{item.label}
</button>
))}
</nav>
<div style={{ borderTop: `1px solid ${s.border}`, paddingTop: 16 }}>
<p style={{ fontSize: 13, color: s.sub, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
<button onClick={toggleTheme} style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${s.border}`, background: s.inputBg, color: s.text, fontSize: 14, fontWeight: 500, cursor: "pointer", marginBottom: 8 }}>
{dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>
<button onClick={() => window.location.href = "/login"} style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${s.border}`, background: s.inputBg, color: s.text, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
Sign out
</button>
</div>
</div>

{/* MAIN */}
<div style={{ marginLeft: 240, flex: 1, padding: 40, maxWidth: 800 }}>
<h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

{/* TABS */}
<div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: `1px solid ${s.border}`, paddingBottom: 0 }}>
{[
{ id: "store", label: "🏪 ร้านค้า" },
{ id: "profile", label: "👤 Profile" },
{ id: "password", label: "🔑 Password" },
{ id: "danger", label: "⚠️ Danger" },
].map((t) => (
<button key={t.id} onClick={() => setTab(t.id as any)}
style={{ padding: "10px 20px", border: "none", background: "transparent", fontSize: 14, fontWeight: 600, cursor: "pointer", color: tab === t.id ? accentColor : s.sub, borderBottom: tab === t.id ? `2px solid ${accentColor}` : "2px solid transparent", marginBottom: -1 }}>
{t.label}
</button>
))}
</div>

{/* STORE TAB */}
{tab === "store" && (
<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
{storeMsg && <p style={{ background: "#d1fae5", color: "#065f46", padding: "12px 16px", borderRadius: 10, fontSize: 14 }}>{storeMsg}</p>}

{/* ข้อมูลร้าน */}
<div style={{ background: s.cardBg, borderRadius: 16, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
<h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>ข้อมูลร้าน</h3>
<p style={{ fontSize: 14, color: s.sub, marginBottom: 20 }}>ชื่อร้านและข้อความใน Hero</p>
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
<input placeholder="ชื่อร้าน" value={storeName} onChange={(e) => setStoreName(e.target.value)}
style={{ padding: 12, borderRadius: 10, border: `1px solid ${s.border}`, fontSize: 15, background: s.inputBg, color: s.text, outline: "none" }} />
<input placeholder="Hero title เช่น ยินดีต้อนรับสู่ร้านของฉัน" value={heroText} onChange={(e) => setHeroText(e.target.value)}
style={{ padding: 12, borderRadius: 10, border: `1px solid ${s.border}`, fontSize: 15, background: s.inputBg, color: s.text, outline: "none" }} />
<input placeholder="Hero subtitle เช่น สินค้าคณภาพดี ราคาถูก" value={heroSub} onChange={(e) => setHeroSub(e.target.value)}
style={{ padding: 12, borderRadius: 10, border: `1px solid ${s.border}`, fontSize: 15, background: s.inputBg, color: s.text, outline: "none" }} />
</div>
</div>

{/* สีและ Font */}
<div style={{ background: s.cardBg, borderRadius: 16, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
<h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>สีและ Font</h3>
<p style={{ fontSize: 14, color: s.sub, marginBottom: 20 }}>ปรับแต่งสีและฟอนต์ของร้าน</p>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
{[
{ label: "สีพื้นหลัง", value: bgColor, setter: setBgColor },
{ label: "สี Accent", value: accentColor, setter: setAccentColor },
{ label: "สีตวหนังสือ", value: textColor, setter: setTextColor },
].map((c) => (
<div key={c.label}>
<p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: s.text }}>{c.label}</p>
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<input type="color" value={c.value} onChange={(e) => c.setter(e.target.value)}
style={{ width: 44, height: 44, borderRadius: 10, border: `1px solid ${s.border}`, cursor: "pointer", padding: 2 }} />
<span style={{ fontSize: 13, color: s.sub }}>{c.value}</span>
</div>
</div>
))}
</div>
<p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Font</p>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
{FONTS.map((f) => (
<button key={f} onClick={() => setFont(f)}
style={{ padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${font === f ? accentColor : s.border}`, background: font === f ? accentColor : s.inputBg, color: font === f ? bgColor : s.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: f }}>
{f}
</button>
))}
</div>
</div>

{/* Sections */}
<div style={{ background: s.cardBg, borderRadius: 16, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
<h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Sections</h3>
<p style={{ fontSize: 14, color: s.sub, marginBottom: 20 }}>เลือก sections ที่จะแสดงในร้าน</p>
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
{SECTIONS.map((sec) => (
<div key={sec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 12, border: `1px solid ${s.border}`, background: s.inputBg }}>
<span style={{ fontSize: 15, fontWeight: 500 }}>{sec.label}</span>
<button onClick={() => toggleSection(sec.id)}
style={{ width: 48, height: 26, borderRadius: 13, border: "none", background: enabledSections.includes(sec.id) ? accentColor : s.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
<div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: enabledSections.includes(sec.id) ? 25 : 3, transition: "left 0.2s" }} />
</button>
</div>
))}
</div>
</div>

{/* Preview */}
<div style={{ background: s.cardBg, borderRadius: 16, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
<h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>Preview</h3>
<div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${s.border}` }}>
<div style={{ background: bgColor, padding: "20px 24px", fontFamily: font }}>
<div style={{ background: "rgba(0,0,0,0.05)", padding: "10px 16px", borderRadius: 8, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<span style={{ fontWeight: 700, color: textColor, fontSize: 16 }}>{storeName || "ชอร้าน"}</span>
<div style={{ display: "flex", gap: 12, fontSize: 13, color: textColor, opacity: 0.7 }}>
<span>หน้าแรก</span><span>สินค้า</span><span>ติดต่อ</span>
</div>
</div>
<div style={{ textAlign: "center", padding: "24px 0" }}>
<h2 style={{ fontSize: 24, fontWeight: 800, color: textColor, margin: "0 0 8px" }}>{heroText || "ยินดีต้อนรับสู่ร้านของคุณ"}</h2>
<p style={{ fontSize: 14, color: textColor, opacity: 0.6, margin: "0 0 16px" }}>{heroSub || "สินค้าคุณภาพดี ราคาถูก"}</p>
<button style={{ background: accentColor, color: bgColor, border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>ดูสินค้า →</button>
</div>
</div>
</div>
</div>

<button onClick={handleSaveStore}
style={{ padding: "14px", borderRadius: 12, border: "none", background: accentColor, color: bgColor, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
💾 บันทึกการตั้งค่าร้าน
</button>
</div>
)}

{/* PROFILE TAB */}
{tab === "profile" && (
<div style={{ background: s.cardBg, borderRadius: 16, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
<h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Profile</h3>
<p style={{ fontSize: 14, color: s.sub, marginBottom: 20 }}>Update your display name and photo</p>
{msg && <p style={{ background: "#d1fae5", color: "#065f46", padding: "12px 16px", borderRadius: 10, fontSize: 14, marginBottom: 16 }}>{msg}</p>}
{error && <p style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: 10, fontSize: 14, marginBottom: 16 }}>{error}</p>}
{photoURL && <img src={photoURL} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 16 }} />}
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
<input placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)}
style={{ padding: 12, borderRadius: 10, border: `1px solid ${s.border}`, fontSize: 15, background: s.inputBg, color: s.text, outline: "none" }} />
<input placeholder="Photo URL" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)}
style={{ padding: 12, borderRadius: 10, border: `1px solid ${s.border}`, fontSize: 15, background: s.inputBg, color: s.text, outline: "none" }} />
<button onClick={handleUpdateProfile} style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "#1d1d1f", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
Save Profile
</button>
</div>
<p style={{ fontSize: 14, color: s.sub, marginTop: 12 }}>Email: {user.email}</p>
</div>
)}

{/* PASSWORD TAB */}
{tab === "password" && (
<div style={{ background: s.cardBg, borderRadius: 16, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
<h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Change Password</h3>
<p style={{ fontSize: 14, color: s.sub, marginBottom: 20 }}>Update your password</p>
{msg && <p style={{ background: "#d1fae5", color: "#065f46", padding: "12px 16px", borderRadius: 10, fontSize: 14, marginBottom: 16 }}>{msg}</p>}
{error && <p style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: 10, fontSize: 14, marginBottom: 16 }}>{error}</p>}
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
<input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
style={{ padding: 12, borderRadius: 10, border: `1px solid ${s.border}`, fontSize: 15, background: s.inputBg, color: s.text, outline: "none" }} />
<input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
style={{ padding: 12, borderRadius: 10, border: `1px solid ${s.border}`, fontSize: 15, background: s.inputBg, color: s.text, outline: "none" }} />
<button onClick={handleUpdatePassword} style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "#1d1d1f", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
Update Password
</button>
</div>
</div>
)}

{/* DANGER TAB */}
{tab === "danger" && (
<div style={{ background: s.cardBg, borderRadius: 16, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #fee2e2" }}>
<h3 style={{ fontSize: 17, fontWeight: 600, color: "#ef4444", marginBottom: 4 }}>Danger Zone</h3>
<p style={{ fontSize: 14, color: s.sub, marginBottom: 20 }}>Permanently delete your account and all data.</p>
{error && <p style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: 10, fontSize: 14, marginBottom: 16 }}>{error}</p>}
<button onClick={handleDeleteAccount} style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
Delete Account
</button>
</div>
)}
</div>
</div>
);
}
