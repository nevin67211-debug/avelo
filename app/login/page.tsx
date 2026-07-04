"use client";

import React, { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function AveloLogin(): ReactNode {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Unable to sign in. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
        body { font-family: 'Outfit', sans-serif; background: #fcfcfc; margin: 0; }
        
        .navbar { display: flex; justify-content: space-between; align-items: center; padding: 40px 60px; }
        .brand { font-weight: 800; font-size: 28px; color: #000; cursor: pointer; }
        
        /* Card ปรับให้ดูนิ่งและสะอาดตา */
        .card { max-width: 420px; margin: 40px auto; padding: 48px; background: #fff; border: 1px solid #eee; border-radius: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        
        /* ปรับ Input ให้มองเห็นเป็นสีเทา */
        .input-field { 
            width: 100%; padding: 18px; margin: 12px 0; 
            border: 1px solid #e0e0e0; border-radius: 16px; 
            font-size: 16px; color: #333; /* สีเทาเข้มสำหรับตัวอักษร */
            background: #fcfcfc; /* พื้นหลังเทาอ่อนๆ */
            outline: none; transition: 0.3s; 
        }
        .input-field::placeholder { color: #aaa; } /* สีเทาสำหรับ Placeholder */
        .input-field:focus { border-color: #000; color: #000; }
        
        /* Buttons */
        .btn-primary { width: 100%; padding: 18px; background: #000; color: #fff; border: none; border-radius: 16px; font-weight: 600; cursor: pointer; margin-top: 10px; }
        .btn-google { 
            width: 100%; padding: 16px; background: #fff; border: 1px solid #e5e5e5; 
            border-radius: 16px; display: flex; align-items: center; justify-content: center; 
            gap: 12px; cursor: pointer; margin-bottom: 20px; font-weight: 600; color: #000;
        }
      `}</style>

      <nav className="navbar">
        <div className="brand" onClick={() => router.push('/')}>AVELO</div>
      </nav>

      <div className="card">
        {/* หัวข้อสีดำสนิท */}
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#000', marginBottom: '8px' }}>Welcome back</h2>
        {/* ข้อความรองสีเทา */}
        <p style={{ color: '#888', marginBottom: '30px' }}>Enter your details to access your account.</p>

        <button className="btn-google">
            {/* ไอคอน Google */}
            <svg width="20" height="20" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.86 2.08-1.82 2.74v2.27h2.89c1.68-1.54 2.65-3.8 2.65-6.65z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.95-2.18l-2.89-2.27c-.8.54-1.82.86-3.06.86-2.35 0-4.34-1.59-5.05-3.73H.95v2.33C2.42 15.9 5.48 18 9 18z"/><path fill="#FBBC05" d="M3.95 10.68c-.18-.54-.28-1.12-.28-1.72s.1-1.18.28-1.72V4.91H.95C.34 6.13 0 7.51 0 9s.34 2.87.95 4.09l3-2.32z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.47.8 11.43 0 9 0 5.48 0 2.42 2.1.95 4.91l3 2.33C4.66 5.1 6.65 3.58 9 3.58z"/></svg>
            Continue with Google
        </button>

        <div style={{ textAlign: 'center', color: '#ccc', margin: '10px 0', fontSize: '14px' }}>OR</div>

        <form onSubmit={handleLogin}>
          <input className="input-field" placeholder="Email address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input className="input-field" type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Signing in..." : "Log in"}</button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '20px', color: '#888' }}>
            Do not have an account? <a href="/get-started" style={{ color: '#000', fontWeight: 600, textDecoration: 'none' }}>Sign up</a>
        </p>
      </div>
    </>
  );
}