"use client";

import { useRouter } from "next/navigation";
import React, { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { signOut } from "firebase/auth";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { fetchAnalyticsOverview, fetchOrders, fetchProducts, type OrderRecord, type ProductRecord } from "../lib/api";
import { auth } from "../lib/firebase";

type Range = "7d" | "30d" | "90d";
type MetricKey = "revenue" | "orders" | "visitors";
type AdminSection = "overview" | "users" | "products" | "orders" | "analytics" | "settings";

interface ShopifyProductRecord extends ProductRecord {
  image?: string;
  sku?: string;
  barcode?: string;
  cost?: number;
  status: "Active" | "Draft";
  category?: string;
}

interface ShopifyOrderRecord extends OrderRecord {
  status: "Pending" | "Fulfilled";
  trackingNumber?: string;
  dateString?: string;
  items?: { name: string; qty: number; price: number }[];
}

interface StockLogRecord {
  id: string;
  productName: string;
  type: "In" | "Out";
  qty: number;
  reason: string;
  timestamp: string;
}

interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info";
}

const INITIAL_USERS = [
  { id: 1, name: "Sarah Kim", email: "sarah@example.com", role: "Admin", status: "Active" },
  { id: 2, name: "Marcus Lee", email: "marcus@example.com", role: "Seller", status: "Active" },
  { id: 3, name: "Nina Patel", email: "nina@example.com", role: "Customer", status: "Pending" },
];

const ALL_DATA: Record<Range, { label: string; revenue: number; orders: number; visitors: number }[]> = {
  "7d": [
    { label: "Mon", revenue: 1820, orders: 14, visitors: 142 },
    { label: "Tue", revenue: 2450, orders: 19, visitors: 198 },
    { label: "Wed", revenue: 1960, orders: 15, visitors: 167 },
    { label: "Thu", revenue: 3100, orders: 24, visitors: 241 },
    { label: "Fri", revenue: 2780, orders: 21, visitors: 223 },
    { label: "Sat", revenue: 1340, orders: 10, visitors: 118 },
    { label: "Sun", revenue: 790,  orders: 7,  visitors: 84   },
  ],
  "30d": [
    { label: "W1", revenue: 9200,  orders: 71,  visitors: 820   },
    { label: "W2", revenue: 11400, orders: 88,  visitors: 1020 },
    { label: "W3", revenue: 8700,  orders: 64,  visitors: 760   },
    { label: "W4", revenue: 13100, orders: 102, visitors: 1180 },
  ],
  "90d": [
    { label: "Apr", revenue: 38200, orders: 294, visitors: 3400 },
    { label: "May", revenue: 44800, orders: 341, visitors: 3920 },
    { label: "Jun", revenue: 42400, orders: 322, visitors: 3710 },
  ],
};

const STATS: Record<Range, { delta: string }> = {
  "7d":  { delta: "+12%" }, "30d": { delta: "+8%"  }, "90d": { delta: "+21%" },
};

const RANGE_LABELS: Record<Range, string> = {
  "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days",
};

const W = 800, H = 220, PAD_X = 16, PAD_Y = 24;

