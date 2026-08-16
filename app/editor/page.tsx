'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Font Options ────────────────────────────────────────────────
const FONT_OPTIONS = [
  { label: 'Inter + Archivo', body: 'Inter', display: 'Archivo' },
  { label: 'Playfair + Lato', body: 'Lato', display: 'Playfair Display' },
  { label: 'DM Sans + DM Serif', body: 'DM Sans', display: 'DM Serif Display' },
  { label: 'Nunito + Poppins', body: 'Nunito', display: 'Poppins' },
  { label: 'Roboto Mono + Roboto', body: 'Roboto', display: 'Roboto' },
  { label: 'Outfit (All)', body: 'Outfit', display: 'Outfit' },
];

// ─── Section Types ────────────────────────────────────────────────
const TYPE_META = {
  header:      { tag: 'Header',       title: 'Header Settings',      sub: 'Logo, navigation & top bar' },
  countdown:   { tag: 'Countdown',    title: 'Countdown Timer',      sub: 'Urgency bar to drive conversions' },
  hero:        { tag: 'Hero Banner',  title: 'Hero Banner',          sub: 'Headline, description & CTA button' },
  grid:        { tag: 'Products',     title: 'Product Grid',         sub: 'Showcase your best-selling items' },
  gallery:     { tag: 'Gallery',      title: 'Image Gallery',        sub: 'Showcase a grid of photos' },
  map:         { tag: 'Map',          title: 'Store Location',       sub: 'Show your address on a map' },
  testimonials:{ tag: 'Testimonials', title: 'Testimonials',         sub: 'Social proof from happy customers' },
  faq:         { tag: 'FAQ',          title: 'FAQ Section',          sub: 'Answer common customer questions' },
  pricing:     { tag: 'Pricing',      title: 'Pricing Table',        sub: 'Display plans and pricing clearly' },
  leadForm:    { tag: 'Lead Form',    title: 'Lead Capture Form',    sub: 'Collect emails or contacts' },
  newsletter:  { tag: 'Newsletter Popup', title: 'Newsletter Popup', sub: 'Modal popup that captures emails' },
  text:        { tag: 'Text + CTA',   title: 'Text Block',           sub: 'Short text with optional action button' },
  banner:      { tag: 'Promo Banner', title: 'Promo Banner',         sub: 'Full-width image or color banner' },
  video:       { tag: 'Video Embed',  title: 'Video Section',        sub: 'Embed a YouTube or Vimeo video' },
  features:    { tag: 'Features',     title: 'Feature List',         sub: 'Highlight key features or benefits' },
  footer:      { tag: 'Footer',       title: 'Footer Settings',      sub: 'Links, social & copyright info' },
};
const ADDABLE_TYPES = ['countdown','hero','grid','gallery','map','testimonials','faq','pricing','leadForm','newsletter','text','banner','video','features','footer'];

const GRADIENT_PRESETS = [
  { bg: 'linear-gradient(135deg,#ffffff 0%,#e5e5e5 100%)', text: '#111111' },
  { bg: 'linear-gradient(135deg,#e5e5e5 0%,#a3a3a3 100%)', text: '#111111' },
  { bg: 'linear-gradient(135deg,#525252 0%,#171717 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg,#f5f5f5 0%,#d4d4d4 100%)', text: '#111111' },
  { bg: 'linear-gradient(135deg,#404040 0%,#000000 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg,#d4d4d4 0%,#737373 100%)', text: '#111111' },
  { bg: 'linear-gradient(135deg,#262626 0%,#000000 100%)', text: '#ffffff' },
  { bg: 'linear-gradient(135deg,#ffffff 0%,#171717 100%)', text: '#111111' },
];

const PRODUCT_CATALOG = [
  { name: 'Minimalist Backpack', price: '49.90', priceFull: '64.90', badge: 'SALE 23%', rating: 5, reviews: 128, image: '', url: '' },
  { name: 'Ceramic Coffee Mug', price: '18.00', priceFull: '', badge: '', rating: 4, reviews: 84, image: '', url: '' },
  { name: 'Desk Organizer Set', price: '34.90', priceFull: '', badge: '', rating: 5, reviews: 215, image: '', url: '' },
  { name: 'Linen Throw Pillow', price: '24.90', priceFull: '32.00', badge: 'SALE', rating: 4, reviews: 56, image: '', url: '' },
  { name: 'Wireless Earbuds Case', price: '39.90', priceFull: '', badge: 'NEW', rating: 5, reviews: 302, image: '', url: '' },
  { name: 'Scented Soy Candle', price: '14.00', priceFull: '', badge: '', rating: 5, reviews: 41, image: '', url: '' },
  { name: 'Canvas Tote Bag', price: '16.50', priceFull: '', badge: '', rating: 4, reviews: 77, image: '', url: '' },
  { name: 'Stainless Water Bottle', price: '22.90', priceFull: '28.00', badge: 'SALE', rating: 5, reviews: 189, image: '', url: '' },
];

let uidCounter = 1;
const uid = (p) => `${p}_${uidCounter++}_${Math.random().toString(36).slice(2,6)}`;

