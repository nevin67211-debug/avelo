"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "../components/ProtectedRoute";

interface OrderRecord {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem("avelo-orders") || "[]"));
  }, []);

  const updateStatus = (id: string, status: string) => {
    const next = orders.map((order) => (order.id === id ? { ...order, status } : order));
    setOrders(next);
    localStorage.setItem("avelo-orders", JSON.stringify(next));
  };

  return (
    <ProtectedRoute requiredRole="admin">
    <main style={{ minHeight: "100vh", background: "#fff", fontFamily: "Outfit, sans-serif", color: "#111" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", borderBottom: "1px solid #ececec" }}>
        <Link href="/shop" style={{ fontWeight: 800, fontSize: 24, textDecoration: "none", color: "#111" }}>Avelo Store</Link>
        <Link href="/cart" style={{ textDecoration: "none", color: "#111", fontWeight: 600, border: "1px solid #111", borderRadius: 999, padding: "8px 12px" }}>Cart</Link>
      </nav>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>Order Management</h1>
        <p style={{ color: "#666", marginBottom: 18 }}>Review orders, update fulfillment status, and keep the store running smoothly.</p>

        <div style={{ display: "grid", gap: 14 }}>
          {orders.length === 0 ? (
            <div style={{ border: "1px dashed #ccc", borderRadius: 24, padding: 18, color: "#666" }}>No orders yet. Place one from the checkout page to see it here.</div>
          ) : orders.map((order) => (
            <article key={order.id} style={{ border: "1px solid #ececec", borderRadius: 24, padding: 18, background: "#fafafa" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#666" }}>{order.id}</div>
                  <h2 style={{ fontSize: 20, fontWeight: 800 }}>{order.customer}</h2>
                  <p style={{ color: "#666", marginTop: 4 }}>{order.email}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>${order.total}</div>
                  <div style={{ color: "#666", fontSize: 13 }}>{order.createdAt}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 10, flexWrap: "wrap" }}>
                <span style={{ border: "1px solid #ddd", borderRadius: 999, padding: "6px 10px", background: "#fff" }}>{order.status}</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {['Processing', 'Packed', 'Shipped', 'Delivered'].map((status) => (
                    <button key={status} onClick={() => updateStatus(order.id, status)} style={{ border: "1px solid #111", borderRadius: 999, background: status === order.status ? "#111" : "#fff", color: status === order.status ? "#fff" : "#111", padding: "8px 10px", cursor: "pointer", fontWeight: 600 }}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
    </ProtectedRoute>
  );
}
