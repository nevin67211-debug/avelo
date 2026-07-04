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
}

interface StockLogRecord {
  id: string;
  productName: string;
  type: "In" | "Out";
  qty: number;
  reason: string;
  timestamp: string;
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
  const [liveActivity, setLiveActivity] = useState([
    { title: "Checkout completed", detail: "3 new purchases in the last 5 minutes", time: "just now" },
    { title: "User session spike", detail: "12% growth in active sessions", time: "6 min ago" },
  ]);

  // ── INVENTORY LOGS STATE ──
  const [stockLogs, setStockLogs] = useState<StockLogRecord[]>([
    { id: "LOG-901", productName: "Sample Leather Jacket", type: "In", qty: 50, reason: "Initial Stocking", timestamp: "10 min ago" },
  ]);

  // ── BULK ACTIONS STATE ──
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // ── ORDER FULFILLMENT STATE ──
  const [activeFulfillOrder, setActiveFulfillOrder] = useState<ShopifyOrderRecord | null>(null);
  const [inputTracking, setInputTracking] = useState("");

  // ── SETTINGS STATE ──
  const [storeName, setStoreName] = useState("Avelo Premium Store");
  const [storeEmail, setStoreEmail] = useState("contact@avelo.com");
  const [currency, setCurrency] = useState("USD");
  const [enableStripe, setEnableStripe] = useState(true);
  const [enablePaypal, setEnablePaypal] = useState(false);
  const [enableBankTransfer, setEnableBankTransfer] = useState(true);
  const [shippingRate, setShippingRate] = useState("4.99");
  const [enableVat, setEnableVat] = useState(true);

  // Shopify Advanced Product Form States
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

