"use client";

import React, { useState, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Template {
id: string;
name: string;
tag: string;
color: string;
accent: string;
preview: React.ReactNode;
}

interface Section {
id: string;
type: string;
label: string;
icon: string;
removable: boolean;
}

// ─── Section Library ──────────────────────────────────────────────────────────

const SECTION_LIBRARY: Section[] = [
{ id: "hero", type: "hero", label: "Hero Banner", icon: "◻", removable: false },
{ id: "products", type: "products", label: "Product Grid", icon: "⊞", removable: true },
{ id: "about", type: "about", label: "About Us", icon: "◎", removable: true },
{ id: "testimonials",type:"testimonials",label: "Testimonials", icon: "❝", removable: true },
{ id: "newsletter", type: "newsletter", label: "Newsletter", icon: "✉", removable: true },
{ id: "gallery", type: "gallery", label: "Photo Gallery", icon: "⊡", removable: true },
{ id: "faq", type: "faq", label: "FAQ", icon: "?", removable: true },
{ id: "cta", type: "cta", label: "Call to Action", icon: "→", removable: true },
];

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
{
id: "minimal",
name: "Minimal",
tag: "Clean & simple",
color: "#fafafa",
accent: "#111",
preview: (
<div style={{ width: "100%", height: "100%", background: "#fafafa", padding: 12, borderRadius: 12 }}>
<div style={{ height: 8, width: "60%", background: "#111", borderRadius: 4, marginBottom: 8 }} />
<div style={{ height: 4, width: "90%", background: "#ddd", borderRadius: 4, marginBottom: 4 }} />
<div style={{ height: 4, width: "75%", background: "#ddd", borderRadius: 4, marginBottom: 12 }} />
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
{[0,1,2].map(i => <div key={i} style={{ height: 30, background: "#e8e8e8", borderRadius: 6 }} />)}
</div>
</div>
),
},
{
id: "bold",
name: "Bold",
tag: "High impact",
color: "#111",
accent: "#fff",
preview: (
<div style={{ width: "100%", height: "100%", background: "#111", padding: 12, borderRadius: 12 }}>
<div style={{ height: 10, width: "70%", background: "#fff", borderRadius: 4, marginBottom: 8 }} />
<div style={{ height: 4, width: "85%", background: "#444", borderRadius: 4, marginBottom: 4 }} />
<div style={{ height: 4, width: "60%", background: "#444", borderRadius: 4, marginBottom: 12 }} />
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
{[0,1].map(i => <div key={i} style={{ height: 36, background: "#222", borderRadius: 6, border: "1px solid #333" }} />)}
</div>
</div>
),
},
{
id: "warm",
name: "Warm",
tag: "Cozy & inviting",
color: "#fdf6ee",
accent: "#8b5e3c",
preview: (
<div style={{ width: "100%", height: "100%", background: "#fdf6ee", padding: 12, borderRadius: 12 }}>
<div style={{ height: 8, width: "55%", background: "#8b5e3c", borderRadius: 4, marginBottom: 8 }} />
<div style={{ height: 4, width: "90%", background: "#e8d8c8", borderRadius: 4, marginBottom: 4 }} />
<div style={{ height: 4, width: "70%", background: "#e8d8c8", borderRadius: 4, marginBottom: 12 }} />
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
{[0,1,2].map(i => <div key={i} style={{ height: 30, background: "#f0e4d4", borderRadius: 6 }} />)}
</div>
</div>
),
},
{
id: "fresh",
name: "Fresh",
tag: "Modern & bright",
color: "#f0faf5",
accent: "#1a7a4a",
preview: (
<div style={{ width: "100%", height: "100%", background: "#f0faf5", padding: 12, borderRadius: 12 }}>
<div style={{ height: 8, width: "65%", background: "#1a7a4a", borderRadius: 4, marginBottom: 8 }} />
<div style={{ height: 4, width: "85%", background: "#c0e8d0", borderRadius: 4, marginBottom: 4 }} />
<div style={{ height: 4, width: "70%", background: "#c0e8d0", borderRadius: 4, marginBottom: 12 }} />
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
{[0,1,2].map(i => <div key={i} style={{ height: 30, background: "#d8f0e4", borderRadius: 6 }} />)}
</div>
</div>
),
},
{
id: "luxury",
name: "Luxury",
tag: "Premium feel",
color: "#1a1410",
accent: "#c9a96e",
preview: (
<div style={{ width: "100%", height: "100%", background: "#1a1410", padding: 12, borderRadius: 12 }}>
<div style={{ height: 8, width: "60%", background: "#c9a96e", borderRadius: 4, marginBottom: 8 }} />
<div style={{ height: 4, width: "80%", background: "#3a2e28", borderRadius: 4, marginBottom: 4 }} />
<div style={{ height: 4, width: "65%", background: "#3a2e28", borderRadius: 4, marginBottom: 12 }} />
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
{[0,1].map(i => <div key={i} style={{ height: 36, background: "#2a2018", borderRadius: 6, border: "1px solid #3a2e28" }} />)}
</div>
</div>
),
},
{
id: "playful",
name: "Playful",
tag: "Fun & energetic",
color: "#fff8f0",
accent: "#ff5533",
preview: (
<div style={{ width: "100%", height: "100%", background: "#fff8f0", padding: 12, borderRadius: 12 }}>
<div style={{ height: 10, width: "50%", background: "#ff5533", borderRadius: 99, marginBottom: 8 }} />
<div style={{ height: 4, width: "85%", background: "#ffd8cc", borderRadius: 4, marginBottom: 4 }} />
<div style={{ height: 4, width: "60%", background: "#ffd8cc", borderRadius: 4, marginBottom: 12 }} />
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
{["#ff5533","#ffcc00","#33cc88"].map(c => <div key={c} style={{ height: 28, background: c, borderRadius: 99, opacity: 0.7 }} />)}
</div>
</div>
),
},
];

