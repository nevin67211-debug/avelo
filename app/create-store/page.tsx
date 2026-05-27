"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const BUSINESS_TYPES = [
  { id: "ecommerce", icon: "🛒", label: "E-Commerce", desc: "ขายสินค้าออนไลน์" },
  { id: "marketing", icon: "📣", label: "Marketing", desc: "โปรโมทสินค้า/บริการ" },
  { id: "restaurant", icon: "🍽️", label: "Restaurant", desc: "ร้านอาหาร / คาเฟ่" },
  { id: "service", icon: "💼", label: "Service", desc: "รับจ้าง / บริการ" },
  { id: "portfolio", icon: "🎨", label: "Portfolio", desc: "แสดงผลงาน" },
  { id: "blog", icon: "✍️", label: "Blog", desc: "เขียนบทความ" },
];

const TEMPLATES = [
  { id: "minimal", label: "Minimal", color: "#f8f8f8", accent: "#1d1d1f" },
  { id: "bold", label: "Bold", color: "#1d1d1f", accent: "#FFD60A" },
  { id: "soft", label: "Soft", color: "#FFF5F5", accent: "#FF6B6B" },
  { id: "pro", label: "Pro", color: "#0A0A2E", accent: "#6C63FF" },
];

export default function CreateStore() {
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [template, setTemplate] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (val: string) => {
    setStoreName(val);
    if (!slugEdited) {
      setStoreSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugEdited(true);
    setStoreSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleFinish = async () => {
    setCreating(true);
    setError("");
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      await addDoc(collection(db, "stores"), {
        uid: user.uid,
        name: storeName,
        slug: storeSlug,
        businessType,
        template,
        createdAt: serverTimestamp(),
      });

      setDone(true);
    } catch (err: any) {
      console.error(err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setCreating(false);
    }
  };

  const canNext1 = storeName.trim().length > 0 && storeSlug.trim().length > 0 && businessType !== "";
  const canNext2 = template !== "";

  if (done) {
    return (
      <div style={styles.doneWrap}>
        <div style={styles.doneCard}>
          <div style={styles.doneIcon}>🎉</div>
          <h2 style={styles.doneTitle}>ร้านของคุณพร้อมแล้ว!</h2>
          <p style={styles.doneSubtitle}>
            <span style={styles.doneUrl}>{storeSlug}.avelo.com</span>
          </p>
          <div style={styles.doneBtns}>
            <button style={styles.primaryBtn} onClick={() => window.location.href = "/dashboard"}>
              กลับ Dashboard
            </button>
            <button style={styles.secondaryBtn} onClick={() => window.location.href = `/store/${storeSlug}`}>
              เข้าร้านเลย →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => step === 1 ? window.location.href = "/dashboard" : setStep(step - 1)}
        >
          ← {step === 1 ? "Dashboard" : "Back"}
        </button>
        <span style={styles.headerLogo}>Avelo</span>
        <span style={{ width: 80 }} />
      </div>

      {/* Stepper */}
      <div style={styles.stepper}>
        {["ข้อมูลร้าน", "เลือก Template", "ยืนยัน"].map((label, i) => {
          const s = i + 1;
          const active = step === s;
          const isDone = step > s;
          return (
            <div key={s} style={styles.stepItem}>
              <div style={{
                ...styles.stepCircle,
                background: isDone ? "#34c759" : active ? "#1d1d1f" : "#e5e7eb",
                color: isDone || active ? "#fff" : "#999",
              }}>
                {isDone ? "✓" : s}
              </div>
              <span style={{
                ...styles.stepLabel,
                color: active ? "#1d1d1f" : isDone ? "#34c759" : "#999",
                fontWeight: active ? 600 : 400,
              }}>{label}</span>
              {i < 2 && <div style={{ ...styles.stepLine, background: isDone ? "#34c759" : "#e5e7eb" }} />}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div style={styles.content}>

        {/* STEP 1 */}
        {step === 1 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>ข้อมูลร้านค้า</h2>
            <p style={styles.cardSub}>บอกเราเกี่ยวกับร้านของคุณ</p>

            <label style={styles.label}>ชื่อร้าน</label>
            <input
              style={styles.input}
              placeholder="เช่น My Awesome Shop"
              value={storeName}
              onChange={(e) => handleNameChange(e.target.value)}
            />

            <label style={styles.label}>URL ร้านของคุณ</label>
            <div style={styles.slugRow}>
              <span style={styles.slugPrefix}>avelo.com/</span>
              <input
                style={styles.slugInput}
                placeholder="my-shop"
                value={storeSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
              />
            </div>

            <label style={styles.label}>ประเภทธุรกิจ</label>
            <div style={styles.typeGrid}>
              {BUSINESS_TYPES.map((t) => (
                <button
                  key={t.id}
                  style={{
                    ...styles.typeCard,
                    ...(businessType === t.id ? styles.typeCardActive : {}),
                  }}
                  onClick={() => setBusinessType(t.id)}
                >
                  <span style={styles.typeIcon}>{t.icon}</span>
                  <span style={styles.typeLabel}>{t.label}</span>
                  <span style={styles.typeDesc}>{t.desc}</span>
                </button>
              ))}
            </div>

            <button
              style={{ ...styles.primaryBtn, opacity: canNext1 ? 1 : 0.4, marginTop: 32 }}
              onClick={() => canNext1 && setStep(2)}
            >
              ถัดไป →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>เลือก Template</h2>
            <p style={styles.cardSub}>เลือกหน้าตาเว็บไซต์ที่ชอบ แก้ไขได้ทีหลัง</p>

            <div style={styles.templateGrid}>
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  style={{
                    ...styles.templateCard,
                    outline: template === t.id ? "3px solid #1d1d1f" : "2px solid transparent",
                  }}
                  onClick={() => setTemplate(t.id)}
                >
                  <div style={{ ...styles.templatePreview, background: t.color }}>
                    <div style={styles.previewBar}>
                      <div style={{ ...styles.previewDot, background: t.accent }} />
                      <div style={{ ...styles.previewDot, background: t.accent, opacity: 0.5 }} />
                      <div style={{ ...styles.previewDot, background: t.accent, opacity: 0.25 }} />
                    </div>
                    <div style={{ padding: "12px 16px" }}>
                      <div style={{ ...styles.previewLine, background: t.accent, width: "70%", height: 8, marginBottom: 6 }} />
                      <div style={{ ...styles.previewLine, background: t.accent, width: "45%", height: 6, opacity: 0.5, marginBottom: 12 }} />
                      <div style={{ display: "flex", gap: 6 }}>
                        {[1, 2, 3].map((n) => (
                          <div key={n} style={{ flex: 1, height: 40, borderRadius: 6, background: t.accent, opacity: 0.15 }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={styles.templateFooter}>
                    <span style={styles.templateName}>{t.label}</span>
                    {template === t.id && <span style={styles.templateCheck}>✓</span>}
                  </div>
                </button>
              ))}
            </div>

            <button
              style={{ ...styles.primaryBtn, opacity: canNext2 ? 1 : 0.4, marginTop: 32 }}
              onClick={() => canNext2 && setStep(3)}
            >
              ถัดไป →
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>ยืนยันการสร้างร้าน</h2>
            <p style={styles.cardSub}>ตรวจสอบข้อมูลก่อนสร้าง</p>

            <div style={styles.summaryBox}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryKey}>ชื่อร้าน</span>
                <span style={styles.summaryVal}>{storeName}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryKey}>URL</span>
                <span style={styles.summaryVal}>avelo.com/{storeSlug}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryKey}>ประเภท</span>
                <span style={styles.summaryVal}>
                  {BUSINESS_TYPES.find((t) => t.id === businessType)?.icon}{" "}
                  {BUSINESS_TYPES.find((t) => t.id === businessType)?.label}
                </span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryKey}>Template</span>
                <span style={styles.summaryVal}>{TEMPLATES.find((t) => t.id === template)?.label}</span>
              </div>
            </div>

            {error && <p style={styles.errorText}>{error}</p>}

            <button
              style={{ ...styles.primaryBtn, marginTop: 32, opacity: creating ? 0.7 : 1 }}
              onClick={handleFinish}
              disabled={creating}
            >
              {creating ? "⏳ กำลังสร้าง..." : "🚀 สร้างร้านเลย!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f7",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: "14px",
    color: "#6e6e73",
    cursor: "pointer",
    fontWeight: 500,
    width: 80,
    textAlign: "left",
  },
  headerLogo: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1d1d1f",
  },
  stepper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "32px 16px 0",
    gap: 0,
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    transition: "all 0.3s",
  },
  stepLabel: {
    fontSize: "13px",
    transition: "all 0.3s",
  },
  stepLine: {
    width: 48,
    height: 2,
    margin: "0 12px",
    transition: "all 0.3s",
  },
  content: {
    maxWidth: 560,
    margin: "32px auto",
    padding: "0 16px 60px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "36px",
    boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1d1d1f",
    margin: "0 0 6px",
  },
  cardSub: {
    fontSize: "15px",
    color: "#6e6e73",
    margin: "0 0 28px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid #e5e7eb",
    fontSize: "15px",
    color: "#1d1d1f",
    outline: "none",
    boxSizing: "border-box",
    background: "#fafafa",
  },
  slugRow: {
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    background: "#fafafa",
  },
  slugPrefix: {
    padding: "12px 12px 12px 16px",
    fontSize: "14px",
    color: "#6e6e73",
    background: "#f0f0f5",
    borderRight: "1.5px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  slugInput: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    fontSize: "15px",
    color: "#1d1d1f",
    outline: "none",
    background: "transparent",
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginTop: 4,
  },
  typeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 8px",
    borderRadius: "12px",
    border: "1.5px solid #e5e7eb",
    background: "#fafafa",
    cursor: "pointer",
    gap: 4,
    transition: "all 0.2s",
  },
  typeCardActive: {
    border: "1.5px solid #1d1d1f",
    background: "#f0f0f5",
  },
  typeIcon: { fontSize: "24px" },
  typeLabel: { fontSize: "13px", fontWeight: "600", color: "#1d1d1f" },
  typeDesc: { fontSize: "11px", color: "#6e6e73", textAlign: "center" },
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  templateCard: {
    borderRadius: "14px",
    overflow: "hidden",
    border: "none",
    cursor: "pointer",
    padding: 0,
    background: "#fff",
    transition: "all 0.2s",
    boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
  },
  templatePreview: {
    height: 120,
    overflow: "hidden",
  },
  previewBar: {
    display: "flex",
    gap: 5,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  previewLine: {
    borderRadius: 4,
  },
  templateFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderTop: "1px solid #e5e7eb",
  },
  templateName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1d1d1f",
  },
  templateCheck: {
    fontSize: "14px",
    color: "#34c759",
    fontWeight: "700",
  },
  summaryBox: {
    background: "#f5f5f7",
    borderRadius: "14px",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryKey: {
    fontSize: "14px",
    color: "#6e6e73",
    fontWeight: 500,
  },
  summaryVal: {
    fontSize: "14px",
    color: "#1d1d1f",
    fontWeight: 600,
  },
  errorText: {
    fontSize: "14px",
    color: "#ff3b30",
    textAlign: "center",
    marginTop: 16,
  },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#1d1d1f",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  secondaryBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1.5px solid #1d1d1f",
    background: "transparent",
    color: "#1d1d1f",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: 10,
  },
  doneWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f7",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  },
  doneCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "48px 40px",
    textAlign: "center",
    boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
    maxWidth: 400,
    width: "90%",
  },
  doneIcon: { fontSize: "56px", marginBottom: 16 },
  doneTitle: { fontSize: "24px", fontWeight: "700", color: "#1d1d1f", margin: "0 0 8px" },
  doneSubtitle: { fontSize: "15px", color: "#6e6e73", margin: "0 0 28px" },
  doneUrl: { fontWeight: "600", color: "#1d1d1f" },
  doneBtns: { display: "flex", flexDirection: "column", gap: 10 },
};
