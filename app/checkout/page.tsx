"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../lib/cart-context";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "" });

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order = {
      id: `ORD-${Date.now()}`,
      customer: form.name,
      email: form.email,
      total: subtotal,
      status: "Processing",
      items: cart,
      createdAt: new Date().toLocaleString(),
    };
    const existing = JSON.parse(localStorage.getItem("avelo-orders") || "[]");
    localStorage.setItem("avelo-orders", JSON.stringify([order, ...existing]));
    clearCart();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Outfit, sans-serif", background: "#fff" }}>
        <section style={{ maxWidth: 640, border: "1px solid #ececec", borderRadius: 28, padding: 28, textAlign: "center" }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Order placed successfully!</h1>
          <p style={{ color: "#666", marginBottom: 18 }}>Your order is now in the admin queue for fulfillment.</p>
          <Link href="/admin" style={{ textDecoration: "none", background: "#111", color: "#fff", borderRadius: 999, padding: "10px 14px", fontWeight: 700 }}>View admin panel</Link>
        </section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fff", fontFamily: "Outfit, sans-serif", color: "#111" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", borderBottom: "1px solid #ececec" }}>
        <Link href="/shop" style={{ fontWeight: 800, fontSize: 24, textDecoration: "none", color: "#111" }}>Avelo Store</Link>
      </nav>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px", display: "grid", gap: 24, gridTemplateColumns: "1fr 0.8fr" }}>
        <form onSubmit={placeOrder} style={{ border: "1px solid #ececec", borderRadius: 24, padding: 18, display: "grid", gap: 12, background: "#fafafa" }}>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Checkout</h1>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" style={inputStyle} />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" style={inputStyle} />
          <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={4} placeholder="Shipping address" style={inputStyle} />
          <button type="submit" style={{ border: "none", borderRadius: 999, background: "#111", color: "#fff", padding: "12px 16px", cursor: "pointer", fontWeight: 700 }}>Place order</button>
        </form>

        <aside style={{ border: "1px solid #ececec", borderRadius: 24, padding: 18, background: "#fafafa", height: "fit-content" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Order summary</h2>
          {cart.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 8 }}>
              <span>{item.name} × {item.quantity}</span><strong>${item.price * item.quantity}</strong>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #ddd", fontWeight: 800, fontSize: 18 }}><span>Total</span><span>${subtotal}</span></div>
        </aside>
      </section>
    </main>
  );
}

const inputStyle = {
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 15,
  background: "#fff",
  fontFamily: "Outfit, sans-serif",
};
