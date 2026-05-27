"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const ALL_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const MAX_PER_SLOT = 1; // จองได้กี่คนต่อ slot

function Calendar({ selected, onChange, bookedMap }: {
selected: string;
onChange: (d: string) => void;
bookedMap: Record<string, number>; // date -> จำนวน slot ที่จองไปแล้ว
}) {
const today = new Date();
const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
const year = viewDate.getFullYear();
const month = viewDate.getMonth();
const firstDay = new Date(year, month, 1).getDay();
const daysInMonth = new Date(year, month + 1, 0).getDate();

const toStr = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const isPast = (d: number) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

const getStatus = (d: number) => {
const str = toStr(d);
const booked = bookedMap[str] || 0;
const total = ALL_SLOTS.length * MAX_PER_SLOT;
if (booked >= total) return "full";
if (booked >= total - 2) return "almost";
return "available";
};

const cells = [];
for (let i = 0; i < firstDay; i++) cells.push(null);
for (let i = 1; i <= daysInMonth; i++) cells.push(i);

return (
<div style={{ border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
{/* Header */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#1d1d1f", color: "#fff" }}>
<button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>‹</button>
<span style={{ fontWeight: 700, fontSize: 15 }}>{MONTHS[month]} {year + 543}</span>
<button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>›</button>
</div>

{/* Day labels */}
<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#f5f5f7" }}>
{DAYS.map((d) => (
<div key={d} style={{ textAlign: "center", padding: "8px 0", fontSize: 12, fontWeight: 600, color: "#6e6e73" }}>{d}</div>
))}
</div>

{/* Dates */}
<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: 8, background: "#fff" }}>
{cells.map((d, i) => {
if (!d) return <div key={i} />;
const str = toStr(d);
const past = isPast(d);
const status = past ? "past" : getStatus(d);
const isSelected = selected === str;
const isToday = new Date(year, month, d).toDateString() === today.toDateString();

const bgColor = isSelected ? "#1d1d1f"
: status === "full" ? "#fee2e2"
: status === "almost" ? "#fef9c3"
: status === "past" ? "transparent"
: "#f0fdf4";

const textColor = isSelected ? "#fff"
: status === "full" ? "#ef4444"
: status === "almost" ? "#ca8a04"
: status === "past" ? "#d1d5db"
: "#15803d";

return (
<button key={i}
onClick={() => !past && status !== "full" && onChange(str)}
disabled={past || status === "full"}
style={{
margin: 2, padding: "8px 0", borderRadius: 8, border: isToday && !isSelected ? "2px solid #1d1d1f" : "none",
fontSize: 13, fontWeight: isSelected ? 700 : 500,
background: bgColor, color: textColor,
cursor: past || status === "full" ? "not-allowed" : "pointer",
}}>
{d}
</button>
);
})}
</div>

{/* Legend */}
<div style={{ display: "flex", gap: 16, padding: "10px 16px", borderTop: "1px solid #e5e7eb", background: "#fafafa", flexWrap: "wrap" }}>
{[
{ color: "#f0fdf4", text: "#15803d", label: "วาง" },
{ color: "#fef9c3", text: "#ca8a04", label: "เหลือน้อย" },
{ color: "#fee2e2", text: "#ef4444", label: "เตม" },
].map((l) => (
<div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
<div style={{ width: 14, height: 14, borderRadius: 4, background: l.color, border: `1px solid ${l.text}33` }} />
<span style={{ fontSize: 12, color: "#6e6e73" }}>{l.label}</span>
</div>
))}
</div>
</div>
);
}

export default function Booking() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [date, setDate] = useState("");
const [time, setTime] = useState("");
const [note, setNote] = useState("");
const [submitted, setSubmitted] = useState(false);
const [bookedMap, setBookedMap] = useState<Record<string, number>>({});
const [bookedSlots, setBookedSlots] = useState<string[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
fetchReservations();
}, []);

const fetchReservations = async () => {
const snap = await getDocs(collection(db, "reservations"));
const map: Record<string, number> = {};
const all = snap.docs.map((d) => d.data());
all.forEach((r) => {
if (r.date) map[r.date] = (map[r.date] || 0) + 1;
});
setBookedMap(map);
setLoading(false);
};

