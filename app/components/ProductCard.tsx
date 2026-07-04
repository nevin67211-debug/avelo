"use client";

import { useCart } from "../lib/cart-context";
import type { Product } from "../lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <article style={{ border: "1px solid #e5e5e5", borderRadius: 24, padding: 18, background: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#666" }}>{product.badge}</span>
        <span style={{ fontSize: 24 }}>{product.image}</span>
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{product.name}</h3>
      <p style={{ color: "#666", fontSize: 14, minHeight: 42, marginBottom: 12 }}>{product.description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 18 }}>${product.price}</strong>
        <button onClick={() => addToCart(product)} style={{ border: "none", borderRadius: 999, background: "#111", color: "#fff", padding: "10px 14px", cursor: "pointer", fontWeight: 600 }}>
          Add to cart
        </button>
      </div>
    </article>
  );
}