  // ระบบกราฟ Interactivity
  const [metric, setMetric] = useState<MetricKey>("revenue");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [livePulse, setLivePulse] = useState([42, 56, 49, 68, 58, 75, 69]);
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
    const interval = setInterval(() => {
      setLivePulse((prev) => prev.map((value, index) => (index === prev.length - 1 ? Math.max(35, Math.min(90, value + (Math.random() > 0.5 ? 4 : -3))) : prev[index + 1])));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

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
        
        const extendedOrders = orderData.map((o: any) => ({
          ...o,
          status: "Pending" as const,
          trackingNumber: "",
          dateString: o.created_at ? new Date(o.created_at).toLocaleDateString() : "June 15, 2026"
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
  const marginPercentage = priceNum > 0 ? (profit / priceNum) * 100 : 0;

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

    setLiveActivity((prev) => [
      { title: `Shopify Sync: Product Created`, detail: `[${inputStatus}] "${inputName}" listed successfully.`, time: "just now" },
      ...prev.slice(0, 2),
    ]);

    setInputName(""); setInputDescription(""); setInputImageUrl("");
    setInputPrice(""); setInputCost(""); setInputSku(""); setInputBarcode("");
    setInputStock(""); setInputCategory("Electronics"); setInputStatus("Active");
    setShowProductModal(false);
    setSection("products");
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllProducts = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบสินค้าทั้ง ${selectedProductIds.length} รายการนี้?`)) {
      setProducts((prev) => prev.filter((p) => !selectedProductIds.includes(p.id)));
      setSelectedProductIds([]);
    }
  };

  const handleBulkArchive = () => {
    setProducts((prev) =>
      prev.map((p) => (selectedProductIds.includes(p.id) ? { ...p, status: "Draft" } : p))
    );
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

    setLiveActivity((prev) => [
      { title: `Fulfillment: ${activeFulfillOrder.id}`, detail: `Shipped via Tracking: ${inputTracking}`, time: "just now" },
      ...prev.slice(0, 2),
    ]);

    setActiveFulfillOrder(null);
    setInputTracking("");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setLiveActivity((prev) => [
      { title: `System: Settings Updated`, detail: `Configs and Core Framework synchronized.`, time: "just now" },
      ...prev.slice(0, 2),
    ]);
    alert("⚙️ บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว!");
  };

  return (
    <ProtectedRoute requiredRole="user">
      <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fafafa; font-family: 'Outfit', sans-serif; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
        .layout { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar { width: 240px; padding: 48px 24px; border-right: 1px solid rgba(0,0,0,0.06); position: sticky; top: 0; height: 100vh; background: #fff; display: flex; flex-direction: column; }
        .s-logo { font-weight: 800; font-size: 20px; letter-spacing: -0.03em; color: #1a1a1a; margin-bottom: 24px; padding: 0 12px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; color: #6d7175; font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 8px; margin-bottom: 4px; transition: all 0.2s; }
        .nav-item:hover { background: #f5f5f5; color: #1a1a1a; }
        .nav-item.active { background: #000000; color: #ffffff; font-weight: 600; }
        
        .sidebar-btn-new { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; margin: 12px 0; background: #008060; color: #ffffff; font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 8px; border: none; }
        /* สไตล์เพิ่มเติมสำหรับปุ่มเปิด Editor เพื่อให้เด่นชัดขึ้น */
        .sidebar-btn-editor { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; margin: 4px 0 12px 0; background: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 8px; border: none; transition: background 0.2s; }
        .sidebar-btn-editor:hover { background: #1d4ed8; }
        .s-logout { color: #e11d48; font-size: 13px; font-weight: 600; cursor: pointer; padding: 12px 14px; }

        /* MAIN PANEL */
        .main { flex: 1; padding: 60px 60px 100px; max-width: 1400px; margin: 0 auto; width: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .page-title { font-size: 32px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; }

        .range-picker { display: flex; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 10px; padding: 4px; gap: 2px; }
        .range-btn { font-family: inherit; font-size: 12px; font-weight: 600; padding: 6px 14px; border: none; border-radius: 7px; cursor: pointer; background: transparent; color: #888888; }
        .range-btn.on { background: #000000; color: #ffffff; }

        /* TABLES & CARDS */
        .table-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 24px; }
        .section-title { font-size: 16px; font-weight: 700; color: #000000; margin-bottom: 20px; }
        .tbl { width: 100%; border-collapse: collapse; }
        .tbl th { text-align: left; font-size: 11px; font-weight: 600; color: #999999; padding: 0 0 14px; border-bottom: 1px solid rgba(0,0,0,.06); }
        .tbl td { padding: 16px 0; border-bottom: 1px solid rgba(0,0,0,.04); font-size: 14px; color: #1a1a1a; vertical-align: middle; }
        
        .prod-cell { display: flex; align-items: center; gap: 12px; }
        .prod-img { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(0,0,0,0.06); }
        .s-badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
        .s-badge.active { background: #eaf6ed; color: #1a8a4a; }
        .s-badge.draft { background: #f5f5f5; color: #666666; }
        .s-badge.pending { background: #fff5ea; color: #b98900; }
        .s-badge.fulfilled { background: #eaf6ed; color: #1a8a4a; }

        /* BULK BAR */
        .bulk-bar { display: flex; align-items: center; justify-content: space-between; background: #000; color: #fff; padding: 12px 24px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; }
        .bulk-actions-btns { display: flex; gap: 10px; }
        .btn-bulk-op { background: rgba(255,255,255,0.15); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .btn-bulk-op.danger { background: #e11d48; }

        /* SETTINGS LAYOUT */
        .settings-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 32px; padding-top: 12px; }
        .settings-meta-info h3 { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px; }
        .settings-meta-info p { font-size: 13px; color: #6d7175; line-height: 1.4; }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #f1f2f4; }
        .checkbox-custom { width: 18px; height: 18px; accent-color: #008060; cursor: pointer; }
        .btn-settings-save { padding: 12px 24px; background: #008060; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; float: right; margin-top: 12px; }

        /* OVERVIEW & CHART */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
        .stat-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 24px; cursor: pointer; }
        .stat-card.on { border-color: #000000; box-shadow: inset 0 0 0 1px #000; }
        .stat-lbl { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #999999; margin-bottom: 10px; }
        .stat-val { font-size: 32px; font-weight: 800; color: #000000; }
        .chart-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 32px 32px 16px; margin-bottom: 24px; }
        .chart-meta-val { font-size: 36px; font-weight: 800; }
        .chart-svg { width: 100%; display: block; cursor: crosshair; overflow: visible; }
        .day-row { display: flex; padding: 16px 0 10px; border-top: 1px solid #fafafa; }
        .day-lbl { flex: 1; text-align: center; font-size: 12px; color: #999999; }
        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }
        .activity-item { padding: 14px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .activity-title { font-weight: 700; font-size: 14px; color: #000000; }
        .activity-detail { color: #666666; font-size: 13px; }
        .activity-time { color: #aaaaaa; font-size: 12px; }

        /* MODALS */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
        .modal-content { background: #f6f6f7; border-radius: 14px; width: 100%; max-width: 780px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; }
        .modal-header { padding: 20px 24px; background: #fff; border-bottom: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 24px; overflow-y: auto; display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
        .shopify-card { background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 18px; margin-bottom: 14px; }
        .card-sub-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; color: #555; }
        .form-group { margin-bottom: 12px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #222; }
        .form-input, .form-textarea, .form-select { width: 100%; padding: 10px 12px; border: 1px solid #ccc; border-radius: 6px; font-family: inherit; font-size: 14px; background: #fff; outline: none; }
        .pricing-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .profit-bar { display: flex; justify-content: space-between; background: #fafafa; padding: 10px; border-radius: 6px; border: 1px dashed #ddd; margin-top: 10px; font-size: 12px; }
        .modal-footer { padding: 16px 24px; background: #fff; border-top: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: flex-end; gap: 12px; }
        .btn-save { padding: 10px 18px; background: #008060; color: white; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; }
        .btn-close { padding: 10px 18px; background: #fff; border: 1px solid #ccc; color: #333; font-weight: 600; border-radius: 6px; cursor: pointer; }
        .btn-fulfill-action { background: #008060; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
      `}</style>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="s-logo">{storeName.split(" ")[0] || "Avelo"}.</div>
          
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

          {/* ปุ่มเปิด Editor (สีน้ำเงินเด่นชัด) */}
          <button className="sidebar-btn-editor" onClick={() => router.push("/editor")}>
            ✏️ Open Editor
          </button>

          <button className="sidebar-btn-new" onClick={() => setShowProductModal(true)}>
            + Add Product
          </button>

          <div className="s-logout" onClick={handleLogout} style={{ marginTop: "auto" }}>→ Log out</div>
        </aside>

        {/* MAIN PANEL */}
        <main className="main">
          <div className="page-header">
            <div>
              <p style={{ textTransform: "uppercase", letterSpacing: "0.1em", color: "#999999", fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Store Control</p>
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

          {/* ── SECTION: OVERVIEW & INVENTORY ADJUSTMENT LOGS ── */}
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

              {/* กราฟเอฟเฟกต์จุดขยับตามเมาส์ */}
              <div className="chart-card">
                <div className="chart-head">
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#000" }}>Store Trend</p>
                    <div className="chart-meta-row">
                      <span style={{ fontSize: "12px", color: "#888" }}>{metricLabel} — {data[activeIdx]?.label}</span>
                      <span className="chart-meta-val">{fmt(activeVal)}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "12px", background: "#f5f5f5", padding: "4px 8px", borderRadius: "6px" }}>{RANGE_LABELS[range]}</span>
                </div>
                <div className="chart-svg-wrap">
                  <svg key={animKey} ref={svgRef} className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)}>
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path ref={areaRef} d={areaD} fill="url(#ag)" style={{ opacity: 0 }} />
                    <path ref={lineRef} d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {hoverIdx !== null && (
                      <g>
                        <line x1={dotPos.x} y1={0} x2={dotPos.x} y2={H} stroke="rgba(0,0,0,0.06)" strokeWidth="1.2" strokeDasharray="4 4" />
                        <circle cx={dotPos.x} cy={dotPos.y} r="6" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                      </g>
                    )}
                  </svg>
                </div>
                <div className="day-row">{data.map((d) => <span key={d.label} className="day-lbl">{d.label}</span>)}</div>
              </div>

              {/* ตารางประวัติคลังสินค้า (Inventory logs) */}
              <div className="table-card">
                <div className="section-title">📦 Inventory Realtime Adjustment Logs</div>
                <table className="tbl">
                  <thead>
                    <tr><th>Log ID</th><th>Product Name</th><th>Type</th><th>Quantity Change</th><th>Activity Context</th><th>Timestamp</th></tr>
                  </thead>
                  <tbody>
                    {stockLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontFamily: "monospace", color: "#666" }}>{log.id}</td>
                        <td style={{ fontWeight: 600 }}>{log.productName}</td>
                        <td>
                          <span className={`s-badge ${log.type === "In" ? "active" : "draft"}`}>
                            Stock {log.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: log.type === "In" ? "#1a8a4a" : "#e11d48" }}>
                          {log.type === "In" ? "+" : "-"}{log.qty} Units
                        </td>
                        <td style={{ color: "#555" }}>{log.reason}</td>
                        <td style={{ color: "#aaa", fontSize: "13px" }}>{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bottom-grid">
                <div className="table-card">
                  <div className="section-title">Live Pulse Status</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 100, marginTop: 16 }}>
                    {livePulse.map((value, index) => (
                      <div key={index} style={{ flex: 1, height: `${value}%`, borderRadius: 4, background: "#2563eb" }} />
                    ))}
                  </div>
                </div>
                <div className="table-card">
                  <div className="section-title">Recent System Activity</div>
                  <div style={{ marginTop: 8 }}>
                    {liveActivity.map((item, idx) => (
                      <div key={idx} className="activity-item">
                        <div className="activity-title">{item.title}</div>
                        <div className="activity-detail">{item.detail}</div>
                        <div className="activity-time">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── SECTION: PRODUCTS WITH BULK ACTIONS ── */}
          {section === "products" && (
            <>
              {selectedProductIds.length > 0 && (
                <div className="bulk-bar">
                  <div>Selected <strong>{selectedProductIds.length}</strong> products</div>
                  <div className="bulk-actions-btns">
                    <button className="btn-bulk-op" onClick={handleBulkArchive}>Hide / Change to Draft</button>
                    <button className="btn-bulk-op danger" onClick={handleBulkDelete}>Delete Selected Items</button>
                  </div>
                </div>
              )}

              <div className="table-card">
                <div className="section-title">All Products Inventory</div>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>
                        <input type="checkbox" checked={products.length > 0 && selectedProductIds.length === products.length} onChange={handleSelectAllProducts} className="checkbox-custom" />
                      </th>
                      <th>Product</th>
                      <th>Status</th>
                      <th>Inventory</th>
                      <th>SKU</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => handleToggleSelectProduct(product.id)} className="checkbox-custom" />
                        </td>
                        <td>
                          <div className="prod-cell">
                            <img src={product.image} className="prod-img" alt="" />
                            <div>
                              <div style={{ fontWeight: 600 }}>{product.name}</div>
                              <div style={{ fontSize: "12px", color: "#6d7175" }}>{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`s-badge ${product.status === "Active" ? "active" : "draft"}`}>
                            {product.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, color: product.stock === 0 ? "#e11d48" : "#1a1a1a" }}>
                          {product.stock === 0 ? "Out of Stock" : `${product.stock} available`}
                        </td>
                        <td style={{ color: "#6d7175", fontFamily: "monospace" }}>{product.sku}</td>
                        <td style={{ fontWeight: 600 }}>
                          {currency === "USD" ? "$" : currency === "EUR" ? "€" : "฿"}{product.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SECTION: ORDERS ── */}
          {section === "orders" && (
            <div className="table-card">
              <div className="section-title">Recent Customer Orders</div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Fulfillment Status</th>
                    <th>Tracking</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600, color: "#2563eb" }}>{order.id}</td>
                      <td style={{ color: "#6d7175" }}>{order.dateString}</td>
                      <td style={{ fontWeight: 500 }}>{order.customer_name || "Guest User"}</td>
                      <td>
                        <span className={`s-badge ${order.status === "Fulfilled" ? "fulfilled" : "pending"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", color: "#444" }}>
                        {order.trackingNumber || <span style={{ color: "#bbb" }}>—</span>}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {currency === "USD" ? "$" : currency === "EUR" ? "€" : "฿"}{order.total_price.toLocaleString()}
                      </td>
                      <td>
                        {order.status === "Pending" ? (
                          <button className="btn-fulfill-action" onClick={() => setActiveFulfillOrder(order)}>
                            Fulfill Order
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#1a8a4a", fontWeight: 600 }}>✓ Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── SECTION: USERS ── */}
          {section === "users" && (
            <div className="table-card">
              <div className="section-title">Store Personnel & Users</div>
              <table className="tbl">
                <thead>
                  <tr><th>User ID</th><th>Full Name</th><th>Email Address</th><th>Role Access</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ color: "#888" }}>#{u.id}</td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td><strong>{u.role}</strong></td>
                      <td><span className={`s-badge ${u.status === "Active" ? "active" : "pending"}`}>{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── SECTION: SETTINGS ── */}
          {section === "settings" && (
            <form onSubmit={handleSaveSettings} className="table-card">
              <div className="section-title">⚙️ General & Infrastructure Settings</div>
              
              <div className="settings-grid">
                <div className="settings-meta-info">
                  <h3>Store Identity</h3>
                  <p>Configure internal branding data variables and currency formatting contexts.</p>
                </div>
                <div className="shopify-card">
                  <div className="form-group">
                    <label className="form-label">Store Name</label>
                    <input type="text" className="form-input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sender Email</label>
                    <input type="email" className="form-input" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Store Currency</label>
                    <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="THB">THB (฿)</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr style={{ border: "0", borderTop: "1px solid #f1f2f4", margin: "24px 0" }} />

              <div className="settings-grid">
                <div className="settings-meta-info">
                  <h3>Payment Integration</h3>
                  <p>Toggle backend transaction pipelines for customer checkouts.</p>
                </div>
                <div className="shopify-card">
                  <div className="toggle-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>Stripe Payment Gateway</div>
                      <div style={{ fontSize: "12px", color: "#6d7175" }}>Accept Visa, Mastercard, and ApplePay instantly.</div>
                    </div>
                    <input type="checkbox" className="checkbox-custom" checked={enableStripe} onChange={(e) => setEnableStripe(e.target.checked)} />
                  </div>
                  <div className="toggle-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>PayPal Express</div>
                      <div style={{ fontSize: "12px", color: "#6d7175" }}>Allow digital wallet fast-checkout hooks.</div>
                    </div>
                    <input type="checkbox" className="checkbox-custom" checked={enablePaypal} onChange={(e) => setEnablePaypal(e.target.checked)} />
                  </div>
                  <div className="toggle-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>Direct Bank Transfer</div>
                      <div style={{ fontSize: "12px", color: "#6d7175" }}>Manual upload and reconciliation pipeline.</div>
                    </div>
                    <input type="checkbox" className="checkbox-custom" checked={enableBankTransfer} onChange={(e) => setEnableBankTransfer(e.target.checked)} />
                  </div>
                </div>
              </div>

              <hr style={{ border: "0", borderTop: "1px solid #f1f2f4", margin: "24px 0" }} />

              <div className="settings-grid">
                <div className="settings-meta-info">
                  <h3>Taxes & Logistics</h3>
                  <p>Setup flat rate shipping rules and automated fiscal margins.</p>
                </div>
                <div className="shopify-card">
                  <div className="form-group">
                    <label className="form-label">Standard Shipping Rate ({currency})</label>
                    <input type="text" className="form-input" value={shippingRate} onChange={(e) => setShippingRate(e.target.value)} />
                  </div>
                  <div className="toggle-row" style={{ borderBottom: "none" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>Automate VAT Calculation</div>
                      <div style={{ fontSize: "12px", color: "#6d7175" }}>Apply default percentages based on geolocation variables.</div>
                    </div>
                    <input type="checkbox" className="checkbox-custom" checked={enableVat} onChange={(e) => setEnableVat(e.target.checked)} />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-settings-save">Save Configurations</button>
              <div style={{ clear: "both" }} />
            </form>
          )}
        </main>
      </div>

      {/* ── MODAL: ADD PRODUCT ── */}
      {showProductModal && (
        <div className="modal-overlay">
          <form onSubmit={handleShopifyProductSubmit} className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Add Shopify Sourced Product</h2>
              <button type="button" onClick={() => setShowProductModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-left">
                <div className="shopify-card">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-input" placeholder="e.g. Winter Air Jacket" value={inputName} onChange={(e) => setInputName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" rows={3} placeholder="Provide item marketing insights..." value={inputDescription} onChange={(e) => setInputDescription(e.target.value)} />
                  </div>
                </div>

                <div className="shopify-card">
                  <div className="card-sub-title">Media & assets</div>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input type="url" className="form-input" placeholder="https://unsplash.com/..." value={inputImageUrl} onChange={(e) => setInputImageUrl(e.target.value)} />
                  </div>
                </div>

                <div className="shopify-card">
                  <div className="card-sub-title">Pricing matrix</div>
                  <div className="pricing-row">
                    <div className="form-group">
                      <label className="form-label">Price</label>
                      <input type="number" className="form-input" placeholder="0.00" value={inputPrice} onChange={(e) => setInputPrice(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cost per item</label>
                      <input type="number" className="form-input" placeholder="0.00" value={inputCost} onChange={(e) => setInputCost(e.target.value)} />
                    </div>
                  </div>
                  <div className="profit-bar">
                    <span>Margin profit: <strong>${profit.toFixed(2)}</strong></span>
                    <span>Percentage: <strong>{marginPercentage.toFixed(1)}%</strong></span>
                  </div>
                </div>
              </div>

              <div className="modal-right">
                <div className="shopify-card">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={inputStatus} onChange={(e) => setInputStatus(e.target.value as any)}>
                      <option value="Active">Active (Live)</option>
                      <option value="Draft">Draft (Hidden)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Product Category</label>
                    <select className="form-select" value={inputCategory} onChange={(e) => setInputCategory(e.target.value)}>
                      <option value="Electronics">Electronics</option>
                      <option value="Apparel">Apparel</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="shopify-card">
                  <div className="card-sub-title">Inventory & Codes</div>
                  <div className="form-group">
                    <label className="form-label">SKU (Stock Keeping Unit)</label>
                    <input type="text" className="form-input" placeholder="AUTO" value={inputSku} onChange={(e) => setInputSku(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Barcode (ISBN/GTIN)</label>
                    <input type="text" className="form-input" placeholder="AUTO" value={inputBarcode} onChange={(e) => setInputBarcode(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Quantity</label>
                    <input type="number" className="form-input" placeholder="0" value={inputStock} onChange={(e) => setInputStock(e.target.value)} required />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-close" onClick={() => setShowProductModal(false)}>Cancel</button>
              <button type="submit" className="btn-save">Publish Sourced Item</button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: ORDER FULFILLMENT ── */}
      {activeFulfillOrder && (
        <div className="modal-overlay">
          <form onSubmit={handleFulfillSubmit} className="modal-content" style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2 style={{ fontSize: "16px", fontWeight: "700" }}>Fulfill Shipment: {activeFulfillOrder.id}</h2>
              <button type="button" onClick={() => setActiveFulfillOrder(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>&times;</button>
            </div>
            <div className="modal-body" style={{ gridTemplateColumns: "1fr", padding: "20px" }}>
              <div className="shopify-card" style={{ margin: 0 }}>
                <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                  Customer Name: <strong>{activeFulfillOrder.customer_name}</strong>
                </div>
                <div className="form-group">
                  <label className="form-label">Logistics Tracking Number</label>
                  <input type="text" className="form-input" placeholder="e.g. TRK901234812" value={inputTracking} onChange={(e) => setInputTracking(e.target.value)} required />
                </div>
                <p style={{ fontSize: "12px", color: "#6d7175", lineHeight: "1.4" }}>
                  การกดยืนยันจะเป็นการบันทึกหมายเลข Tracking ลงระบบ และเปลี่ยนสถานะ Order เป็น <strong>Fulfilled</strong>
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-close" onClick={() => setActiveFulfillOrder(null)}>Cancel</button>
              <button type="submit" className="btn-save" style={{ background: "#008060" }}>Confirm Dispatch</button>
            </div>
          </form>
        </div>
      )}
      </>
    </ProtectedRoute>
  );
}