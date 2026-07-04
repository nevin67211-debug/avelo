"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { fetchProducts, type ProductRecord } from "../lib/api";
import { useCart } from "../lib/cart-context";

export default function ShopPage() {
  const { itemCount } = useCart();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #fff 0%, #f7f7f5 100%)", fontFamily: "Outfit, sans-serif", color: "#111" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", borderBottom: "1px solid #ececec", position: "sticky", top: 0, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)" }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 24, textDecoration: "none", color: "#111" }}>Avelo Store</Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/admin" style={{ textDecoration: "none", color: "#111", fontWeight: 600 }}>Admin</Link>
          <Link href="/cart" style={{ textDecoration: "none", color: "#111", fontWeight: 600, border: "1px solid #111", borderRadius: 999, padding: "8px 12px" }}>Cart ({itemCount})</Link>
        </div>
      </nav>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
          <p style={{ textTransform: "uppercase", letterSpacing: 3, color: "#666", fontSize: 12 }}>Ecommerce</p>
          <h1 style={{ fontSize: 42, lineHeight: 1.05, fontWeight: 800, maxWidth: 680 }}>Shop curated essentials for modern living.</h1>
          <p style={{ color: "#666", maxWidth: 700 }}>Browse products, add your favorites to the cart, and complete a quick checkout in one seamless flow.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          {loading ? (
            <p style={{ color: "#666" }}>Loading products from the database…</p>
          ) : products.length === 0 ? (
            <p style={{ color: "#666" }}>No products are available yet.</p>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