function buildPath(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const n = values.length;
  const pts = values.map((v, i) => ({
    x: PAD_X + (i / (n - 1)) * (W - PAD_X * 2),
    y: PAD_Y + (1 - (v - min) / range) * (H - PAD_Y * 2),
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cp1x} ${pts[i - 1].y}, ${cp1x} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  return { d, pts };
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export default function Dashboard(): ReactNode {
  const router = useRouter();
  const [section, setSection] = useState<AdminSection>("overview");
  const [range, setRange] = useState<Range>("7d");
  const [users] = useState(INITIAL_USERS);
  const [products, setProducts] = useState<ShopifyProductRecord[]>([]);
  const [orders, setOrders] = useState<ShopifyOrderRecord[]>([]);
  const [analytics, setAnalytics] = useState({ revenue: 0, orders: 0, products: 0, events: 0 });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<"All" | "Active" | "Draft">("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"All" | "Pending" | "Fulfilled">("All");

  const [editingProduct, setEditingProduct] = useState<ShopifyProductRecord | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ShopifyOrderRecord | null>(null);

  const [stockLogs, setStockLogs] = useState<StockLogRecord[]>([
    { id: "LOG-901", productName: "Sample Leather Jacket", type: "In", qty: 50, reason: "Initial Stocking", timestamp: "10 min ago" },
  ]);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [activeFulfillOrder, setActiveFulfillOrder] = useState<ShopifyOrderRecord | null>(null);
  const [inputTracking, setInputTracking] = useState("");

  const [storeName, setStoreName] = useState("Avelo Premium Store");
  const [storeEmail, setStoreEmail] = useState("contact@avelo.com");
  const [currency, setCurrency] = useState("USD");
  const [enableStripe, setEnableStripe] = useState(true);
  const [enablePaypal, setEnablePaypal] = useState(false);
  const [enableBankTransfer, setEnableBankTransfer] = useState(true);

  const [showProductModal, setShowProductModal] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [inputImageUrl, setInputImageUrl] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [inputCost, setInputCost] = useState("");
  const [inputSku, setInputSku] = useState("");
  const [inputBarcode, setInputBarcode] = useState("");
  const [inputStock, setInputStock] = useState("");
  const [inputCategory, setInputCategory] = useState("Electronics");
  const [inputStatus, setInputStatus] = useState<"Active" | "Draft">("Active");

  const [metric, setMetric] = useState<MetricKey>("revenue");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const [dotPos, setDotPos] = useState({ x: 0, y: 0 });
  const dotTarget = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const data = ALL_DATA[range];
  const stats = {
    revenue: `${currency === "USD" ? "$" : currency === "EUR" ? "€" : "฿"}${analytics.revenue.toLocaleString()}`,
    orders: analytics.orders.toString(),
    visitors: `${Math.max(analytics.orders * 8, 120)}`,
    delta: STATS[range].delta,
  };
  const values = data.map((d) => d[metric]);
  const { d: pathD, pts } = buildPath(values);
  const areaD = pathD + ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  const activeIdx = hoverIdx ?? data.length - 1;
  const activeVal = data[activeIdx][metric];

  const fmt = (v: number) => metric === "revenue" ? (currency === "USD" ? "$" : currency === "EUR" ? "€" : "฿") + v.toLocaleString() : v.toLocaleString();
  const triggerAnim = () => setAnimKey(k => k + 1);

  useEffect(() => {
    const line = lineRef.current, area = areaRef.current;
    if (!line || !area) return;
    const len = line.getTotalLength();
    line.style.strokeDasharray = `${len}`;
    line.style.strokeDashoffset = `${len}`;
    area.style.opacity = "0";
    line.getBoundingClientRect();
    line.style.transition = "stroke-dashoffset 0.75s cubic-bezier(0.16, 1, 0.3, 1)";
    line.style.strokeDashoffset = "0";
    area.style.transition = "opacity 0.6s ease 0.3s";
    area.style.opacity = "1";
    return () => { line.style.transition = ""; area.style.transition = ""; };
  }, [animKey]);

  useEffect(() => {
    dotTarget.current = { x: pts[activeIdx]?.x ?? 0, y: pts[activeIdx]?.y ?? 0 };
  }, [activeIdx, pts]);

  useEffect(() => {
    let prev = performance.now();
    function tick(now: number) {
      const dt = Math.min((now - prev) / 16, 4); prev = now;
      setDotPos(cur => {
        const nx = lerp(cur.x, dotTarget.current.x, 0.24 * dt);
        const ny = lerp(cur.y, dotTarget.current.y, 0.24 * dt);
        return Math.abs(nx - dotTarget.current.x) < 0.05 && Math.abs(ny - dotTarget.current.y) < 0.05
          ? dotTarget.current : { x: nx, y: ny };
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const xChart = xRatio * W;
    let closest = 0, minDist = Infinity;
    pts.forEach((p, i) => { const d = Math.abs(p.x - xChart); if (d < minDist) { minDist = d; closest = i; } });
    setHoverIdx(closest);
  }, [pts]);

  const handleRange = (r: Range) => { setRange(r); setHoverIdx(null); triggerAnim(); };
  const handleMetric = (k: MetricKey) => { setMetric(k); setHoverIdx(null); triggerAnim(); };
  const metricLabel = metric === "revenue" ? "REVENUE" : metric === "orders" ? "ORDERS" : "VISITORS";

  const gridValues = (() => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => min + (range * i) / steps);
  })();

  useEffect(() => {
    Promise.all([fetchProducts(), fetchOrders(), fetchAnalyticsOverview()])
      .then(([productData, orderData, analyticsData]) => {
        const extendedProducts = productData.map((p: any) => ({
          ...p,
          status: "Active" as const,
          category: "General",
          sku: "SKU-" + Math.floor(10000 + Math.random() * 90000),
          image: p.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80"
        }));

        const extendedOrders = orderData.map((o: any, idx: number) => ({
          ...o,
          status: "Pending" as const,
          trackingNumber: "",
          dateString: o.created_at ? new Date(o.created_at).toLocaleDateString() : "June 15, 2026",
          items: o.items || [
            { name: "Premium Wireless Headphone", qty: 1, price: o.total ? o.total * 0.7 : 120 },
            { name: "USB-C Fast Charging Cable", qty: 2, price: o.total ? o.total * 0.3 : 25 }
          ]
        }));

        setProducts(extendedProducts);
        setOrders(extendedOrders);
        setAnalytics(analyticsData);
      })
      .catch(() => {
        setProducts([]);
        setOrders([]);
      });
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const priceNum = parseFloat(inputPrice) || 0;
  const costNum = parseFloat(inputCost) || 0;
  const profit = priceNum - costNum;

  const handleShopifyProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = "PROD-" + Math.floor(1000 + Math.random() * 9000);
    const finalImg = inputImageUrl.trim() || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&q=80";
    const parsedStock = parseInt(inputStock) || 0;

    const newShopifyProduct: ShopifyProductRecord = {
      id: generatedId,
      name: inputName,
      price: priceNum,
      stock: parsedStock,
      image: finalImg,
      sku: inputSku || "SKU-" + Math.floor(10000 + Math.random() * 90000),
      barcode: inputBarcode || "BAR-" + Math.floor(1000000 + Math.random() * 9000000),
      cost: costNum,
      status: inputStatus,
      category: inputCategory,
    };

    setProducts((prev) => [newShopifyProduct, ...prev]);

    const newLog: StockLogRecord = {
      id: "LOG-" + Math.floor(100 + Math.random() * 900),
      productName: inputName,
      type: "In",
      qty: parsedStock,
      reason: "New Product Sourced",
      timestamp: "Just now",
    };
    setStockLogs((prev) => [newLog, ...prev]);

    setInputName(""); setInputDescription(""); setInputImageUrl("");
    setInputPrice(""); setInputCost(""); setInputSku(""); setInputBarcode("");
    setInputStock(""); setInputCategory("Electronics"); setInputStatus("Active");
    setShowProductModal(false);
    setSection("products");
    addToast(`Product "${newShopifyProduct.name}" added successfully`);
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
    );

    const newLog: StockLogRecord = {
      id: "LOG-" + Math.floor(100 + Math.random() * 900),
      productName: editingProduct.name,
      type: "In",
      qty: editingProduct.stock,
      reason: "Updated Product Details",
      timestamp: "Just now",
    };
    setStockLogs((prev) => [newLog, ...prev]);
    addToast(`Product "${editingProduct.name}" updated`);
    setEditingProduct(null);
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllProducts = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedProductIds.length} selected product(s)?`)) {
      setProducts((prev) => prev.filter((p) => !selectedProductIds.includes(p.id)));
      addToast(`Deleted ${selectedProductIds.length} product(s)`, "error");
      setSelectedProductIds([]);
    }
  };

  const handleBulkArchive = () => {
    setProducts((prev) =>
      prev.map((p) => (selectedProductIds.includes(p.id) ? { ...p, status: "Draft" } : p))
    );
    addToast(`Selected products moved to Draft`);
    setSelectedProductIds([]);
  };

  const handleFulfillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFulfillOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === activeFulfillOrder.id
          ? { ...o, status: "Fulfilled", trackingNumber: inputTracking }
          : o
      )
    );
    addToast(`Order ${activeFulfillOrder.id} marked as fulfilled`);
    setActiveFulfillOrder(null);
    setInputTracking("");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("Store settings saved");
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesStatus = productStatusFilter === "All" || p.status === productStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customer && o.customer.toLowerCase().includes(orderSearch.toLowerCase()));
    const matchesStatus = orderStatusFilter === "All" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute requiredRole="user">
      <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f7f7f8; font-family: 'Inter', -apple-system, sans-serif; color: #16181d; -webkit-font-smoothing: antialiased; }
        .layout { display: flex; min-height: 100vh; }

        .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .toast-item { pointer-events: auto; background: #16181d; color: #fff; padding: 13px 18px; border-radius: 8px; font-size: 13.5px; font-weight: 500; box-shadow: 0 8px 20px rgba(0,0,0,0.18); display: flex; align-items: center; gap: 10px; animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .toast-item.error { background: #c81e3a; }
        .toast-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; flex-shrink: 0; }
        .toast-item.error .toast-dot { background: #fecdd3; }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .sidebar { width: 232px; padding: 40px 20px; border-right: 1px solid rgba(0,0,0,0.07); position: sticky; top: 0; height: 100vh; background: #fff; display: flex; flex-direction: column; }
        .s-logo { font-weight: 700; font-size: 18px; letter-spacing: -0.02em; color: #16181d; margin-bottom: 28px; padding: 0 12px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; color: #6b7076; font-size: 13.5px; font-weight: 500; cursor: pointer; border-radius: 8px; margin-bottom: 2px; transition: all 0.15s; }
        .nav-item:hover { background: #f3f3f4; color: #16181d; }
        .nav-item.active { background: #16181d; color: #ffffff; font-weight: 600; }

        .sidebar-btn-new { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 11px; margin: 10px 0; background: #16181d; color: #ffffff; font-size: 13.5px; font-weight: 600; cursor: pointer; border-radius: 8px; border: none; transition: background 0.15s; }
        .sidebar-btn-new:hover { background: #2a2d34; }
        .sidebar-btn-editor { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 11px; margin: 4px 0 10px 0; background: #fff; color: #16181d; font-size: 13.5px; font-weight: 600; cursor: pointer; border-radius: 8px; border: 1px solid rgba(0,0,0,0.12); transition: background 0.15s; }
        .sidebar-btn-editor:hover { background: #f3f3f4; }
        .s-logout { color: #8a8f97; font-size: 12.5px; font-weight: 500; cursor: pointer; padding: 10px 14px; transition: color 0.15s; }
        .s-logout:hover { color: #c81e3a; }

        .main { flex: 1; padding: 56px 56px 100px; max-width: 1400px; margin: 0 auto; width: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
        .page-title { font-size: 28px; font-weight: 700; color: #16181d; letter-spacing: -0.02em; }

        .range-picker { display: flex; background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 9px; padding: 3px; gap: 2px; }
        .range-btn { font-family: inherit; font-size: 12px; font-weight: 600; padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; background: transparent; color: #8a8f97; transition: all 0.15s; }
        .range-btn.on { background: #16181d; color: #ffffff; }

        .filter-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
        .search-box { padding: 9px 14px; border: 1px solid #dfe1e4; border-radius: 8px; font-size: 13.5px; width: 280px; outline: none; background: #fff; font-family: inherit; transition: border-color 0.15s; }
        .search-box:focus { border-color: #16181d; }
        .filter-tabs { display: flex; gap: 6px; }
        .filter-tab-btn { padding: 7px 14px; font-size: 12.5px; font-weight: 600; background: #fff; border: 1px solid #e2e4e7; border-radius: 6px; cursor: pointer; color: #5b5f66; transition: all 0.15s; }
        .filter-tab-btn.active { background: #16181d; color: #fff; border-color: #16181d; }

        .table-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.07); border-radius: 16px; padding: 28px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); margin-bottom: 22px; }
        .section-title { font-size: 14.5px; font-weight: 700; color: #16181d; margin-bottom: 18px; }
        .tbl { width: 100%; border-collapse: collapse; }
        .tbl th { text-align: left; font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #9599a1; padding: 0 0 12px; border-bottom: 1px solid rgba(0,0,0,.06); }
        .tbl td { padding: 15px 0; border-bottom: 1px solid rgba(0,0,0,.04); font-size: 13.5px; color: #16181d; vertical-align: middle; }
        .clickable-row { cursor: pointer; transition: background 0.15s; }
        .clickable-row:hover td { background: #fafafb; }

        .prod-cell { display: flex; align-items: center; gap: 12px; }
        .prod-img { width: 38px; height: 38px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(0,0,0,0.07); }
        .s-badge { padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; display: inline-block; }
        .s-badge.active { background: #e7f6ec; color: #1a8a4a; }
        .s-badge.draft { background: #f0f1f2; color: #6b7076; }
        .s-badge.pending { background: #fef3e2; color: #b07a00; }
        .s-badge.fulfilled { background: #e7f6ec; color: #1a8a4a; }

        .bulk-bar { display: flex; align-items: center; justify-content: space-between; background: #16181d; color: #fff; padding: 12px 22px; border-radius: 10px; margin-bottom: 16px; font-size: 13.5px; }
        .bulk-actions-btns { display: flex; gap: 10px; }
        .btn-bulk-op { background: rgba(255,255,255,0.14); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .btn-bulk-op:hover { background: rgba(255,255,255,0.22); }
        .btn-bulk-op.danger { background: #c81e3a; }
        .btn-bulk-op.danger:hover { background: #a8172f; }

        .settings-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 32px; padding-top: 8px; }
        .settings-meta-info h3 { font-size: 15px; font-weight: 600; color: #16181d; margin-bottom: 6px; }
        .settings-meta-info p { font-size: 12.5px; color: #7a7f87; line-height: 1.5; }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f1f2f4; font-size: 13.5px; }
        .toggle-row:last-child { border-bottom: none; }
        .checkbox-custom { width: 17px; height: 17px; accent-color: #16181d; cursor: pointer; }
        .btn-settings-save { padding: 11px 22px; background: #16181d; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 13.5px; cursor: pointer; float: right; margin-top: 8px; transition: background 0.15s; }
        .btn-settings-save:hover { background: #2a2d34; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
        .stat-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.07); border-radius: 14px; padding: 22px; cursor: pointer; transition: border-color 0.15s; }
        .stat-card.on { border-color: #16181d; box-shadow: inset 0 0 0 1px #16181d; }
        .stat-lbl { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #9599a1; margin-bottom: 10px; }
        .stat-val { font-size: 28px; font-weight: 700; color: #16181d; letter-spacing: -0.01em; }
        .stat-delta { font-size: 12px; color: #8a8f97; margin-top: 6px; }

        .chart-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.07); border-radius: 16px; padding: 28px 28px 14px; margin-bottom: 22px; }
        .chart-eyebrow { font-size: 13px; font-weight: 700; color: #16181d; }
        .chart-meta-row { display: flex; align-items: baseline; gap: 10px; margin-top: 4px; }
        .chart-meta-sub { font-size: 12px; color: #9599a1; font-weight: 500; }
        .chart-meta-val { font-size: 30px; font-weight: 700; color: #16181d; letter-spacing: -0.01em; }
        .chart-range-pill { font-size: 11.5px; font-weight: 600; color: #6b7076; background: #f3f3f4; padding: 5px 10px; border-radius: 6px; }
        .chart-svg { width: 100%; display: block; cursor: crosshair; overflow: visible; }
        .grid-line { stroke: rgba(0,0,0,0.05); stroke-width: 1; }
        .day-row { display: flex; padding: 14px 0 4px; border-top: 1px solid #f1f2f4; margin-top: 6px; }
        .day-lbl { flex: 1; text-align: center; font-size: 11.5px; font-weight: 500; color: #9599a1; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,16,18,0.45); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
        .modal-content { background: #f7f7f8; border-radius: 14px; width: 100%; max-width: 780px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
        .modal-header { padding: 20px 24px; background: #fff; border-bottom: 1px solid rgba(0,0,0,0.07); display: flex; justify-content: space-between; align-items: center; }
        .modal-header h3 { font-size: 15px; font-weight: 700; color: #16181d; }
        .modal-body { padding: 24px; overflow-y: auto; display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
        .shopify-card { background: #fff; border: 1px solid rgba(0,0,0,0.07); border-radius: 10px; padding: 18px; margin-bottom: 14px; }
        .card-sub-title { font-size: 11.5px; font-weight: 700; margin-bottom: 12px; letter-spacing: 0.04em; text-transform: uppercase; color: #7a7f87; }
        .form-group { margin-bottom: 12px; }
        .form-label { display: block; font-size: 12.5px; font-weight: 600; margin-bottom: 6px; color: #4a4e55; }
        .form-input, .form-textarea, .form-select { width: 100%; padding: 10px 12px; border: 1px solid #d9dbdf; border-radius: 7px; font-family: inherit; font-size: 13.5px; background: #fff; outline: none; transition: border-color 0.15s; }
        .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: #16181d; }
        .pricing-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .profit-bar { display: flex; justify-content: space-between; background: #f7f7f8; padding: 10px 12px; border-radius: 7px; border: 1px solid #e8e9eb; margin-top: 10px; font-size: 12px; color: #4a4e55; }
        .modal-footer { padding: 16px 24px; background: #fff; border-top: 1px solid rgba(0,0,0,0.07); display: flex; justify-content: flex-end; gap: 10px; }
        .btn-save { padding: 10px 18px; background: #16181d; color: white; font-weight: 600; font-size: 13.5px; border: none; border-radius: 7px; cursor: pointer; transition: background 0.15s; }
        .btn-save:hover { background: #2a2d34; }
        .btn-close { padding: 10px 18px; background: #fff; border: 1px solid #d9dbdf; color: #4a4e55; font-weight: 600; font-size: 13.5px; border-radius: 7px; cursor: pointer; transition: background 0.15s; }
        .btn-close:hover { background: #f3f3f4; }
        .btn-fulfill-action { background: #16181d; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .btn-fulfill-action:hover { background: #2a2d34; }

        @media print {
          body * { visibility: hidden; }
          .printable-invoice, .printable-invoice * { visibility: visible; }
          .printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item ${t.type === "error" ? "error" : ""}`}>
            <span className="toast-dot" /> {t.text}
          </div>
        ))}
      </div>

      <div className="layout">
        <aside className="sidebar">
          <div className="s-logo">{storeName.split(" ")[0] || "Avelo"}</div>

          {[
            { label: "Overview", key: "overview" },
            { label: "Products", key: "products" },
            { label: "Orders", key: "orders" },
            { label: "Users", key: "users" },
            { label: "Settings", key: "settings" },
          ].map(({ label, key }) => (
            <div key={label} className={`nav-item${section === key ? " active" : ""}`} onClick={() => setSection(key as AdminSection)}>
              {label}
            </div>
          ))}

          <button className="sidebar-btn-editor" onClick={() => router.push("/editor")}>
            Open Editor
          </button>

          <button className="sidebar-btn-new" onClick={() => setShowProductModal(true)}>
            Add Product
          </button>

          <div className="s-logout" onClick={handleLogout} style={{ marginTop: "auto" }}>Log out</div>
        </aside>

        <main className="main">
          <div className="page-header">
            <div>
              <p style={{ textTransform: "uppercase", letterSpacing: "0.1em", color: "#9599a1", fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Store Control</p>
              <h1 className="page-title">{section.charAt(0).toUpperCase() + section.slice(1)}</h1>
            </div>
            {section !== "settings" && (
              <div className="header-right">
                <div className="range-picker">
                  {(["7d", "30d", "90d"] as Range[]).map((r) => (
                    <button key={r} className={`range-btn${range === r ? " on" : ""}`} onClick={() => handleRange(r)}>
                      {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {section === "overview" && (
            <>
              <div className="stats-grid">
                {(["revenue", "orders", "visitors"] as MetricKey[]).map((key) => {
                  const labels: Record<MetricKey, string> = { revenue: "Total Revenue", orders: "Orders", visitors: "Visitors" };
                  const vals: Record<MetricKey, string> = { revenue: stats.revenue, orders: stats.orders, visitors: stats.visitors };
                  return (
                    <div key={key} className={`stat-card${metric === key ? " on" : ""}`} onClick={() => handleMetric(key)}>
                      <div className="stat-lbl">{labels[key]}</div>
                      <div className="stat-val">{vals[key]}</div>
                      <div className="stat-delta">{stats.delta} vs last period</div>
                    </div>
                  );
                })}
                <div className="stat-card">
                  <div className="stat-lbl">Unique SKUs</div>
                  <div className="stat-val">{products.length || 12}</div>
                  <div className="stat-delta">Total catalog items</div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                  <div>
                    <p className="chart-eyebrow">Store Trend</p>
                    <div className="chart-meta-row">
                      <span className="chart-meta-val">{fmt(activeVal)}</span>
                      <span className="chart-meta-sub">{metricLabel} · {data[activeIdx]?.label}</span>
                    </div>
                  </div>
                  <div className="chart-range-pill">{RANGE_LABELS[range]}</div>
                </div>

                <svg ref={svgRef} className="chart-svg" viewBox={`0 0 ${W} ${H}`} onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16181d" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#16181d" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {gridValues.map((val, i) => {
                    const y = PAD_Y + (1 - i / 4) * (H - PAD_Y * 2);
                    return <line key={i} x1={PAD_X} y1={y} x2={W - PAD_X} y2={y} className="grid-line" />;
                  })}

                  <path ref={areaRef} d={areaD} fill="url(#areaGrad)" />
                  <path ref={lineRef} d={pathD} fill="none" stroke="#16181d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {hoverIdx !== null && pts[hoverIdx] && (
                    <line x1={pts[hoverIdx].x} y1={PAD_Y} x2={pts[hoverIdx].x} y2={H - PAD_Y} stroke="rgba(0,0,0,0.12)" strokeDasharray="3 3" />
                  )}

                  <circle cx={dotPos.x} cy={dotPos.y} r="5" fill="#ffffff" stroke="#16181d" strokeWidth="3" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }} />
                </svg>

                <div className="day-row">
                  {data.map((item, i) => (
                    <div key={i} className="day-lbl" style={{ color: activeIdx === i ? "#16181d" : undefined, fontWeight: activeIdx === i ? 700 : undefined }}>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="table-card">
                <div className="section-title">Recent Orders</div>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="clickable-row" onClick={() => setSelectedOrder(ord)}>
                        <td style={{ fontWeight: 600 }}>{ord.id}</td>
                        <td>{ord.customer || "Guest Customer"}</td>
                        <td>
                          <span className={`s-badge ${ord.status.toLowerCase()}`}>
                            {ord.status}
                          </span>
                        </td>
                        <td>{currency === "USD" ? "$" : currency === "EUR" ? "€" : "฿"}{(ord.total || 0).toFixed(2)}</td>
                        <td style={{ color: "#7a7f87" }}>{ord.dateString}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", color: "#8a8f97", padding: "20px" }}>No orders found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {section === "products" && (
            <div className="table-card">
              <div className="filter-toolbar">
                <input
                  type="text"
                  placeholder="Search products or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="search-box"
                />
                <div className="filter-tabs">
                  {(["All", "Active", "Draft"] as const).map((st) => (
                    <button
                      key={st}
                      className={`filter-tab-btn${productStatusFilter === st ? " active" : ""}`}
                      onClick={() => setProductStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {selectedProductIds.length > 0 && (
                <div className="bulk-bar">
                  <span>{selectedProductIds.length} product(s) selected</span>
                  <div className="bulk-actions-btns">
                    <button className="btn-bulk-op" onClick={handleBulkArchive}>Move to Draft</button>
                    <button className="btn-bulk-op danger" onClick={handleBulkDelete}>Delete Selected</button>
                  </div>
                </div>
              )}

              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: "30px" }}>
                      <input
                        type="checkbox"
                        className="checkbox-custom"
                        checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                        onChange={handleSelectAllProducts}
                      />
                    </th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Status</th>
                    <th>Inventory</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="clickable-row">
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox-custom"
                          checked={selectedProductIds.includes(p.id)}
                          onChange={() => handleToggleSelectProduct(p.id)}
                        />
                      </td>
                      <td onClick={() => setEditingProduct(p)}>
                        <div className="prod-cell">
                          <img src={p.image} alt={p.name} className="prod-img" />
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td onClick={() => setEditingProduct(p)} style={{ color: "#7a7f87", fontSize: "12.5px" }}>{p.sku || "N/A"}</td>
                      <td onClick={() => setEditingProduct(p)}>
                        <span className={`s-badge ${p.status.toLowerCase()}`}>
                          {p.status}
                        </span>
                      </td>
                      <td onClick={() => setEditingProduct(p)}>{p.stock} in stock</td>
                      <td onClick={() => setEditingProduct(p)} style={{ fontWeight: 600 }}>{currency === "USD" ? "$" : currency === "EUR" ? "€" : "฿"}{p.price.toFixed(2)}</td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#8a8f97", padding: "30px" }}>No products match your search</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {section === "orders" && (
            <div className="table-card">
              <div className="filter-toolbar">
                <input
                  type="text"
                  placeholder="Search orders or customer..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="search-box"
                />
                <div className="filter-tabs">
                  {(["All", "Pending", "Fulfilled"] as const).map((st) => (
                    <button
                      key={st}
                      className={`filter-tab-btn${orderStatusFilter === st ? " active" : ""}`}
                      onClick={() => setOrderStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <table className="tbl">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Tracking</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="clickable-row">
                      <td onClick={() => setSelectedOrder(ord)} style={{ fontWeight: 600 }}>{ord.id}</td>
                      <td onClick={() => setSelectedOrder(ord)}>{ord.customer || "Guest Customer"}</td>
                      <td onClick={() => setSelectedOrder(ord)}>
                        <span className={`s-badge ${ord.status.toLowerCase()}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td onClick={() => setSelectedOrder(ord)} style={{ color: "#7a7f87", fontSize: "12.5px" }}>{ord.trackingNumber || "—"}</td>
                      <td onClick={() => setSelectedOrder(ord)}>{currency === "USD" ? "$" : currency === "EUR" ? "€" : "฿"}{(ord.total || 0).toFixed(2)}</td>
                      <td onClick={() => setSelectedOrder(ord)} style={{ color: "#7a7f87" }}>{ord.dateString}</td>
                      <td style={{ textAlign: "right" }}>
                        {ord.status === "Pending" ? (
                          <button className="btn-fulfill-action" onClick={() => setActiveFulfillOrder(ord)}>
                            Fulfill
                          </button>
                        ) : (
                          <button className="btn-close" style={{ padding: "4px 10px", fontSize: "11.5px" }} onClick={() => setSelectedOrder(ord)}>
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#8a8f97", padding: "30px" }}>No orders match your filter</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {section === "users" && (
            <div className="table-card">
              <div className="section-title">Store Users & Permissions</div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: "#7a7f87" }}>{u.email}</td>
                      <td><span className="s-badge active">{u.role}</span></td>
                      <td><span className={`s-badge ${u.status.toLowerCase()}`}>{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section === "settings" && (
            <div className="table-card">
              <div className="section-title">Store Configuration</div>
              <form onSubmit={handleSaveSettings}>
                <div className="settings-grid" style={{ marginBottom: "24px", borderBottom: "1px solid #f1f2f4", paddingBottom: "24px" }}>
                  <div className="settings-meta-info">
                    <h3>General Details</h3>
                    <p>Configure store name, email address, and primary currency.</p>
                  </div>
                  <div>
                    <div className="form-group">
                      <label className="form-label">Store Name</label>
                      <input type="text" className="form-input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Support Email</label>
                      <input type="email" className="form-input" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Currency</label>
                      <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="THB">THB (฿)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="settings-grid">
                  <div className="settings-meta-info">
                    <h3>Payment Gateways</h3>
                    <p>Enable checkout payment providers for customers.</p>
                  </div>
                  <div>
                    <div className="toggle-row">
                      <span>Stripe Checkout</span>
                      <input type="checkbox" className="checkbox-custom" checked={enableStripe} onChange={(e) => setEnableStripe(e.target.checked)} />
                    </div>
                    <div className="toggle-row">
                      <span>PayPal Express</span>
                      <input type="checkbox" className="checkbox-custom" checked={enablePaypal} onChange={(e) => setEnablePaypal(e.target.checked)} />
                    </div>
                    <div className="toggle-row">
                      <span>Direct Bank Transfer</span>
                      <input type="checkbox" className="checkbox-custom" checked={enableBankTransfer} onChange={(e) => setEnableBankTransfer(e.target.checked)} />
                    </div>
                    <button type="submit" className="btn-settings-save">Save Changes</button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Product</h3>
              <button className="btn-close" style={{ padding: "4px 10px" }} onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            <form onSubmit={handleShopifyProductSubmit}>
              <div className="modal-body">
                <div>
                  <div className="shopify-card">
                    <div className="card-sub-title">Basic Information</div>
                    <div className="form-group">
                      <label className="form-label">Product Name</label>
                      <input type="text" className="form-input" required placeholder="e.g. Leather Urban Backpack" value={inputName} onChange={(e) => setInputName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" rows={3} placeholder="Provide product details..." value={inputDescription} onChange={(e) => setInputDescription(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Image URL</label>
                      <input type="text" className="form-input" placeholder="https://..." value={inputImageUrl} onChange={(e) => setInputImageUrl(e.target.value)} />
                    </div>
                  </div>

                  <div className="shopify-card">
                    <div className="card-sub-title">Pricing & Profit</div>
                    <div className="pricing-row">
                      <div className="form-group">
                        <label className="form-label">Retail Price</label>
                        <input type="number" step="0.01" className="form-input" required placeholder="0.00" value={inputPrice} onChange={(e) => setInputPrice(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Item Cost</label>
                        <input type="number" step="0.01" className="form-input" placeholder="0.00" value={inputCost} onChange={(e) => setInputCost(e.target.value)} />
                      </div>
                    </div>
                    <div className="profit-bar">
                      <span>Estimated Profit per item: <strong>${profit.toFixed(2)}</strong></span>
                      <span>Margin: <strong>{priceNum > 0 ? ((profit / priceNum) * 100).toFixed(1) : 0}%</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="shopify-card">
                    <div className="card-sub-title">Inventory & Organization</div>
                    <div className="form-group">
                      <label className="form-label">Initial Stock</label>
                      <input type="number" className="form-input" required placeholder="50" value={inputStock} onChange={(e) => setInputStock(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SKU</label>
                      <input type="text" className="form-input" placeholder="SKU-1002" value={inputSku} onChange={(e) => setInputSku(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Barcode</label>
                      <input type="text" className="form-input" placeholder="0123456789" value={inputBarcode} onChange={(e) => setInputBarcode(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-select" value={inputCategory} onChange={(e) => setInputCategory(e.target.value)}>
                        <option value="Electronics">Electronics</option>
                        <option value="Apparel">Apparel</option>
                        <option value="Home">Home & Living</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={inputStatus} onChange={(e) => setInputStatus(e.target.value as "Active" | "Draft")}>
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-close" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button className="btn-close" style={{ padding: "4px 10px" }} onClick={() => setEditingProduct(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateProductSubmit}>
              <div className="modal-body">
                <div>
                  <div className="shopify-card">
                    <div className="card-sub-title">Product Details</div>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-input" required value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Image URL</label>
                      <input type="text" className="form-input" value={editingProduct.image || ""} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })} />
                    </div>
                    <div className="pricing-row">
                      <div className="form-group">
                        <label className="form-label">Price</label>
                        <input type="number" step="0.01" className="form-input" required value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Stock</label>
                        <input type="number" className="form-input" required value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="shopify-card">
                    <div className="card-sub-title">Status & SKU</div>
                    <div className="form-group">
                      <label className="form-label">SKU</label>
                      <input type="text" className="form-input" value={editingProduct.sku || ""} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={editingProduct.status} onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as "Active" | "Draft" })}>
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-close" onClick={() => setEditingProduct(null)}>Cancel</button>
                <button type="submit" className="btn-save">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeFulfillOrder && (
        <div className="modal-overlay" onClick={() => setActiveFulfillOrder(null)}>
          <div className="modal-content" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Fulfill Order {activeFulfillOrder.id}</h3>
              <button className="btn-close" style={{ padding: "4px 10px" }} onClick={() => setActiveFulfillOrder(null)}>✕</button>
            </div>
            <form onSubmit={handleFulfillSubmit}>
              <div style={{ padding: "24px" }}>
                <div className="form-group">
                  <label className="form-label">Tracking Number / Carrier</label>
                  <input type="text" className="form-input" required placeholder="e.g. UPS-98234710" value={inputTracking} onChange={(e) => setInputTracking(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-close" onClick={() => setActiveFulfillOrder(null)}>Cancel</button>
                <button type="submit" className="btn-save">Confirm Fulfillment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content printable-invoice" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Invoice #{selectedOrder.id}</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn-close" onClick={() => window.print()}>Print Invoice</button>
                <button className="btn-close" style={{ padding: "4px 10px" }} onClick={() => setSelectedOrder(null)}>✕</button>
              </div>
            </div>
            <div className="modal-body" style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "13.5px", color: "#4a4e55" }}>
                <div>
                  <strong>Customer:</strong> {selectedOrder.customer || "Guest Customer"}<br />
                  <strong>Date:</strong> {selectedOrder.dateString}
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>Status:</strong> {selectedOrder.status}<br />
                  <strong>Tracking:</strong> {selectedOrder.trackingNumber || "Not Shipped"}
                </div>
              </div>
              <table className="tbl" style={{ marginBottom: "20px" }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: "right", fontSize: "16px", fontWeight: 700 }}>
                Total: ${(selectedOrder.total || 0).toFixed(2)}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-save" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      </>
    </ProtectedRoute>
  );
}