// ─── Default sections per template ───────────────────────────────────────────

const getDefaultSections = (templateId: string): Section[] => {
const base = [
{ ...SECTION_LIBRARY[0] }, // hero always first
{ ...SECTION_LIBRARY[1] }, // products
{ ...SECTION_LIBRARY[2] }, // about
];
if (templateId === "luxury") base.push({ ...SECTION_LIBRARY[3] }); // testimonials
if (templateId === "playful") base.push({ ...SECTION_LIBRARY[5] }); // gallery
base.push({ ...SECTION_LIBRARY[7] }); // cta always last
return base.map((s, i) => ({ ...s, id: s.type + "_" + i }));
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Onboarding(): ReactNode {
const router = useRouter();
const [step, setStep] = useState<1 | 2 | 3>(1);
const [storeName, setStoreName] = useState("");
const [category, setCategory] = useState("");
const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
const [sections, setSections] = useState<Section[]>(getDefaultSections(TEMPLATES[0].id));

// Drag state
const [dragIndex, setDragIndex] = useState<number | null>(null);
const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
const [draggingLibItem, setDraggingLibItem] = useState<Section | null>(null);

const dragNode = useRef<HTMLDivElement | null>(null);

// ── step helpers ──────────────────────────────────────────────────

const goStep2 = () => {
if (!storeName.trim()) return;
setStep(2);
};

const goStep3 = () => {
setSections(getDefaultSections(selectedTemplate.id));
setStep(3);
};

const finish = () => {
// In real app: save to Firestore, then redirect
router.push("/dashboard");
};

const addSectionFromLibrary = (lib: Section) => {
if (sections.some(s => s.type === lib.type)) return;
const newSection = { ...lib, id: `${lib.type}_${crypto.randomUUID()}` };
setSections(prev => {
const updated = [...prev];
updated.splice(prev.length - 1, 0, newSection);
return updated;
});
};

// ── drag & drop (reorder) ─────────────────────────────────────────

const onDragStart = (i: number) => {
setDragIndex(i);
};

const onDragOver = (e: React.DragEvent, i: number) => {
e.preventDefault();
setDragOverIndex(i);
};

const onDrop = (e: React.DragEvent, targetIndex: number) => {
e.preventDefault();
if (draggingLibItem) {
// Add from library
const already = sections.find(s => s.type === draggingLibItem.type);
if (!already) {
const newSec = { ...draggingLibItem, id: `${draggingLibItem.type}_${crypto.randomUUID()}` };
const updated = [...sections];
updated.splice(targetIndex, 0, newSec);
setSections(updated);
}
setDraggingLibItem(null);
} else if (dragIndex !== null && dragIndex !== targetIndex) {
const updated = [...sections];
const [moved] = updated.splice(dragIndex, 1);
updated.splice(targetIndex, 0, moved);
setSections(updated);
}
setDragIndex(null);
setDragOverIndex(null);
};

const onDragEnd = () => {
setDragIndex(null);
setDragOverIndex(null);
setDraggingLibItem(null);
};

const removeSection = (id: string) => {
setSections(prev => prev.filter(s => s.id !== id));
};

const selectTemplate = (t: Template) => {
setSelectedTemplate(t);
setSections(getDefaultSections(t.id));
};

// ── progress bar ─────────────────────────────────────────────────

const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

// ─────────────────────────────────────────────────────────────────
return (
<>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #f7f7f5; font-family: 'Inter', sans-serif; color: #111; }

.ob-input {
width: 100%;
border: 1.5px solid #e0e0e0;
border-radius: 16px;
padding: 16px 18px;
font-size: 16px;
font-family: 'Inter', sans-serif;
outline: none;
background: #fff;
transition: border-color .2s;
}
.ob-input:focus { border-color: #111; }

.ob-btn {
background: #111;
color: #fff;
border: none;
border-radius: 999px;
padding: 16px 36px;
font-size: 15px;
font-weight: 700;
cursor: pointer;
font-family: 'Inter', sans-serif;
transition: all .2s;
letter-spacing: -0.02em;
}
.ob-btn:hover { background: #000; transform: translateY(-1px); }
.ob-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

.ob-btn-ghost {
background: transparent;
color: #888;
border: 1.5px solid #e0e0e0;
border-radius: 999px;
padding: 14px 28px;
font-size: 14px;
font-weight: 600;
cursor: pointer;
font-family: 'Inter', sans-serif;
transition: all .2s;
}
.ob-btn-ghost:hover { border-color: #bbb; color: #555; }

.tmpl-card {
border: 2px solid #e8e8e8;
border-radius: 20px;
cursor: pointer;
overflow: hidden;
transition: all .2s;
background: #fff;
}
.tmpl-card:hover { border-color: #bbb; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.06); }
.tmpl-card.selected { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,0.08); }

.sec-row {
display: flex;
align-items: center;
gap: 12px;
background: #fff;
border: 1.5px solid #eee;
border-radius: 14px;
padding: 14px 16px;
cursor: grab;
user-select: none;
transition: all .15s;
position: relative;
}
.sec-row:active { cursor: grabbing; }
.sec-row.drag-over { border-color: #111; background: #f5f5f5; }
.sec-row.dragging { opacity: 0.4; }

.lib-item {
display: flex;
align-items: center;
gap: 10px;
padding: 12px 14px;
background: #fff;
border: 1.5px solid #eee;
border-radius: 12px;
cursor: grab;
font-size: 13px;
font-weight: 600;
color: #444;
transition: all .15s;
}
.lib-item:hover { border-color: #bbb; background: #fafafa; }
.lib-item.added { opacity: 0.35; cursor: default; }

.chip {
display: inline-flex;
align-items: center;
padding: 8px 16px;
border-radius: 999px;
border: 1.5px solid #e0e0e0;
font-size: 13px;
font-weight: 600;
cursor: pointer;
transition: all .2s;
background: #fff;
color: #555;
}
.chip:hover { border-color: #999; color: #111; }
.chip.selected { background: #111; color: #fff; border-color: #111; }

@media (max-width: 700px) {
.step3-grid { grid-template-columns: 1fr !important; }
}
`}</style>

{/* TOP NAV */}
<div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(247,247,245,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid #eee" }}>
<div style={{ maxWidth: 880, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
<span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.04em" }}>Avelo</span>

{/* Progress dots */}
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
{[1,2,3].map(n => (
<div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
<div style={{
width: n <= step ? 28 : 10,
height: 10,
borderRadius: 99,
background: n <= step ? "#111" : "#ddd",
transition: "all .4s cubic-bezier(.4,0,.2,1)",
}} />
{n < 3 && <div style={{ width: 20, height: 1, background: "#ddd" }} />}
</div>
))}
</div>

<span style={{ fontSize: 13, color: "#999", fontWeight: 500 }}>Step {step} of 3</span>
</div>

{/* Progress bar */}
<div style={{ height: 2, background: "#eee" }}>
<div style={{ height: "100%", width: `${progress}%`, background: "#111", transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
</div>
</div>

{/* MAIN */}
<div style={{ minHeight: "100vh", paddingTop: 80, paddingBottom: 60, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>

{/* ── STEP 1 ─────────────────────────────────────────────────── */}
{step === 1 && (
<div style={{ width: "100%", maxWidth: 520, margin: "60px auto 0", padding: "0 24px" }}>
<div style={{ textAlign: "center", marginBottom: 48 }}>
<div style={{ display: "inline-flex", width: 56, height: 56, borderRadius: 999, background: "#111", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>🏪</div>
<h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 12 }}>Name your store</h1>
<p style={{ color: "#888", fontSize: 16, lineHeight: 1.6 }}>This is what customers will see when they visit.</p>
</div>

<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
<div>
<input
className="ob-input"
type="text"
placeholder="e.g. Luna Clothing, Fresh Bakes..."
value={storeName}
onChange={e => setStoreName(e.target.value)}
onKeyDown={e => e.key === "Enter" && goStep2()}
autoFocus
style={{ fontSize: 18, padding: "18px 20px", letterSpacing: "-0.01em" }}
/>
<div style={{ marginTop: 8, fontSize: 13, color: "#bbb", paddingLeft: 4 }}>
{storeName.length > 0 ? `avelo.store/${storeName.toLowerCase().replace(/\s+/g, "-")}` : "Your URL will appear here"}
</div>
</div>

<div>
<div style={{ fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 10 }}>What are you selling?</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
{["Fashion", "Food & Drinks", "Beauty", "Electronics", "Home & Living", "Art", "Services", "Other"].map(cat => (
<button key={cat} className={`chip ${category === cat ? "selected" : ""}`} onClick={() => setCategory(cat)}>
{cat}
</button>
))}
</div>
</div>

<button className="ob-btn" disabled={!storeName.trim()} onClick={goStep2} style={{ marginTop: 8 }}>
Continue →
</button>
</div>
</div>
)}

{/* ── STEP 2 ─────────────────────────────────────────────────── */}
{step === 2 && (
<div style={{ width: "100%", maxWidth: 860, margin: "40px auto 0", padding: "0 24px" }}>
<div style={{ textAlign: "center", marginBottom: 40 }}>
<h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 12 }}>Choose a template</h1>
<p style={{ color: "#888", fontSize: 16 }}>You can customize everything later.</p>
</div>

<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
{TEMPLATES.map(t => (
<div
key={t.id}
className={`tmpl-card ${selectedTemplate.id === t.id ? "selected" : ""}`}
onClick={() => selectTemplate(t)}
>
{/* Preview */}
<div style={{ height: 110, background: t.color, padding: 12 }}>
{t.preview}
</div>

{/* Info */}
<div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
<div>
<div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
<div style={{ color: "#999", fontSize: 12, marginTop: 2 }}>{t.tag}</div>
</div>
{selectedTemplate.id === t.id && (
<div style={{ width: 22, height: 22, borderRadius: 999, background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</div>
)}
</div>
</div>
))}
</div>

<div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
<button className="ob-btn-ghost" onClick={() => setStep(1)}>← Back</button>
<button className="ob-btn" onClick={goStep3}>Use {selectedTemplate.name} →</button>
</div>
</div>
)}

{/* ── STEP 3 ─────────────────────────────────────────────────── */}
{step === 3 && (
<div style={{ width: "100%", maxWidth: 980, margin: "30px auto 0", padding: "0 24px" }}>
<div style={{ textAlign: "center", marginBottom: 32 }}>
<h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 8 }}>Customize your layout</h1>
<p style={{ color: "#888", fontSize: 15 }}>Drag to reorder sections. Add or remove blocks from the library.</p>
</div>

<div className="step3-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

{/* ── Canvas ── */}
<div style={{ background: "#fff", borderRadius: 24, border: "1.5px solid #eee", overflow: "hidden" }}>
{/* Store header preview */}
<div style={{ background: selectedTemplate.color, padding: "16px 20px", borderBottom: "1px solid #eee" }}>
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
<div style={{ width: 8, height: 8, borderRadius: 99, background: "#ff5f57" }} />
<div style={{ width: 8, height: 8, borderRadius: 99, background: "#febc2e" }} />
<div style={{ width: 8, height: 8, borderRadius: 99, background: "#28c840" }} />
<div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#999", fontWeight: 500 }}>
avelo.store/{storeName.toLowerCase().replace(/\s+/g, "-")}
</div>
</div>
</div>

{/* Sections list */}
<div
style={{ padding: 16, minHeight: 360, display: "flex", flexDirection: "column", gap: 8 }}
onDragOver={e => {
e.preventDefault();
if (sections.length === 0) setDragOverIndex(0);
}}
onDrop={e => sections.length === 0 && onDrop(e, 0)}
>
{sections.map((sec, i) => (
<div
key={sec.id}
ref={dragIndex === i ? dragNode : undefined}
className={`sec-row${dragOverIndex === i ? " drag-over" : ""}${dragIndex === i ? " dragging" : ""}`}
draggable
onDragStart={() => onDragStart(i)}
onDragOver={e => onDragOver(e, i)}
onDrop={e => onDrop(e, i)}
onDragEnd={onDragEnd}
>
{/* Order badge */}
<div style={{ width: 26, height: 26, borderRadius: 8, background: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#888", flexShrink: 0 }}>
{i + 1}
</div>

{/* Drag handle */}
<div style={{ color: "#ccc", fontSize: 16, letterSpacing: -2, cursor: "grab", flexShrink: 0 }}>⠿</div>

{/* Section icon */}
<div style={{ width: 32, height: 32, borderRadius: 10, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
{sec.icon}
</div>

{/* Name */}
<div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{sec.label}</div>

{/* Tags */}
{!sec.removable && (
<span style={{ fontSize: 11, color: "#bbb", fontWeight: 600, border: "1px solid #eee", borderRadius: 6, padding: "3px 8px" }}>Required</span>
)}

{/* Remove */}
{sec.removable && (
<button
onClick={() => removeSection(sec.id)}
style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: "#f5f5f5", cursor: "pointer", color: "#bbb", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}
onMouseEnter={e => { (e.target as HTMLElement).style.background = "#fee"; (e.target as HTMLElement).style.color = "#e55"; }}
onMouseLeave={e => { (e.target as HTMLElement).style.background = "#f5f5f5"; (e.target as HTMLElement).style.color = "#bbb"; }}
>
×
</button>
)}
</div>
))}

{/* Drop zone hint */}
<div
style={{ border: "2px dashed #ddd", borderRadius: 14, padding: "20px", textAlign: "center", color: "#ccc", fontSize: 13, fontWeight: 500 }}
onDragOver={e => { e.preventDefault(); setDragOverIndex(sections.length); }}
onDrop={e => onDrop(e, sections.length)}
>
Drop a section here to add it
</div>
</div>
</div>

{/* ── Right panel ── */}
<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

{/* Template chip */}
<div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #eee", padding: 20 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Active template</div>
<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
<div style={{ width: 44, height: 30, borderRadius: 8, background: selectedTemplate.color, border: "1px solid #eee", flexShrink: 0 }} />
<div>
<div style={{ fontWeight: 700, fontSize: 14 }}>{selectedTemplate.name}</div>
<div style={{ fontSize: 12, color: "#999" }}>{selectedTemplate.tag}</div>
</div>
<button className="ob-btn-ghost" onClick={() => setStep(2)} style={{ marginLeft: "auto", padding: "8px 14px", fontSize: 12 }}>Change</button>
</div>
</div>

{/* Section library */}
<div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #eee", padding: 20, flex: 1 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Section library</div>
<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
{SECTION_LIBRARY.map(lib => {
const alreadyAdded = sections.some(s => s.type === lib.type);
return (
<div
key={lib.id}
className={`lib-item ${alreadyAdded ? "added" : ""}`}
draggable={!alreadyAdded}
onDragStart={() => !alreadyAdded && setDraggingLibItem(lib)}
onDragEnd={onDragEnd}
onClick={() => addSectionFromLibrary(lib)}
>
<span style={{ fontSize: 14 }}>{lib.icon}</span>
<span>{lib.label}</span>
{alreadyAdded
? <span style={{ marginLeft: "auto", fontSize: 11, color: "#bbb" }}>Added</span>
: <span style={{ marginLeft: "auto", fontSize: 11, color: "#bbb" }}>Drag or click</span>
}
</div>
);
})}
</div>
</div>

{/* Launch button */}
<button className="ob-btn" onClick={finish} style={{ width: "100%", padding: "18px" }}>
🚀 Launch my store
</button>
<button className="ob-btn-ghost" onClick={() => setStep(2)} style={{ width: "100%" }}>
← Back
</button>
</div>
</div>
</div>
)}
</div>
</>
);
}