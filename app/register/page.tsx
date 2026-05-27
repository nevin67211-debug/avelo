"use client";

import { useState } from "react";
import "../lib/firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function Register() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

const handleRegister = async (e: React.FormEvent) => {
e.preventDefault();
const auth = getAuth();
try {
await createUserWithEmailAndPassword(auth, email, password);
alert("สมัครสำเร็จ!");
window.location.href = "/login";
} catch (err: any) {
setError(err.message);
}
};

return (
<div style={styles.container}>
<div style={styles.card}>
<h1 style={styles.title}>Create Account</h1>
{error && <p style={styles.error}>{error}</p>}
<form onSubmit={handleRegister} style={styles.form}>
<input
type="email"
placeholder="Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
style={styles.input}
required
/>
<input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
style={styles.input}
required
/>
<button type="submit" style={styles.button}>
Create Account
</button>
</form>
<p style={styles.hint}>Already have an account? <a href="/login" style={{color: "#111", fontWeight: "600"}}>Login</a></p>
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
background: "#f9fafb",
},
card: {
background: "#fff",
padding: "40px",
borderRadius: "16px",
border: "1px solid #e5e7eb",
width: "100%",
maxWidth: "400px",
},
title: {
fontSize: "28px",
fontWeight: "700",
marginBottom: "24px",
textAlign: "center",
color: "#000",
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
button: {
padding: "14px",
borderRadius: "10px",
border: "none",
background: "#111",
color: "#fff",
fontSize: "15px",
fontWeight: "600",
cursor: "pointer",
marginTop: "8px",
},
error: {
color: "red",
fontSize: "14px",
marginBottom: "12px",
},
hint: {
textAlign: "center",
marginTop: "16px",
fontSize: "14px",
color: "#6b7280",
},
};
