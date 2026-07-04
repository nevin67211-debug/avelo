"use client";



import React, { useState, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { db } from "./lib/firebase";

import { collection, addDoc } from "firebase/firestore";



export default function Home(): ReactNode {

  const router = useRouter();

  const [email, setEmail] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const [faqOpen, setFaqOpen] = useState<number | null>(null);



  const plans = [

    { name: "Launch", price: "$29", features: ["Basic landing pages", "Email support", "1 Custom domain"] },

    { name: "Quantum", price: "$99", features: ["Everything in Launch", "Advanced analytics", "Priority support", "3 Custom domains"] },

    { name: "Piercing", price: "$249", features: ["Everything in Quantum", "Unlimited sites", "24/7 Phone support", "Custom integrations"] },

  ];



  const faqs = [

    { q: "Is there a free trial?", a: "Yes, 6-day full-access trial to explore all features." },

    { q: "Can I cancel anytime?", a: "Absolutely. You can cancel with one click from your dashboard." },

    { q: "What support is included?", a: "We provide email support for Launch, and 24/7 priority for others." },

  ];



  const handleRegister = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      await addDoc(collection(db, "emails"), { email, createdAt: new Date() });

      setSubmitted(true);

    } catch {
      alert("Connection error.");
    }

  };



  return (

    <>

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

        :root { --ink: #0a0a0a; --bg: #ffffff; }

        body { font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--ink); margin: 0; overflow-x: hidden; }



        button { transition: all 0.3s ease !important; cursor: pointer; }

       

        .nav-btn-login { background: transparent; border: 2px solid transparent; color: #000; padding: 10px 22px; border-radius: 10px; font-weight: 600; }

        .nav-btn-login:hover { background: #000; color: #fff; }



        .nav-btn-get { background: #000; color: #fff; padding: 10px 22px; border-radius: 10px; border: 2px solid #000; font-weight: 600; }

        .nav-btn-get:hover { background: #333; transform: translateY(-2px); }



        /* เอฟเฟกต์ Slide In สำหรับปุ่ม */

        .btn-slide {

            padding: 12px 24px; background: #000; color: #fff; border-radius: 16px; border: none; font-weight: 600;

            transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) !important;

            position: relative; overflow: hidden;

        }

        .btn-slide:hover { background: #222; transform: translateX(5px); padding-right: 32px; }



        /* เอฟเฟกต์ Focus สำหรับช่องใส่อีเมล */

        .email-box {

            display: flex; background: #ffffff; padding: 6px; border-radius: 20px; border: 1px solid #e0e0e0; width: 500px;

            transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) !important;

        }

        .email-box:focus-within {

            width: 540px; border-color: #000; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transform: scale(1.02);

        }

        .email-in { flex: 1; background: transparent; border: none; padding: 12px 20px; outline: none; font-size: 16px; color: #000; }



        .btn-select {

          width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e0e0e0; background: #f9f9f9;

          font-size: 14px; font-weight: 500; color: #666; transition: all 0.4s ease !important;

        }

        .btn-select:hover { background: #000 !important; color: #fff !important; border-color: #000 !important; transform: translateY(-2px); }

       

        .nav-sticky { position: fixed; top: 0; width: 100%; z-index: 1000; padding: 24px 0; background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); }

        .blobs { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; }

        .blob { position: absolute; width: 600px; height: 600px; background: rgba(0,0,0,0.03); filter: blur(120px); border-radius: 50%; }

        .plan { position: relative; background: #fff; border: 1px solid #ddd; border-radius: 24px; padding: 40px; cursor: pointer; transition: 0.6s; }

        .plan:hover { transform: translateY(-15px); box-shadow: 0 30px 60px rgba(0,0,0,0.08); border-color: #000; }

        .faq-ans { height: 0; overflow: hidden; transition: 0.4s ease; color: #666; }

        .faq-ans.open { height: auto; padding-top: 10px; }

        .hero-full { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }

        .wrap { max-width: 1000px; margin: 0 auto; padding: 0 32px; }

        @media (max-width: 768px) { .email-box { width: 90%; } }

      `}</style>



      <div className="blobs"><div className="blob" style={{ top: "-200px", left: "-200px" }} /><div className="blob" style={{ bottom: "-200px", right: "-200px" }} /></div>



      <nav className="nav-sticky">

        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          <div style={{ fontWeight: 800, fontSize: '22px' }}>Avelo.</div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>

            <button className="nav-btn-login" onClick={() => router.push('/login')}>Log in</button>

            <button className="nav-btn-get" onClick={() => router.push('/shop')}>Shop now</button>

          </div>

        </div>

      </nav>



      <section className="hero-full">

        <h1 style={{ fontSize: 'clamp(60px, 10vw, 100px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '24px' }}>

          Ecommerce Store<br />for Modern Brands.

        </h1>

        <p style={{ color: '#666', fontSize: '20px', marginBottom: '40px' }}>Launch a polished shopping experience with products, cart, checkout, and admin order management.</p>

       

        {submitted ? (

          <div style={{ padding: '18px 32px', background: '#000', color: '#fff', borderRadius: '12px', fontWeight: 600 }}>🎉 Thank you!</div>

        ) : (

          <form onSubmit={handleRegister} className="email-box">

            <input className="email-in" type="email" placeholder="name@company.com" required onChange={(e) => setEmail(e.target.value)} />

            <button type="submit" className="btn-slide">Start shopping</button>

          </form>

        )}

      </section>



      <main style={{ paddingBottom: '150px' }}>

        <section className="wrap" style={{ marginBottom: '120px' }}>

          <h2 style={{ textAlign: 'center', fontSize: '42px', marginBottom: '48px', fontWeight: 800 }}>Simple Pricing</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

            {plans.map((p) => (

              <div key={p.name} className="plan" onClick={() => router.push('/get-started')}>

                <h3>{p.name}</h3>

                <div style={{ fontSize: '48px', fontWeight: 800, margin: '20px 0' }}>{p.price}</div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', color: '#666', fontSize: '15px' }}>

                  {p.features.map((feat, i) => <li key={i} style={{ marginBottom: '8px' }}>✓ {feat}</li>)}

                </ul>

                <button className="btn-select">Select Plan</button>

              </div>

            ))}

          </div>

        </section>



        <section className="wrap">

          <h2 style={{ textAlign: 'center', fontSize: '42px', marginBottom: '48px', fontWeight: 800 }}>Common Questions</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

            {faqs.map((f, i) => (

              <div key={i} className="plan" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>

                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{faqOpen === i ? '−' : '+'}</div>

                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{f.q}</h3>

                <div className={`faq-ans ${faqOpen === i ? 'open' : ''}`}>{f.a}</div>

              </div>

            ))}

          </div>

        </section>

      </main>

    </>

  );

}