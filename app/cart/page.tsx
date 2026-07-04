"use client";

import Link from "next/link";
import { useCart } from "../lib/cart-context";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal } = useCart();

  return (
    <main style={{ minHeight: "100vh", background: "#fff", fontFamily: "Outfit, sans-serif", color: "#111" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", borderBottom: "1px solid #ececec" }}>
        <Link href="/shop" style={{ fontWeight: 800, fontSize: 24, textDecoration: "none", color: "#111" }}>Avelo Store</Link>
        <Link href="/checkout" style={{ textDecoration: "none", color: "#111", fontWeight: 600, border: "1px solid #111", borderRadius: 999, padding: "8px 12px" }}>Checkout</Link>
      </nav>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px", display: "grid", gap: 24, gridTemplateColumns: "1.2fr 0.8fr" }}>
        <div style={{ display: "grid", gap: 14 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800 }}>Shopping Cart</h1>
          {cart.length === 0 ? (
            <div style={{ border: "1px dashed #ccc", borderRadius: 24, padding: 24, color: "#666" }}>Your cart is empty. Add a few products from the shop.</div>
          ) : cart.map((item) => (
            <article key={item.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, border: "1px solid #ececec", borderRadius: 24, padding: 16, alignItems: "center" }}>
              <div style={{ fontSize: 32, width: 48, height: 48, display: "grid", placeItems: "center", background: "#f6f6f6", borderRadius: 16 }}>{item.image}</div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{item.name}</h2>
                <p style={{ color: "#666", fontSize: 14 }}>{item.description}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ border: "1px solid #ccc", background: "#fff", borderRadius: 999, width: 30, height: 30, cursor: "pointer" }}>−</button>
                  <strong>{item.quantity}</strong>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ border: "1px solid #ccc", background: "#fff", borderRadius: 999, width: 30, height: 30, cursor: "pointer" }}>+</button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>${item.price * item.quantity}</div>
                <button onClick={() => removeFromCart(item.id)} style={{ border: "none", background: "transparent", color: "#777", cursor: "pointer", marginTop: 6 }}>Remove</button>
              </div>
            </article>
          ))}
        </div>

        <aside style={{ border: "1px solid #ececec", borderRadius: 24, padding: 18, background: "#fafafa", height: "fit-content" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Summary</h2>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 8 }}><span>Subtotal</span><strong>${subtotal}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 8 }}><span>Shipping</span><strong>Free</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, borderTop: "1px solid #ddd", paddingTop: 10, marginTop: 10 }}><span>Total</span><span>${subtotal}</span></div>
          <Link href="/checkout" style={{ display: "block", textAlign: "center", textDecoration: "none", background: "#111", color: "#fff", borderRadius: 999, padding: "12px 14px", marginTop: 16, fontWeight: 700 }}>Proceed to checkout</Link>
        </aside>
      </section>
    </main>
  );
}
