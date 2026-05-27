"use client";

import { useEffect, useState } from "react";
import "../lib/firebase";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Store() {
const [products, setProducts] = useState<any[]>([]);
const [search, setSearch] = useState("");
const [cart, setCart] = useState<any[]>([]);
const [showCart, setShowCart] = useState(false);

useEffect(() => {
fetchProducts();
}, []);

const fetchProducts = async () => {
const snap = await getDocs(collection(db, "products"));
setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
};

const addToCart = (product: any) => {
const existing = cart.find((c) => c.id === product.id);
if (existing) {
setCart(cart.map((c) => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
} else {
setCart([...cart, { ...product, qty: 1 }]);
}
};

const removeFromCart = (id: string) => {
setCart(cart.filter((c) => c.id !== id));
};

const total = cart.reduce((sum, c) => sum + parseFloat(c.price) * c.qty, 0);
const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

return (
<div style={styles.container}>
{/* NAVBAR */}
<nav style={styles.nav}>
<h2 style={styles.logo}>Avelo Store</h2>
<div style={styles.navRight}>
<input
placeholder="Search products..."
value={search}
onChange={(e) => setSearch(e.target.value)}
style={styles.searchInput}
/>
<button onClick={() => setShowCart(!showCart)} style={styles.cartBtn}>
🛒 {cart.length > 0 && <span style={styles.cartBadge}>{cart.reduce((s, c) => s + c.qty, 0)}</span>}
</button>
</div>
</nav>

<div style={styles.body}>
{/* PRODUCTS */}
<div style={styles.main}>
<h1 style={styles.title}>All Products</h1>
{filtered.length === 0 ? (
<p style={styles.empty}>No products found</p>
) : (
<div style={styles.grid}>
{filtered.map((p) => (
<div key={p.id} style={styles.productCard}>
{p.image ? (
<img src={p.image} style={styles.productImg} />
) : (
<div style={styles.productImgPlaceholder}>🛍️</div>
)}
<div style={styles.productInfo}>
<h3 style={styles.productName}>{p.name}</h3>
<p style={styles.productDesc}>{p.description}</p>
<div style={styles.productBottom}>
<p style={styles.productPrice}>${p.price}</p>
<button onClick={() => addToCart(p)} style={styles.addBtn}>Add to cart</button>
</div>
</div>
</div>
))}
</div>
)}
</div>

{/* CART */}
{showCart && (
<div style={styles.cartPanel}>
<h3 style={styles.cartTitle}>Your Cart</h3>
{cart.length === 0 ? (
<p style={styles.empty}>Cart is empty</p>
) : (
<>
{cart.map((c) => (
<div key={c.id} style={styles.cartItem}>
<div>
<p style={styles.cartItemName}>{c.name}</p>
<p style={styles.cartItemPrice}>${c.price} x {c.qty}</p>
</div>
<button onClick={() => removeFromCart(c.id)} style={styles.removeBtn}>✕</button>
</div>
))}
<div style={styles.cartTotal}>
<p style={styles.totalText}>Total: <strong>${total.toFixed(2)}</strong></p>
<button style={styles.checkoutBtn}>Checkout</button>
</div>
</>
)}
</div>
)}
</div>
</div>
);
}

const styles: { [key: string]: React.CSSProperties } = {
container: {
minHeight: "100vh",
background: "#f5f5f7",
fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
},
nav: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
padding: "16px 40px",
background: "rgba(255,255,255,0.8)",
backdropFilter: "blur(20px)",
borderBottom: "1px solid #e5e7eb",
position: "sticky",
top: 0,
zIndex: 100,
},
logo: {
fontSize: "20px",
fontWeight: "700",
color: "#1d1d1f",
},
navRight: {
display: "flex",
alignItems: "center",
gap: "12px",
},
searchInput: {
padding: "10px 16px",
borderRadius: "20px",
border: "1px solid #e5e7eb",
fontSize: "14px",
outline: "none",
width: "220px",
color: "#111",
},
cartBtn: {
padding: "10px 16px",
borderRadius: "20px",
border: "1px solid #e5e7eb",
background: "#fff",
fontSize: "16px",
cursor: "pointer",
position: "relative",
},
cartBadge: {
background: "#ef4444",
color: "#fff",
borderRadius: "50%",
padding: "2px 6px",
fontSize: "12px",
fontWeight: "700",
marginLeft: "4px",
},
body: {
display: "flex",
gap: "24px",
padding: "40px",
maxWidth: "1200px",
margin: "0 auto",
},
main: { flex: 1 },
title: {
fontSize: "28px",
fontWeight: "700",
color: "#1d1d1f",
marginBottom: "24px",
},
empty: {
color: "#6e6e73",
fontSize: "15px",
textAlign: "center",
padding: "40px 0",
},
grid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
gap: "20px",
},
productCard: {
background: "#fff",
borderRadius: "16px",
overflow: "hidden",
boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
},
productImg: {
width: "100%",
height: "180px",
objectFit: "cover",
},
productImgPlaceholder: {
width: "100%",
height: "180px",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "48px",
background: "#f5f5f7",
},
productInfo: { padding: "16px" },
productName: {
fontSize: "16px",
fontWeight: "600",
color: "#1d1d1f",
marginBottom: "4px",
},
productDesc: {
fontSize: "13px",
color: "#6e6e73",
marginBottom: "12px",
},
productBottom: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
},
productPrice: {
fontSize: "18px",
fontWeight: "700",
color: "#1d1d1f",
},
addBtn: {
padding: "8px 14px",
borderRadius: "8px",
border: "none",
background: "#1d1d1f",
color: "#fff",
fontSize: "13px",
fontWeight: "600",
cursor: "pointer",
},
cartPanel: {
width: "300px",
background: "#fff",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
height: "fit-content",
position: "sticky",
top: "80px",
},
cartTitle: {
fontSize: "18px",
fontWeight: "700",
color: "#1d1d1f",
marginBottom: "16px",
},
cartItem: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
padding: "12px 0",
borderBottom: "1px solid #f5f5f7",
},
cartItemName: {
fontSize: "14px",
fontWeight: "600",
color: "#1d1d1f",
margin: 0,
},
cartItemPrice: {
fontSize: "13px",
color: "#6e6e73",
margin: 0,
},
removeBtn: {
padding: "4px 8px",
borderRadius: "6px",
border: "none",
background: "#fee2e2",
color: "#ef4444",
cursor: "pointer",
fontSize: "12px",
},
cartTotal: {
marginTop: "16px",
},
totalText: {
fontSize: "16px",
color: "#1d1d1f",
marginBottom: "12px",
},
checkoutBtn: {
width: "100%",
padding: "12px",
borderRadius: "10px",
border: "none",
background: "#1d1d1f",
color: "#fff",
fontSize: "15px",
fontWeight: "600",
cursor: "pointer",
},
};
