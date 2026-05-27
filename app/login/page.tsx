"use client";

import { useState } from "react";
import "../lib/firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

const handleLogin = async (e: React.FormEvent) => {
e.preventDefault();
const auth = getAuth();
try {
await signInWithEmailAndPassword(auth, email, password);
window.location.href = "/dashboard";
} catch (err: any) {
setError("Email หรือ Password ไม่ถูกต้อง");
}
};

return (
<div style={styles.container}>
<div style={styles.card}>
<h1 style={styles.title}>Login</h1>
{error && <p style={styles.error}>{error}</p>}
<form onSubmit={handleLogin} style={styles.form}>
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
Login
</button>
</form>
<p style={styles.hint}>Don't have an account? <a href="/register" style={{color: "#111", fontWeight: "600"}}>Create Account</a></p>
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
