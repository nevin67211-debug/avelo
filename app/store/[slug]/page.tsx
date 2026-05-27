import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
const { slug } = await params;

const storeSnap = await getDocs(query(collection(db, "stores"), where("slug", "==", slug)));
if (storeSnap.empty) {
return (
<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
<div style={{ textAlign: "center" }}>
<p style={{ fontSize: 64 }}>🏪</p>
<h1 style={{ fontSize: 24, fontWeight: 700 }}>ไม่พบร้านนี้</h1>
<p style={{ color: "#6e6e73" }}>avelo.com/{slug} ยังไม่มีอยู่</p>
</div>
</div>
);
}

const store = storeSnap.docs[0].data();
const storeId = storeSnap.docs[0].id;

// ดึงสินค้าของร้านนี้
const productSnap = await getDocs(query(collection(db, "products"), where("storeId", "==", storeId)));
const products = productSnap.docs.map((d) => ({ id: d.id, ...d.data() as any }));

// customization
const bg = store.bgColor || "#f8f8f8";
const accent = store.accentColor || "#1d1d1f";
const text = store.textColor || "#1d1d1f";
const font = store.font || "SF Pro Display";
const sections: string[] = store.sections || ["hero", "products", "contact"];
const cardBg = "#fff";

return (
<div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: font }}>

{/* NAVBAR */}
<header style={{ padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: `${bg}ee`, backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100, borderBottom: `1px solid ${accent}22` }}>
<h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{store.name}</h1>
<nav style={{ display: "flex", gap: 24, fontSize: 14 }}>
{sections.includes("hero") && <a href="#" style={{ color: text, textDecoration: "none", opacity: 0.7 }}>หน้าแรก</a>}
{sections.includes("products") && <a href="#products" style={{ color: text, textDecoration: "none", opacity: 0.7 }}>สินค้า</a>}
{sections.includes("about") && <a href="#about" style={{ color: text, textDecoration: "none", opacity: 0.7 }}>เกี่ยวกับ</a>}
{sections.includes("contact") && <a href="#contact" style={{ color: text, textDecoration: "none", opacity: 0.7 }}>ติดต่อ</a>}
</nav>
<button style={{ background: accent, color: bg, border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>🛒 ตะกร้า</button>
</header>

{/* HERO */}
{sections.includes("hero") && (
<section style={{ textAlign: "center", padding: "100px 40px", background: `linear-gradient(135deg, ${bg}, ${accent}11)` }}>
<h2 style={{ fontSize: 52, fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 }}>
{store.heroText || `ยินดีต้อนรับสู่ ${store.name}`}
</h2>
<p style={{ fontSize: 18, opacity: 0.6, margin: "0 0 32px" }}>
{store.heroSub || "สินค้าคุณภาพ ส่งตรงถงมือคุณ"}
</p>
<a href="#products">
<button style={{ background: accent, color: bg, border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
ดูสินค้าทั้งหมด →
</button>
</a>
</section>
)}

{/* PROMO BANNER */}
{sections.includes("banner") && (
<section style={{ background: accent, color: bg, textAlign: "center", padding: "20px 40px", fontSize: 16, fontWeight: 600 }}>
🎉 โปรโมชั่นพิเศษ! ลด 20% ทุกออเดอร์วันนี้
</section>
)}

{/* PRODUCTS */}
{sections.includes("products") && (
<section id="products" style={{ padding: "60px 40px" }}>
<h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, textAlign: "center" }}>สินค้าทั้งหมด</h3>
{products.length === 0 ? (
<p style={{ textAlign: "center", opacity: 0.5 }}>ยังไม่มีสินค้าในร้านนี้</p>
) : (
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
{products.map((p) => (
<div key={p.id} style={{ background: cardBg, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", cursor: "pointer" }}>
{p.image ? (
<img src={p.image} style={{ width: "100%", height: 200, objectFit: "cover" }} />
) : (
<div style={{ height: 200, background: `${accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>🛍️</div>
)}
<div style={{ padding: "16px 20px" }}>
<h4 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#1d1d1f" }}>{p.name}</h4>
{p.description && <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6e6e73" }}>{p.description}</p>}
<p style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: accent }}>฿{p.price}</p>
<button style={{ width: "100%", background: accent, color: bg, border: "none", borderRadius: 10, padding: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
เพิ่มลงตะกร้า
</button>
</div>
</div>
))}
</div>
)}
</section>
)}

{/* ABOUT */}
{sections.includes("about") && (
<section id="about" style={{ padding: "60px 40px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
<h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>เกี่ยวกับร้าน</h3>
<p style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.7 }}>
{store.aboutText || `${store.name} คือร้านค้าออนไลน์ที่มุงมั่นให้บริการสินค้าคุณภาพดีในราคาที่เหมาะสม`}
</p>
</section>
)}

{/* CONTACT */}
{sections.includes("contact") && (
<section id="contact" style={{ padding: "60px 40px", background: `${accent}11`, textAlign: "center" }}>
<h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>ติดต่อเรา</h3>
<p style={{ fontSize: 16, opacity: 0.7, marginBottom: 24 }}>มคำถาม? เราพร้อมช่วยเหลือคณเสมอ</p>
<button style={{ background: accent, color: bg, border: "none", borderRadius: 14, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
📩 สงข้อความ
</button>
</section>
)}

{/* FOOTER */}
<footer style={{ borderTop: `1px solid ${accent}22`, padding: "24px 40px", textAlign: "center", opacity: 0.4, fontSize: 13 }}>
© {new Date().getFullYear()} {store.name} · Powered by Avelo
</footer>
</div>
);
}
