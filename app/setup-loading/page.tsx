"use client";

import React, { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function SetupLoading(): ReactNode {
  const router = useRouter();

  useEffect(() => {
    // จำลองเวลาในการตั้งค่าระบบ
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: "'Outfit', sans-serif",
      background: '#fcfcfc'
    }}>
      <style jsx>{`
        .brand-loading {
          font-size: 32px;
          font-weight: 800;
          color: #000;
          margin-bottom: 32px;
          letter-spacing: -1px;
        }
        .spinner {
          width: 40px; height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 24px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      
      {/* เพิ่มชื่อแบรนด์ AVELO เข้าไปในหน้า Loading */}
      <div className="brand-loading">AVELO</div>

      <div className="spinner"></div>
      
      <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Setting up your workspace...</h2>
      <p style={{ color: '#666', marginTop: '8px' }}>This will only take a moment.</p>
    </div>
  );
}