useEffect(() => {
if (!date) { setBookedSlots([]); return; }
const fetchSlots = async () => {
const snap = await getDocs(query(collection(db, "reservations"), where("date", "==", date)));
setBookedSlots(snap.docs.map((d) => d.data().time));
};
fetchSlots();
}, [date]);

const handleSubmit = async () => {
if (!name || !email || !date || !time) return alert("กรุณากรอกข้อมูลให้ครบ");
try {
await addDoc(collection(db, "reservations"), { name, email, date, time, note, status: "pending", createdAt: new Date() });
setSubmitted(true);
fetchReservations();
} catch {
alert("เกิดข้อผิดพลาด");
}
};

const formatDate = (d: string) => {
if (!d) return "";
const [y, m, day] = d.split("-");
return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]} ${parseInt(y) + 543}`;
};

if (submitted) return (
<div style={styles.container}>
<div style={styles.card}>
<div style={{ fontSize: 48, textAlign: "center" }}>✅</div>
<h1 style={{ ...styles.title, textAlign: "center" }}>จองสำเร็จ!</h1>
<p style={{ textAlign: "center", color: "#6e6e73" }}>วันที่ {formatDate(date)} เวลา {time}</p>
<button onClick={() => { setSubmitted(false); setDate(""); setTime(""); setName(""); setEmail(""); setNote(""); }} style={styles.button}>
จองอีกครั้ง
</button>
</div>
</div>
);

return (
<div style={styles.container}>
<div style={styles.card}>
<h1 style={styles.title}>จองนัดหมาย</h1>
<p style={styles.subtitle}>เลือกวันและเวลาที่ต้องการ</p>

<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
<input placeholder="ชื่อของคุณ" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
<input type="email" placeholder="อีเมล" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />

<label style={styles.label}>เลือกวันที่</label>
{loading ? <p style={{ color: "#6e6e73", fontSize: 14 }}>กำลังโหลด...</p> : (
<Calendar selected={date} onChange={(d) => { setDate(d); setTime(""); }} bookedMap={bookedMap} />
)}
{date && <p style={{ fontSize: 14, color: "#15803d", fontWeight: 600, textAlign: "center" }}>✓ {formatDate(date)}</p>}

{date && (
<>
<label style={styles.label}>เลือกเวลา</label>
<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
{ALL_SLOTS.map((t) => {
const isBooked = bookedSlots.includes(t);
const isSelected = time === t;
return (
<button key={t} onClick={() => !isBooked && setTime(t)} disabled={isBooked}
style={{
padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: isBooked ? "not-allowed" : "pointer",
border: "1px solid #e5e7eb",
background: isSelected ? "#1d1d1f" : isBooked ? "#fee2e2" : "#f0fdf4",
color: isSelected ? "#fff" : isBooked ? "#ef4444" : "#15803d",
}}>
{t}{isBooked ? " 🔴" : ""}
</button>
);
})}
</div>
</>
)}

<textarea placeholder="หมายเหตุ (ถ้ามี)" value={note} onChange={(e) => setNote(e.target.value)} style={styles.textarea} />
<button onClick={handleSubmit} style={{ ...styles.button, opacity: !name || !email || !date || !time ? 0.5 : 1 }}>
📅 จองเลย
</button>
</div>
</div>
</div>
);
}

const styles: { [key: string]: React.CSSProperties } = {
container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", padding: "40px 20px" },
card: { background: "#fff", padding: "40px", borderRadius: "20px", width: "100%", maxWidth: "500px", boxShadow: "0 2px 20px rgba(0,0,0,0.08)" },
title: { fontSize: "28px", fontWeight: "700", color: "#1d1d1f", marginBottom: "8px" },
subtitle: { fontSize: "15px", color: "#6e6e73", marginBottom: "24px" },
label: { fontSize: 13, fontWeight: 600, color: "#1d1d1f" } as React.CSSProperties,
input: { padding: "14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "15px", outline: "none", color: "#111" },
textarea: { padding: "14px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "15px", outline: "none", color: "#111", minHeight: "80px", resize: "vertical" },
button: { padding: "14px", borderRadius: "10px", border: "none", background: "#1d1d1f", color: "#fff", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
};
