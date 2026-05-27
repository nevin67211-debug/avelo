"use client";

import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Booking() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [date, setDate] = useState("");
const [time, setTime] = useState("");
const [note, setNote] = useState("");
const [submitted, setSubmitted] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
try {
await addDoc(collection(db, "reservations"), {
name,
email,
date,
time,
note,
status: "pending",
createdAt: new Date(),
});
setSubmitted(true);
} catch (err) {
alert("Error booking");
}
};

if (submitted) return (
<div style={styles.container}>
<div style={styles.card}>
<div style={{ fontSize: "48px", textAlign: "center" }}>✅</div>
<h1 style={{ ...styles.title, textAlign: "center" }}>Booking Confirmed!</h1>
<p style={{ textAlign: "center", color: "#6e6e73" }}>We'll see you on {date} at {time}</p>
<button onClick={() => setSubmitted(false)} style={styles.button}>Book again</button>
</div>
</div>
);

return (
<div style={styles.container}>
<div style={styles.card}>
<h1 style={styles.title}>Book an Appointment</h1>
<p style={styles.subtitle}>Fill in your details and we'll confirm your booking.</p>
<form onSubmit={handleSubmit} style={styles.form}>
<input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
<input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
<input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} required />
<input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={styles.input} required />
<textarea placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} style={styles.textarea} />
<button type="submit" style={styles.button}>Book Now</button>
</form>
</div>
</div>
);
}

const styles: { [key: string]: React.CSSProperties } = {
container: {
minHeight: "100vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
background: "#f5f5f7",
fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
padding: "40px 20px",
},
card: {
background: "#fff",
padding: "40px",
borderRadius: "20px",
width: "100%",
maxWidth: "480px",
boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
},
title: {
fontSize: "28px",
fontWeight: "700",
color: "#1d1d1f",
marginBottom: "8px",
},
subtitle: {
fontSize: "15px",
color: "#6e6e73",
marginBottom: "24px",
},
form: {
display: "flex",
flexDirection: "column",
gap: "12px",
},
input: {
padding: "14px",
borderRadius: "10px",
border: "1px solid #e5e7eb",
fontSize: "15px",
outline: "none",
color: "#111",
},
textarea: {
padding: "14px",
borderRadius: "10px",
border: "1px solid #e5e7eb",
fontSize: "15px",
outline: "none",
color: "#111",
minHeight: "100px",
resize: "vertical",
},
button: {
padding: "14px",
borderRadius: "10px",
border: "none",
background: "#1d1d1f",
color: "#fff",
fontSize: "15px",
fontWeight: "600",
cursor: "pointer",
marginTop: "8px",
},
};
