"use client";

import { useEffect, useState } from "react";
import "../lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where } from "firebase/firestore";
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

export default function Products() {
const [user, setUser] = useState<any>(null);
const [storeId, setStoreId] = useState("");
const [products, setProducts] = useState<any[]>([]);
const [showForm, setShowForm] = useState(false);
const [editId, setEditId] = useState<string | null>(null);
const [name, setName] = useState("");
const [price, setPrice] = useState("");
const [description, setDescription] = useState("");
const [image, setImage] = useState("");
const [category, setCategory] = useState("");
const [stock, setStock] = useState("");
const { dark, toggleTheme } = useTheme();

useEffect(() => {
const auth = getAuth();
onAuthStateChanged(auth, async (u) => {
if (!u) { window.location.href = "/login"; return; }
setUser(u);
// หา storeId ของ user
const storeSnap = await getDocs(query(collection(db, "stores"), where("uid", "==", u.uid)));
if (!storeSnap.empty) {
const sid = storeSnap.docs[0].id;
setStoreId(sid);
fetchProducts(sid);
}
});
}, []);

const fetchProducts = async (sid?: string) => {
const id = sid || storeId;
if (!id) return;
const snap = await getDocs(query(collection(db, "products"), where("storeId", "==", id)));
setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
};

const resetForm = () => {
setName(""); setPrice(""); setDescription(""); setImage(""); setCategory(""); setStock("");
setEditId(null); setShowForm(false);
};

const handleSave = async () => {
if (!name || !price) return;
if (editId) {
await updateDoc(doc(db, "products", editId), { name, price, description, image, category, stock });
} else {
await addDoc(collection(db, "products"), { name, price, description, image, category, stock, storeId, createdAt: new Date() });
}
resetForm();
fetchProducts();
};

const handleEdit = (p: any) => {
setEditId(p.id); setName(p.name); setPrice(p.price);
setDescription(p.description || ""); setImage(p.image || "");
setCategory(p.category || ""); setStock(p.stock || "");
setShowForm(true);
};

const handleDelete = async (id: string) => {
if (!confirm("ลบสินค้านี้?")) return;
await deleteDoc(doc(db, "products", id));
fetchProducts();
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
style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: item.id === "products" ? (dark ? "#3a3a3a" : "#f0f0f5") : "transparent", color: item.id === "products" ? s.text : s.sub, fontSize: 15, fontWeight: 500, cursor: "pointer", textAlign: "left", width: "100%" }}>
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
<div style={{ marginLeft: 240, flex: 1, padding: 40 }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
<h1 style={{ fontSize: 28, fontWeight: 700 }}>Products</h1>
<button onClick={() => { resetForm(); setShowForm(true); }}
style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#1d1d1f", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
+ Add Product
</button>
</div>

{showForm && (
<div style={{ background: s.cardBg, borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: 24, maxWidth: 560 }}>
<h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>{editId ? "แก้ไขสินค้า" : "สินค้าใหม่"}</h3>
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
{[
{ placeholder: "ชื่อสินค้า *", value: name, setter: setName },
{ placeholder: "ราคา * เช่น 299", value: price, setter: setPrice },
{ placeholder: "คำอธิบาย", value: description, setter: setDescription },
{ placeholder: "URL รูปภาพ", value: image, setter: setImage },
{ placeholder: "หมวดหมู่ เช่น เสื้อผ้า, อาหาร", value: category, setter: setCategory },
{ placeholder: "จำนวนสต็อก", value: stock, setter: setStock },
].map((f, i) => (
<input key={i} placeholder={f.placeholder} value={f.value} onChange={(e) => f.setter(e.target.value)}
style={{ padding: 12, borderRadius: 10, border: `1px solid ${s.border}`, fontSize: 15, background: s.inputBg, color: s.text, outline: "none" }} />
))}
<div style={{ display: "flex", gap: 10 }}>
<button onClick={handleSave} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#1d1d1f", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
{editId ? "บันทึก" : "เพิ่มสินค้า"}
</button>
<button onClick={resetForm} style={{ padding: "10px 24px", borderRadius: 10, border: `1px solid ${s.border}`, background: s.inputBg, color: s.text, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
ยกเลิก
</button>
</div>
</div>
</div>
)}

{products.length === 0 ? (
<div style={{ textAlign: "center", padding: "80px 0", color: s.sub, fontSize: 16 }}>
<p style={{ fontSize: 48, marginBottom: 16 }}>🛍️</p>
<p>ยังไม่มีสินค้า</p>
<button onClick={() => setShowForm(true)} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, border: "none", background: "#1d1d1f", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
+ เพิ่มสินค้าแรก
</button>
</div>
) : (
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
{products.map((p) => (
<div key={p.id} style={{ background: s.cardBg, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
{p.image ? (
<img src={p.image} style={{ width: "100%", height: 160, objectFit: "cover" }} />
) : (
<div style={{ height: 160, background: dark ? "#3a3a3a" : "#f5f5f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🛍️</div>
)}
<div style={{ padding: "12px 16px 16px" }}>
<h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px", color: s.text }}>{p.name}</h3>
{p.category && <p style={{ fontSize: 12, color: s.sub, margin: "0 0 4px" }}>#{p.category}</p>}
<p style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>฿{p.price}</p>
{p.stock && <p style={{ fontSize: 12, color: s.sub, margin: "0 0 12px" }}>สต็อก: {p.stock} ชิ้น</p>}
<div style={{ display: "flex", gap: 8 }}>
<button onClick={() => handleEdit(p)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${s.border}`, background: s.inputBg, color: s.text, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>✏️ แก้ไข</button>
<button onClick={() => handleDelete(p.id)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>🗑️ ลบ</button>
</div>
</div>
</div>
))}
</div>
)}
</div>
</div>
);
}