function defaultCountdownEnd() {
  const d = new Date(Date.now() + 2*24*60*60*1000); d.setSeconds(0,0);
  const p = (n) => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function defaultDataFor(type) {
  switch(type) {
    case 'header': return {
      logoText:'STORE.', logoImage:'',
      navItems:[{label:'Home',url:'#'},{label:'New Collection',url:'#'},{label:'All Products',url:'#'},{label:'About',url:'#'}],
      bgColor:'#ffffff', textColor:'#111111', sticky: false,
    };
    case 'countdown': return { promoText:'Flash Sale — 50% OFF ends in:', bgColor:'#000000', textColor:'#ffffff', endDateTime:defaultCountdownEnd() };
    case 'hero': return {
      eyebrow:'New Collection 2024',
      heading:'Elevate Your Lifestyle\nWith Thoughtful Design',
      desc:'Experience a new era of living with products handpicked for you — where minimal aesthetics meet everyday functionality.',
      cta:'Shop Now', ctaUrl:'', ctaSecondary:'', ctaSecondaryUrl:'',
      align:'center', bgType:'gradient', bgColor:'#ffffff', bgImage:'',
      gradient:GRADIENT_PRESETS[0].bg, textColor:'#0a0a0a',
      fontSize:38, padding:72, hasPattern:true, roundedCta:true,
    };
    case 'grid': return {
      heading:'Best Sellers This Week', columns:3, bgColor:'#ffffff',
      showAddToCart: true, cardStyle: 'default',
      products:[
        {id:uid('p'),name:'Minimalist Backpack',price:'49.90',priceFull:'64.90',badge:'SALE 23%',rating:5,reviews:128,image:'',url:''},
        {id:uid('p'),name:'Ceramic Coffee Mug',price:'18.00',priceFull:'',badge:'',rating:4,reviews:84,image:'',url:''},
        {id:uid('p'),name:'Desk Organizer Set',price:'34.90',priceFull:'',badge:'',rating:5,reviews:215,image:'',url:''},
      ],
    };
    case 'gallery': return {
      heading:'Our Gallery', bgColor:'#ffffff', columns:3,
      images:[
        {id:uid('img'),src:'',caption:'Studio, morning light'},
        {id:uid('img'),src:'',caption:'Workshop detail'},
        {id:uid('img'),src:'',caption:'Finished piece'},
        {id:uid('img'),src:'',caption:'Packing an order'},
        {id:uid('img'),src:'',caption:'Materials on the bench'},
        {id:uid('img'),src:'',caption:'Behind the counter'},
      ],
    };
    case 'map': return {
      heading:'Visit Our Store',
      address:'123 Main Street, Springfield',
      hours:'Mon–Sat, 10:00–19:00',
      mapEmbedUrl:'',
      bgColor:'#ffffff',
    };
    case 'testimonials': return {
      heading:'What Our Customers Say',
      bgColor:'#f8fafc',
      items:[
        {id:uid('t'),name:'Sarah M.',role:'Verified Buyer',avatar:'',text:'Absolutely love this product! The quality exceeded my expectations and delivery was super fast. Will definitely order again.',rating:5},
        {id:uid('t'),name:'James K.',role:'Loyal Customer',avatar:'',text:'Clean design and great build quality. It fits perfectly into my workspace. Highly recommend to anyone looking for minimalist products.',rating:5},
        {id:uid('t'),name:'Emma R.',role:'First-time Buyer',avatar:'',text:'I was skeptical at first but I\'m so glad I made the purchase. Customer service was also excellent — 5 stars!',rating:4},
      ],
    };
    case 'faq': return {
      heading:'Frequently Asked Questions',
      bgColor:'#ffffff',
      items:[
        {id:uid('f'),q:'How long does shipping take?',a:'Standard shipping takes 3–5 business days. Express shipping (1–2 days) is available at checkout.'},
        {id:uid('f'),q:'What is your return policy?',a:'We offer a 30-day hassle-free return policy. Simply contact our support team and we\'ll guide you through the process.'},
        {id:uid('f'),q:'Do you ship internationally?',a:'Yes! We ship to over 50 countries worldwide. International shipping typically takes 7–14 business days.'},
        {id:uid('f'),q:'Is my payment information secure?',a:'Absolutely. All transactions are encrypted via SSL and we never store your card details.'},
      ],
    };
    case 'pricing': return {
      heading:'Simple, Transparent Pricing',
      sub:'Choose the plan that works for you. Upgrade or cancel anytime.',
      bgColor:'#f8fafc', accentColor:'#1a1a1a',
      plans:[
        {id:uid('pl'),name:'Starter',price:'0',period:'month',badge:'',highlight:false,cta:'Get Started',ctaUrl:'#',features:['Up to 10 products','Basic analytics','Email support','1 store page']},
        {id:uid('pl'),name:'Pro',price:'29',period:'month',badge:'Most Popular',highlight:true,cta:'Start Free Trial',ctaUrl:'#',features:['Unlimited products','Advanced analytics','Priority support','Custom domain','Remove branding','Discount codes']},
        {id:uid('pl'),name:'Enterprise',price:'99',period:'month',badge:'',highlight:false,cta:'Contact Sales',ctaUrl:'#',features:['Everything in Pro','Dedicated manager','Custom integrations','SLA uptime guarantee','Multi-store','API access']},
      ],
    };
    case 'leadForm': return {
      heading:'Get 10% Off Your First Order',
      sub:'Join our newsletter for exclusive deals, new arrivals, and styling tips.',
      placeholder:'Enter your email address...', buttonText:'Claim Discount',
      trustText:'No spam, ever. Unsubscribe anytime.', bgColor:'#f8fafc', buttonColor:'#0f172a',
    };
    case 'newsletter': return {
      heading:'Join Our Newsletter',
      sub:'Get 10% off your first order plus early access to new drops.',
      placeholder:'Enter your email address...', buttonText:'Subscribe',
      dismissText:'No thanks', delaySeconds:5,
      bgColor:'#ffffff', textColor:'#111111', buttonColor:'#0f172a',
    };
    case 'text': return {
      content:'Shop with confidence — 100% satisfaction guaranteed.\nIf something isn\'t right, we\'ll make it right within 7 business days.',
      bgColor:'#ffffff', textColor:'#475569', btnText:'', btnUrl:'', align:'center',
    };
    case 'banner': return {
      text:'FREE SHIPPING on orders over $50 — Use code: FREESHIP', subText:'Limited time offer. Shop now →',
      bgColor:'#0f172a', textColor:'#ffffff', bgImage:'', fontSize:20,
    };
    case 'video': return {
      heading:'See It In Action',
      sub:'Watch how our products fit into your everyday life.',
      videoUrl:'https://www.youtube.com/embed/dQw4w9WgXcQ',
      bgColor:'#f8fafc',
    };
    case 'features': return {
      heading:'Why Choose Us',
      sub:'Built around what matters most to our customers.',
      bgColor:'#ffffff', columns:3,
      items:[
        {id:uid('feat'),icon:'',title:'Fast Delivery',desc:'Order before 2pm for same-day dispatch. Free shipping on orders over $50.'},
        {id:uid('feat'),icon:'',title:'Secure Checkout',desc:'All payments are SSL-encrypted. We accept all major cards and PayPal.'},
        {id:uid('feat'),icon:'',title:'Eco Packaging',desc:'We use 100% recyclable materials in all our packaging. Planet first.'},
        {id:uid('feat'),icon:'',title:'Gift Wrapping',desc:'Add a personal message and gift wrapping at checkout for just $3.'},
        {id:uid('feat'),icon:'',title:'Top Rated',desc:'Over 10,000 five-star reviews from customers around the world.'},
        {id:uid('feat'),icon:'',title:'Easy Returns',desc:'30-day no-questions-asked returns. Free return label included.'},
      ],
    };
    case 'footer': return {
      brandName:'STORE.', brandDesc:'We curate quality, beautifully designed products to upgrade your everyday life.',
      col1Title:'Support', col1Items:[{label:'FAQ',url:'#'},{label:'Shipping Policy',url:'#'},{label:'Return Policy',url:'#'},{label:'Track Order',url:'#'}],
      col2Title:'Follow Us', col2Items:[{label:'Instagram',url:'#'},{label:'Facebook',url:'#'},{label:'TikTok',url:'#'},{label:'Pinterest',url:'#'}],
      bottomText:'© 2024 STORE. All rights reserved.', bgColor:'#0a0a0a',
    };
    default: return {};
  }
}

function defaultSections() {
  return [
    {id:uid('sec'),type:'header',   visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor('header')},
    {id:uid('sec'),type:'countdown',visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor('countdown')},
    {id:uid('sec'),type:'hero',     visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor('hero')},
    {id:uid('sec'),type:'grid',     visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor('grid')},
    {id:uid('sec'),type:'features', visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor('features')},
    {id:uid('sec'),type:'testimonials',visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor('testimonials')},
    {id:uid('sec'),type:'leadForm', visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor('leadForm')},
    {id:uid('sec'),type:'footer',   visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor('footer')},
  ];
}

function emptyPageSections() {
  return [
    {id:uid('sec'),type:'hero',visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor('hero')},
    {id:uid('sec'),type:'text',visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor('text')},
  ];
}

function slugify(name, existingSlugs) {
  let base = '/' + name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-') || '/page';
  let slug = base, n = 2;
  while (existingSlugs.includes(slug)) { slug = `${base}-${n}`; n++; }
  return slug;
}

function defaultPages() {
  return [{ id: uid('page'), name: 'Home', slug: '/', sections: defaultSections() }];
}

// ─── Export HTML ──────────────────────────────────────────────────
function generateHTML(sections, darkMode, fontPair) {
  const fp = FONT_OPTIONS.find(f => f.label === fontPair) || FONT_OPTIONS[0];
  const googleFonts = `https://fonts.googleapis.com/css2?family=${fp.display.replace(/ /g,'+')}:wght@400;600;700;800&family=${fp.body.replace(/ /g,'+')}:wght@400;500;600&display=swap`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>My Store</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="${googleFonts}" rel="stylesheet"/>
<style>
  :root{--display:'${fp.display}',sans-serif;--body:'${fp.body}',sans-serif;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:var(--body);${darkMode?'background:#0a0a0a;color:#fff;':'background:#fff;color:#111;'}}
</style>
</head>
<body>
<!-- Exported from StoreBuilder -->
${sections.filter(s=>s.visible).map(s=>`<!-- ${TYPE_META[s.type].tag} -->`).join('\n')}
</body>
</html>`;
}

export default function StoreEditor() {
  const [pages, setPages] = useState(defaultPages);
  const [activePageId, setActivePageId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [multiSelect, setMultiSelect] = useState(() => new Set());
  const [device, setDevice] = useState('desktop');
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);
  const [versionNameInput, setVersionNameInput] = useState('');
  const [versions, setVersions] = useState([]);
  const [facebookPixel, setFacebookPixel] = useState('');
  const [googleAnalytics, setGoogleAnalytics] = useState('');
  const [toast, setToast] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogTargetId, setCatalogTargetId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [fontPair, setFontPair] = useState(FONT_OPTIONS[0].label);
  const [expandedFaq, setExpandedFaq] = useState({});
  const [siteName, setSiteName] = useState('My Awesome Store');
  const [renamingPageId, setRenamingPageId] = useState(null);
  const [renameInput, setRenameInput] = useState('');

  const past = useRef({});
  const future = useRef({});
  const toastTimer = useRef(null);

  const fp = FONT_OPTIONS.find(f => f.label === fontPair) || FONT_OPTIONS[0];

  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const sections = activePage.sections;
  const setSections = (updater) => {
    setPages(prev => prev.map(p => p.id !== activePage.id ? p : {...p, sections: typeof updater==='function' ? updater(p.sections) : updater}));
  };

  useEffect(() => {
    if (sections.length) {
      setActiveId(sections[0].id);
      setMultiSelect(new Set([sections[0].id]));
    } else {
      setActiveId(null);
      setMultiSelect(new Set());
    }
  }, [activePage.id]);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const commit = (next) => {
    const key = activePage.id;
    past.current[key] = [...(past.current[key]||[]).slice(-49), sections];
    future.current[key] = [];
    setSections(next);
  };

  const undo = () => {
    const key = activePage.id;
    const arr = past.current[key] || [];
    if (!arr.length) return;
    const prev = arr[arr.length - 1];
    past.current[key] = arr.slice(0,-1);
    future.current[key] = [sections, ...(future.current[key]||[])];
    setSections(prev);
  };

  const redo = () => {
    const key = activePage.id;
    const arr = future.current[key] || [];
    if (!arr.length) return;
    const next = arr[0];
    future.current[key] = arr.slice(1);
    past.current[key] = [...(past.current[key]||[]), sections];
    setSections(next);
  };

  const addPage = () => {
    const name = `Page ${pages.length + 1}`;
    const slug = slugify(name, pages.map(p=>p.slug));
    const np = { id: uid('page'), name, slug, sections: emptyPageSections() };
    setPages(p => [...p, np]);
    setActivePageId(np.id);
    showToast('Page added');
  };

  const renamePage = (id, name) => setPages(p => p.map(pg => pg.id===id ? {...pg, name: name || pg.name} : pg));

  const duplicatePage = (id) => {
    const src = pages.find(p=>p.id===id); if (!src) return;
    const name = src.name + ' Copy';
    const slug = slugify(name, pages.map(p=>p.slug));
    const clone = {...src, id: uid('page'), name, slug, sections: JSON.parse(JSON.stringify(src.sections))};
    setPages(p => [...p, clone]);
    setActivePageId(clone.id);
    showToast('Page duplicated');
  };

  const requestDeletePage = (id) => {
    if (pages.length <= 1) { showToast("Can't delete the only page"); return; }
    const pg = pages.find(p=>p.id===id);
    setConfirmModal({ type:'page', id, label: pg ? pg.name : '' });
  };

  const navigateToPage = (id) => { if (pages.find(p=>p.id===id)) setActivePageId(id); };

  const activeIndex = sections.findIndex(s => s.id === activeId);
  const activeSection = sections[activeIndex];
  const meta = activeSection ? TYPE_META[activeSection.type] : null;

  const toggleVisibility = (id, e) => { e.stopPropagation(); commit(sections.map(s => s.id===id ? {...s,visible:!s.visible} : s)); };

  const addSection = (type) => {
    const ns = {id:uid('sec'),type,visible:true,hideOnMobile:false,hideOnTablet:false,data:defaultDataFor(type)};
    const at = activeIndex >= 0 ? activeIndex+1 : sections.length;
    commit([...sections.slice(0,at),ns,...sections.slice(at)]);
    setActiveId(ns.id); setMultiSelect(new Set([ns.id])); setActiveTab('content'); setShowAddModal(false);
    showToast('Block added');
  };

  const duplicateSection = (id) => {
    const idx = sections.findIndex(s=>s.id===id); if(idx===-1) return;
    const clone = {...sections[idx],id:uid('sec'),data:JSON.parse(JSON.stringify(sections[idx].data))};
    commit([...sections.slice(0,idx+1),clone,...sections.slice(idx+1)]);
    setActiveId(clone.id); setMultiSelect(new Set([clone.id])); showToast('Block duplicated');
  };

  const deleteSection = (id) => {
    const idx = sections.findIndex(s=>s.id===id); if(idx===-1) return;
    const next = sections.filter(s=>s.id!==id);
    commit(next);
    const na = next.length ? next[Math.max(0,idx-1)].id : null;
    setActiveId(na); setMultiSelect(na ? new Set([na]) : new Set()); showToast('Block deleted');
  };

  const reorder = (from,to) => {
    if(from===to||from==null||to==null) return;
    const next=[...sections]; const [moved]=next.splice(from,1); next.splice(to,0,moved); commit(next);
  };

  const bulkHide = () => { commit(sections.map(s=>multiSelect.has(s.id)?{...s,visible:false}:s)); showToast('Blocks hidden'); };
  const bulkShow = () => { commit(sections.map(s=>multiSelect.has(s.id)?{...s,visible:true}:s)); showToast('Blocks shown'); };
  const bulkDelete = () => {
    const next=sections.filter(s=>!multiSelect.has(s.id)); commit(next);
    const na=next.length?next[0].id:null; setActiveId(na); setMultiSelect(na?new Set([na]):new Set()); showToast('Blocks deleted');
  };

  const requestDeleteSection=(id)=>{const s=sections.find(x=>x.id===id); setConfirmModal({type:'section',id,label:s?TYPE_META[s.type].tag:''});};
  const requestBulkDelete=()=>{if(!multiSelect.size)return; setConfirmModal({type:'bulk',count:multiSelect.size});};
  const requestDeleteVersion=(id)=>{const v=versions.find(x=>x.id===id); setConfirmModal({type:'version',id,label:v?v.name:''});};
  const handleConfirmDelete=()=>{
    if(!confirmModal)return;
    if(confirmModal.type==='section') deleteSection(confirmModal.id);
    else if(confirmModal.type==='bulk') bulkDelete();
    else if(confirmModal.type==='version') setVersions(v=>v.filter(x=>x.id!==confirmModal.id));
    else if(confirmModal.type==='page') {
      const next = pages.filter(p=>p.id!==confirmModal.id);
      setPages(next);
      if (activePage.id===confirmModal.id) setActivePageId(next[0].id);
      showToast('Page deleted');
    }
    setConfirmModal(null);
  };

  const handleRowClick=(e,id)=>{
    if(e.shiftKey||e.ctrlKey||e.metaKey){
      setMultiSelect(prev=>{const next=new Set(prev); next.has(id)?next.delete(id):next.add(id); return next;});
    } else { setActiveId(id); setActiveTab('content'); setMultiSelect(new Set([id])); }
  };

  useEffect(()=>{
    const onKey=(e)=>{
      const tag=(e.target&&e.target.tagName)||'';
      const isTyping=tag==='INPUT'||tag==='TEXTAREA';
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}
      if(isTyping)return;
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();if(activeId)duplicateSection(activeId);return;}
      if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();multiSelect.size>1?requestBulkDelete():activeId?requestDeleteSection(activeId):null;return;}
      if(e.key==='Escape'){setShowAddModal(false);setShowVersionModal(false);setShowCatalogModal(false);setConfirmModal(null);setShowExportModal(false);setShowFontModal(false);}
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  });

  const patchData=(id,patch)=>setSections(prev=>prev.map(s=>s.id===id?{...s,data:{...s.data,...patch}}:s));
  const patchDataCommit=(id,patch)=>commit(sections.map(s=>s.id===id?{...s,data:{...s.data,...patch}}:s));

  const updateProduct=(secId,prodId,patch)=>setSections(prev=>prev.map(s=>s.id!==secId?s:{...s,data:{...s.data,products:s.data.products.map(p=>p.id===prodId?{...p,...patch}:p)}}));
  const addProduct=(secId)=>{
    const sec=sections.find(s=>s.id===secId); if(!sec||sec.data.products.length>=8)return;
    const np={id:uid('p'),name:'New Product',price:'0.00',priceFull:'',badge:'',rating:5,reviews:0,image:'',url:''};
    commit(sections.map(s=>s.id===secId?{...s,data:{...s.data,products:[...s.data.products,np]}}:s));
  };
  const removeProduct=(secId,prodId)=>commit(sections.map(s=>s.id===secId?{...s,data:{...s.data,products:s.data.products.filter(p=>p.id!==prodId)}}:s));
  const addProductFromCatalog=(secId,item)=>{
    const sec=sections.find(s=>s.id===secId); if(!sec||sec.data.products.length>=8)return;
    const np={id:uid('p'),...item};
    commit(sections.map(s=>s.id===secId?{...s,data:{...s.data,products:[...s.data.products,np]}}:s));
    showToast(`Added "${item.name}"`);
  };

  // Generic list item helpers
  const updateListItem=(secId,key,idx,patch)=>setSections(prev=>prev.map(s=>{if(s.id!==secId)return s; const list=s.data[key].map((it,i)=>i===idx?{...it,...patch}:it); return{...s,data:{...s.data,[key]:list}};}));
  const addListItem=(secId,key,def)=>commit(sections.map(s=>s.id===secId?{...s,data:{...s.data,[key]:[...s.data[key],def]}}:s));
  const removeListItem=(secId,key,idx)=>commit(sections.map(s=>s.id===secId?{...s,data:{...s.data,[key]:s.data[key].filter((_,i)=>i!==idx)}}:s));

  // Generic generic-keyed items (testimonials/faq/features/pricing)
  const updateItem=(secId,key,itemId,patch)=>setSections(prev=>prev.map(s=>s.id!==secId?s:{...s,data:{...s.data,[key]:s.data[key].map(it=>it.id===itemId?{...it,...patch}:it)}}));
  const addItem=(secId,key,def)=>commit(sections.map(s=>s.id===secId?{...s,data:{...s.data,[key]:[...s.data[key],def]}}:s));
  const removeItem=(secId,key,itemId)=>commit(sections.map(s=>s.id===secId?{...s,data:{...s.data,[key]:s.data[key].filter(it=>it.id!==itemId)}}:s));

  const saveVersion=()=>{
    const name=versionNameInput.trim()||`Version ${versions.length+1}`;
    setVersions(v=>[...v,{id:uid('ver'),name,savedAt:new Date().toLocaleString('en-US'),snapshot:JSON.parse(JSON.stringify(sections))}]);
    setVersionNameInput(''); showToast('Version saved');
  };
  const restoreVersion=(id)=>{
    const v=versions.find(x=>x.id===id); if(!v)return;
    commit(JSON.parse(JSON.stringify(v.snapshot))); setShowVersionModal(false); showToast(`Restored "${v.name}"`);
  };

  const exportHTML=()=>{
    const html=generateHTML(sections,darkMode,fontPair);
    const blob=new Blob([html],{type:'text/html'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='store.html'; a.click();
    showToast('HTML exported!');
  };

  const dm = darkMode;
  const dmStyle = dm ? { background:'#0a0a0a', color:'#e5e7eb' } : {};
  const panelBg = dm ? '#111827' : '#ffffff';
  const borderCol = dm ? '#1f2937' : '#e2e8f0';
  const inputBg = dm ? '#1f2937' : '#ffffff';
  const inputBorder = dm ? '#374151' : '#cbd5e1';
  const inkSoft = dm ? '#9ca3af' : '#64748b';
  const bgPanel = dm ? '#0f172a' : '#f8fafc';

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={`https://fonts.googleapis.com/css2?family=${fp.display.replace(/ /g,'+')}:wght@400;600;700;800&family=${fp.body.replace(/ /g,'+')}:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap`} rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg:${dm?'#0a0a0a':'#f8f9fa'};--panel:${dm?'#111827':'#f1f3f5'};--panel-2:${dm?'#1f2937':'#ffffff'};
          --line:${dm?'#1f2937':'#e9ecef'};--line-strong:${dm?'#374151':'#dee2e6'};
          --ink:${dm?'#f1f5f9':'#212529'};--ink-soft:${dm?'#94a3b8':'#495057'};--ink-faint:${dm?'#4b5563':'#adb5bd'};
          --black:${dm?'#f1f5f9':'#111111'};--white:${dm?'#1f2937':'#ffffff'};--canvas-frame:${dm?'#1e293b':'#343a40'};
          --radius:8px;--disp:'${fp.display}',sans-serif;--body:'${fp.body}',sans-serif;--mono:'JetBrains Mono',monospace;
        }
        .app-container*{box-sizing:border-box;}
        .app-container{font-family:var(--body);color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased;}
        .app-container button{font-family:inherit;}
        .icon-btn{all:unset;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}
        .app{display:grid;grid-template-rows:56px 1fr;height:100vh;min-height:600px;}

        .topbar{display:flex;align-items:center;gap:12px;padding:0 16px;border-bottom:1px solid var(--line);background:var(--panel-2);z-index:10;box-shadow:0 1px 3px rgba(0,0,0,.04);}
        .brand{display:flex;align-items:center;gap:8px;font-family:var(--disp);font-weight:800;font-size:15px;letter-spacing:.02em;padding-right:14px;border-right:1px solid var(--line);height:32px;color:var(--ink);}
        .brand .mark{width:20px;height:20px;background:linear-gradient(135deg,#1a1a1a,#4d4d4d);border-radius:5px;flex:none;box-shadow:0 2px 4px rgba(99,102,241,0.4);}
        .topbar-spacer{flex:1;}
        .history-btns{display:flex;gap:2px;}
        .history-btns button{width:30px;height:30px;border-radius:6px;border:1px solid var(--line-strong);background:var(--panel-2);color:var(--ink-soft);display:flex;align-items:center;justify-content:center;cursor:pointer;}
        .history-btns button:disabled{opacity:.3;cursor:not-allowed;}
        .history-btns button:not(:disabled):hover{background:var(--panel);color:var(--ink);}
        .device-switch{display:flex;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:3px;gap:2px;}
        .device-switch button{width:32px;height:28px;border:none;background:transparent;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink-soft);}
        .device-switch button.active{background:var(--panel-2);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.1);}
        .btn{font-size:12.5px;font-weight:600;padding:0 14px;height:32px;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all 0.15s;border:none;}
        .btn-ghost{background:transparent;border:1px solid var(--line-strong);color:var(--ink);}
        .btn-ghost:hover{background:var(--panel);border-color:var(--ink-soft);}
        .btn-dark{background:#1a1a1a;border:1px solid #1a1a1a;color:#fff;box-shadow:0 2px 4px rgba(99,102,241,0.3);}
        .btn-dark:hover{background:#000000;transform:translateY(-1px);}
        .btn-sm{height:28px;font-size:12px;padding:0 10px;}

        .main{display:grid;grid-template-columns:256px 1fr 308px;min-height:0;}
        .main.preview-mode{grid-template-columns:1fr;}
        .sidebar-left,.sidebar-right{border-right:1px solid var(--line);background:var(--panel-2);display:flex;flex-direction:column;min-height:0;z-index:5;}
        .sidebar-right{border-right:none;border-left:1px solid var(--line);}
        .pages-bar{display:flex;flex-wrap:wrap;gap:5px;padding:12px 12px 10px;border-bottom:1px solid var(--line);}
        .page-tab{display:flex;align-items:center;gap:5px;padding:6px 9px;border-radius:6px;font-size:12px;font-weight:600;color:var(--ink-soft);background:var(--panel);border:1px solid transparent;cursor:pointer;max-width:150px;}
        .page-tab:hover{border-color:var(--line-strong);}
        .page-tab.active{background:var(--panel-2);border-color:var(--line-strong);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.08);}
        .page-tab-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .page-tab-input{border:1px solid var(--line-strong);border-radius:4px;font-size:12px;font-weight:600;padding:1px 4px;width:78px;background:var(--panel-2);color:var(--ink);}
        .page-tab-actions{display:flex;gap:2px;}
        .page-tab-actions .icon-btn{font-size:10px;color:var(--ink-faint);padding:1px 2px;border-radius:3px;}
        .page-tab-actions .icon-btn:hover{color:var(--ink);background:var(--line);}
        .page-tab-add{border:1px dashed var(--line-strong);background:transparent;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;color:var(--ink-soft);cursor:pointer;}
        .page-tab-add:hover{border-color:#1a1a1a;color:#1a1a1a;}

        .side-head{padding:14px 16px 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);}
        .side-head h2{font-family:var(--disp);font-size:11.5px;text-transform:uppercase;letter-spacing:.1em;color:var(--ink);margin:0;font-weight:800;}
        .side-head-hint{font-size:10px;color:var(--ink-faint);}
        .bulk-bar{display:flex;align-items:center;gap:5px;padding:8px 12px;margin:8px 12px 4px;background:${dm?'#262626':'#f0f0f0'};border:1px solid ${dm?'#4d4d4d':'#cccccc'};border-radius:8px;font-size:12px;font-weight:600;color:#333333;}
        .bulk-bar .spacer{flex:1;}
        .bulk-bar button{font-size:11px;padding:4px 8px;border-radius:5px;border:1px solid ${dm?'#4d4d4d':'#cccccc'};background:${dm?'#1e293b':'#fff'};cursor:pointer;color:#333333;font-weight:600;}
        .bulk-bar button.danger{color:#1a1a1a;border-color:${dm?'#333333':'#d4d4d4'};}
        .section-list{flex:1;overflow-y:auto;padding:8px 10px 10px;display:flex;flex-direction:column;gap:3px;}
        .sec-row{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:7px;cursor:pointer;border:1px solid transparent;font-size:12.5px;color:var(--ink);position:relative;transition:all .12s;}
        .sec-row:hover{background:var(--panel);}
        .sec-row.selected{background:var(--panel);border-color:var(--line-strong);font-weight:500;}
        .sec-row.multi-selected{border-color:#333333;background:${dm?'#262626':'#f0f0f0'};}
        .sec-row.drag-over{border-color:#1a1a1a;background:${dm?'#1a1a1a':'#f0f0f0'};}
        .sec-row .grip{color:var(--ink-faint);cursor:grab;font-size:14px;}
        .sec-row .type-icon{font-size:13px;}
        .sec-row .name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .sec-row .row-actions{display:flex;align-items:center;gap:1px;opacity:0;}
        .sec-row:hover .row-actions,.sec-row.selected .row-actions{opacity:1;}
        .sec-row .row-actions .icon-btn{color:var(--ink-faint);font-size:11px;padding:3px 4px;border-radius:4px;}
        .sec-row .row-actions .icon-btn:hover{color:var(--ink);background:var(--line);}
        .sec-row.hidden-sec{opacity:.5;}
        .add-section-btn{margin:8px 14px 14px;border:1px dashed var(--line-strong);background:transparent;border-radius:8px;padding:9px;font-size:12.5px;font-weight:600;color:var(--ink-soft);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .15s;}
        .add-section-btn:hover{border-color:#1a1a1a;color:#1a1a1a;background:${dm?'#1a1a1a':'#f0f0f0'};}
        .kbd-hint{font-size:10.5px;color:var(--ink-faint);padding:0 14px 10px;line-height:1.6;}
        .kbd-hint kbd{font-family:var(--mono);background:var(--panel);border:1px solid var(--line-strong);border-radius:3px;padding:1px 4px;font-size:10px;}

        .canvas-wrap{background-color:${dm?'#060a11':'#e8eaed'};background-image:linear-gradient(rgba(128,128,128,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(128,128,128,.06) 1px,transparent 1px);background-size:24px 24px;display:flex;align-items:flex-start;justify-content:center;padding:28px 20px;overflow:auto;min-height:0;}
        .device-frame{background:${dm?'#1e2530':'#343a40'};border-radius:14px;padding:10px;transition:max-width .3s cubic-bezier(.25,.8,.25,1);width:100%;max-width:1040px;box-shadow:0 20px 48px -12px rgba(0,0,0,.4);}
        .device-frame.tablet{max-width:768px;}
        .device-frame.mobile{max-width:390px;}
        .device-frame.preview-frame{max-width:1200px;}
        .device-bar{display:flex;justify-content:center;padding:4px 0 8px;}
        .device-bar span{width:48px;height:4px;border-radius:2px;background:rgba(255,255,255,.18);}
        .site{background:${dm?'#111827':'#fff'};border-radius:6px;overflow:hidden;min-height:500px;}

        .blk{position:relative;border:2px solid transparent;cursor:pointer;transition:border-color .15s;}
        .blk:hover{border-color:#999999;}
        .blk.active{border-color:#1a1a1a;z-index:2;}
        .blk-tag{position:absolute;top:-2px;left:-2px;transform:translateY(-100%);background:#1a1a1a;color:#fff;font-family:var(--body);font-weight:600;font-size:11px;padding:3px 10px;border-radius:5px 5px 0 0;display:none;white-space:nowrap;}
        .blk.active .blk-tag{display:block;}
        .preview-mode .blk{cursor:default;border-color:transparent!important;}
        .preview-mode .blk-tag{display:none!important;}
        .blk.is-hidden{display:none!important;}

        /* ── Site Sections ── */
        .s-header{display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid rgba(0,0,0,.07);}
        .s-header .logo{font-family:var(--disp);font-weight:800;font-size:18px;letter-spacing:-.5px;}
        .s-header .logo-img{height:28px;object-fit:contain;}
        .s-header nav{display:flex;gap:22px;font-size:14px;font-weight:500;color:#666;}
        .s-header nav a{color:inherit;text-decoration:none;transition:color .15s;}
        .s-header nav a:hover{color:#000;}
        .s-header .icons{display:flex;gap:14px;color:#111;}

        @keyframes pulseFire{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
        .s-countdown{padding:11px 24px;text-align:center;font-size:13.5px;font-weight:600;display:flex;justify-content:center;gap:14px;align-items:center;}
        .s-countdown .fire{display:inline-block;animation:pulseFire 1.5s infinite;margin-right:4px;}
        .s-countdown .timer-wrap{display:flex;gap:5px;align-items:center;}
        .s-countdown .timer-box{font-family:var(--mono);background:rgba(0,0,0,.18);padding:3px 8px;border-radius:5px;min-width:34px;font-size:13px;}
        .s-countdown .colon{opacity:.7;}

        .s-hero{padding:64px 32px;position:relative;overflow:hidden;background-size:cover;background-position:center;}
        .s-hero-content{position:relative;z-index:2;max-width:720px;margin:0 auto;}
        .s-hero.has-pattern::after{content:'';position:absolute;inset:0;opacity:.35;z-index:1;pointer-events:none;background-image:radial-gradient(rgba(0,0,0,.1) 1px,transparent 1px);background-size:20px 20px;}
        .s-hero.has-image-bg::before{content:'';position:absolute;inset:0;background:rgba(0,0,0,.28);z-index:1;}
        .s-hero .eyebrow{font-family:var(--mono);font-size:11.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#1a1a1a;margin-bottom:14px;display:inline-block;background:rgba(99,102,241,.1);padding:3px 12px;border-radius:20px;}
        .s-hero h1{font-family:var(--disp);line-height:1.15;margin:0 0 18px;font-weight:800;letter-spacing:-.02em;}
        .s-hero p{max-width:540px;font-size:16px;line-height:1.65;opacity:.88;margin:0 0 28px;}
        .s-hero.align-center p,.s-hero.align-center .eyebrow,.s-hero.align-center h1{text-align:center;margin-left:auto;margin-right:auto;}
        .s-hero.align-right p,.s-hero.align-right .eyebrow,.s-hero.align-right h1{text-align:right;margin-left:auto;}
        .s-hero.align-center .s-hero-content{text-align:center;}
        .s-hero .cta-row{display:flex;gap:12px;flex-wrap:wrap;}
        .s-hero.align-center .cta-row{justify-content:center;}
        .s-hero.align-right .cta-row{justify-content:flex-end;}
        .s-hero .cta{display:inline-block;background:#0a0a0a;color:#fff;padding:13px 28px;font-size:14.5px;font-weight:600;text-decoration:none;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 12px rgba(0,0,0,.15);}
        .s-hero .cta:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.2);}
        .s-hero .cta.rounded{border-radius:8px;}
        .s-hero .cta-secondary{display:inline-block;background:transparent;color:inherit;padding:13px 28px;font-size:14.5px;font-weight:600;text-decoration:none;border:2px solid currentColor;opacity:.8;border-radius:8px;transition:opacity .2s;}
        .s-hero .cta-secondary:hover{opacity:1;}

        .s-grid{padding:52px 32px;}
        .s-grid h3{font-family:var(--disp);font-size:22px;margin:0 0 24px;font-weight:800;text-align:center;}
        .grid-cards{display:grid;gap:20px;max-width:960px;margin:0 auto;}
        .card{border:1px solid rgba(0,0,0,.07);border-radius:10px;overflow:hidden;transition:all .25s;background:#fff;position:relative;}
        .card:hover{transform:translateY(-4px);box-shadow:0 10px 24px rgba(0,0,0,.07);}
        .card .badge{position:absolute;top:10px;left:10px;background:#1a1a1a;color:#fff;font-size:10.5px;font-weight:700;padding:3px 8px;border-radius:4px;z-index:2;}
        .card .thumb{aspect-ratio:1;background:#f8fafc;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
        .card .thumb::before{content:'';position:absolute;inset:18px;border:2px dashed #e2e8f0;border-radius:6px;}
        .card .thumb.has-photo::before{display:none;}
        .card .thumb img{width:100%;height:100%;object-fit:cover;}
        .card .thumb svg{width:28px;height:28px;color:#cbd5e1;}
        .card .info{padding:14px;}
        .card .info .stars{color:#000000;font-size:11px;margin-bottom:5px;letter-spacing:1px;}
        .card .info .n{font-size:14.5px;font-weight:700;color:#111;}
        .card .info .price-row{display:flex;align-items:center;gap:7px;margin-top:5px;}
        .card .info .p-sale{font-size:14px;font-weight:700;color:#1a1a1a;}
        .card .info .p-full{font-size:12px;color:#9ca3af;text-decoration:line-through;}
        .card .add-to-cart{display:block;width:calc(100% - 28px);margin:0 14px 14px;padding:9px;background:#0f172a;color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;text-align:center;transition:opacity .2s;}
        .card .add-to-cart:hover{opacity:.85;}
        a.card{display:block;text-decoration:none;color:inherit;}

        .s-testimonials{padding:60px 32px;}
        .s-testimonials h3{font-family:var(--disp);font-size:22px;margin:0 0 32px;font-weight:800;text-align:center;}
        .testimonials-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:960px;margin:0 auto;}
        .tcard{border:1px solid rgba(0,0,0,.07);border-radius:12px;padding:20px;background:#fff;}
        .tcard .tstars{color:#000000;font-size:12px;margin-bottom:10px;}
        .tcard .ttext{font-size:14px;line-height:1.65;color:#374151;margin-bottom:14px;}
        .tcard .tauthor{display:flex;align-items:center;gap:10px;}
        .tcard .tavatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1a1a1a,#4d4d4d);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;}
        .tcard .tname{font-size:13px;font-weight:700;color:#111;}
        .tcard .trole{font-size:11.5px;color:#6b7280;}

        .s-faq{padding:60px 32px;}
        .s-faq h3{font-family:var(--disp);font-size:22px;margin:0 0 28px;font-weight:800;text-align:center;}
        .faq-list{max-width:680px;margin:0 auto;display:flex;flex-direction:column;gap:8px;}
        .faq-item{border:1px solid rgba(0,0,0,.08);border-radius:10px;overflow:hidden;}
        .faq-q{padding:16px 20px;font-size:14.5px;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:#fff;transition:background .15s;}
        .faq-q:hover{background:#f8fafc;}
        .faq-q .faq-arrow{font-size:12px;color:#6b7280;transition:transform .2s;}
        .faq-q.open .faq-arrow{transform:rotate(180deg);}
        .faq-a{padding:0 20px;max-height:0;overflow:hidden;transition:max-height .3s,padding .3s;font-size:14px;line-height:1.7;color:#4b5563;background:#f8fafc;}
        .faq-a.open{max-height:200px;padding:0 20px 16px;}

        .s-pricing{padding:60px 32px;}
        .s-pricing h3{font-family:var(--disp);font-size:22px;margin:0 0 8px;font-weight:800;text-align:center;}
        .s-pricing .pricing-sub{text-align:center;color:#6b7280;margin:0 0 32px;font-size:15px;}
        .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;margin:0 auto;}
        .plan-card{border:1px solid rgba(0,0,0,.08);border-radius:14px;padding:24px;background:#fff;position:relative;}
        .plan-card.highlight{border-color:#1a1a1a;box-shadow:0 0 0 2px #1a1a1a;}
        .plan-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;font-size:11px;font-weight:700;padding:3px 14px;border-radius:20px;white-space:nowrap;}
        .plan-name{font-family:var(--disp);font-size:16px;font-weight:800;color:#111;margin-bottom:4px;}
        .plan-price{display:flex;align-items:flex-end;gap:2px;margin:12px 0;}
        .plan-price .amt{font-family:var(--disp);font-size:36px;font-weight:800;color:#111;}
        .plan-price .period{font-size:13px;color:#6b7280;margin-bottom:6px;}
        .plan-features{list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:8px;}
        .plan-features li{font-size:13.5px;color:#374151;display:flex;align-items:center;gap:8px;}
        .plan-features li::before{content:'✓';color:#1a1a1a;font-weight:700;flex:none;}
        .plan-cta{display:block;width:100%;padding:11px;border:2px solid #0f172a;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;background:transparent;color:#0f172a;text-align:center;transition:all .15s;}
        .plan-cta:hover,.plan-card.highlight .plan-cta{background:#0f172a;color:#fff;}

        .s-leadform{padding:60px 32px;text-align:center;border-top:1px solid rgba(0,0,0,.06);border-bottom:1px solid rgba(0,0,0,.06);}
        .s-leadform h3{font-family:var(--disp);font-size:24px;margin:0 0 10px;font-weight:800;}
        .s-leadform p.sub{color:#64748b;margin:0 0 22px;font-size:15px;}
        .s-leadform .form-group{display:flex;justify-content:center;max-width:460px;margin:0 auto;box-shadow:0 8px 24px rgba(0,0,0,.08);border-radius:9px;overflow:hidden;background:#fff;padding:4px;}
        .s-leadform input{flex:1;padding:12px 16px;border:none;outline:none;font-family:inherit;font-size:14.5px;background:transparent;}
        .s-leadform button{color:#fff;border:none;padding:0 22px;font-weight:600;cursor:pointer;font-family:inherit;font-size:14px;border-radius:6px;transition:opacity .2s;}
        .s-leadform .trust{font-size:12px;color:#94a3b8;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:5px;}

        .s-text{padding:44px 32px;text-align:center;}
        .s-text p{max-width:560px;margin:0 auto;font-size:15.5px;line-height:1.75;}
        .s-text.align-left p{margin-left:0;text-align:left;}
        .s-text.align-right p{margin-left:auto;text-align:right;}
        .s-text .txt-btn{display:inline-block;margin-top:18px;background:#0a0a0a;color:#fff;padding:11px 24px;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 12px rgba(0,0,0,.12);}
        .s-text .txt-btn:hover{transform:translateY(-2px);}

        .s-banner{padding:48px 40px;text-align:center;background-size:cover;background-position:center;position:relative;}
        .s-banner .banner-overlay{position:absolute;inset:0;background:rgba(0,0,0,.32);}
        .s-banner .banner-content{position:relative;z-index:2;}
        .s-banner h2{font-family:var(--disp);font-weight:800;margin:0 0 8px;line-height:1.2;}
        .s-banner p{margin:0;opacity:.85;font-size:15px;}

        .s-video{padding:52px 32px;text-align:center;}
        .s-video h3{font-family:var(--disp);font-size:22px;margin:0 0 8px;font-weight:800;}
        .s-video .video-sub{color:#6b7280;margin:0 0 24px;font-size:15px;}
        .s-video .video-wrap{max-width:760px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,.15);aspect-ratio:16/9;background:#0f172a;display:flex;align-items:center;justify-content:center;}
        .s-video .video-wrap iframe{width:100%;height:100%;border:none;}
        .s-video .video-placeholder{color:#fff;font-size:40px;opacity:.4;}

        .s-features{padding:52px 32px;}
        .s-features h3{font-family:var(--disp);font-size:22px;margin:0 0 8px;font-weight:800;text-align:center;}
        .s-features .feat-sub{text-align:center;color:#6b7280;margin:0 0 36px;font-size:15px;}
        .features-grid{display:grid;gap:24px;max-width:960px;margin:0 auto;}
        .feat-card{padding:20px;border:1px solid rgba(0,0,0,.06);border-radius:10px;background:#fff;}
        .feat-card .feat-icon{font-size:26px;margin-bottom:10px;}
        .feat-card .feat-title{font-size:14.5px;font-weight:700;color:#111;margin:0 0 6px;}
        .feat-card .feat-desc{font-size:13.5px;color:#6b7280;line-height:1.6;margin:0;}

        .s-footer{padding:44px 44px 28px;color:#d1d5db;display:grid;grid-template-columns:2fr 1fr 1fr;gap:28px;font-size:13px;}
        .s-footer .col-title{font-family:var(--disp);font-weight:700;font-size:14px;margin-bottom:14px;color:#fff;letter-spacing:.4px;}
        .s-footer .col a{color:#9ca3af;text-decoration:none;display:block;margin-bottom:9px;transition:color .15s;}
        .s-footer .col a:hover{color:#fff;}
        .s-footer .brand-desc{color:#9ca3af;line-height:1.6;margin-top:10px;max-width:230px;}
        .s-footer .bottom-bar{grid-column:1/-1;border-top:1px solid #27272a;margin-top:20px;padding-top:20px;text-align:center;color:#71717a;font-size:12px;}

        .s-gallery{padding:52px 32px;}
        .s-gallery h3{font-family:var(--disp);font-size:22px;margin:0 0 24px;font-weight:800;text-align:center;}
        .gallery-grid{display:grid;gap:14px;max-width:960px;margin:0 auto;}
        .gallery-item{margin:0;}
        .gallery-thumb{aspect-ratio:1;background:#f5f5f5;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;border-radius:6px;}
        .gallery-thumb::before{content:'';position:absolute;inset:14px;border:2px dashed #d4d4d4;border-radius:6px;}
        .gallery-thumb.has-photo::before{display:none;}
        .gallery-thumb img{width:100%;height:100%;object-fit:cover;}
        .gallery-thumb svg{width:24px;height:24px;color:#a3a3a3;}
        .gallery-item figcaption{font-size:12px;color:#6b7280;margin-top:8px;text-align:center;}

        .s-map{padding:0;display:grid;grid-template-columns:1.3fr 1fr;min-height:260px;}
        .map-embed{background:#e5e5e5;position:relative;overflow:hidden;}
        .map-embed iframe{width:100%;height:100%;border:none;display:block;min-height:260px;}
        .map-placeholder{width:100%;height:100%;min-height:260px;display:flex;align-items:center;justify-content:center;color:#a3a3a3;}
        .map-info{padding:40px 32px;display:flex;flex-direction:column;justify-content:center;}
        .map-info h3{font-family:var(--disp);font-size:20px;font-weight:800;margin:0 0 10px;}
        .map-info .map-address{font-size:14.5px;line-height:1.6;color:#374151;margin:0 0 6px;}
        .map-info .map-hours{font-size:13px;color:#6b7280;margin:0;}

        .s-newsletter-wrap{padding:52px 32px;display:flex;justify-content:center;}
        .newsletter-popup{position:relative;max-width:400px;width:100%;background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:14px;padding:32px 28px;text-align:center;box-shadow:0 20px 48px -12px rgba(0,0,0,.18);}
        .newsletter-popup .popup-close{position:absolute;top:12px;right:14px;font-size:12px;color:#9ca3af;cursor:default;}
        .newsletter-popup h3{font-family:var(--disp);font-size:19px;font-weight:800;margin:0 0 8px;}
        .newsletter-popup p{font-size:13.5px;color:#6b7280;line-height:1.55;margin:0 0 18px;}
        .newsletter-popup .form-group{display:flex;flex-direction:column;gap:8px;}
        .newsletter-popup input{padding:11px 14px;border:1px solid #d4d4d4;border-radius:7px;font-family:inherit;font-size:14px;}
        .newsletter-popup button{color:#fff;border:none;padding:11px;font-weight:600;cursor:pointer;font-family:inherit;font-size:14px;border-radius:7px;}
        .newsletter-popup .popup-dismiss{font-size:12px;color:#9ca3af;margin-top:12px;text-decoration:underline;cursor:default;}

        /* Right panel */
        .rp-head{padding:14px 18px 0;border-bottom:1px solid var(--line);padding-bottom:14px;}
        .rp-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;}
        .rp-title{font-family:var(--disp);font-weight:800;font-size:14px;display:flex;align-items:center;gap:7px;color:var(--ink);}
        .rp-sub{font-size:11.5px;color:var(--ink-soft);margin-top:3px;}
        .section-badge{font-family:var(--mono);font-size:9.5px;font-weight:600;color:#1a1a1a;letter-spacing:.06em;margin-bottom:6px;display:inline-block;background:${dm?'#1a1a1a':'#f0f0f0'};padding:3px 7px;border-radius:4px;}
        .rp-quick-actions{display:flex;gap:4px;}
        .rp-quick-actions button{width:26px;height:26px;border-radius:6px;border:1px solid var(--line-strong);background:var(--panel-2);font-size:11.5px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-soft);}
        .rp-quick-actions button:hover{background:var(--panel);}
        .rp-quick-actions button.danger:hover{background:${dm?'#262626':'#f5f5f5'};border-color:${dm?'#333333':'#d4d4d4'};color:#1a1a1a;}
        .tabs{display:flex;gap:3px;margin:12px 16px 0;background:var(--panel);border-radius:8px;padding:3px;}
        .tabs button{flex:1;border:none;background:transparent;padding:7px 0;font-size:12px;font-weight:600;color:var(--ink-soft);border-radius:6px;cursor:pointer;transition:all .15s;}
        .tabs button.active{background:var(--panel-2);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.08);}
        .rp-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px;}
        .field{display:flex;flex-direction:column;gap:6px;}
        .field label{font-size:12px;font-weight:600;color:var(--ink);display:flex;justify-content:space-between;align-items:center;}
        .field label .val{font-family:var(--mono);font-weight:400;color:#1a1a1a;font-size:10.5px;background:${dm?'#1a1a1a':'#f0f0f0'};padding:2px 6px;border-radius:4px;}
        .input{border:1px solid var(--line-strong);border-radius:7px;padding:9px 11px;font-size:12.5px;font-family:inherit;color:var(--ink);background:var(--panel-2);transition:border-color .15s,box-shadow .15s;width:100%;}
        .input:focus{border-color:#1a1a1a;outline:none;box-shadow:0 0 0 3px rgba(99,102,241,.12);}
        textarea.input{resize:vertical;min-height:72px;line-height:1.55;}
        input[type="color"].input{padding:3px;height:36px;cursor:pointer;}
        .align-group,.radio-group{display:flex;border:1px solid var(--line-strong);border-radius:7px;overflow:hidden;width:100%;background:var(--panel);}
        .align-group button,.radio-group button{flex:1;height:34px;border:none;background:transparent;border-right:1px solid var(--line-strong);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-soft);font-size:12px;font-weight:500;}
        .align-group button:last-child,.radio-group button:last-child{border-right:none;}
        .align-group button.active,.radio-group button.active{background:var(--panel-2);color:var(--ink);font-weight:600;}
        .color-preset{display:flex;gap:6px;flex-wrap:wrap;margin-top:3px;}
        .c-btn{width:30px;height:30px;border-radius:6px;border:1px solid rgba(0,0,0,.1);cursor:pointer;transition:transform .1s;}
        .c-btn:hover{transform:scale(1.1);}
        .c-btn.active{box-shadow:0 0 0 2px var(--panel-2),0 0 0 4px #1a1a1a;}
        .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:8px 11px;background:var(--panel);border:1px solid var(--line);border-radius:7px;}
        .toggle-row .t-label{font-size:12.5px;font-weight:600;color:var(--ink);}
        .toggle-row .t-sub{font-size:11px;color:var(--ink-soft);margin-top:1px;}
        .product-card-edit{border:1px solid var(--line-strong);border-radius:8px;padding:11px;display:flex;flex-direction:column;gap:7px;background:var(--panel);}
        .product-card-edit .pc-top{display:flex;justify-content:space-between;align-items:center;}
        .product-card-edit .pc-remove{font-size:11px;color:#1a1a1a;cursor:pointer;background:none;border:none;font-weight:600;}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
        .img-upload-btn{border:1px dashed var(--line-strong);background:var(--panel);border-radius:7px;padding:12px;font-size:12px;font-weight:600;color:var(--ink-soft);cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:5px;}
        .img-upload-btn:hover{border-color:#1a1a1a;color:#1a1a1a;background:${dm?'#1a1a1a':'#f0f0f0'};}
        .img-preview-wrap{position:relative;border-radius:7px;overflow:hidden;border:1px solid var(--line-strong);}
        .img-preview{width:100%;height:88px;object-fit:cover;display:block;background:var(--panel);}
        .img-remove{position:absolute;top:5px;right:5px;background:rgba(17,24,39,.75);color:#fff;border:none;font-size:10.5px;font-weight:600;padding:3px 8px;border-radius:5px;cursor:pointer;}
        .img-remove:hover{background:#000000;}
        .link-row{display:flex;gap:5px;align-items:center;}
        .link-row .input{font-size:12px;}
        .link-row input.link-label{flex:1;}
        .link-row input.link-url{flex:1.3;font-family:var(--mono);font-size:11px;}
        .link-remove{flex:none;width:28px;height:32px;border:1px solid var(--line-strong);background:var(--panel-2);border-radius:5px;color:#1a1a1a;cursor:pointer;font-size:11px;}
        .link-remove:hover{background:${dm?'#262626':'#f5f5f5'};border-color:${dm?'#333333':'#d4d4d4'};}
        .link-list{display:flex;flex-direction:column;gap:5px;margin-bottom:6px;}
        .color-row{display:flex;gap:7px;align-items:center;}
        .color-swatch{width:40px;flex:none;padding:3px;height:36px;cursor:pointer;}
        .hex-input{flex:1;font-family:var(--mono);text-transform:uppercase;}

        /* Modals */
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:100;}
        .modal-card{background:var(--panel-2);border-radius:12px;width:480px;max-width:92vw;max-height:82vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 48px -8px rgba(0,0,0,.45);}
        .modal-head{padding:16px 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;}
        .modal-head h3{margin:0;font-family:var(--disp);font-size:14.5px;font-weight:800;color:var(--ink);}
        .modal-close{background:none;border:none;font-size:16px;cursor:pointer;color:var(--ink-soft);}
        .modal-grid{padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:9px;overflow-y:auto;}
        .type-card{border:1px solid var(--line-strong);border-radius:9px;padding:14px 11px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:7px;background:var(--panel-2);transition:all .12s;}
        .type-card:hover{border-color:#1a1a1a;background:${dm?'#1a1a1a':'#f0f0f0'};transform:translateY(-2px);}
        .type-card .ic{font-size:22px;}
        .type-card .lb{font-size:12px;font-weight:600;color:var(--ink);}
        .version-save-row{padding:12px 16px;border-bottom:1px solid var(--line);display:flex;gap:7px;}
        .version-list{padding:10px 14px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:7px;}
        .version-row{display:flex;justify-content:space-between;align-items:center;padding:9px 11px;border:1px solid var(--line-strong);border-radius:7px;}
        .version-name{font-size:13px;font-weight:600;color:var(--ink);}
        .version-time{font-size:11px;color:var(--ink-soft);margin-top:1px;}
        .v-actions{display:flex;gap:5px;}
        .v-actions button{font-size:11px;padding:5px 9px;border-radius:5px;border:1px solid var(--line-strong);background:var(--panel-2);cursor:pointer;font-weight:600;color:var(--ink);}
        .v-actions button.primary{color:#333333;border-color:${dm?'#4d4d4d':'#cccccc'};}
        .v-actions button.danger{color:#1a1a1a;border-color:${dm?'#333333':'#d4d4d4'};}
        .confirm-card{width:360px;}
        .confirm-body{padding:18px;}
        .confirm-body p{margin:0 0 6px;font-size:13.5px;color:var(--ink);line-height:1.5;}
        .confirm-body p.confirm-sub{font-size:11.5px;color:var(--ink-soft);margin-bottom:0;}
        .confirm-actions{display:flex;gap:7px;justify-content:flex-end;padding:12px 18px;border-top:1px solid var(--line);}
        .btn-danger{background:#000000;border:1px solid #000000;color:#fff;}
        .btn-danger:hover{background:#000000;}
        .catalog-card{width:430px;}
        .catalog-list{padding:10px 14px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:7px;}
        .catalog-row{display:flex;justify-content:space-between;align-items:center;padding:9px 11px;border:1px solid var(--line-strong);border-radius:7px;}
        .catalog-name{font-size:13px;font-weight:600;color:var(--ink);}
        .catalog-price{font-size:12px;color:#1a1a1a;font-weight:700;margin-top:1px;}
        .catalog-full{font-size:11px;color:#9ca3af;text-decoration:line-through;margin-left:5px;font-weight:400;}
        .export-modal{width:500px;}
        .export-body{padding:18px;display:flex;flex-direction:column;gap:14px;}
        .export-body pre{background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:14px;font-family:var(--mono);font-size:11px;overflow-x:auto;color:var(--ink-soft);max-height:160px;overflow-y:auto;white-space:pre-wrap;}
        .font-grid{padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:9px;overflow-y:auto;}
        .font-card{border:2px solid var(--line-strong);border-radius:9px;padding:14px;cursor:pointer;background:var(--panel-2);transition:all .12s;}
        .font-card:hover{border-color:#1a1a1a;}
        .font-card.active{border-color:#1a1a1a;background:${dm?'#1a1a1a':'#f0f0f0'};}
        .font-card .fc-label{font-size:11.5px;font-weight:700;color:var(--ink-soft);margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em;}
        .font-card .fc-preview{font-size:19px;font-weight:700;color:var(--ink);}
        .empty-tip{text-align:center;padding:36px 0;}
        .empty-tip p{font-size:12.5px;color:var(--ink-soft);margin:0;}

        .timer-box{display:flex;flex-direction:column;align-items:center;line-height:1.1;}
        .timer-box em{font-style:normal;font-size:8px;opacity:.75;margin-top:1px;letter-spacing:.02em;}
        .timer-ended{font-weight:700;}

        ::-webkit-scrollbar{width:7px;height:7px;}
        ::-webkit-scrollbar-thumb{background:var(--line-strong);border-radius:4px;}
        ::-webkit-scrollbar-thumb:hover{background:var(--ink-faint);}
        ::-webkit-scrollbar-track{background:transparent;}
        .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:${dm?'#e5e7eb':'#111827'};color:${dm?'#111':'#fff'};padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.2);z-index:200;display:flex;align-items:center;gap:7px;}

        @media(max-width:480px){
          .device-frame.mobile .s-header nav{display:none;}
          .device-frame.mobile .s-hero{padding:44px 18px;}
          .device-frame.mobile .grid-cards{grid-template-columns:1fr!important;}
          .device-frame.mobile .testimonials-grid,.device-frame.mobile .pricing-grid,.device-frame.mobile .features-grid{grid-template-columns:1fr!important;}
          .device-frame.mobile .s-footer{grid-template-columns:1fr;text-align:center;}
          .device-frame.mobile .s-map{grid-template-columns:1fr;}
          .device-frame.mobile .gallery-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
        .device-frame.mobile .sec-mobile-hide{display:none!important;}
        .device-frame.tablet .sec-tablet-hide{display:none!important;}
      ` }} />

      <div className="app-container">
        <div className="app">
          {/* TOP BAR */}
          <header className="topbar">
            <div className="brand"><div className="mark"></div>STOREBUILDER</div>
            <span style={{fontSize:'12px',color:'var(--ink-soft)',fontWeight:600,background:'var(--panel)',padding:'4px 10px',borderRadius:'6px',border:'1px solid var(--line)'}}>{siteName}</span>
            <div className="topbar-spacer"></div>

            {!previewMode && (
              <div className="history-btns">
                <button onClick={undo} disabled={!(past.current[activePage.id]||[]).length} title="Undo (Ctrl+Z)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-1"/></svg>
                </button>
                <button onClick={redo} disabled={!(future.current[activePage.id]||[]).length} title="Redo (Ctrl+Shift+Z)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h1"/></svg>
                </button>
                <button onClick={() => setShowVersionModal(true)} title="Version History">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                </button>
              </div>
            )}

            {!previewMode && <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowFontModal(true)}>Fonts</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setDarkMode(d=>!d)}>{dm ? 'Light' : 'Dark'}</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowExportModal(true)}>Export</button>
            </>}

            {!previewMode && (
              <div className="device-switch">
                {['desktop','tablet','mobile'].map(d => (
                  <button key={d} className={device===d?'active':''} onClick={()=>setDevice(d)} title={d.charAt(0).toUpperCase()+d.slice(1)}>
                    {d==='desktop' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><path d="M8 20h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}
                    {d==='tablet' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg>}
                    {d==='mobile' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M11 19h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}
                  </button>
                ))}
              </div>
            )}

            <button className="btn btn-ghost" onClick={() => setPreviewMode(p=>!p)}>{previewMode ? 'Back to Edit' : 'Preview'}</button>
            {!previewMode && <button className="btn btn-dark" onClick={() => showToast('Published successfully')}>Publish</button>}
          </header>

          <div className={`main ${previewMode?'preview-mode':''}`}>
            {/* LEFT */}
            {!previewMode && (
              <aside className="sidebar-left">
                <div className="pages-bar">
                  {pages.map(pg => (
                    <div key={pg.id} className={`page-tab ${activePage.id===pg.id?'active':''}`} onClick={()=>setActivePageId(pg.id)}>
                      {renamingPageId===pg.id ? (
                        <input
                          className="page-tab-input" autoFocus value={renameInput}
                          onClick={e=>e.stopPropagation()}
                          onChange={e=>setRenameInput(e.target.value)}
                          onBlur={()=>{renamePage(pg.id,renameInput.trim());setRenamingPageId(null);}}
                          onKeyDown={e=>{if(e.key==='Enter'){renamePage(pg.id,renameInput.trim());setRenamingPageId(null);} if(e.key==='Escape')setRenamingPageId(null);}}
                        />
                      ) : (
                        <span className="page-tab-label" onDoubleClick={e=>{e.stopPropagation();setRenamingPageId(pg.id);setRenameInput(pg.name);}} title="Double-click to rename">{pg.name}</span>
                      )}
                      {activePage.id===pg.id && (
                        <span className="page-tab-actions">
                          <button className="icon-btn" title="Duplicate page" onClick={e=>{e.stopPropagation();duplicatePage(pg.id);}}>⧉</button>
                          {pages.length>1 && <button className="icon-btn" title="Delete page" onClick={e=>{e.stopPropagation();requestDeletePage(pg.id);}}>✕</button>}
                        </span>
                      )}
                    </div>
                  ))}
                  <button className="page-tab-add" onClick={addPage} title="Add Page">+ Page</button>
                </div>
                <div className="side-head">
                  <h2>Page Structure</h2>
                  <span className="side-head-hint">Ctrl+Click multi-select</span>
                </div>
                {multiSelect.size > 1 && (
                  <div className="bulk-bar">
                    <span>{multiSelect.size} selected</span><span className="spacer"></span>
                    <button onClick={bulkShow}>Show</button>
                    <button onClick={bulkHide}>Hide</button>
                    <button className="danger" onClick={requestBulkDelete}>Delete</button>
                    <button onClick={()=>setMultiSelect(activeId?new Set([activeId]):new Set())}>Clear</button>
                  </div>
                )}
                <div className="section-list">
                  {sections.map((s,idx) => (
                    <div
                      key={s.id} draggable
                      onDragStart={()=>setDragIndex(idx)}
                      onDragOver={(e)=>{e.preventDefault();setDragOverIndex(idx);}}
                      onDragLeave={()=>setDragOverIndex(d=>d===idx?null:d)}
                      onDrop={(e)=>{e.preventDefault();reorder(dragIndex,idx);setDragIndex(null);setDragOverIndex(null);}}
                      onDragEnd={()=>{setDragIndex(null);setDragOverIndex(null);}}
                      className={`sec-row ${activeId===s.id?'selected':''} ${multiSelect.has(s.id)&&multiSelect.size>1?'multi-selected':''} ${!s.visible?'hidden-sec':''} ${dragOverIndex===idx?'drag-over':''}`}
                      onClick={(e)=>handleRowClick(e,s.id)}
                    >
                      <button className="icon-btn grip" title="Drag to reorder">⣿</button>
                      <span className="name">{TYPE_META[s.type].tag}</span>
                      <div className="row-actions">
                        <button className="icon-btn" title="Duplicate" onClick={(e)=>{e.stopPropagation();duplicateSection(s.id);}}>⧉</button>
                        <button className="icon-btn" title={s.visible?'Hide':'Show'} onClick={(e)=>toggleVisibility(s.id,e)}>{s.visible?'◉':'○'}</button>
                        <button className="icon-btn" title="Delete" onClick={(e)=>{e.stopPropagation();requestDeleteSection(s.id);}}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="kbd-hint"><kbd>Delete</kbd> delete &nbsp;<kbd>Ctrl+D</kbd> duplicate &nbsp;<kbd>Ctrl+Z</kbd> undo</div>
                <button className="add-section-btn" onClick={()=>setShowAddModal(true)}>+ Add Block</button>
              </aside>
            )}

            {/* CANVAS */}
            <main className="canvas-wrap">
              <div className={`device-frame ${device} ${previewMode?'preview-frame':''}`}>
                <div className="device-bar"><span></span></div>
                <div className="site">
                  {sections.map(s => (
                    <SectionBlock
                      key={s.id} section={s} active={activeId===s.id}
                      onSelect={()=>{setActiveId(s.id);setMultiSelect(new Set([s.id]));}}
                      expandedFaq={expandedFaq} onToggleFaq={(id)=>setExpandedFaq(p=>({...p,[id]:!p[id]}))}
                    />
                  ))}
                  {sections.length===0 && <div style={{padding:'80px 20px',textAlign:'center',color:'#94a3b8'}}>No blocks yet. Click "+ Add Block" to get started.</div>}
                </div>
              </div>
            </main>

            {/* RIGHT PANEL */}
            {!previewMode && activeSection && (
              <aside className="sidebar-right">
                <div className="rp-head">
                  <div className="rp-title-row">
                    <div>
                      <div className="section-badge">{meta.tag}</div>
                      <div className="rp-title">{meta.title}</div>
                    </div>
                    <div className="rp-quick-actions">
                      <button onClick={()=>duplicateSection(activeSection.id)} title="Duplicate">⧉</button>
                      <button className="danger" onClick={()=>requestDeleteSection(activeSection.id)} title="Delete">✕</button>
                    </div>
                  </div>
                  <div className="rp-sub">{meta.sub}</div>
                </div>
                <div className="tabs">
                  {['content','style','advanced'].map(t=>(
                    <button key={t} className={activeTab===t?'active':''} onClick={()=>setActiveTab(t)}>
                      {t.charAt(0).toUpperCase()+t.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="rp-body">
                  {activeTab==='content' && (
                    <ContentPanel
                      section={activeSection}
                      patchData={p=>patchData(activeSection.id,p)}
                      updateProduct={(pid,p)=>updateProduct(activeSection.id,pid,p)}
                      addProduct={()=>addProduct(activeSection.id)}
                      removeProduct={pid=>removeProduct(activeSection.id,pid)}
                      updateListItem={(k,i,p)=>updateListItem(activeSection.id,k,i,p)}
                      addListItem={(k,def)=>addListItem(activeSection.id,k,def)}
                      removeListItem={(k,i)=>removeListItem(activeSection.id,k,i)}
                      updateItem={(k,id,p)=>updateItem(activeSection.id,k,id,p)}
                      addItem={(k,def)=>addItem(activeSection.id,k,def)}
                      removeItem={(k,id)=>removeItem(activeSection.id,k,id)}
                      openCatalog={()=>{setCatalogTargetId(activeSection.id);setShowCatalogModal(true);}}
                    />
                  )}
                  {activeTab==='style' && (
                    <StylePanel
                      section={activeSection}
                      patchData={p=>patchData(activeSection.id,p)}
                      patchDataCommit={p=>patchDataCommit(activeSection.id,p)}
                    />
                  )}
                  {activeTab==='advanced' && (
                    <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                      <div className="field">
                        <label>Facebook Pixel ID</label>
                        <input className="input" placeholder="e.g. 123456789012345" value={facebookPixel} onChange={e=>setFacebookPixel(e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Google Analytics ID</label>
                        <input className="input" placeholder="e.g. G-XXXXXXXXXX" value={googleAnalytics} onChange={e=>setGoogleAnalytics(e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Site Name</label>
                        <input className="input" value={siteName} onChange={e=>setSiteName(e.target.value)} />
                      </div>
                      {['hideOnTablet','hideOnMobile'].map(key=>(
                        <div className="toggle-row" key={key}>
                          <div>
                            <div className="t-label">Hide on {key==='hideOnTablet'?'Tablet':'Mobile'}</div>
                            <div className="t-sub">{key==='hideOnTablet'?'Hidden on tablet screens':'Hidden on smartphone screens'}</div>
                          </div>
                          <input type="checkbox" checked={activeSection[key]} onChange={e=>commit(sections.map(s=>s.id===activeSection.id?{...s,[key]:e.target.checked}:s))} style={{accentColor:'#1a1a1a',width:'15px',height:'15px'}}/>
                        </div>
                      ))}
                      <div className="toggle-row">
                        <div>
                          <div className="t-label">Block Visible</div>
                          <div className="t-sub">Toggle to show/hide without deleting</div>
                        </div>
                        <input type="checkbox" checked={activeSection.visible} onChange={e=>commit(sections.map(s=>s.id===activeSection.id?{...s,visible:e.target.checked}:s))} style={{accentColor:'#1a1a1a',width:'15px',height:'15px'}}/>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* ADD BLOCK MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={()=>setShowAddModal(false)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>Add a Block</h3><button className="modal-close" onClick={()=>setShowAddModal(false)}>✕</button></div>
            <div className="modal-grid">
              {ADDABLE_TYPES.map(t=>(
                <div key={t} className="type-card" onClick={()=>addSection(t)}>
                  <div className="lb">{TYPE_META[t].tag}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VERSIONS MODAL */}
      {showVersionModal && (
        <div className="modal-overlay" onClick={()=>setShowVersionModal(false)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>Version History</h3><button className="modal-close" onClick={()=>setShowVersionModal(false)}>✕</button></div>
            <div className="version-save-row">
              <input className="input" placeholder="Version name (e.g. Before redesign)" value={versionNameInput} onChange={e=>setVersionNameInput(e.target.value)}/>
              <button className="btn btn-dark" style={{flexShrink:0}} onClick={saveVersion}>Save Version</button>
            </div>
            <div className="version-list">
              {versions.length===0 && <div className="empty-tip"><p>No saved versions yet. Save the current state to restore later.</p></div>}
              {[...versions].reverse().map(v=>(
                <div className="version-row" key={v.id}>
                  <div><div className="version-name">{v.name}</div><div className="version-time">{v.savedAt}</div></div>
                  <div className="v-actions">
                    <button className="primary" onClick={()=>restoreVersion(v.id)}>Restore</button>
                    <button className="danger" onClick={()=>requestDeleteVersion(v.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="modal-overlay" onClick={()=>setShowExportModal(false)}>
          <div className="modal-card export-modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>Export</h3><button className="modal-close" onClick={()=>setShowExportModal(false)}>✕</button></div>
            <div className="export-body">
              <p style={{fontSize:'13px',color:'var(--ink-soft)',lineHeight:1.6,margin:0}}>Export your store page as a standalone HTML file. It will include your current fonts, dark/light mode, and all visible blocks.</p>
              <div>
                <div style={{fontSize:'12px',fontWeight:600,color:'var(--ink)',marginBottom:'6px'}}>Preview snippet:</div>
                <pre>{`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8"/>\n  <title>${siteName}</title>\n  <!-- ${fp.display} + ${fp.body} -->\n  <!-- ${sections.filter(s=>s.visible).length} blocks exported -->\n</head>\n<body>...</body>\n</html>`}</pre>
              </div>
              <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
                <button className="btn btn-ghost" onClick={()=>setShowExportModal(false)}>Cancel</button>
                <button className="btn btn-dark" onClick={()=>{exportHTML();setShowExportModal(false);}}>Download store.html</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FONT MODAL */}
      {showFontModal && (
        <div className="modal-overlay" onClick={()=>setShowFontModal(false)}>
          <div className="modal-card" style={{width:'420px'}} onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>Choose Font Pair</h3><button className="modal-close" onClick={()=>setShowFontModal(false)}>✕</button></div>
            <div className="font-grid">
              {FONT_OPTIONS.map(f=>(
                <div key={f.label} className={`font-card ${fontPair===f.label?'active':''}`} onClick={()=>{setFontPair(f.label);setShowFontModal(false);showToast(`Font: ${f.label}`);}}>
                  <div className="fc-label">{f.label}</div>
                  <div className="fc-preview" style={{fontFamily:`'${f.display}',sans-serif`}}>Hello World</div>
                  <div style={{fontSize:'12px',color:'var(--ink-soft)',marginTop:'3px',fontFamily:`'${f.body}',sans-serif`}}>The quick brown fox</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM */}
      {confirmModal && (
        <div className="modal-overlay" onClick={()=>setConfirmModal(null)}>
          <div className="modal-card confirm-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>Confirm Delete</h3><button className="modal-close" onClick={()=>setConfirmModal(null)}>✕</button></div>
            <div className="confirm-body">
              <p>{confirmModal.type==='bulk'?`Delete ${confirmModal.count} selected blocks?`:confirmModal.type==='version'?`Delete version "${confirmModal.label}"?`:confirmModal.type==='page'?`Delete page "${confirmModal.label}"?`:`Delete block "${confirmModal.label}"?`}</p>
              <p className="confirm-sub">{(confirmModal.type==='version'||confirmModal.type==='page')?'This cannot be undone.':'You can press Ctrl+Z to undo.'}</p>
            </div>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={()=>setConfirmModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* CATALOG */}
      {showCatalogModal && (
        <div className="modal-overlay" onClick={()=>setShowCatalogModal(false)}>
          <div className="modal-card catalog-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>Product Catalog</h3><button className="modal-close" onClick={()=>setShowCatalogModal(false)}>✕</button></div>
            <div className="catalog-list">
              {PRODUCT_CATALOG.map((item,i)=>(
                <div className="catalog-row" key={i}>
                  <div>
                    <div className="catalog-name">{item.name}</div>
                    <div className="catalog-price">${item.price}{item.priceFull&&<span className="catalog-full">${item.priceFull}</span>}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>addProductFromCatalog(catalogTargetId,item)}>+ Add</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  );
}

// ─── Canvas Block ──────────────────────────────────────────────────
function SectionBlock({ section, active, onSelect, expandedFaq, onToggleFaq }) {
  const { type, data, visible, hideOnMobile, hideOnTablet } = section;
  const cls = `blk ${active?'active':''} ${!visible?'is-hidden':''} ${hideOnMobile?'sec-mobile-hide':''} ${hideOnTablet?'sec-tablet-hide':''}`;

  return (
    <div className={cls} onClick={onSelect}>
      <span className="blk-tag">{TYPE_META[type].tag}</span>

      {type==='header' && (
        <div className="s-header" style={{background:data.bgColor,color:data.textColor}}>
          {data.logoImage ? <img className="logo-img" src={data.logoImage} alt={data.logoText}/> : <div className="logo">{data.logoText}</div>}
          <nav>{data.navItems.map((n,i)=><a key={i} href={n.url||'#'} onClick={e=>{if(!n.url||n.url==='#')e.preventDefault();}}>{n.label}</a>)}</nav>
          <div className="icons">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </div>
        </div>
      )}

      {type==='countdown' && (
        <div className="s-countdown" style={{background:data.bgColor,color:data.textColor}}>
          <div>{data.promoText}</div>
          <CountdownTimer endDateTime={data.endDateTime}/>
        </div>
      )}

      {type==='hero' && (
        <div
          className={`s-hero align-${data.align} ${data.hasPattern?'has-pattern':''} ${data.bgType==='image'&&data.bgImage?'has-image-bg':''}`}
          style={{
            background: data.bgType==='image'?(data.bgImage?`url(${data.bgImage})`:'#cbd5e1'):data.bgType==='gradient'?data.gradient:data.bgColor,
            color:data.textColor, paddingTop:`${data.padding}px`, paddingBottom:`${data.padding}px`,
          }}
        >
          <div className="s-hero-content">
            <div className="eyebrow">{data.eyebrow}</div>
            <h1 style={{fontSize:`${data.fontSize}px`}} dangerouslySetInnerHTML={{__html:data.heading.replace(/\n/g,'<br/>')}}></h1>
            <p>{data.desc}</p>
            <div className="cta-row">
              <a className={`cta ${data.roundedCta?'rounded':''}`} href={data.ctaUrl||'#'} onClick={e=>{if(!data.ctaUrl)e.preventDefault();}}>{data.cta}</a>
              {data.ctaSecondary && <a className="cta-secondary" href={data.ctaSecondaryUrl||'#'} onClick={e=>{if(!data.ctaSecondaryUrl)e.preventDefault();}}>{data.ctaSecondary}</a>}
            </div>
          </div>
        </div>
      )}

      {type==='grid' && (
        <div className="s-grid" style={{background:data.bgColor}}>
          <h3>{data.heading}</h3>
          <div className="grid-cards" style={{gridTemplateColumns:`repeat(${data.columns},1fr)`}}>
            {data.products.map(p=>(
              <a className="card" key={p.id} href={p.url||'#'} onClick={e=>{if(!p.url)e.preventDefault();}}>
                {p.badge && <div className="badge">{p.badge}</div>}
                <div className={`thumb ${p.image?'has-photo':''}`}>
                  {p.image ? <img src={p.image} alt={p.name}/> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>}
                </div>
                <div className="info">
                  <div className="stars">{'★'.repeat(p.rating)}{'☆'.repeat(5-p.rating)} <span style={{color:'#9ca3af',fontSize:'11px'}}>({p.reviews})</span></div>
                  <div className="n">{p.name}</div>
                  <div className="price-row">
                    <span className={p.priceFull?'p-sale':'n'}>${p.price}</span>
                    {p.priceFull && <span className="p-full">${p.priceFull}</span>}
                  </div>
                </div>
                {data.showAddToCart && <div className="add-to-cart">Add to Cart</div>}
              </a>
            ))}
          </div>
        </div>
      )}

      {type==='gallery' && (
        <div className="s-gallery" style={{background:data.bgColor}}>
          <h3>{data.heading}</h3>
          <div className="gallery-grid" style={{gridTemplateColumns:`repeat(${data.columns},1fr)`}}>
            {data.images.map(img=>(
              <figure className="gallery-item" key={img.id}>
                <div className={`gallery-thumb ${img.src?'has-photo':''}`}>
                  {img.src ? <img src={img.src} alt={img.caption}/> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>}
                </div>
                {img.caption && <figcaption>{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      )}

      {type==='map' && (
        <div className="s-map" style={{background:data.bgColor}}>
          <div className="map-embed">
            {data.mapEmbedUrl ? <iframe src={data.mapEmbedUrl} loading="lazy" title="Store location"/> : (
              <div className="map-placeholder">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-7-6.1-7-11a7 7 0 0114 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
              </div>
            )}
          </div>
          <div className="map-info">
            <h3>{data.heading}</h3>
            <p className="map-address">{data.address}</p>
            {data.hours && <p className="map-hours">{data.hours}</p>}
          </div>
        </div>
      )}

      {type==='newsletter' && (
        <div className="s-newsletter-wrap" style={{background:data.bgColor}}>
          <div className="newsletter-popup" style={{color:data.textColor}}>
            <div className="popup-close">✕</div>
            <h3>{data.heading}</h3>
            <p>{data.sub}</p>
            <div className="form-group">
              <input type="email" placeholder={data.placeholder} readOnly/>
              <button style={{background:data.buttonColor}}>{data.buttonText}</button>
            </div>
            <div className="popup-dismiss">{data.dismissText}</div>
          </div>
        </div>
      )}

      {type==='testimonials' && (
        <div className="s-testimonials" style={{background:data.bgColor}}>
          <h3>{data.heading}</h3>
          <div className="testimonials-grid">
            {data.items.map(t=>(
              <div className="tcard" key={t.id}>
                <div className="tstars">{'★'.repeat(t.rating)}{'☆'.repeat(5-t.rating)}</div>
                <div className="ttext">"{t.text}"</div>
                <div className="tauthor">
                  <div className="tavatar">{t.name.charAt(0)}</div>
                  <div><div className="tname">{t.name}</div><div className="trole">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {type==='faq' && (
        <div className="s-faq" style={{background:data.bgColor}}>
          <h3>{data.heading}</h3>
          <div className="faq-list">
            {data.items.map(f=>(
              <div className="faq-item" key={f.id}>
                <div className={`faq-q ${expandedFaq[f.id]?'open':''}`} onClick={e=>{e.stopPropagation();onToggleFaq(f.id);}}>
                  {f.q}<span className="faq-arrow">▼</span>
                </div>
                <div className={`faq-a ${expandedFaq[f.id]?'open':''}`}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {type==='pricing' && (
        <div className="s-pricing" style={{background:data.bgColor}}>
          <h3>{data.heading}</h3>
          <p className="pricing-sub">{data.sub}</p>
          <div className="pricing-grid">
            {data.plans.map(p=>(
              <div className={`plan-card ${p.highlight?'highlight':''}`} key={p.id}>
                {p.badge && <div className="plan-badge">{p.badge}</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price"><span className="amt">${p.price}</span><span className="period">/{p.period}</span></div>
                <ul className="plan-features">{p.features.map((f,i)=><li key={i}>{f}</li>)}</ul>
                <a className="plan-cta" href={p.ctaUrl||'#'} onClick={e=>{if(!p.ctaUrl||p.ctaUrl==='#')e.preventDefault();}}>{p.cta}</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {type==='leadForm' && (
        <div className="s-leadform" style={{background:data.bgColor}}>
          <h3>{data.heading}</h3>
          <p className="sub">{data.sub}</p>
          <div className="form-group">
            <input type="email" placeholder={data.placeholder} readOnly/>
            <button style={{background:data.buttonColor}}>{data.buttonText}</button>
          </div>
          <div className="trust">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            {data.trustText}
          </div>
        </div>
      )}

      {type==='text' && (
        <div className={`s-text align-${data.align||'center'}`} style={{background:data.bgColor}}>
          <p style={{color:data.textColor}} dangerouslySetInnerHTML={{__html:data.content.replace(/\n/g,'<br/>')}}></p>
          {data.btnText && <a className="txt-btn" href={data.btnUrl||'#'} onClick={e=>{if(!data.btnUrl)e.preventDefault();}}>{data.btnText}</a>}
        </div>
      )}

      {type==='banner' && (
        <div className="s-banner" style={{background:data.bgImage?`url(${data.bgImage}) center/cover no-repeat`:data.bgColor,color:data.textColor}}>
          {data.bgImage && <div className="banner-overlay"></div>}
          <div className="banner-content">
            <h2 style={{fontSize:`${data.fontSize}px`}}>{data.text}</h2>
            {data.subText && <p>{data.subText}</p>}
          </div>
        </div>
      )}

      {type==='video' && (
        <div className="s-video" style={{background:data.bgColor}}>
          <h3>{data.heading}</h3>
          {data.sub && <p className="video-sub">{data.sub}</p>}
          <div className="video-wrap">
            {data.videoUrl ? <iframe src={data.videoUrl} allowFullScreen title="Video"/> : <div className="video-placeholder">▶</div>}
          </div>
        </div>
      )}

      {type==='features' && (
        <div className="s-features" style={{background:data.bgColor}}>
          <h3>{data.heading}</h3>
          {data.sub && <p className="feat-sub">{data.sub}</p>}
          <div className="features-grid" style={{gridTemplateColumns:`repeat(${data.columns||3},1fr)`}}>
            {data.items.map(f=>(
              <div className="feat-card" key={f.id}>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <p className="feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {type==='footer' && (
        <div className="s-footer" style={{background:data.bgColor}}>
          <div className="col">
            <div className="col-title" style={{fontSize:'18px'}}>{data.brandName}</div>
            <div className="brand-desc">{data.brandDesc}</div>
          </div>
          <div className="col">
            <div className="col-title">{data.col1Title}</div>
            {data.col1Items.map((it,i)=><a key={i} href={it.url||'#'} onClick={e=>{if(!it.url||it.url==='#')e.preventDefault();}}>{it.label}</a>)}
          </div>
          <div className="col">
            <div className="col-title">{data.col2Title}</div>
            {data.col2Items.map((it,i)=><a key={i} href={it.url||'#'} onClick={e=>{if(!it.url||it.url==='#')e.preventDefault();}}>{it.label}</a>)}
          </div>
          <div className="bottom-bar">{data.bottomText}</div>
        </div>
      )}
    </div>
  );
}

// ─── Countdown ────────────────────────────────────────────────────
function CountdownTimer({ endDateTime }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(t); }, []);
  const end = endDateTime ? new Date(endDateTime).getTime() : NaN;
  const diff = isNaN(end) ? 0 : Math.max(0, end - now);
  const ts = Math.floor(diff/1000);
  const p = n => String(n).padStart(2,'0');
  if (endDateTime && diff<=0) return <span className="timer-ended">Promotion ended</span>;
  return (
    <div className="timer-wrap">
      <span className="timer-box">{p(Math.floor(ts/86400))}<em>days</em></span><span className="colon">:</span>
      <span className="timer-box">{p(Math.floor((ts%86400)/3600))}<em>hrs</em></span><span className="colon">:</span>
      <span className="timer-box">{p(Math.floor((ts%3600)/60))}<em>min</em></span><span className="colon">:</span>
      <span className="timer-box">{p(ts%60)}<em>sec</em></span>
    </div>
  );
}

// ─── Image Upload ─────────────────────────────────────────────────
function ImageUploadField({ label, value, onChange }) {
  const ref = useRef(null);
  const handleFile = e => {
    const file = e.target.files&&e.target.files[0]; if(!file)return;
    const r=new FileReader(); r.onload=()=>onChange(String(r.result)); r.readAsDataURL(file); e.target.value='';
  };
  return (
    <div className="field">
      <label>{label}</label>
      {value ? (
        <div className="img-preview-wrap">
          <img className="img-preview" src={value} alt=""/>
          <button className="img-remove" onClick={()=>onChange('')}>Remove</button>
        </div>
      ) : (
        <button className="img-upload-btn" onClick={()=>ref.current&&ref.current.click()}>Upload Image</button>
      )}
      <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
    </div>
  );
}

// ─── Link List ────────────────────────────────────────────────────
function LinkListField({ label, items, onUpdate, onAdd, onRemove, addLabel }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="link-list">
        {items.map((it,i) => (
          <div className="link-row" key={i}>
            <input className="input link-label" value={it.label} onChange={e=>onUpdate(i,{label:e.target.value})} placeholder="Label"/>
            <input className="input link-url" value={it.url} onChange={e=>onUpdate(i,{url:e.target.value})} placeholder="https://..."/>
            <button className="link-remove" onClick={()=>onRemove(i)}>✕</button>
          </div>
        ))}
      </div>
      <button className="add-section-btn" style={{margin:0}} onClick={onAdd}>+ {addLabel||'Add Item'}</button>
    </div>
  );
}

// ─── Content Panel ────────────────────────────────────────────────
function ContentPanel({ section, patchData, updateProduct, addProduct, removeProduct, updateListItem, addListItem, removeListItem, updateItem, addItem, removeItem, openCatalog }) {
  const { type, data } = section;

  if (type==='header') return (
    <>
      <ImageUploadField label="Logo Image (overrides text)" value={data.logoImage} onChange={v=>patchData({logoImage:v})}/>
      <div className="field"><label>Logo Text</label><input className="input" value={data.logoText} onChange={e=>patchData({logoText:e.target.value})}/></div>
      <LinkListField label="Navigation Menu" items={data.navItems} onUpdate={(i,p)=>updateListItem('navItems',i,p)} onAdd={()=>addListItem('navItems',{label:'New Link',url:'#'})} onRemove={i=>removeListItem('navItems',i)} addLabel="Add Menu Item"/>
      <div className="toggle-row">
        <div><div className="t-label">Sticky Header</div><div className="t-sub">Stays fixed at top while scrolling</div></div>
        <input type="checkbox" checked={data.sticky||false} onChange={e=>patchData({sticky:e.target.checked})} style={{accentColor:'#1a1a1a',width:'15px',height:'15px'}}/>
      </div>
    </>
  );

  if (type==='countdown') return (
    <>
      <div className="field"><label>Promotion Text</label><input className="input" value={data.promoText} onChange={e=>patchData({promoText:e.target.value})}/></div>
      <div className="field">
        <label>End Date & Time</label>
        <input className="input" type="datetime-local" value={data.endDateTime} onChange={e=>patchData({endDateTime:e.target.value})}/>
        <p style={{fontSize:'11px',color:'var(--ink-soft)',margin:0}}>The live timer counts down to this date/time</p>
      </div>
    </>
  );

  if (type==='hero') return (
    <>
      <div className="field"><label>Eyebrow Tag</label><input className="input" value={data.eyebrow} onChange={e=>patchData({eyebrow:e.target.value})}/></div>
      <div className="field"><label>Headline (H1)</label><textarea className="input" rows={2} value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      <div className="field"><label>Description</label><textarea className="input" rows={3} value={data.desc} onChange={e=>patchData({desc:e.target.value})}/></div>
      <div className="field"><label>Primary Button Text</label><input className="input" value={data.cta} onChange={e=>patchData({cta:e.target.value})}/></div>
      <div className="field"><label>Primary Button URL</label><input className="input" value={data.ctaUrl} onChange={e=>patchData({ctaUrl:e.target.value})} placeholder="https://..."/></div>
      <div className="field"><label>Secondary Button Text (optional)</label><input className="input" value={data.ctaSecondary||''} onChange={e=>patchData({ctaSecondary:e.target.value})} placeholder="Learn More"/></div>
      <div className="field"><label>Secondary Button URL</label><input className="input" value={data.ctaSecondaryUrl||''} onChange={e=>patchData({ctaSecondaryUrl:e.target.value})} placeholder="https://..."/></div>
    </>
  );

  if (type==='grid') return (
    <>
      <div className="field"><label>Section Heading</label><input className="input" value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      <div className="toggle-row">
        <div><div className="t-label">Show "Add to Cart" Button</div></div>
        <input type="checkbox" checked={data.showAddToCart!==false} onChange={e=>patchData({showAddToCart:e.target.checked})} style={{accentColor:'#1a1a1a',width:'15px',height:'15px'}}/>
      </div>
      <div className="field">
        <label>Products ({data.products.length}/8)</label>
        {data.products.map(p=>(
          <div className="product-card-edit" key={p.id}>
            <ImageUploadField label="Product Photo" value={p.image} onChange={v=>updateProduct(p.id,{image:v})}/>
            <div className="pc-top">
              <input className="input" style={{fontWeight:600}} value={p.name} onChange={e=>updateProduct(p.id,{name:e.target.value})} placeholder="Product name"/>
              <button className="pc-remove" onClick={()=>removeProduct(p.id)}>Remove</button>
            </div>
            <div className="two-col">
              <input className="input" value={p.price} onChange={e=>updateProduct(p.id,{price:e.target.value})} placeholder="Price"/>
              <input className="input" value={p.priceFull} onChange={e=>updateProduct(p.id,{priceFull:e.target.value})} placeholder="Original (optional)"/>
            </div>
            <input className="input" value={p.badge} onChange={e=>updateProduct(p.id,{badge:e.target.value})} placeholder="Badge e.g. SALE 20%"/>
            <input className="input" value={p.url||''} onChange={e=>updateProduct(p.id,{url:e.target.value})} placeholder="Product URL (optional)"/>
          </div>
        ))}
        {data.products.length < 8 && (
          <div style={{display:'flex',gap:'6px'}}>
            <button className="add-section-btn" style={{margin:0,flex:1}} onClick={addProduct}>+ Add Product</button>
            <button className="add-section-btn" style={{margin:0,flex:1}} onClick={openCatalog}>From Catalog</button>
          </div>
        )}
      </div>
    </>
  );

  if (type==='gallery') return (
    <>
      <div className="field"><label>Section Heading</label><input className="input" value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      <div className="field">
        <label>Photos ({data.images.length})</label>
        {data.images.map(img=>(
          <div className="product-card-edit" key={img.id}>
            <ImageUploadField label="Photo" value={img.src} onChange={v=>updateItem('images',img.id,{src:v})}/>
            <div className="pc-top">
              <input className="input" value={img.caption} onChange={e=>updateItem('images',img.id,{caption:e.target.value})} placeholder="Caption (optional)"/>
              <button className="pc-remove" onClick={()=>removeItem('images',img.id)}>Remove</button>
            </div>
          </div>
        ))}
        <button className="add-section-btn" style={{margin:0}} onClick={()=>addItem('images',{id:uid('img'),src:'',caption:''})}>+ Add Photo</button>
      </div>
    </>
  );

  if (type==='map') return (
    <>
      <div className="field"><label>Section Heading</label><input className="input" value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      <div className="field"><label>Address</label><textarea className="input" rows={2} value={data.address} onChange={e=>patchData({address:e.target.value})}/></div>
      <div className="field"><label>Hours (optional)</label><input className="input" value={data.hours||''} onChange={e=>patchData({hours:e.target.value})}/></div>
      <div className="field">
        <label>Map Embed URL</label>
        <input className="input" value={data.mapEmbedUrl} onChange={e=>patchData({mapEmbedUrl:e.target.value})} placeholder="https://www.google.com/maps/embed?..."/>
        <p style={{fontSize:'11px',color:'var(--ink-soft)',margin:0}}>In Google Maps: Share → Embed a map → copy the src URL</p>
      </div>
    </>
  );

  if (type==='testimonials') return (
    <>
      <div className="field"><label>Section Heading</label><input className="input" value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      {data.items.map(t=>(
        <div className="product-card-edit" key={t.id}>
          <div className="pc-top">
            <input className="input" style={{fontWeight:600}} value={t.name} onChange={e=>updateItem('items',t.id,{name:e.target.value})} placeholder="Name"/>
            <button className="pc-remove" onClick={()=>removeItem('items',t.id)}>Remove</button>
          </div>
          <input className="input" value={t.role} onChange={e=>updateItem('items',t.id,{role:e.target.value})} placeholder="Role e.g. Verified Buyer"/>
          <textarea className="input" rows={3} value={t.text} onChange={e=>updateItem('items',t.id,{text:e.target.value})} placeholder="Review text..."/>
          <div className="field">
            <label>Rating</label>
            <div className="radio-group">
              {[3,4,5].map(r=><button key={r} className={t.rating===r?'active':''} onClick={()=>updateItem('items',t.id,{rating:r})}>{'★'.repeat(r)}</button>)}
            </div>
          </div>
        </div>
      ))}
      <button className="add-section-btn" style={{margin:0}} onClick={()=>addItem('items',{id:uid('t'),name:'New Reviewer',role:'Customer',text:'Great product!',rating:5})}>+ Add Testimonial</button>
    </>
  );

  if (type==='faq') return (
    <>
      <div className="field"><label>Section Heading</label><input className="input" value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      {data.items.map(f=>(
        <div className="product-card-edit" key={f.id}>
          <div className="pc-top">
            <input className="input" style={{fontWeight:600}} value={f.q} onChange={e=>updateItem('items',f.id,{q:e.target.value})} placeholder="Question"/>
            <button className="pc-remove" onClick={()=>removeItem('items',f.id)}>Remove</button>
          </div>
          <textarea className="input" rows={3} value={f.a} onChange={e=>updateItem('items',f.id,{a:e.target.value})} placeholder="Answer..."/>
        </div>
      ))}
      <button className="add-section-btn" style={{margin:0}} onClick={()=>addItem('items',{id:uid('f'),q:'New Question?',a:'Answer here.'})}>+ Add FAQ Item</button>
    </>
  );

  if (type==='pricing') return (
    <>
      <div className="field"><label>Section Heading</label><input className="input" value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      <div className="field"><label>Subtext</label><input className="input" value={data.sub} onChange={e=>patchData({sub:e.target.value})}/></div>
      {data.plans.map(p=>(
        <div className="product-card-edit" key={p.id}>
          <div className="pc-top">
            <input className="input" style={{fontWeight:700}} value={p.name} onChange={e=>updateItem('plans',p.id,{name:e.target.value})} placeholder="Plan name"/>
            <button className="pc-remove" onClick={()=>removeItem('plans',p.id)}>Remove</button>
          </div>
          <div className="two-col">
            <input className="input" value={p.price} onChange={e=>updateItem('plans',p.id,{price:e.target.value})} placeholder="Price"/>
            <input className="input" value={p.badge} onChange={e=>updateItem('plans',p.id,{badge:e.target.value})} placeholder="Badge (optional)"/>
          </div>
          <textarea className="input" rows={3} value={p.features.join('\n')} onChange={e=>updateItem('plans',p.id,{features:e.target.value.split('\n').filter(Boolean)})} placeholder="One feature per line..."/>
          <div className="toggle-row" style={{marginTop:'2px'}}>
            <div><div className="t-label">Highlighted Plan</div></div>
            <input type="checkbox" checked={p.highlight} onChange={e=>updateItem('plans',p.id,{highlight:e.target.checked})} style={{accentColor:'#1a1a1a',width:'15px',height:'15px'}}/>
          </div>
        </div>
      ))}
      <button className="add-section-btn" style={{margin:0}} onClick={()=>addItem('plans',{id:uid('pl'),name:'New Plan',price:'0',period:'month',badge:'',highlight:false,cta:'Get Started',ctaUrl:'#',features:['Feature 1','Feature 2']})}>+ Add Plan</button>
    </>
  );

  if (type==='leadForm') return (
    <>
      <div className="field"><label>Headline</label><input className="input" value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      <div className="field"><label>Subtext</label><input className="input" value={data.sub} onChange={e=>patchData({sub:e.target.value})}/></div>
      <div className="field"><label>Input Placeholder</label><input className="input" value={data.placeholder} onChange={e=>patchData({placeholder:e.target.value})}/></div>
      <div className="field"><label>Button Text</label><input className="input" value={data.buttonText} onChange={e=>patchData({buttonText:e.target.value})}/></div>
      <div className="field"><label>Trust Text</label><input className="input" value={data.trustText} onChange={e=>patchData({trustText:e.target.value})}/></div>
    </>
  );

  if (type==='newsletter') return (
    <>
      <div className="field"><label>Headline</label><input className="input" value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      <div className="field"><label>Subtext</label><textarea className="input" rows={2} value={data.sub} onChange={e=>patchData({sub:e.target.value})}/></div>
      <div className="field"><label>Input Placeholder</label><input className="input" value={data.placeholder} onChange={e=>patchData({placeholder:e.target.value})}/></div>
      <div className="field"><label>Button Text</label><input className="input" value={data.buttonText} onChange={e=>patchData({buttonText:e.target.value})}/></div>
      <div className="field"><label>Dismiss Link Text</label><input className="input" value={data.dismissText} onChange={e=>patchData({dismissText:e.target.value})}/></div>
      <div className="field">
        <label>Show After: <span className="val">{data.delaySeconds}s</span></label>
        <input type="range" min="0" max="30" value={data.delaySeconds} onChange={e=>patchData({delaySeconds:Number(e.target.value)})} style={{accentColor:'#1a1a1a'}}/>
      </div>
    </>
  );

  if (type==='text') return (
    <>
      <div className="field"><label>Text Content</label><textarea className="input" rows={5} value={data.content} onChange={e=>patchData({content:e.target.value})}/></div>
      <div className="field"><label>Button Text (optional)</label><input className="input" value={data.btnText} onChange={e=>patchData({btnText:e.target.value})} placeholder="Shop Now"/></div>
      <div className="field"><label>Button URL</label><input className="input" value={data.btnUrl||''} onChange={e=>patchData({btnUrl:e.target.value})} placeholder="https://..."/></div>
    </>
  );

  if (type==='banner') return (
    <>
      <div className="field"><label>Headline Text</label><textarea className="input" rows={2} value={data.text} onChange={e=>patchData({text:e.target.value})}/></div>
      <div className="field"><label>Subtext (optional)</label><input className="input" value={data.subText||''} onChange={e=>patchData({subText:e.target.value})}/></div>
      <ImageUploadField label="Background Image (optional)" value={data.bgImage} onChange={v=>patchData({bgImage:v})}/>
    </>
  );

  if (type==='video') return (
    <>
      <div className="field"><label>Section Heading</label><input className="input" value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      <div className="field"><label>Subtext</label><input className="input" value={data.sub} onChange={e=>patchData({sub:e.target.value})}/></div>
      <div className="field"><label>YouTube/Vimeo Embed URL</label><input className="input" value={data.videoUrl} onChange={e=>patchData({videoUrl:e.target.value})} placeholder="https://www.youtube.com/embed/..."/><p style={{fontSize:'11px',color:'var(--ink-soft)',margin:0}}>Use the /embed/ URL format from YouTube</p></div>
    </>
  );

  if (type==='features') return (
    <>
      <div className="field"><label>Section Heading</label><input className="input" value={data.heading} onChange={e=>patchData({heading:e.target.value})}/></div>
      <div className="field"><label>Subtext</label><input className="input" value={data.sub} onChange={e=>patchData({sub:e.target.value})}/></div>
      {data.items.map(f=>(
        <div className="product-card-edit" key={f.id}>
          <div className="pc-top">
            <input className="input" value={f.icon} onChange={e=>updateItem('items',f.id,{icon:e.target.value})} placeholder="Mark" style={{width:'64px'}}/>
            <input className="input" style={{flex:1,marginLeft:'6px',fontWeight:600}} value={f.title} onChange={e=>updateItem('items',f.id,{title:e.target.value})} placeholder="Feature title"/>
            <button className="pc-remove" onClick={()=>removeItem('items',f.id)}>Remove</button>
          </div>
          <textarea className="input" rows={2} value={f.desc} onChange={e=>updateItem('items',f.id,{desc:e.target.value})} placeholder="Short description..."/>
        </div>
      ))}
      <button className="add-section-btn" style={{margin:0}} onClick={()=>addItem('items',{id:uid('feat'),icon:'',title:'New Feature',desc:'Describe this feature here.'})}>+ Add Feature</button>
    </>
  );

  if (type==='footer') return (
    <>
      <div className="field"><label>Brand Name</label><input className="input" value={data.brandName} onChange={e=>patchData({brandName:e.target.value})}/></div>
      <div className="field"><label>Brand Description</label><textarea className="input" rows={3} value={data.brandDesc} onChange={e=>patchData({brandDesc:e.target.value})}/></div>
      <LinkListField label="Column 1 — Title & Links" items={data.col1Items} onUpdate={(i,p)=>updateListItem('col1Items',i,p)} onAdd={()=>addListItem('col1Items',{label:'New Link',url:'#'})} onRemove={i=>removeListItem('col1Items',i)} addLabel="Add Link"/>
      <div className="field"><label>Column 1 Title</label><input className="input" value={data.col1Title} onChange={e=>patchData({col1Title:e.target.value})}/></div>
      <LinkListField label="Column 2 — Title & Links" items={data.col2Items} onUpdate={(i,p)=>updateListItem('col2Items',i,p)} onAdd={()=>addListItem('col2Items',{label:'New Link',url:'#'})} onRemove={i=>removeListItem('col2Items',i)} addLabel="Add Link"/>
      <div className="field"><label>Column 2 Title</label><input className="input" value={data.col2Title} onChange={e=>patchData({col2Title:e.target.value})}/></div>
      <div className="field"><label>Copyright Text</label><input className="input" value={data.bottomText} onChange={e=>patchData({bottomText:e.target.value})}/></div>
    </>
  );

  return <div className="empty-tip"><p>No content settings for this block.</p></div>;
}

// ─── Style Panel ──────────────────────────────────────────────────
function StylePanel({ section, patchData, patchDataCommit }) {
  const { type, data } = section;

  if (type==='header') return (
    <>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
      <ColorField label="Text Color" value={data.textColor} onChange={v=>patchDataCommit({textColor:v})}/>
    </>
  );

  if (type==='countdown') return (
    <>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
      <ColorField label="Text Color" value={data.textColor} onChange={v=>patchDataCommit({textColor:v})}/>
    </>
  );

  if (type==='hero') return (
    <>
      <div className="field">
        <label>Text Alignment</label>
        <div className="align-group">
          {['left','center','right'].map(a=><button key={a} className={data.align===a?'active':''} onClick={()=>patchDataCommit({align:a})}>{a.charAt(0).toUpperCase()+a.slice(1)}</button>)}
        </div>
      </div>
      <div className="field">
        <label>Background Type</label>
        <div className="radio-group">
          <button className={data.bgType==='solid'?'active':''} onClick={()=>patchDataCommit({bgType:'solid'})}>Solid</button>
          <button className={data.bgType==='gradient'?'active':''} onClick={()=>patchDataCommit({bgType:'gradient'})}>Gradient</button>
          <button className={data.bgType==='image'?'active':''} onClick={()=>patchDataCommit({bgType:'image'})}>Image</button>
        </div>
      </div>
      {data.bgType==='gradient' && (
        <div className="field">
          <label style={{fontSize:'11px',color:'var(--ink-soft)'}}>Gradient Presets</label>
          <div className="color-preset">{GRADIENT_PRESETS.map((g,i)=><div key={i} className={`c-btn ${data.gradient===g.bg?'active':''}`} style={{background:g.bg}} onClick={()=>patchDataCommit({gradient:g.bg,textColor:g.text})}></div>)}</div>
        </div>
      )}
      {data.bgType==='solid' && <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>}
      {data.bgType==='image' && <ImageUploadField label="Background Image" value={data.bgImage} onChange={v=>patchDataCommit({bgImage:v})}/>}
      <ColorField label="Text Color" value={data.textColor} onChange={v=>patchDataCommit({textColor:v})}/>
      <div className="field">
        <label>Headline Size: <span className="val">{data.fontSize}px</span></label>
        <input type="range" min="22" max="64" value={data.fontSize} onChange={e=>patchData({fontSize:Number(e.target.value)})} onMouseUp={()=>patchDataCommit({})} style={{accentColor:'#1a1a1a'}}/>
      </div>
      <div className="field">
        <label>Vertical Padding: <span className="val">{data.padding}px</span></label>
        <input type="range" min="32" max="140" value={data.padding} onChange={e=>patchData({padding:Number(e.target.value)})} onMouseUp={()=>patchDataCommit({})} style={{accentColor:'#1a1a1a'}}/>
      </div>
      <div className="toggle-row">
        <div><div className="t-label">Dot Pattern Overlay</div><div className="t-sub">Subtle texture on the background</div></div>
        <input type="checkbox" checked={data.hasPattern} onChange={e=>patchDataCommit({hasPattern:e.target.checked})} style={{accentColor:'#1a1a1a',width:'15px',height:'15px'}}/>
      </div>
      <div className="toggle-row">
        <div><div className="t-label">Rounded CTA Button</div></div>
        <input type="checkbox" checked={data.roundedCta} onChange={e=>patchDataCommit({roundedCta:e.target.checked})} style={{accentColor:'#1a1a1a',width:'15px',height:'15px'}}/>
      </div>
    </>
  );

  if (type==='grid') return (
    <>
      <div className="field">
        <label>Columns</label>
        <div className="radio-group">
          {[2,3,4].map(c=><button key={c} className={data.columns===c?'active':''} onClick={()=>patchDataCommit({columns:c})}>{c} cols</button>)}
        </div>
      </div>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
    </>
  );

  if (type==='gallery') return (
    <>
      <div className="field">
        <label>Columns</label>
        <div className="radio-group">
          {[2,3,4].map(c=><button key={c} className={data.columns===c?'active':''} onClick={()=>patchDataCommit({columns:c})}>{c} cols</button>)}
        </div>
      </div>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
    </>
  );

  if (type==='map') return (
    <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
  );

  if (type==='testimonials') return (
    <>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
    </>
  );

  if (type==='faq') return (
    <>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
    </>
  );

  if (type==='pricing') return (
    <>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
      <ColorField label="Highlight Accent Color" value={data.accentColor||'#1a1a1a'} onChange={v=>patchDataCommit({accentColor:v})}/>
    </>
  );

  if (type==='leadForm') return (
    <>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
      <ColorField label="Button Color" value={data.buttonColor} onChange={v=>patchDataCommit({buttonColor:v})}/>
    </>
  );

  if (type==='newsletter') return (
    <>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
      <ColorField label="Text Color" value={data.textColor} onChange={v=>patchDataCommit({textColor:v})}/>
      <ColorField label="Button Color" value={data.buttonColor} onChange={v=>patchDataCommit({buttonColor:v})}/>
    </>
  );

  if (type==='text') return (
    <>
      <div className="field">
        <label>Text Alignment</label>
        <div className="align-group">
          {['left','center','right'].map(a=><button key={a} className={(data.align||'center')===a?'active':''} onClick={()=>patchDataCommit({align:a})}>{a.charAt(0).toUpperCase()+a.slice(1)}</button>)}
        </div>
      </div>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
      <ColorField label="Text Color" value={data.textColor} onChange={v=>patchDataCommit({textColor:v})}/>
    </>
  );

  if (type==='banner') return (
    <>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
      <ColorField label="Text Color" value={data.textColor} onChange={v=>patchDataCommit({textColor:v})}/>
      <div className="field">
        <label>Headline Size: <span className="val">{data.fontSize}px</span></label>
        <input type="range" min="14" max="48" value={data.fontSize} onChange={e=>patchData({fontSize:Number(e.target.value)})} onMouseUp={()=>patchDataCommit({})} style={{accentColor:'#1a1a1a'}}/>
      </div>
    </>
  );

  if (type==='video') return (
    <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
  );

  if (type==='features') return (
    <>
      <div className="field">
        <label>Columns</label>
        <div className="radio-group">
          {[2,3,4].map(c=><button key={c} className={(data.columns||3)===c?'active':''} onClick={()=>patchDataCommit({columns:c})}>{c} cols</button>)}
        </div>
      </div>
      <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
    </>
  );

  if (type==='footer') return (
    <ColorField label="Background Color" value={data.bgColor} onChange={v=>patchDataCommit({bgColor:v})}/>
  );

  return <div className="empty-tip"><p>No style settings for this block.</p></div>;
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input" type="color" value={value} onChange={e=>onChange(e.target.value)}/>
    </div>
  );
}