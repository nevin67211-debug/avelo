'use client';

import React, { useState } from 'react';

// โครงสร้างข้อมูล Metadata ของแต่ละ Section สำหรับ Right Settings Panel
const sectionMeta = {
  header: { tag: 'แถบหัวเว็บ', title: 'ตั้งค่าแถบหัวเว็บ', sub: 'จัดการเมนู โลโก้ และไอคอนด้านบน' },
  hero: { tag: 'แบนเนอร์หลัก', title: 'ตั้งค่าแบนเนอร์หลัก', sub: 'แก้ไขข้อความ สี และระยะห่างของส่วนนี้' },
  grid: { tag: 'สินค้าแนะนำ', title: 'ตั้งค่าสินค้าแนะนำ', sub: 'เลือกคอลเลกชันและจำนวนสินค้าที่แสดง' },
  text: { tag: 'ข้อความ + ปุ่ม', title: 'ตั้งค่าข้อความและปุ่ม', sub: 'ข้อความสั้นๆ พร้อมปุ่มเรียกร้องให้ทำ' },
  footer: { tag: 'ท้ายเว็บ', title: 'ตั้งค่าท้ายเว็บ', sub: 'ลิงก์ โซเชียล และข้อมูลติดต่อท้ายเว็บ' }
};

export default function StoreEditor() {
  // --- UI STATES ---
  const [activeSection, setActiveSection] = useState<'header' | 'hero' | 'grid' | 'text' | 'footer'>('hero');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');
  
  // สถานะการซ่อน/แสดงบล็อก (Visibility)
  const [visibleSections, setVisibleSections] = useState({
    header: true,
    hero: true,
    grid: true,
    text: true,
    footer: true
  });

  // --- CONTENT STATES (สำหรับผูกอินพุตแบบ Real-time บน Canvas) ---
  const [heroEyebrow, setHeroEyebrow] = useState('คอลเลกชันใหม่');
  const [heroHeading, setHeroHeading] = useState('ดีไซน์เรียบ\nใช้งานได้จริง');
  const [heroDesc, setHeroDesc] = useState('สินค้าที่ตัดทอนทุกอย่างที่ไม่จำเป็นออก เหลือไว้แค่สิ่งที่ใช้งานดี');
  const [heroCta, setHeroCta] = useState('ช้อปเลย');

  // --- STYLE STATES ---
  const [heroAlign, setHeroAlign] = useState<'left' | 'center' | 'right'>('center');
  const [heroBgColor, setHeroBgColor] = useState('#ffffff');
  const [heroTextColor, setHeroTextColor] = useState('#0a0a0a');
  const [heroFontSize, setHeroFontSize] = useState(34);
  const [heroPadding, setHeroPadding] = useState(64);
  const [hasPattern, setHasPattern] = useState(true);
  const [roundedCta, setRoundedCta] = useState(true);

  // --- ADVANCED STATES ---
  const [hideHeroOnMobile, setHideHeroOnMobile] = useState(false);

  // ฟังก์ชันสลับการมองเห็นผ่านไอคอนดวงตา
  const toggleVisibility = (key: keyof typeof visibleSections, e: React.MouseEvent) => {
    e.stopPropagation(); // ไม่ให้ไปทับอีเวนต์คลิกแถว
    setVisibleSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentMeta = sectionMeta[activeSection];

  return (
    <>
      {/* ฝังฟอนต์ Google Fonts และ CSS Styles ดั้งเดิมผ่าน Global/Scoped Injection */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: #ffffff; --panel: #f6f6f5; --panel-2: #ffffff; --line: #e2e2e0;
          --line-strong: #c9c9c6; --ink: #111111; --ink-soft: #6b6b68; --ink-faint: #a3a3a0;
          --black: #0a0a0a; --white: #ffffff; --canvas-frame: #1a1a1a; --focus: #111111;
          --radius: 6px; --disp: 'Archivo', sans-serif; --body: 'Inter', sans-serif; --mono: 'JetBrains Mono', monospace;
        }
        .app-container * { box-sizing: border-box; }
        .app-container { font-family: var(--body); color: var(--ink); background: var(--bg); -webkit-font-smoothing: antialiased; }
        .app-container button { font-family: inherit; }
        .app-container ::selection { background: #111; color: #fff; }

        .app { display: grid; grid-template-rows: 52px 1fr; height: 100vh; min-height: 600px; }
        .topbar { display: flex; align-items: center; gap: 14px; padding: 0 14px; border-bottom: 1px solid var(--line); background: var(--white); z-index: 10; }
        .brand { display: flex; align-items: center; gap: 8px; font-family: var(--disp); font-weight: 700; font-size: 14px; letter-spacing: .02em; padding-right: 12px; border-right: 1px solid var(--line); height: 28px; }
        .brand .mark { width: 18px; height: 18px; background: var(--black); border-radius: 3px; position: relative; flex: none; }
        .brand .mark::after { content: ""; position: absolute; inset: 4px; border: 1.4px solid var(--white); }
        .page-title { font-size: 13px; color: var(--ink-soft); display: flex; align-items: center; gap: 6px; }
        .page-title b { color: var(--ink); font-weight: 600; }
        .page-title svg { opacity: .5; }
        .topbar-spacer { flex: 1; }
        .icon-btn { width: 30px; height: 30px; border: 1px solid transparent; background: transparent; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink); }
        .icon-btn:hover { background: var(--panel); border-color: var(--line); }
        .icon-btn:disabled { opacity: .3; cursor: default; }
        .icon-btn:disabled:hover { background: transparent; border-color: transparent; }

        .device-switch { display: flex; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 2px; gap: 2px; }
        .device-switch button { width: 30px; height: 26px; border: none; background: transparent; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink-soft); }
        .device-switch button.active { background: var(--white); color: var(--ink); box-shadow: 0 1px 2px rgba(0,0,0,.08); }

        .btn { font-size: 13px; font-weight: 600; padding: 0 14px; height: 32px; border-radius: 7px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .btn-ghost { background: transparent; border: 1px solid var(--line); color: var(--ink); }
        .btn-ghost:hover { border-color: var(--line-strong); }
        .btn-dark { background: var(--black); border: 1px solid var(--black); color: var(--white); }
        .btn-dark:hover { background: #000; }

        .main { display: grid; grid-template-columns: 264px 1fr 300px; min-height: 0; }
        .sidebar-left { border-right: 1px solid var(--line); background: var(--panel); display: flex; flex-direction: column; min-height: 0; }
        .side-head { padding: 14px 14px 10px; display: flex; align-items: center; justify-content: space-between; }
        .side-head h2 { font-family: var(--disp); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-soft); margin: 0; font-weight: 700; }
        .tpl-select { margin: 0 14px 12px; border: 1px solid var(--line); background: var(--white); border-radius: 7px; padding: 9px 10px; font-size: 13px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-weight: 500; }
        .section-list { flex: 1; overflow-y: auto; padding: 0 10px 10px; display: flex; flex-direction: column; gap: 2px; }
        .section-group-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-faint); padding: 10px 6px 4px; }
        
        .sec-row { display: flex; align-items: center; gap: 8px; padding: 9px 8px; border-radius: 7px; cursor: pointer; border: 1px solid transparent; font-size: 13px; color: var(--ink); position: relative; }
        .sec-row:hover { background: rgba(0,0,0,.04); }
        .sec-row.selected { background: var(--white); border-color: var(--line-strong); box-shadow: 0 1px 2px rgba(0,0,0,.05); }
        .sec-row .grip { color: var(--ink-faint); cursor: grab; display: flex; }
        .sec-row .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-faint); flex: none; }
        .sec-row.selected .dot { background: var(--black); }
        .sec-row .name { flex: 1; }
        .sec-row .eye { color: var(--ink-faint); display: flex; opacity: 0; font-style: normal; }
        .sec-row:hover .eye, .sec-row.selected .eye { opacity: 1; }
        .sec-row .eye:hover { color: var(--ink); }
        .sec-row.hidden-sec { color: var(--ink-faint); }
        .sec-row.hidden-sec .eye { opacity: 1; color: var(--ink); }

        .add-section-btn { margin: 10px 14px 14px; border: 1px dashed var(--line-strong); background: transparent; border-radius: 8px; padding: 9px; font-size: 13px; font-weight: 600; color: var(--ink-soft); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .add-section-btn:hover { border-color: var(--ink); color: var(--ink); background: var(--white); }

        .canvas-wrap { background: #efefec; background-image: radial-gradient(#dcdcd9 1px, transparent 1px); background-size: 18px 18px; display: flex; align-items: flex-start; justify-content: center; padding: 28px 24px; overflow: auto; min-height: 0; }
        .device-frame { background: var(--canvas-frame); border-radius: 14px; padding: 10px; transition: width .25s ease; width: 100%; max-width: 1040px; box-shadow: 0 20px 40px -12px rgba(0,0,0,.35); }
        .device-frame.tablet { max-width: 600px; }
        .device-frame.mobile { max-width: 340px; }
        .device-bar { display: flex; justify-content: center; padding: 2px 0 8px; }
        .device-bar span { width: 44px; height: 4px; border-radius: 2px; background: #3c3c3c; }
        .site { background: var(--white); border-radius: 8px; overflow: hidden; }

        .blk { position: relative; border: 1.5px dashed transparent; cursor: pointer; }
        .blk:hover { border-color: #c9c9c6; }
        .blk.active { border-color: var(--black); border-style: solid; }
        .blk-tag { position: absolute; top: -1px; left: -1.5px; transform: translateY(-100%); background: var(--black); color: var(--white); font-family: var(--mono); font-size: 10px; letter-spacing: .04em; padding: 3px 7px; border-radius: 4px 4px 0 0; display: none; white-space: nowrap; }
        .blk.active .blk-tag { display: block; }
        .blk.is-hidden { display: none !important; }

        .s-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 28px; border-bottom: 1px solid #eee; font-family: var(--disp); font-weight: 700; font-size: 15px; }
        .s-header nav { display: flex; gap: 20px; font-family: var(--body); font-weight: 500; font-size: 12.5px; color: #444; }
        .s-header .icons { display: flex; gap: 14px; color: #111; }

        .s-hero { padding: 64px 28px; text-align: center; }
        .s-hero.has-pattern { background-image: repeating-linear-gradient(135deg, rgba(100,100,100,0.04) 0 2px, transparent 2px 14px); }
        .s-hero .eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #777; margin-bottom: 10px; }
        .s-hero h1 { font-family: var(--disp); line-height: 1.1; margin: 0 0 14px; font-weight: 800; letter-spacing: -.01em; }
        .s-hero p { color: #555; max-width: 420px; margin: 0 auto 20px; font-size: 14px; opacity: 0.9; }
        .s-hero .cta { display: inline-block; background: #0a0a0a; color: #fff; padding: 11px 22px; border-radius: 0px; font-size: 13px; font-weight: 600; }
        .s-hero .cta.rounded { border-radius: 6px; }

        .s-grid { padding: 36px 28px; }
        .s-grid h3 { font-family: var(--disp); font-size: 18px; margin: 0 0 16px; font-weight: 700; }
        .grid-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .card { border: 1px solid #ececec; border-radius: 8px; overflow: hidden; }
        .card .thumb { aspect-ratio: 1; background: linear-gradient(135deg,#efefef,#f8f8f8); display: flex; align-items: center; justify-content: center; color: #c7c7c7; }
        .card .info { padding: 10px 12px; }
        .card .info .n { font-size: 12.5px; font-weight: 600; }
        .card .info .p { font-size: 12px; color: #777; margin-top: 2px; }

        .s-text { padding: 32px 28px; text-align: center; }
        .s-text p { max-width: 480px; margin: 0 auto; font-size: 14px; color: #555; line-height: 1.7; }

        .s-footer { padding: 28px 28px 24px; background: #0a0a0a; color: #e8e8e8; display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 18px; font-size: 12px; }
        .s-footer .col-title { font-family: var(--disp); font-weight: 700; font-size: 12px; margin-bottom: 8px; color: #fff; }
        .s-footer .col div { color: #999; margin-bottom: 6px; }

        @media (max-width: 700px) {
          .device-frame.mobile .s-header nav { display: none; }
          .device-frame.mobile .grid-cards { grid-template-columns: 1fr; }
          .device-frame.mobile .s-footer { grid-template-columns: 1fr; }
        }
        
        .device-frame.mobile .hero-mobile-hide { display: none !important; }

        .sidebar-right { border-left: 1px solid var(--line); background: var(--white); display: flex; flex-direction: column; min-height: 0; }
        .rp-head { padding: 14px 16px 0; }
        .rp-title { font-family: var(--disp); font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .rp-sub { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
        .tabs { display: flex; gap: 2px; margin: 14px 16px 0; background: var(--panel); border-radius: 8px; padding: 2px; }
        .tabs button { flex: 1; border: none; background: transparent; padding: 7px 0; font-size: 12.5px; font-weight: 600; color: var(--ink-soft); border-radius: 6px; cursor: pointer; }
        .tabs button.active { background: var(--white); color: var(--ink); box-shadow: 0 1px 2px rgba(0,0,0,.08); }

        .rp-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 18px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field label { font-size: 12px; font-weight: 600; color: var(--ink); display: flex; justify-content: space-between; align-items: center; }
        .field label .val { font-family: var(--mono); font-weight: 400; color: var(--ink-soft); font-size: 11px; }
        .input { border: 1px solid var(--line); border-radius: 7px; padding: 8px 10px; font-size: 13px; font-family: inherit; color: var(--ink); background: var(--white); }
        .input:focus { border-color: var(--ink); outline: none; }
        textarea.input { resize: vertical; min-height: 60px; font-family: inherit; line-height: 1.5; }

        .align-group { display: flex; border: 1px solid var(--line); border-radius: 7px; overflow: hidden; width: fit-content; }
        .align-group button { width: 34px; height: 32px; border: none; background: var(--white); border-right: 1px solid var(--line); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--ink-soft); }
        .align-group button:last-child { border-right: none; }
        .align-group button.active { background: var(--black); color: var(--white); }

        .swatches { display: flex; gap: 8px; flex-wrap: wrap; }
        .swatch { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--line); cursor: pointer; position: relative; }
        .swatch.active::after { content: ""; position: absolute; inset: -4px; border: 1.5px solid var(--black); border-radius: 50%; }

        .slider-row { display: flex; align-items: center; gap: 10px; }
        input[type=range] { -webkit-appearance: none; flex: 1; height: 3px; background: var(--line-strong); border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--black); cursor: pointer; border: 2px solid var(--white); box-shadow: 0 0 0 1px var(--line-strong); }

        .toggle-row { display: flex; align-items: center; justify-content: space-between; }
        .toggle-row .t-label { font-size: 13px; font-weight: 500; }
        .toggle-row .t-sub { font-size: 11px; color: var(--ink-soft); margin-top: 1px; }
        .switch { width: 36px; height: 20px; background: var(--line-strong); border-radius: 999px; position: relative; cursor: pointer; flex: none; border: none; }
        .switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--white); transition: left .15s ease; }
        .switch.on { background: var(--black); }
        .switch.on::after { left: 18px; }

        .select-fake { border: 1px solid var(--line); border-radius: 7px; padding: 8px 10px; font-size: 13px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: var(--white); }
        .divider { height: 1px; background: var(--line); margin: 0 -16px; }
        .rp-footer { padding: 12px 16px 16px; border-top: 1px solid var(--line); display: flex; gap: 8px; }
        .rp-footer button { flex: 1; }
        .section-badge { font-family: var(--mono); font-size: 10px; color: var(--ink-faint); letter-spacing: .05em; }

        ::-webkit-scrollbar { width: 9px; height: 9px; }
        ::-webkit-scrollbar-thumb { background: #cfcfcc; border-radius: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
      ` }} />

      <div className="app-container">
        <div className="app">
          
          {/* TOP BAR */}
          <header className="topbar">
            <div className="brand">
              <div className="mark"></div>
              MONO
            </div>
            <div className="page-title">
              <span>ธีม</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <b>หน้าแรก</b>
            </div>

            <div className="topbar-spacer"></div>

            <button className="icon-btn" title="เลิกทำ" aria-label="เลิกทำ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 14l-4-4 4-4M5 10h9a5 5 0 010 10h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="icon-btn" title="ทำซ้ำ" aria-label="ทำซ้ำ" disabled>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 14l4-4-4-4M19 10h-9a5 5 0 000 10h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            {/* Device Switcher */}
            <div className="device-switch" role="group" aria-label="เปลี่ยนขนาดหน้าจอ">
              <button className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')} title="เดสก์ท็อป">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><path d="M8 20h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
              <button className={device === 'tablet' ? 'active' : ''} onClick={() => setDevice('tablet')} title="แท็บเล็ต">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg>
              </button>
              <button className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')} title="มือถือ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M11 19h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
            </div>

            <button className="btn btn-ghost">ดูตัวอย่าง</button>
            <button className="btn btn-dark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              เผยแพร่
            </button>
          </header>

          <div className="main">
            
            {/* LEFT SIDEBAR: STRUCTURE */}
            <aside className="sidebar-left">
              <div className="side-head"><h2>โครงหน้า</h2></div>
              <div className="tpl-select">
                <span>หน้าแรก</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>

              <div className="section-list">
                <div className="section-group-label">ทั่วทั้งเว็บไซต์</div>
                <div className={`sec-row ${activeSection === 'header' ? 'selected' : ''} ${!visibleSections.header ? 'hidden-sec' : ''}`} onClick={() => setActiveSection('header')}>
                  <span className="grip">⠿</span><span className="dot"></span>
                  <span className="name">แถบหัวเว็บ</span>
                  <span className="eye" onClick={(e) => toggleVisibility('header', e)}>{visibleSections.header ? '👁' : '🚫'}</span>
                </div>

                <div className="section-group-label">เนื้อหาหน้านี้</div>
                <div className={`sec-row ${activeSection === 'hero' ? 'selected' : ''} ${!visibleSections.hero ? 'hidden-sec' : ''}`} onClick={() => setActiveSection('hero')}>
                  <span className="grip">⠿</span><span className="dot"></span>
                  <span className="name">แบนเนอร์หลัก</span>
                  <span className="eye" onClick={(e) => toggleVisibility('hero', e)}>{visibleSections.hero ? '👁' : '🚫'}</span>
                </div>
                <div className={`sec-row ${activeSection === 'grid' ? 'selected' : ''} ${!visibleSections.grid ? 'hidden-sec' : ''}`} onClick={() => setActiveSection('grid')}>
                  <span className="grip">⠿</span><span className="dot"></span>
                  <span className="name">สินค้าแนะนำ</span>
                  <span className="eye" onClick={(e) => toggleVisibility('grid', e)}>{visibleSections.grid ? '👁' : '🚫'}</span>
                </div>
                <div className={`sec-row ${activeSection === 'text' ? 'selected' : ''} ${!visibleSections.text ? 'hidden-sec' : ''}`} onClick={() => setActiveSection('text')}>
                  <span className="grip">⠿</span><span className="dot"></span>
                  <span className="name">ข้อความ + ปุ่ม</span>
                  <span className="eye" onClick={(e) => toggleVisibility('text', e)}>{visibleSections.text ? '👁' : '🚫'}</span>
                </div>

                <div className="section-group-label">ทั่วทั้งเว็บไซต์</div>
                <div className={`sec-row ${activeSection === 'footer' ? 'selected' : ''} ${!visibleSections.footer ? 'hidden-sec' : ''}`} onClick={() => setActiveSection('footer')}>
                  <span className="grip">⠿</span><span className="dot"></span>
                  <span className="name">ท้ายเว็บ</span>
                  <span className="eye" onClick={(e) => toggleVisibility('footer', e)}>{visibleSections.footer ? '👁' : '🚫'}</span>
                </div>
              </div>

              <button className="add-section-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"/></svg>
                เพิ่มบล็อกใหม่
              </button>
            </aside>

            {/* CENTER: LIVE CANVAS PREVIEW */}
            <main className="canvas-wrap">
              <div className={`device-frame ${device}`} id="deviceFrame">
                <div className="device-bar"><span></span></div>
                <div className="site">

                  {/* HEADER BLOCK */}
                  <div className={`blk ${activeSection === 'header' ? 'active' : ''} ${!visibleSections.header ? 'is-hidden' : ''}`} onClick={() => setActiveSection('header')}>
                    <span className="blk-tag">แถบหัวเว็บ</span>
                    <div className="s-header">
                      <div>STORE.</div>
                      <nav><span>สินค้าใหม่</span><span>คอลเลกชัน</span><span>เกี่ยวกับเรา</span></nav>
                      <div className="icons">🔍 🛍</div>
                    </div>
                  </div>

                  {/* HERO BLOCK */}
                  <div 
                    className={`blk ${activeSection === 'hero' ? 'active' : ''} ${!visibleSections.hero ? 'is-hidden' : ''} ${hideHeroOnMobile && device === 'mobile' ? 'hero-mobile-hide' : ''}`} 
                    onClick={() => setActiveSection('hero')}
                  >
                    <span className="blk-tag">แบนเนอร์หลัก</span>
                    <div 
                      className={`s-hero ${hasPattern ? 'has-pattern' : ''}`}
                      style={{ 
                        textAlign: heroAlign,
                        backgroundColor: heroBgColor,
                        color: heroTextColor,
                        paddingTop: `${heroPadding}px`,
                        paddingBottom: `${heroPadding}px`
                      }}
                    >
                      <div className="eyebrow">{heroEyebrow}</div>
                      <h1 style={{ fontSize: `${heroFontSize}px` }} dangerouslySetInnerHTML={{ __html: heroHeading.replace(/\n/g, '<br/>') }}></h1>
                      <p style={{ color: heroTextColor }}>{heroDesc}</p>
                      <span className={`cta ${roundedCta ? 'rounded' : ''}`}>{heroCta}</span>
                    </div>
                  </div>

                  {/* GRID BLOCK */}
                  <div className={`blk ${activeSection === 'grid' ? 'active' : ''} ${!visibleSections.grid ? 'is-hidden' : ''}`} onClick={() => setActiveSection('grid')}>
                    <span className="blk-tag">สินค้าแนะนำ</span>
                    <div className="s-grid">
                      <h3>สินค้าขายดี</h3>
                      <div className="grid-cards">
                        <div className="card"><div className="thumb">◻</div><div className="info"><div className="n">เสื้อยืดพื้นฐาน</div><div className="p">฿590</div></div></div>
                        <div className="card"><div className="thumb">◻</div><div className="info"><div className="n">กระเป๋าผ้าแคนวาส</div><div className="p">฿890</div></div></div>
                        <div className="card"><div className="thumb">◻</div><div className="info"><div className="n">หมวกแก๊ปเรียบ</div><div className="p">฿450</div></div></div>
                      </div>
                    </div>
                  </div>

                  {/* TEXT BLOCK */}
                  <div className={`blk ${activeSection === 'text' ? 'active' : ''} ${!visibleSections.text ? 'is-hidden' : ''}`} onClick={() => setActiveSection('text')}>
                    <span className="blk-tag">ข้อความ + ปุ่ม</span>
                    <div className="s-text">
                      <p>ทุกชิ้นผลิตในจำนวนจำกัด ตรวจสอบคุณภาพทีละชิ้นก่อนจัดส่งถึงมือคุณ</p>
                    </div>
                  </div>

                  {/* FOOTER BLOCK */}
                  <div className={`blk ${activeSection === 'footer' ? 'active' : ''} ${!visibleSections.footer ? 'is-hidden' : ''}`} onClick={() => setActiveSection('footer')}>
                    <span className="blk-tag">ท้ายเว็บ</span>
                    <div className="s-footer">
                      <div className="col"><div className="col-title">STORE.</div><div>เรียบง่าย ตรงไปตรงมา ทุกวัน</div></div>
                      <div className="col"><div className="col-title">ช่วยเหลือ</div><div>การจัดส่ง</div><div>คืนสินค้า</div><div>ติดต่อเรา</div></div>
                      <div className="col"><div className="col-title">ติดตาม</div><div>Instagram</div><div>Facebook</div><div>Line</div></div>
                    </div>
                  </div>

                </div>
              </div>
            </main>

            {/* RIGHT: SETTINGS PANEL */}
            <aside className="sidebar-right">
              <div className="rp-head">
                <div className="section-badge">{currentMeta?.tag}</div>
                <div className="rp-title">{currentMeta?.title}</div>
                <div className="rp-sub">{currentMeta?.sub}</div>
              </div>

              <div className="tabs">
                <button className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>เนื้อหา</button>
                <button className={activeTab === 'style' ? 'active' : ''} onClick={() => setActiveTab('style')}>สไตล์</button>
                <button className={activeTab === 'advanced' ? 'active' : ''} onClick={() => setActiveTab('advanced')}>ขั้นสูง</button>
              </div>

              <div className="rp-body">
                {/* CONTENT TAB PANE */}
                {activeTab === 'content' && (
                  <div>
                    {activeSection === 'hero' ? (
                      <>
                        <div className="field">
                          <label>ข้อความนำ (Eyebrow)</label>
                          <input className="input" type="text" value={heroEyebrow} onChange={(e) => setHeroEyebrow(e.target.value)} />
                        </div>
                        <div className="field" style={{ marginTop: '14px' }}>
                          <label>หัวข้อหลัก</label>
                          <textarea className="input" rows={2} value={heroHeading} onChange={(e) => setHeroHeading(e.target.value)} />
                        </div>
                        <div className="field" style={{ marginTop: '14px' }}>
                          <label>คำอธิบาย</label>
                          <textarea className="input" rows={3} value={heroDesc} onChange={(e) => setHeroDesc(e.target.value)} />
                        </div>
                        <div className="field" style={{ marginTop: '14px' }}>
                          <label>ข้อความปุ่ม</label>
                          <input className="input" type="text" value={heroCta} onChange={(e) => setHeroCta(e.target.value)} />
                        </div>
                        <div className="field" style={{ marginTop: '14px' }}>
                          <label>ลิงก์ปุ่ม</label>
                          <div className="select-fake">/collections/all
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--ink-soft)', textAlign: 'center', marginTop: '20px' }}>ไม่มีการตั้งค่าเนื้อหาสำหรับบล็อกนี้</p>
                    )}
                  </div>
                )}

                {/* STYLE TAB PANE */}
                {activeTab === 'style' && (
                  <div>
                    {activeSection === 'hero' ? (
                      <>
                        <div className="field">
                          <label>การจัดวางข้อความ</label>
                          <div className="align-group">
                            <button className={heroAlign === 'left' ? 'active' : ''} onClick={() => setHeroAlign('left')} aria-label="ชิดซ้าย"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
                            <button className={heroAlign === 'center' ? 'active' : ''} onClick={() => setHeroAlign('center')} aria-label="กึ่งกลาง"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
                            <button className={heroAlign === 'right' ? 'active' : ''} onClick={() => setHeroAlign('right')} aria-label="ชิดขวา"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M10 12h10M6 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
                          </div>
                        </div>

                        <div className="field" style={{ marginTop: '16px' }}>
                          <label>สีพื้นหลัง</label>
                          <div className="swatches">
                            {['#ffffff', '#f1f1ef', '#d9d9d6', '#4a4a48', '#0a0a0a'].map((color) => (
                              <div key={color} className={`swatch ${heroBgColor === color ? 'active' : ''}`} style={{ backgroundColor: color, borderColor: color === '#ffffff' ? '#ccc' : color }} onClick={() => setHeroBgColor(color)}></div>
                            ))}
                          </div>
                        </div>

                        <div className="field" style={{ marginTop: '16px' }}>
                          <label>สีข้อความ</label>
                          <div className="swatches">
                            {['#0a0a0a', '#4a4a48', '#ffffff'].map((color) => (
                              <div key={color} className={`swatch ${heroTextColor === color ? 'active' : ''}`} style={{ backgroundColor: color, borderColor: color === '#ffffff' ? '#ccc' : color }} onClick={() => setHeroTextColor(color)}></div>
                            ))}
                          </div>
                        </div>

                        <div className="field" style={{ marginTop: '16px' }}>
                          <label>แบบอักษรหัวข้อ</label>
                          <div className="select-fake">Archivo — หนา
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          </div>
                        </div>

                        <div className="field" style={{ marginTop: '16px' }}>
                          <label>ขนาดหัวข้อ <span className="val">{heroFontSize}px</span></label>
                          <div className="slider-row">
                            <input type="range" min="20" max="64" value={heroFontSize} onChange={(e) => setHeroFontSize(Number(e.target.value))} />
                          </div>
                        </div>

                        <div className="field" style={{ marginTop: '16px' }}>
                          <label>ระยะห่างบน-ล่าง <span className="val">{heroPadding}px</span></label>
                          <div className="slider-row">
                            <input type="range" min="16" max="120" value={heroPadding} onChange={(e) => setHeroPadding(Number(e.target.value))} />
                          </div>
                        </div>

                        <div className="divider" style={{ margin: '18px -16px' }}></div>

                        <div className="toggle-row">
                          <div>
                            <div className="t-label">พื้นหลังลายเส้น</div>
                            <div className="t-sub">แสดงลวดลายเส้นทแยงบางๆ</div>
                          </div>
                          <button className={`switch ${hasPattern ? 'on' : ''}`} onClick={() => setHasPattern(!hasPattern)}></button>
                        </div>
                        
                        <div className="toggle-row" style={{ marginTop: '14px' }}>
                          <div>
                            <div className="t-label">มุมโค้งของปุ่ม</div>
                            <div className="t-sub">ปุ่มเป็นทรงเหลี่ยมเมื่อปิด</div>
                          </div>
                          <button className={`switch ${roundedCta ? 'on' : ''}`} onClick={() => setRoundedCta(!roundedCta)}></button>
                        </div>
                      </>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--ink-soft)', textAlign: 'center', marginTop: '20px' }}>ไม่มีการตั้งค่าสไตล์สำหรับบล็อกนี้</p>
                    )}
                  </div>
                )}

                {/* ADVANCED TAB PANE */}
                {activeTab === 'advanced' && (
                  <div>
                    {activeSection === 'hero' ? (
                      <>
                        <div className="toggle-row">
                          <div>
                            <div className="t-label">ซ่อนในมือถือ</div>
                            <div className="t-sub">ส่วนนี้จะไม่แสดงบนหน้าจอมือถือ</div>
                          </div>
                          <button className={`switch ${hideHeroOnMobile ? 'on' : ''}`} onClick={() => setHideHeroOnMobile(!hideHeroOnMobile)}></button>
                        </div>
                        <div className="field" style={{ marginTop: '18px' }}>
                          <label>คลาส CSS ที่กำหนดเอง</label>
                          <input className="input" type="text" placeholder="section-hero-custom" style={{ fontFamily: 'var(--mono)', fontSize: '12px' }} />
                        </div>
                        <div className="field" style={{ marginTop: '14px' }}>
                          <label>รหัสส่วน</label>
                          <input className="input" type="text" value="hero-01" style={{ fontFamily: 'var(--mono)', fontSize: '12px' }} readOnly />
                        </div>
                        <div className="divider" style={{ margin: '18px -16px' }}></div>
                        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: '#a33', borderColor: '#e6c9c9' }}>ลบส่วนนี้</button>
                      </>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--ink-soft)', textAlign: 'center', marginTop: '20px' }}>ไม่มีการตั้งค่าขั้นสูงสำหรับบล็อกนี้</p>
                    )}
                  </div>
                )}
              </div>

              <div className="rp-footer">
                <button className="btn btn-ghost" style={{ justifyContent: 'center' }}>ทำสำเนา</button>
                <button className="btn btn-dark" style={{ justifyContent: 'center' }}>บันทึก</button>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </>
  );
}