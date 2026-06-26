// src/UrbanBricks.jsx  –  Full redesign: 3D building, day/night sky, light/dark theme, 3D tilt cards
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import founderImg from "./assets/chandan.jpg";
import {
  Home, Building2, Tractor, MapPin, Trees, Store, Factory,
  LayoutTemplate, Layers, Palette, Sofa, Phone, Mail,
  Globe, MapPinned, Menu, X, ChevronRight, ArrowUpRight,
  Sun, Moon, Tag, Key, Award, HardHat,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════
//  THEME TOKENS
// ══════════════════════════════════════════════════════════════
const DARK = {
  bg: "#080403", // Premium mahogany black
  bgAlt: "#130906", // Dark clay warm background
  card: "rgba(26, 14, 10, 0.85)", // Glassmorphic amber-cocoa card
  border: "rgba(184, 92, 56, 0.22)", // Rich terracotta outline
  text1: "#F6ECD9", // Warm parchment white
  text2: "#C5B09E", // Soft bronze-grey
  terra: "#C95B32", // Vibrant sunset terracotta
  terraDark: "#8C2D11", // Deep warm brick red
  terraLight: "#FF7E5F", // Glowing coral accent
  gold: "#D49D42", // Refined honey gold
  goldLight: "#FED049", // Vivid radiant saffron
  shadow: "rgba(0,0,0,0.75)",
  glass: "rgba(13,6,4,0.92)",
  skyA: "#020714",
  skyB: "#0C1428",
  skyC: "#180C05",
  isDark: true,
};

const LIGHT = {
  bg: "#FDFBF7", // Luxurious warm pearl sand
  bgAlt: "#F7EFE2", // Warm sand clay
  card: "rgba(255, 255, 255, 0.88)", // Warm white glass
  border: "rgba(198, 90, 49, 0.16)", // Warm terracotta outline
  text1: "#281102", // Deep mahogany espresso
  text2: "#745239", // Refined cocoa brown
  terra: "#C65A31", // Sunset terracotta accent
  terraDark: "#9C3511", // Deep clay red
  terraLight: "#F07A54", // Saffron sunset orange
  gold: "#CCA05A", // Radiant warm gold
  goldLight: "#F4D08B", // Saffron gold highlight
  shadow: "rgba(139, 69, 19, 0.08)",
  glass: "rgba(253, 251, 247, 0.93)",
  skyA: "#FF7E5F", // Sunset coral
  skyB: "#FEB47B", // Sunset peach
  skyC: "#FFE5B4", // Sunset saffron
  isDark: false,
};

const spring = { type: "spring", stiffness: 360, damping: 28 };
const ease = { duration: 0.65, ease: [0.22, 1, 0.36, 1] };

// ══════════════════════════════════════════════════════════════
//  FONT LOADER
// ══════════════════════════════════════════════════════════════
function useFonts() {
  useEffect(() => {
    const el = document.createElement("link");
    el.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap";
    el.rel = "stylesheet";
    document.head.appendChild(el);
    return () => el.parentNode?.removeChild(el);
  }, []);
}

// ══════════════════════════════════════════════════════════════
//  GLOBAL STYLES
// ══════════════════════════════════════════════════════════════
function GlobalStyles({ t }) {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body {
        font-family: 'Jost', sans-serif;
        background: ${t.bg};
        color: ${t.text1};
        overflow-x: hidden;
        transition: background 0.5s ease, color 0.3s ease;
      }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: ${t.terra}; border-radius: 2px; }
      a { text-decoration: none; color: inherit; }
      input, textarea, select { font-family: 'Jost', sans-serif; outline: none; }
      input::placeholder, textarea::placeholder { color: ${t.text2}88; }
      select option { background: ${t.isDark ? "#211308" : "#FFFFFF"}; color: ${t.text1}; }
      
      /* Blueprint Scrolling Grid overlay */
      .blueprint-grid {
        background-size: 44px 44px;
        background-image: 
          linear-gradient(to right, ${t.isDark ? "rgba(201,151,74,0.03)" : "rgba(184,92,56,0.04)"} 1px, transparent 1px),
          linear-gradient(to bottom, ${t.isDark ? "rgba(201,151,74,0.03)" : "rgba(184,92,56,0.04)"} 1px, transparent 1px);
        animation: blueprintScroll 30s linear infinite;
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1;
        transition: opacity 0.5s ease;
      }
      @keyframes blueprintScroll {
        from { background-position: 0 0; }
        to { background-position: 44px 44px; }
      }

      /* Floating background particles */
      .bg-particle {
        position: absolute;
        border-radius: 50%;
        background: ${t.terra};
        pointer-events: none;
        opacity: ${t.isDark ? 0.06 : 0.08};
        filter: blur(3px);
      }

      /* Holographic Design 3D wireframe color sweep */
      @keyframes neonBorder {
        0% { border-color: ${t.terra}; box-shadow: 0 0 15px ${t.terra}66; }
        50% { border-color: ${t.gold}; box-shadow: 0 0 15px ${t.gold}66; }
        100% { border-color: ${t.terra}; box-shadow: 0 0 15px ${t.terra}66; }
      }
      .neon-wireframe {
        animation: neonBorder 5s infinite alternate ease-in-out;
      }

      /* Swimming Pool deep water wave shifting */
      @keyframes poolGlow {
        0% { background: linear-gradient(135deg, #00E5FF, #00838F); }
        50% { background: linear-gradient(135deg, #00E5FF, #A7FFEB); }
        100% { background: linear-gradient(135deg, #00E5FF, #00838F); }
      }
      .pool-water {
        animation: poolGlow 6s infinite alternate ease-in-out;
      }

      .ub-hide-mobile { display: flex; }
      .ub-show-mobile { display: none; }
      
      /* Infinite Marquee Animation */
      .marquee-container {
        overflow: hidden;
        width: 100%;
        display: flex;
        position: relative;
        mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        padding: 10px 0;
      }
      .marquee-track {
        display: flex;
        width: max-content;
        gap: 16px;
        animation: marqueeScroll 40s linear infinite;
      }
      @keyframes marqueeScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .marquee-track:hover {
        animation-play-state: paused;
      }
      
      @media (max-width: 768px) {
        .ub-hide-mobile { display: none !important; }
        .ub-show-mobile { display: flex !important; }
        .ub-two-col { grid-template-columns: 1fr !important; gap: 48px !important; }
        .ub-hero-right { display: none !important; }
      }
    `}</style>
  );
}

// ══════════════════════════════════════════════════════════════
//  UB LOGO (faithful recreation of circular badge)
// ══════════════════════════════════════════════════════════════
function UBLogo({ size = 38, t, showTagline = true }) {
  return (
    <a href="#home" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(145deg, #8B4513, #4A2200)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 2px 14px rgba(92,46,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)`,
        border: "2px solid rgba(201,151,74,0.45)",
      }}>
        <span style={{
          color: "#FFF", fontWeight: 800, fontSize: size * 0.35,
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "-0.5px", lineHeight: 1, userSelect: "none",
        }}>UB</span>
      </div>
      <div>
        <div style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700, fontSize: size * 0.52,
          color: t.text1, letterSpacing: "0.04em", lineHeight: 1,
          transition: "color 0.3s",
        }}>Urban Bricks</div>
        {showTagline && (
          <div style={{
            fontSize: size * 0.20, color: t.gold,
            letterSpacing: "0.26em", textTransform: "uppercase",
            marginTop: 2, fontWeight: 500,
          }}>Real Estate</div>
        )}
      </div>
    </a>
  );
}

// ══════════════════════════════════════════════════════════════
//  THEME TOGGLE
// ══════════════════════════════════════════════════════════════
function ThemeToggle({ isDark, onToggle, t }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        width: 38, height: 38, borderRadius: "50%",
        background: isDark ? `${t.terra}22` : `${t.terra}18`,
        border: `1px solid ${t.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: t.gold, flexShrink: 0, transition: "all 0.3s",
      }}
    >
      <AnimatePresence mode="wait">
        {isDark
          ? <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun size={16} /></motion.span>
          : <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon size={16} /></motion.span>
        }
      </AnimatePresence>
    </motion.button>
  );
}

// ══════════════════════════════════════════════════════════════
//  FADE UP / SECTION LABEL
// ══════════════════════════════════════════════════════════════
function FadeUp({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...ease, delay }}
    >{children}</motion.div>
  );
}

function SectionLabel({ text, center = false, t }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: center ? 0 : -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={ease}
      style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, justifyContent: center ? "center" : "flex-start" }}
    >
      <div style={{ width: 28, height: 1, background: t.gold }} />
      <span style={{ color: t.gold, fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 500 }}>{text}</span>
      {center && <div style={{ width: 28, height: 1, background: t.gold }} />}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SKY ELEMENTS
// ══════════════════════════════════════════════════════════════
function NightSky({ stars }) {
  return <>
    {stars.map((s, i) => (
      <motion.div key={i}
        animate={{ opacity: [s.lo, s.hi, s.lo] }}
        transition={{ delay: s.delay, duration: s.dur, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%", background: "#FFF",
        }}
      />
    ))}
    {/* Moon */}
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.9 }}
      style={{
        position: "absolute", right: "13%", top: "10%",
        width: 64, height: 64, borderRadius: "50%",
        background: "radial-gradient(circle at 38% 38%, #FFFDE8, #EEE088, #CCBB55)",
        boxShadow: "0 0 40px 14px rgba(230,215,120,0.22), 0 0 80px 30px rgba(180,165,80,0.08)",
      }}
    >
      <div style={{ position: "absolute", right: "22%", top: "18%", width: 10, height: 10, borderRadius: "50%", background: "rgba(175,158,70,0.38)" }} />
      <div style={{ position: "absolute", left: "28%", bottom: "26%", width: 7, height: 7, borderRadius: "50%", background: "rgba(175,158,70,0.28)" }} />
    </motion.div>
  </>;
}

function Cloud({ left, top, scale = 1 }) {
  return (
    <div style={{ position: "absolute", left, top, transform: `scale(${scale})`, transformOrigin: "left top" }}>
      <div style={{ position: "relative", width: 100, height: 38 }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "rgba(255,255,255,0.88)", borderRadius: 30 }} />
        <div style={{ position: "absolute", bottom: "28%", left: "12%", width: "48%", height: "82%", background: "rgba(255,255,255,0.88)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "16%", left: "44%", width: "42%", height: "95%", background: "rgba(255,255,255,0.82)", borderRadius: "50%" }} />
      </div>
    </div>
  );
}

function DaySky() {
  return <>
    {/* Sun */}
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      style={{
        position: "absolute", right: "13%", top: "10%",
        width: 70, height: 70, borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, #FFF8A0, #FFD700, #FFA500)",
        boxShadow: "0 0 60px 20px rgba(255,200,0,0.38), 0 0 120px 40px rgba(255,160,0,0.14)",
      }}
    />
    {/* Sun rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
      <motion.div key={i}
        animate={{ opacity: [0.25, 0.6, 0.25] }}
        transition={{ delay: i * 0.18, duration: 3, repeat: Infinity }}
        style={{
          position: "absolute", right: "16.1%", top: "13.5%",
          width: 2, height: 44,
          background: "linear-gradient(to bottom, rgba(255,210,0,0.55), transparent)",
          transformOrigin: "top center",
          transform: `rotate(${deg}deg) translateX(-50%)`,
        }}
      />
    ))}
    {/* Clouds */}
    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 1 }}>
      <Cloud left="6%" top="22%" scale={1.4} />
    </motion.div>
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 1 }}>
      <Cloud left="38%" top="14%" scale={0.85} />
    </motion.div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
      <Cloud left="62%" top="28%" scale={1.1} />
    </motion.div>
  </>;
}

function CitySilhouette({ t }) {
  const col = t.isDark ? "#040A18" : "rgba(155,80,30,0.32)";

  const buildings = useMemo(() => [
    { x: 34, y: 28, w: 28, h: 62 },
    { x: 59, y: 38, w: 32, h: 52 },
    { x: 128, y: 22, w: 36, h: 68 },
    { x: 176, y: 32, w: 30, h: 58 },
    { x: 202, y: 10, w: 40, h: 80 },
    { x: 284, y: 26, w: 34, h: 64 },
    { x: 334, y: 36, w: 30, h: 54 },
    { x: 360, y: 12, w: 44, h: 78 },
    { x: 416, y: 30, w: 36, h: 60 },
    { x: 470, y: 22, w: 32, h: 68 },
    { x: 516, y: 24, w: 42, h: 66 },
    { x: 574, y: 38, w: 30, h: 52 },
    { x: 600, y: 10, w: 36, h: 80 },
    { x: 650, y: 30, w: 32, h: 60 },
    { x: 702, y: 22, w: 40, h: 68 },
    { x: 758, y: 28, w: 42, h: 62 },
  ], []);

  const windows = useMemo(() => {
    const list = [];
    buildings.forEach((b, bi) => {
      const colCount = Math.floor((b.w - 8) / 6);
      const rowCount = Math.floor((b.h - 12) / 8);
      for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
          if (Math.random() > 0.48) { // Only light up some windows
            list.push({
              id: `${bi}-${r}-${c}`,
              x: b.x + 4.5 + c * 6,
              y: b.y + 6 + r * 8,
              w: 1.8,
              h: 2.8,
              delay: Math.random() * 5,
              dur: 2 + Math.random() * 4,
              brightness: 0.3 + Math.random() * 0.7,
            });
          }
        }
      }
    });
    return list;
  }, [buildings]);

  const windowColor = t.isDark ? "#FFE682" : "rgba(255, 255, 255, 0.9)";

  return (
    <svg viewBox="0 0 800 90" preserveAspectRatio="none"
      style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 90 }}
    >
      <rect x="0" y="55" width="38" height="35" fill={col} />
      <rect x="34" y="28" width="28" height="62" fill={col} />
      <rect x="57" y="15" width="5" height="75" fill={col} />
      <rect x="59" y="38" width="32" height="52" fill={col} />
      <rect x="87" y="60" width="26" height="30" fill={col} />
      <rect x="110" y="42" width="22" height="48" fill={col} />
      <rect x="128" y="22" width="36" height="68" fill={col} />
      <rect x="160" y="50" width="20" height="40" fill={col} />
      <rect x="176" y="32" width="30" height="58" fill={col} />
      <rect x="202" y="10" width="40" height="80" fill={col} />
      <rect x="238" y="45" width="22" height="45" fill={col} />
      <rect x="256" y="58" width="32" height="32" fill={col} />
      <rect x="284" y="26" width="34" height="64" fill={col} />
      <rect x="314" y="48" width="24" height="42" fill={col} />
      <rect x="334" y="36" width="30" height="54" fill={col} />
      <rect x="360" y="12" width="44" height="78" fill={col} />
      <rect x="400" y="52" width="20" height="38" fill={col} />
      <rect x="416" y="30" width="36" height="60" fill={col} />
      <rect x="448" y="58" width="26" height="32" fill={col} />
      <rect x="470" y="22" width="32" height="68" fill={col} />
      <rect x="498" y="44" width="22" height="46" fill={col} />
      <rect x="516" y="24" width="42" height="66" fill={col} />
      <rect x="554" y="54" width="24" height="36" fill={col} />
      <rect x="574" y="38" width="30" height="52" fill={col} />
      <rect x="600" y="10" width="36" height="80" fill={col} />
      <rect x="632" y="48" width="22" height="42" fill={col} />
      <rect x="650" y="30" width="32" height="60" fill={col} />
      <rect x="678" y="58" width="28" height="32" fill={col} />
      <rect x="702" y="22" width="40" height="68" fill={col} />
      <rect x="738" y="44" width="24" height="46" fill={col} />
      <rect x="758" y="28" width="42" height="62" fill={col} />

      {/* Dynamic Flickering Windows */}
      {windows.map((w) => (
        <motion.rect
          key={w.id}
          x={w.x}
          y={w.y}
          width={w.w}
          height={w.h}
          fill={windowColor}
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [w.brightness * 0.25, w.brightness, w.brightness * 0.25] }}
          transition={{
            repeat: Infinity,
            duration: w.dur,
            delay: w.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
//  3D CSS BUILDING (shared between preloader + hero)
// ══════════════════════════════════════════════════════════════
function FancyVilla3D({ t }) {
  const dropSpring = { type: "spring", stiffness: 100, damping: 15 };
  const popSpring = { type: "spring", stiffness: 140, damping: 12 };

  return (
    <div style={{ transform: "perspective(1200px) rotateX(15deg)", transformStyle: "preserve-3d" }}>
      <motion.div
        animate={{ rotateY: [-28, -20, -28] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d", width: "200px", height: "200px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* 1. LAWN / MAIN BASE BLOCK (Raised 3D Slab) */}
        <motion.div
          initial={{ transform: "translate3d(0px, 120px, 0px) rotateX(90deg) scale(0)", opacity: 0 }}
          animate={{ transform: "translate3d(0px, 60px, 0px) rotateX(90deg) scale(1)", opacity: 1 }}
          transition={{ ...dropSpring, delay: 0.1 }}
          style={{
            position: "absolute",
            width: "200px", height: "160px",
            background: "linear-gradient(135deg, #2E7D32, #4CAF50)", // Premium rich grass lawn
            border: `1.5px solid ${t.border}`,
            boxShadow: `0 25px 60px ${t.shadow}`,
            transformStyle: "preserve-3d"
          }}
        >
          {/* Paver Path & Driveway (Right side) */}
          <div style={{
            position: "absolute", right: "12px", top: 0, width: "38px", height: "160px",
            background: "repeating-linear-gradient(0deg, #9E9E9E 0px, #9E9E9E 8px, #757575 8px, #757575 10px)",
            boxShadow: "inset 4px 0 10px rgba(0,0,0,0.15)"
          }} />

          {/* Stepping stones from driveway to house */}
          {[{ y: 40 }, { y: 60 }, { y: 80 }].map((stone, idx) => (
            <div key={idx} style={{
              position: "absolute", left: "115px", top: `${stone.y}px`, width: "16px", height: "10px",
              background: "#E2E8F0", border: "1px solid #CBD5E1", borderRadius: "3px", transform: "translateZ(1px)"
            }} />
          ))}

          {/* 3D Base Slab side thickness walls */}
          <div style={{ position: "absolute", left: 0, top: "160px", width: "200px", height: "16px", background: "linear-gradient(to bottom, #2E1C0C, #120905)", transform: "rotateX(-90deg)", transformOrigin: "top center" }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: "200px", height: "16px", background: "linear-gradient(to bottom, #3E2723, #180C07)", transform: "rotateX(90deg)", transformOrigin: "top center" }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: "16px", height: "160px", background: "linear-gradient(to bottom, #2E1C0C, #120905)", transform: "rotateY(-90deg)", transformOrigin: "left center" }} />
          <div style={{ position: "absolute", left: "200px", top: 0, width: "16px", height: "160px", background: "linear-gradient(to bottom, #3E2723, #180C07)", transform: "rotateY(90deg)", transformOrigin: "left center" }} />

          {/* ── INTERNAL VILLA SCENE ELEMENTS (nested inside rotated base plate) ── */}

          {/* A. SWIMMING POOL DECK (Raised 8px with deep water inset) */}
          <div style={{
            position: "absolute", left: "10px", top: "95px", width: "75px", height: "50px",
            background: "#E2E8F0", border: "1px solid #94A3B8", borderRadius: "4px",
            transformStyle: "preserve-3d", transform: "translateZ(8px)",
            boxShadow: "0 6px 12px rgba(0,0,0,0.15)"
          }}>
            {/* Water Surface (Sunk inside deck) */}
            <div className="pool-water" style={{
              position: "absolute", inset: "3px",
              background: "linear-gradient(135deg, #00E5FF 0%, #00838F 100%)",
              transform: "translateZ(-6px)",
              boxShadow: "inset 0 0 12px rgba(0,0,0,0.45)"
            }} />
            {/* Chrome Pool Ladder */}
            <div style={{
              position: "absolute", right: "8px", top: "2px", width: "8px", height: "12px",
              border: "1.5px solid #CFD8DC", borderBottom: "none", borderRadius: "4px 4px 0 0",
              transform: "rotateX(-90deg) translateZ(4px)", transformOrigin: "bottom center"
            }} />
            {/* Glass Perimeter Fence */}
            <div style={{
              position: "absolute", inset: 0,
              border: "1.5px solid rgba(0, 229, 255, 0.35)",
              background: "rgba(0, 229, 255, 0.06)",
              borderRadius: "4px",
              transform: "translateZ(12px)",
              pointerEvents: "none"
            }} />
          </div>

          {/* B. WOODEN LOUNGE DECK & PARASOL */}
          <div style={{
            position: "absolute", left: "10px", top: "25px", width: "35px", height: "60px",
            background: "#A1887F", border: "1px solid #8D6E63", borderRadius: "2px",
            transformStyle: "preserve-3d", transform: "translateZ(2px)",
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.08) 4px, rgba(0,0,0,0.08) 5px)"
          }}>
            {/* 3D Beach Parasol (Umbrella) */}
            <div style={{
              position: "absolute", left: "15px", top: "25px", width: "2px", height: "35px",
              background: "#CFD8DC",
              transformStyle: "preserve-3d",
              transform: "rotateX(-90deg) translateZ(0px)",
              transformOrigin: "bottom center"
            }}>
              {/* Umbrella Cone Canopy */}
              <div style={{
                position: "absolute", top: "-10px", left: "-14px", width: "30px", height: "10px",
                background: "conic-gradient(#FF5252 0% 12.5%, #FFF 12.5% 25%, #FF5252 25% 37.5%, #FFF 37.5% 50%, #FF5252 50% 62.5%, #FFF 62.5% 75%, #FF5252 75% 87.5%, #FFF 87.5% 100%)",
                borderRadius: "50%",
                boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                transform: "rotateX(20deg)" // slightly tilted parasol
              }} />
            </div>
          </div>

          {/* C. 3D ENTRANCE CONCRETE STEPS */}
          {[
            { w: 26, h: 14, t: 80, z: 2 },
            { w: 22, h: 10, t: 82, z: 4 },
            { w: 18, h: 6, t: 84, z: 6 }
          ].map((step, idx) => (
            <div key={idx} style={{
              position: "absolute", left: "95px", top: `${step.t}px`, width: `${step.w}px`, height: `${step.h}px`,
              background: "#94A3B8", border: "1px solid #64748B", borderRadius: "1px",
              transform: `translateZ(${step.z}px)`
            }} />
          ))}

          {/* D. LUXURY BUNGALOW VILLA - GROUND FLOOR */}
          {/* Back Wall */}
          <div style={{
            position: "absolute", left: "55px", top: "20px", width: "85px", height: "55px",
            background: "linear-gradient(to top, #3E2723, #4E342E)",
            border: `1.5px solid ${t.border}`,
            transform: "rotateX(-90deg)", transformOrigin: "bottom center"
          }} />
          {/* Left Wall */}
          <div style={{
            position: "absolute", left: "55px", top: "20px", width: "60px", height: "55px",
            background: "linear-gradient(to top, #3E2723, #4E342E)",
            border: `1.5px solid ${t.border}`,
            transform: "rotateY(90deg) rotateX(-90deg)", transformOrigin: "bottom left"
          }} />
          {/* Right Wall */}
          <div style={{
            position: "absolute", left: "140px", top: "20px", width: "60px", height: "55px",
            background: "linear-gradient(to top, #2E1C0C, #3E2723)",
            border: `1.5px solid ${t.border}`,
            transform: "rotateY(90deg) rotateX(-90deg)", transformOrigin: "bottom left"
          }} />
          {/* Front Wall (Main Entry facade with columns) */}
          <div style={{
            position: "absolute", left: "55px", top: "80px", width: "85px", height: "55px",
            background: "linear-gradient(to top, #5D4037, #8D6E63)", // Stone brick texture
            border: `1.5px solid ${t.border}`,
            transform: "rotateX(-90deg)", transformOrigin: "bottom center",
            transformStyle: "preserve-3d"
          }}>
            {/* Glass Bay Window */}
            <div style={{
              position: "absolute", left: "6px", bottom: "6px", width: "42px", height: "38px",
              background: "rgba(0, 229, 255, 0.15)", border: "2px solid #212121", borderRadius: "3px",
              transformStyle: "preserve-3d"
            }}>
              {/* Warm interior lighting effect */}
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                style={{ position: "absolute", inset: 0, background: "rgba(255, 193, 7, 0.35)" }}
              />
            </div>
            {/* Double Solid Wood Door */}
            <div style={{
              position: "absolute", right: "6px", bottom: 0, width: "24px", height: "42px",
              background: "#3E2723", border: "1.5px solid #1A0E07", borderRadius: "2px 2px 0 0",
              display: "flex", gap: "2px", padding: "2px"
            }}>
              <div style={{ flex: 1, background: "#4E342E", borderRight: "1px solid #1A0E07", position: "relative" }}>
                <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#D49D42", position: "absolute", top: "50%", right: "1px" }} />
              </div>
              <div style={{ flex: 1, background: "#4E342E", position: "relative" }}>
                <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#D49D42", position: "absolute", top: "50%", left: "1px" }} />
              </div>
            </div>
          </div>

          {/* E. VILLA FIRST FLOOR (Cantilevered Stucco Unit sitting at Z = 55px) */}
          <div style={{
            position: "absolute", left: "40px", top: "15px", width: "105px", height: "65px",
            transformStyle: "preserve-3d", transform: "translateZ(55px)"
          }}>
            {/* Back Wall */}
            <div style={{
              position: "absolute", left: 0, top: 0, width: "105px", height: "44px",
              background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.15)",
              transform: "rotateX(-90deg)", transformOrigin: "bottom center"
            }} />
            {/* Left Wall */}
            <div style={{
              position: "absolute", left: 0, top: 0, width: "65px", height: "44px",
              background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.15)",
              transform: "rotateY(90deg) rotateX(-90deg)", transformOrigin: "bottom left"
            }} />
            {/* Right Wall */}
            <div style={{
              position: "absolute", left: 0, top: 0, width: "65px", height: "44px",
              background: "#ECEFF1", border: "1px solid rgba(0,0,0,0.15)",
              transform: "rotateY(90deg) rotateX(-90deg)", transformOrigin: "bottom left"
            }} />
            {/* Front Wall (Cantilever White Stucco with wood louvers) */}
            <div style={{
              position: "absolute", left: 0, top: "65px", width: "105px", height: "44px",
              background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.15)",
              transform: "rotateX(-90deg)", transformOrigin: "bottom center",
              transformStyle: "preserve-3d"
            }}>
              {/* Sliding Glass Balcony Doors */}
              <div style={{ position: "absolute", left: "8px", bottom: "4px", width: "52px", height: "32px", background: "rgba(0, 229, 255, 0.18)", border: "1.5px solid #2A2A2A", borderRadius: "2px" }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(255, 235, 59, 0.2)" }} />
              </div>
              {/* Wood Lath Louver Accent panels */}
              <div style={{ position: "absolute", right: "8px", bottom: "4px", width: "32px", height: "32px", background: "repeating-linear-gradient(90deg, #A1887F 0px, #A1887F 3px, #7E57C2 3px, #7E57C2 5px)", borderRadius: "1px", border: "1px solid #8D6E63" }} />
            </div>

            {/* Glass Balcony Railing (wraps around cantilever edges at Z = 44px) */}
            <div style={{
              position: "absolute", left: "-6px", top: "68px", width: "117px", height: "14px",
              background: "rgba(0, 229, 255, 0.15)", border: "1px solid rgba(0, 229, 255, 0.5)",
              borderRadius: "1px", transformStyle: "preserve-3d", transform: "translateZ(44px) rotateX(-90deg)", transformOrigin: "bottom center"
            }}>
              {/* Balcony Railing Left Return */}
              <div style={{ position: "absolute", width: "22px", height: "14px", background: "rgba(0, 229, 255, 0.15)", border: "1px solid rgba(0, 229, 255, 0.5)", transform: "rotateY(-90deg) translateZ(0px)", transformOrigin: "left center" }} />
            </div>
          </div>

          {/* F. SLOPED CLAY-TILE LUXURY ROOFS (sitting at Z = 100px) */}
          <div style={{
            position: "absolute", left: "35px", top: "12px", width: "115px", height: "70px",
            transformStyle: "preserve-3d", transform: "translateZ(100px)"
          }}>
            {/* Front Sloped Roof Panel */}
            <div style={{
              position: "absolute", width: "115px", height: "38px",
              background: "repeating-linear-gradient(0deg, #A44E28 0px, #A44E28 5px, #8C2D11 5px, #8C2D11 7px)", // Red clay tiles
              border: "1px solid #7B240B",
              transform: "translate3d(0, 35px, 0) rotateX(25deg)", transformOrigin: "bottom center"
            }} />
            {/* Back Sloped Roof Panel */}
            <div style={{
              position: "absolute", width: "115px", height: "38px",
              background: "repeating-linear-gradient(0deg, #A44E28 0px, #A44E28 5px, #8C2D11 5px, #8C2D11 7px)",
              border: "1px solid #7B240B",
              transform: "translate3d(0, 35px, 0) rotateX(-25deg)", transformOrigin: "top center"
            }} />
          </div>

          {/* G. OUTDOOR VEGETATION & GARDENS (Lawn ornaments) */}
          {/* Cypress Tree 1 */}
          <div style={{
            position: "absolute", left: "100px", top: "15px", width: "12px", height: "36px",
            transformStyle: "preserve-3d", transform: "translateZ(0px) rotateX(-90deg)", transformOrigin: "bottom center"
          }}>
            <div style={{ position: "absolute", bottom: 0, left: "4px", width: "3px", height: "8px", background: "#5D4037" }} />
            <div style={{ position: "absolute", bottom: "8px", left: 0, width: "12px", height: "28px", background: "linear-gradient(to bottom, #1B5E20, #2E7D32)", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
            <div style={{ position: "absolute", bottom: "8px", left: 0, width: "12px", height: "28px", background: "linear-gradient(to bottom, #1B5E20, #2E7D32)", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", transform: "rotateY(90deg)" }} />
          </div>
          {/* Cypress Tree 2 */}
          <div style={{
            position: "absolute", left: "15px", top: "10px", width: "12px", height: "36px",
            transformStyle: "preserve-3d", transform: "translateZ(0px) rotateX(-90deg)", transformOrigin: "bottom center"
          }}>
            <div style={{ position: "absolute", bottom: 0, left: "4px", width: "3px", height: "8px", background: "#5D4037" }} />
            <div style={{ position: "absolute", bottom: "8px", left: 0, width: "12px", height: "28px", background: "linear-gradient(to bottom, #1B5E20, #2E7D32)", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
            <div style={{ position: "absolute", bottom: "8px", left: 0, width: "12px", height: "28px", background: "linear-gradient(to bottom, #1B5E20, #2E7D32)", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", transform: "rotateY(90deg)" }} />
          </div>

          {/* H. VOLUMETRIC SPORTS SEDAN CAR (Parked on Driveway) */}
          <div style={{
            position: "absolute", left: "150px", top: "80px", width: "24px", height: "45px",
            transformStyle: "preserve-3d", transform: "translateZ(4px)" // sitting on driveway
          }}>
            {/* Car Chassis (Gold sports car body) */}
            <div style={{
              position: "absolute", inset: 0,
              background: t.gold, border: `1.5px solid ${t.goldLight}`, borderRadius: "4px",
              transformStyle: "preserve-3d"
            }}>
              {/* Car Side Left */}
              <div style={{ position: "absolute", left: 0, top: 0, width: "4px", height: "45px", background: "#9E782F", transform: "rotateY(-90deg)", transformOrigin: "left center" }} />
              {/* Car Side Right */}
              <div style={{ position: "absolute", left: "24px", top: 0, width: "4px", height: "45px", background: "#9E782F", transform: "rotateY(90deg)", transformOrigin: "left center" }} />
              {/* Car Bumper Front */}
              <div style={{ position: "absolute", left: 0, top: "45px", width: "24px", height: "4px", background: "#5D4037", transform: "rotateX(-90deg)", transformOrigin: "top center" }} />
              {/* Car Bumper Back */}
              <div style={{ position: "absolute", left: 0, top: 0, width: "24px", height: "4px", background: "#5D4037", transform: "rotateX(90deg)", transformOrigin: "top center" }} />

              {/* Car Cabin */}
              <div style={{
                position: "absolute", left: "3px", top: "10px", width: "18px", height: "20px",
                background: "#111", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "2px",
                transform: "translateZ(4px)"
              }} />
            </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}

function Building3D({ numFloors = 9, floorH = 30, bW = 110, bD = 64, t, windowData, animated = true, small = false }) {
  return (
    <div style={{ transform: "perspective(900px) rotateX(8deg)", transformStyle: "preserve-3d" }}>
      <motion.div
        animate={{ rotateY: [-28, -20, -28] }}
        transition={{ repeat: Infinity, duration: small ? 8 : 6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d", width: bW, height: numFloors * floorH, position: "relative" }}
      >
        {/* ── Spire ── */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: animated ? 2.5 : 0.2, duration: 0.5, ease: "backOut" }}
          style={{
            position: "absolute", top: -(floorH * 1.7), left: "50%", marginLeft: -4,
            width: 8, height: floorH * 1.7,
            transformStyle: "preserve-3d", transformOrigin: "bottom center",
          }}
        >
          {/* Front */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to top, ${t.gold}, ${t.goldLight})`,
            transform: `translateZ(${bD / 2}px)`,
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          }} />
          {/* Right */}
          <div style={{
            position: "absolute", width: bD, height: floorH * 1.7,
            background: `linear-gradient(to top, #9A7030, ${t.gold})`,
            transform: `rotateY(90deg) translateZ(${bW / 2}px)`,
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          }} />
          {/* Beacon */}
          <motion.div
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            style={{
              position: "absolute", top: -6, left: "50%", marginLeft: -4,
              width: 8, height: 8, borderRadius: "50%",
              background: "#FF3C3C",
              boxShadow: "0 0 14px 5px rgba(255,60,60,0.55)",
              transform: `translateZ(${bD / 2}px)`,
            }}
          />
        </motion.div>

        {/* ── Floors ── */}
        {Array.from({ length: numFloors }).map((_, domIdx) => {
          const fi = numFloors - 1 - domIdx;          // floor index 0=bottom
          const isTop = fi === numFloors - 1;
          const dropDelay = animated ? (numFloors - 1 - fi) * 0.13 + 0.15 : 0;
          const wd = windowData[fi];

          return (
            <motion.div
              key={fi}
              initial={animated ? { y: -(numFloors * floorH + 150), opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={animated ? { delay: dropDelay, type: "spring", stiffness: 175, damping: 18, mass: 0.85 } : {}}
              style={{ position: "absolute", bottom: fi * floorH, transformStyle: "preserve-3d", width: bW, height: floorH }}
            >
              {/* Front face */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, #C26438, #A44E28)",
                transform: `translateZ(${bD / 2}px)`,
                display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 14px",
                overflow: "hidden",
              }}>
                {/* Modern Finish Overlay - 3D Tiles sliding/snapping into place */}
                <motion.div
                  initial={animated ? { scaleY: 0, z: 12, transformOrigin: "top" } : { scaleY: 1, z: 0 }}
                  animate={{ scaleY: 1, z: 0 }}
                  transition={animated ? { delay: 1.8 + (numFloors - 1 - fi) * 0.12, duration: 0.8, ease: "easeOut" } : { duration: 0.1 }}
                  style={{
                    position: "absolute", inset: 0,
                    background: t.isDark
                      ? "linear-gradient(90deg, transparent 32.5%, rgba(255,255,255,0.06) 32.5%, rgba(255,255,255,0.06) 34.5%, transparent 34.5%, transparent 65.5%, rgba(255,255,255,0.06) 65.5%, rgba(255,255,255,0.06) 67.5%, transparent 67.5%), linear-gradient(to bottom, #1E293B, #0F172A)"
                      : "linear-gradient(90deg, transparent 32.5%, rgba(0,0,0,0.04) 32.5%, rgba(0,0,0,0.04) 34.5%, transparent 34.5%, transparent 65.5%, rgba(0,0,0,0.04) 65.5%, rgba(0,0,0,0.04) 66.5%, transparent 66.5%), linear-gradient(to bottom, #E2E8F0, #CBD5E1)",
                    border: `1px solid ${t.isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)"}`,
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.05)",
                    zIndex: 1,
                  }}
                />
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 1,
                  background: `linear-gradient(90deg, transparent, ${t.gold}60, transparent)`,
                  zIndex: 2,
                }} />
                {wd.front.map((lit, wi) => (
                  <motion.div key={wi}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: animated ? 1.8 + (numFloors - 1 - fi) * 0.12 + 0.5 + wi * 0.05 : 0.1 }}
                    style={{
                      width: small ? 10 : 13, height: floorH * 0.60,
                      background: lit ? `linear-gradient(135deg, ${t.goldLight}EE, ${t.gold}CC)` : "rgba(20,8,2,0.8)",
                      boxShadow: lit ? `0 0 10px ${t.gold}AA, 0 0 22px ${t.gold}44` : "none",
                      borderRadius: 1,
                      position: "relative",
                      zIndex: 2,
                    }}
                  />
                ))}
              </div>

              {/* Right face */}
              <div style={{
                position: "absolute", width: bD, height: floorH,
                background: "linear-gradient(to right, #6A2C14, #521E0A)",
                transform: `rotateY(90deg) translateZ(${bW - bD / 2}px)`,
                borderTop: "1px solid rgba(130,55,25,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                {/* Modern Finish Overlay - 3D Tiles sliding/snapping into place */}
                <motion.div
                  initial={animated ? { scaleY: 0, z: 12, transformOrigin: "top" } : { scaleY: 1, z: 0 }}
                  animate={{ scaleY: 1, z: 0 }}
                  transition={animated ? { delay: 1.8 + (numFloors - 1 - fi) * 0.12, duration: 0.8, ease: "easeOut" } : { duration: 0.1 }}
                  style={{
                    position: "absolute", inset: 0,
                    background: t.isDark
                      ? "linear-gradient(90deg, transparent 48.5%, rgba(255,255,255,0.06) 48.5%, rgba(255,255,255,0.06) 51.5%, transparent 51.5%), linear-gradient(to bottom, #0F172A, #020617)"
                      : "linear-gradient(90deg, transparent 48.5%, rgba(0,0,0,0.04) 48.5%, rgba(0,0,0,0.04) 51.5%, transparent 51.5%), linear-gradient(to bottom, #CBD5E1, #94A3B8)",
                    borderLeft: `1px solid ${t.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}`,
                    zIndex: 1,
                  }}
                />
                {wd.side && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: animated ? 1.8 + (numFloors - 1 - fi) * 0.12 + 0.6 : 0.1 }}
                    style={{
                      width: small ? 8 : 11, height: floorH * 0.58,
                      background: `${t.gold}99`, boxShadow: `0 0 8px ${t.gold}66`, borderRadius: 1,
                      position: "relative",
                      zIndex: 2,
                    }}
                  />
                )}
              </div>

              {/* Roof — only top floor */}
              {isTop && (
                <div style={{
                  position: "absolute", width: bW, height: bD,
                  background: `linear-gradient(135deg, ${t.gold}EE, ${t.goldLight}BB)`,
                  transform: `rotateX(-90deg) translateZ(${floorH}px) translateY(${bD / 2}px)`,
                  borderLeft: `1px solid ${t.gold}80`, borderBottom: `1px solid ${t.gold}80`,
                }} />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PRELOADER
// ══════════════════════════════════════════════════════════════
function Preloader({ onComplete, t }) {
  const NF = 9, FH = 30;

  const windowData = useMemo(() =>
    Array.from({ length: NF }, () => ({
      front: Array.from({ length: 3 }, () => Math.random() > 0.28),
      side: Math.random() > 0.38,
    })), []);

  const stars = useMemo(() =>
    Array.from({ length: 95 }, () => ({
      x: Math.random() * 100, y: Math.random() * 72,
      size: Math.random() * 1.8 + 0.4,
      delay: Math.random() * 3, dur: 2 + Math.random() * 3,
      lo: 0.15 + Math.random() * 0.25, hi: 0.65 + Math.random() * 0.35,
    })), []);

  useEffect(() => {
    const id = setTimeout(onComplete, 4800);
    return () => clearTimeout(id);
  }, [onComplete]);

  const skyGrad = `linear-gradient(to bottom, ${t.skyA} 0%, ${t.skyB} 55%, ${t.skyC} 100%)`;

  return (
    <motion.div
      key="preloader"
      exit={{ y: "-100%", transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: skyGrad,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Skip Intro Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        onClick={onComplete}
        style={{
          position: "absolute", right: 24, top: 24, zIndex: 10,
          background: "rgba(255, 255, 255, 0.08)",
          border: `1.5px solid ${t.border}`,
          borderRadius: "20px",
          color: t.text1,
          padding: "8px 18px",
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          transition: "border-color 0.25s, background-color 0.25s"
        }}
      >
        Skip Intro
      </motion.button>
      {/* Sky */}
      {t.isDark ? <NightSky stars={stars} /> : <DaySky />}

      {/* Ground glow */}
      <div style={{
        position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
        width: 320, height: 40,
        background: t.isDark
          ? "radial-gradient(ellipse, rgba(184,92,56,0.18) 0%, transparent 70%)"
          : "radial-gradient(ellipse, rgba(255,200,100,0.3) 0%, transparent 70%)",
        filter: "blur(8px)",
      }} />

      {/* City silhouette */}
      <CitySilhouette t={t} />

      {/* 3D Building */}
      <div style={{ position: "relative", zIndex: 3, marginTop: -50 }}>
        <Building3D numFloors={NF} floorH={FH} bW={110} bD={64} t={t} windowData={windowData} animated />
      </div>

      {/* Brand reveal */}
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", marginTop: 30 }}>
        <div style={{ overflow: "hidden" }}>
          <motion.div
            initial={{ y: "110%" }} animate={{ y: 0 }}
            transition={{ delay: 2.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(145deg, #8B4513, #4A2200)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 28px rgba(140,70,20,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
              border: "2.5px solid rgba(201,151,74,0.5)", flexShrink: 0,
            }}>
              <span style={{ color: "#FFF", fontWeight: 800, fontSize: 19, fontFamily: "Georgia, serif" }}>UB</span>
            </div>
            <span style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 40, fontWeight: 700,
              color: t.isDark ? "#F2E5CC" : "#1A0E07",
              letterSpacing: "0.1em", textTransform: "uppercase",
              textShadow: t.isDark ? "0 2px 24px rgba(0,0,0,0.7)" : "0 2px 12px rgba(255,255,255,0.6)",
            }}>Urban Bricks</span>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.30em" }}
          transition={{ delay: 3.3, duration: 0.8 }}
          style={{ color: t.gold, fontSize: 10, textTransform: "uppercase", marginTop: 12, fontWeight: 500 }}
        >Real Estate Complete Solution</motion.p>
      </div>

      {/* Progress bar */}
      <motion.div
        style={{
          position: "absolute", bottom: 0, left: 0, height: 3, zIndex: 3,
          background: `linear-gradient(90deg, ${t.terra}, ${t.gold})`
        }}
        initial={{ width: "0%" }} animate={{ width: "100%" }}
        transition={{ duration: 4.4, ease: "easeInOut" }}
      />

      {/* Corner ornaments */}
      {[0, 1, 2, 3].map((qi) => (
        <motion.div key={qi}
          initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: 0.5 }}
          style={{
            position: "absolute", width: 40, height: 40, zIndex: 3,
            [qi < 2 ? "top" : "bottom"]: 22,
            [qi % 2 === 0 ? "left" : "right"]: 22,
            borderTop: qi < 2 ? `1.5px solid ${t.terra}` : "none",
            borderBottom: qi >= 2 ? `1.5px solid ${t.terra}` : "none",
            borderLeft: qi % 2 === 0 ? `1.5px solid ${t.terra}` : "none",
            borderRight: qi % 2 !== 0 ? `1.5px solid ${t.terra}` : "none",
          }}
        />
      ))}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  NAVBAR
// ══════════════════════════════════════════════════════════════
function Navbar({ t, isDark, onToggle }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total === 0) return;
      setProgress((window.scrollY / total) * 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, ...ease }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        height: 72,
        background: scrolled ? t.glass : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${t.border}` : "none",
        boxShadow: scrolled ? `0 4px 24px ${t.shadow}` : "none",
        transition: "all 0.4s ease",
        padding: "0 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}
    >
      {/* Dynamic Scroll Progress Bar */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: `${progress}%`, height: "3.5px",
        background: `linear-gradient(90deg, ${t.terra}, ${t.gold}, ${t.terraLight})`,
        transition: "width 0.08s ease-out",
        zIndex: 100,
      }} />

      <UBLogo size={36} t={t} />

      {/* Desktop */}
      <div className="ub-hide-mobile" style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {links.map((lk) => (
          <a key={lk.label} href={lk.href}
            style={{ color: t.text2, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.target.style.color = t.terra)}
            onMouseLeave={(e) => (e.target.style.color = t.text2)}
          >{lk.label}</a>
        ))}
        <ThemeToggle isDark={isDark} onToggle={onToggle} t={t} />
        <a href="#contact" style={{
          background: `linear-gradient(135deg, ${t.terra}, ${t.terraDark})`,
          color: "#F2E5CC", padding: "10px 22px", fontSize: 11,
          letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
          borderRadius: 4, transition: "all 0.25s",
          boxShadow: `0 4px 16px ${t.terra}44`,
        }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
        >Enquire Now</a>
      </div>

      {/* Mobile */}
      <div className="ub-show-mobile" style={{ display: "none", alignItems: "center", gap: 10 }}>
        <ThemeToggle isDark={isDark} onToggle={onToggle} t={t} />
        <button onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", color: t.text1, cursor: "pointer", display: "flex", alignItems: "center" }}
        >{open ? <X size={24} /> : <Menu size={24} />}</button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
            style={{
              position: "absolute", top: 72, left: 0, right: 0,
              background: t.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              padding: "20px 5%", borderBottom: `1px solid ${t.border}`
            }}
          >
            {links.map((lk) => (
              <a key={lk.label} href={lk.href} onClick={() => setOpen(false)}
                style={{ display: "block", color: t.text1, padding: "13px 0", borderBottom: `1px solid ${t.border}80`, fontSize: 13, letterSpacing: "0.06em" }}
              >{lk.label}</a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)}
              style={{ display: "block", marginTop: 16, background: t.terra, color: "#F2E5CC", padding: "13px 0", textAlign: "center", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, borderRadius: 4 }}
            >Enquire Now</a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ══════════════════════════════════════════════════════════════
//  ANIMATED STATS COUNTER
// ══════════════════════════════════════════════════════════════
function AnimatedCounter({ value, duration = 2, delay = 0.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const isNumber = /[0-9]/.test(value);

  useEffect(() => {
    if (!inView || !isNumber) return;

    const target = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(target)) return;

    let start = 0;
    const end = target;
    const range = end - start;
    if (range === 0) return;

    const startTime = performance.now();
    let animationFrameId;

    const updateCount = (now) => {
      const elapsed = (now - startTime) / 1000;
      const t = elapsed - delay;
      if (t < 0) {
        setCount(0);
        animationFrameId = requestAnimationFrame(updateCount);
        return;
      }

      if (t >= duration) {
        setCount(end);
      } else {
        const progress = t / duration;
        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(start + range * easeOut));
        animationFrameId = requestAnimationFrame(updateCount);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [inView, value, duration, delay, isNumber]);

  if (!isNumber) {
    return <span ref={ref}>{value}</span>;
  }

  const suffix = value.replace(/[0-9]/g, "");

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════
//  BACKGROUND AMBIENT PARTICLES
// ══════════════════════════════════════════════════════════════
function BackgroundParticles({ count = 6, t }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 120 + 40,
      dur: Math.random() * 15 + 15,
      delay: Math.random() * -10,
    }));
  }, [count]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="bg-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  HERO — with live 3D building scene + day/night sky
// ══════════════════════════════════════════════════════════════
function Hero({ t, isDark }) {
  const heroWindowData = useMemo(() =>
    Array.from({ length: 6 }, () => ({
      front: Array.from({ length: 3 }, () => Math.random() > 0.25),
      side: Math.random() > 0.35,
    })), []);

  const heroStars = useMemo(() =>
    Array.from({ length: 55 }, () => ({
      x: Math.random() * 100, y: Math.random() * 80,
      size: Math.random() * 1.5 + 0.3,
      delay: Math.random() * 3, dur: 2 + Math.random() * 3,
      lo: 0.1, hi: 0.7,
    })), []);

  return (
    <section id="home" style={{
      minHeight: "100vh", position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center",
      padding: "120px 5% 80px",
      background: t.isDark
        ? `linear-gradient(135deg, ${t.bg} 0%, ${t.bgAlt} 100%)`
        : `linear-gradient(135deg, ${t.bg} 0%, ${t.bgAlt} 100%)`,
    }}>
      {/* Blueprint Grid background overlay */}
      <div className="blueprint-grid" style={{ opacity: t.isDark ? 0.35 : 0.45 }} />

      {/* Floating Ambient Particles */}
      <BackgroundParticles count={5} t={t} />

      {/* Dot grid */}
      <div style={{ position: "absolute", inset: 0, opacity: t.isDark ? 0.04 : 0.06, pointerEvents: "none" }}>
        {Array.from({ length: 10 }).map((_, r) =>
          Array.from({ length: 16 }).map((_, c) => (
            <div key={`${r}-${c}`} style={{
              position: "absolute", width: 2, height: 2, borderRadius: "50%",
              background: t.terra, left: `${c * 6.6 + 3.3}%`, top: `${r * 10 + 5}%`,
            }} />
          ))
        )}
      </div>

      {/* Text content — left */}
      <div style={{ maxWidth: 620, position: "relative", zIndex: 2, flex: "1 1 0" }}>
        <motion.div
          initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, ...ease }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}
        >
          <div style={{ width: 28, height: 1, background: t.gold }} />
          <span style={{ color: t.gold, fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 500 }}>
            Ambikapur, Surguja · C.G.
          </span>
        </motion.div>

        {["A Real Estate", "Complete Solution."].map((line, li) => (
          <div key={li} style={{ overflow: "hidden", marginBottom: li === 0 ? 4 : 36 }}>
            <motion.h1
              initial={{ y: "102%" }} animate={{ y: 0 }}
              transition={{ delay: 0.42 + li * 0.14, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(46px, 7vw, 86px)",
                fontWeight: li === 0 ? 600 : 300,
                fontStyle: li === 1 ? "italic" : "normal",
                color: li === 0 ? t.text1 : t.terra,
                lineHeight: 1.05, letterSpacing: "-0.01em",
              }}
            >{line}</motion.h1>
          </div>
        ))}

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.88, ...ease }}
          style={{ color: t.text2, fontSize: 16, lineHeight: 1.85, maxWidth: 500, marginBottom: 44 }}
        >
          From residential flats to commercial spaces, agricultural land to complete interior design —
          Urban Bricks transforms property dreams into reality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.04, ...ease }}
          style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
        >
          <a href="#services" style={{
            background: `linear-gradient(135deg, ${t.terra}, ${t.terraDark})`,
            color: "#F2E5CC", padding: "15px 34px", fontSize: 12, letterSpacing: "0.16em",
            textTransform: "uppercase", fontWeight: 600, borderRadius: 4,
            display: "flex", alignItems: "center", gap: 9,
            boxShadow: `0 6px 22px ${t.terra}44`, transition: "all 0.25s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >Explore Services <ChevronRight size={15} /></a>

          <a href="#contact" style={{
            border: `1px solid ${t.terra}66`, color: t.text1, padding: "15px 34px",
            fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase",
            fontWeight: 500, borderRadius: 4, background: "transparent", transition: "all 0.25s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.terra; e.currentTarget.style.color = t.terra; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${t.terra}66`; e.currentTarget.style.color = t.text1; }}
          >Enquire Now</a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.28, duration: 0.6 }}
          style={{ display: "flex", gap: 44, marginTop: 64, paddingTop: 36, borderTop: `1px solid ${t.border}`, flexWrap: "wrap" }}
        >
          {[["10k+", "Properties Dealt"], ["11", "Services Offered"], ["Trusted", "Since Day One"]].map(([num, lbl]) => (
            <div key={lbl}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 600, color: t.text1, lineHeight: 1 }}>
                <AnimatedCounter value={num} delay={1.4} duration={1.6} />
              </div>
              <div style={{ fontSize: 10, color: t.gold, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 5 }}>{lbl}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 3D Building Scene — right */}
      <motion.div
        className="ub-hero-right"
        initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, ...ease }}
        style={{
          flex: "0 0 460px", height: 520,
          position: "relative", overflow: "hidden",
          borderRadius: 24,
          background: t.isDark
            ? `linear-gradient(to bottom, ${t.skyA} 0%, ${t.skyB} 55%, ${t.skyC} 100%)`
            : `linear-gradient(to bottom, ${t.skyA} 0%, ${t.skyB} 55%, ${t.skyC} 100%)`,
          boxShadow: `0 30px 80px ${t.shadow}, 0 0 0 1px ${t.border}`,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          padding: "0 0 30px",
          marginLeft: 60,
        }}
      >
        {/* Mini sky elements */}
        {t.isDark
          ? <NightSky stars={heroStars} />
          : (
            <>
              <motion.div style={{
                position: "absolute", right: "14%", top: "10%",
                width: 44, height: 44, borderRadius: "50%",
                background: "radial-gradient(circle, #FFF8A0, #FFD700, #FFA500)",
                boxShadow: "0 0 40px 14px rgba(255,200,0,0.35)",
              }} />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 0.4 }}>
                <Cloud left="6%" top="24%" scale={0.75} />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 0.7 }}>
                <Cloud left="54%" top="16%" scale={0.6} />
              </motion.div>
            </>
          )}

        {/* Mini city silhouette */}
        <CitySilhouette t={t} />

        {/* 3D Building */}
        <div style={{ position: "relative", zIndex: 2, marginBottom: 40 }}>
          <Building3D numFloors={6} floorH={30} bW={110} bD={64} t={t} windowData={heroWindowData} animated />
        </div>

      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
//  ABOUT
// ══════════════════════════════════════════════════════════════
function About({ t }) {
  const deals = [
    { label: "Buy Property", Icon: Home },
    { label: "Sell Property", Icon: Tag },
    { label: "Rent / Lease", Icon: Key },
    { label: "Brand Franchisee", Icon: Award },
    { label: "Construction", Icon: HardHat },
  ];

  return (
    <section id="about" style={{ background: t.bgAlt, padding: "108px 5%", transition: "background 0.5s" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="ub-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          <div>
            <SectionLabel text="Who We Are" t={t} />
            <FadeUp delay={0.1}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 50px)", fontWeight: 600, color: t.text1, lineHeight: 1.15, marginBottom: 22 }}>
                Your Trusted Real Estate Partner
              </h2>
            </FadeUp>
            <FadeUp delay={0.18}>
              <p style={{ color: t.text2, fontSize: 15, lineHeight: 1.88, marginBottom: 18 }}>
                Urban Bricks is a comprehensive real estate solutions company rooted in Ambikapur, Surguja. We
                connect buyers, sellers, and tenants with the right property — residential, commercial, or agricultural.
              </p>
            </FadeUp>
            <FadeUp delay={0.26}>
              <p style={{ color: t.text2, fontSize: 15, lineHeight: 1.88, marginBottom: 34 }}>
                Beyond dealing in properties, we provide end-to-end architectural and design services — from detailed
                home plans to 2D/3D elevations and full interior design — making us a truly complete real estate solution.
              </p>
            </FadeUp>
            <FadeUp delay={0.34}>
              <div style={{ padding: "20px 24px", borderLeft: `3px solid ${t.terra}`, background: `${t.terra}12`, borderRadius: "0 4px 4px 0" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: "italic", color: t.text1, lineHeight: 1.5 }}>
                  "Building trust, one brick at a time."
                </p>
              </div>
            </FadeUp>
          </div>

          <div>
            <SectionLabel text="We Deal In" t={t} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {deals.map((deal, i) => {
                const DealIcon = deal.Icon;
                return (
                  <FadeUp key={deal.label} delay={0.08 + i * 0.07}>
                    <motion.div
                      whileHover={{
                        scale: 1.04,
                        y: -4,
                        borderColor: `${t.terra}88`,
                        boxShadow: `0 10px 30px ${t.terra}22`
                      }}
                      transition={spring}
                      style={{
                        background: t.card, border: `1px solid ${t.border}`,
                        padding: "22px 18px", borderRadius: 10, cursor: "default",
                        boxShadow: `0 2px 8px ${t.shadow}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <motion.div
                        whileHover={{
                          backgroundColor: t.terra,
                          color: "#FFF"
                        }}
                        style={{
                          width: 40, height: 40,
                          background: `${t.terra}14`,
                          color: t.terra,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "background-color 0.25s, color 0.25s",
                        }}
                      >
                        <DealIcon size={18} />
                      </motion.div>
                      <div style={{ color: t.text1, fontWeight: 500, fontSize: 13, letterSpacing: "0.04em", lineHeight: 1.4 }}>{deal.label}</div>
                    </motion.div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
//  3D TILT SERVICE CARDS
// ══════════════════════════════════════════════════════════════
function TiltCard({ children, t }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });

  const onMove = useCallback((e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ rx: (y - 0.5) * -14, ry: (x - 0.5) * 14, active: true });
  }, []);

  const onLeave = useCallback(() => setTilt({ rx: 0, ry: 0, active: false }), []);

  return (
    <div ref={cardRef} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ perspective: "900px", height: "100%" }}
    >
      <motion.div
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry, scale: tilt.active ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        style={{
          transformStyle: "preserve-3d",
          background: t.card,
          border: `1px solid ${tilt.active ? `${t.terra}66` : t.border}`,
          borderRadius: 12,
          padding: "28px 22px",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          boxShadow: tilt.active
            ? `0 24px 60px ${t.shadow}, 0 0 0 1px ${t.terra}22, inset 0 1px 0 rgba(255,255,255,0.05)`
            : `0 4px 16px ${t.shadow}`,
          transition: "border-color 0.25s, box-shadow 0.25s",
        }}
      >
        {/* Gradient bar on top (shows on hover) */}
        <motion.div
          animate={{ opacity: tilt.active ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, ${t.terra}, ${t.gold})`,
          }}
        />

        {/* Shine / reflectance that follows cursor */}
        {tilt.active && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(circle at ${50 + tilt.ry * 3}% ${50 - tilt.rx * 3}%, ${t.terra}12, transparent 60%)`,
          }} />
        )}

        {/* 3D depth layer for content */}
        <div style={{ transform: "translateZ(28px)", transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

const SERVICES = [
  {
    title: "Residential Flat",
    desc: "Modern apartments and flats for comfortable urban living.",
    Icon: Home,
    category: "residential",
    details: "Premium flats located in high-growth corridors of Ambikapur. Designed for comfort, featuring multi-tiered security, modern ventilation, and elegant architectural design. Perfect for modern families looking for community and accessibility.",
    deliverables: ["RERA Approved Projects", "24/7 Water & Power Backup", "High-Fidelity Virtual Walkthroughs", "Modular Kitchen Provision", "Premium Sanitary & Fitting Options"]
  },
  {
    title: "Residential Land",
    desc: "Build your dream home on the perfect, verified residential plot.",
    Icon: MapPin,
    category: "residential",
    details: "Premium, fully verified residential plots in top locations across Surguja. We handle complete title verification, boundary markings, and legal documentation to ensure a 100% stress-free acquisition.",
    deliverables: ["Clear Legal Title & Registry Support", "Road Connectivity Map", "Groundwater Assessment", "Demarcated Boundaries", "Immediate Possession & Registry ready"]
  },
  {
    title: "Farm House",
    desc: "Serene farm houses for weekend retreat or rural living.",
    Icon: Trees,
    category: "residential",
    details: "Escape the city hustle with our custom farmhouse plots and built layouts. Beautifully landscaped sites with plantation pathways, organic gardening zones, and private villa architecture concepts.",
    deliverables: ["Green Landscaping Design", "Fencing & Gate Installation", "Water Boring & Storage Setup", "Cottage Layout Planning", "Eco-friendly Sewage & Solar integration"]
  },
  {
    title: "Commercial Office / Space",
    desc: "Prime office and workspace solutions for businesses of all sizes.",
    Icon: Building2,
    category: "commercial",
    details: "Premium corporate offices, co-working suites, and clinical spaces strategically situated in heavy business corridors. Boost your company presence with world-class facilities and design aesthetics.",
    deliverables: ["Vastu-compliant layouts", "High-Speed Fiber Ready", "Dedicated Client Parking Zones", "Ample Natural Light Design", "Flexible Floor Plate Planning"]
  },
  {
    title: "Commercial Shop / Showroom",
    desc: "High-footfall retail units and showrooms in prime locations.",
    Icon: Store,
    category: "commercial",
    details: "Maximize visibility and footprint with highly accessible showrooms and retail shops in premier markets. Designed for high exposure, broad display frontages, and premium loading/unloading logistics.",
    deliverables: ["Wide Double-Glazed Frontages", "Main Road Facing Locations", "Separate Utility & Storage Areas", "High Ceiling Height", "Fire Safety Compliance Certified"]
  },
  {
    title: "Commercial / Industrial Plots",
    desc: "Strategic industrial and commercial land for business ventures.",
    Icon: Factory,
    category: "commercial",
    details: "Large-scale plots designed for warehouses, manufacturing units, commercial complexes, and retail centers. Located near major state highways for optimal transport logistics and supply chains.",
    deliverables: ["Heavy Transport Access Roads", "Industrial Power Connectivity", "Clear Industrial Land Use (CLU)", "Topography & Soil Test Reports", "Secure Perimeter Fencing"]
  },
  {
    title: "Agricultural Land / Plots",
    desc: "Fertile agricultural land and plots for investment or farming.",
    Icon: Tractor,
    category: "agriculture",
    details: "High-yield agricultural land and farm plots across Chhattisgarh. Verified soil fertility, water source availability, and clear land records. Perfect for commercial farming or long-term wealth appreciation.",
    deliverables: ["Government Khatauni Verification", "Irrigation Canal & Well Studies", "Soil Composition Report", "Clear Boundary Survey Maps", "Farming Machinery Access Plan"]
  },
  {
    title: "Home Plan",
    desc: "Custom architectural home plans tailored to your lifestyle.",
    Icon: LayoutTemplate,
    category: "design",
    details: "Bespoke architectural drafting services to bring your dream home to life. We deliver detailed, space-optimized layouts tailored to your unique requirements, Vastu alignment, and natural wind/sunlight optimization.",
    deliverables: ["2D Architectural Layouts", "Vastu Shastra Consultation", "Furniture Placement Layouts", "Detailed Dimension Matrices", "Electrical & Plumbing Drafts"]
  },
  {
    title: "2D / 3D Elevation",
    desc: "Detailed architectural elevations to visualise your dream space.",
    Icon: Layers,
    category: "design",
    details: "Ultra-realistic 3D facade renders and elevation designs that showcase exactly how your finished property will stand out. Perfect for visualising materials, colors, and structural style before brickwork begins.",
    deliverables: ["High-Definition 3D Renders", "Day/Night Lighting Simulation", "Material Specification Sheets", "Structural Section Drawings", "Color Palette Recommendations"]
  },
  {
    title: "Elevation & Layout Design",
    desc: "Creative layout designs with precise architectural finesse.",
    Icon: Palette,
    category: "design",
    details: "A comprehensive design package merging exterior elegance with interior room layouts. We sync your building facade style with highly functional floor arrangements for perfect architectural synergy.",
    deliverables: ["Facade-to-floor Plan Mapping", "Structural Engineering Consults", "Window & Door Schedule Maps", "Sun-Path Analysis & Ventilation", "Premium Finish Visualizations"]
  },
  {
    title: "Interior Design",
    desc: "Transform living and workspaces with premium interior concepts.",
    Icon: Sofa,
    category: "design",
    details: "Turn key residential and commercial interior solutions. Elegant styling, space-maximising modular furniture, bespoke false-ceiling illumination, and carefully selected color palettes to reflect your personality.",
    deliverables: ["Complete 3D Interior Mockups", "Modular Wardrobe & Kitchen Plans", "False Ceiling & Lighting Layouts", "Texture & Wall Polish Selector", "Accompanying Estimate Reports"]
  },
  {
    title: "Agro-Forestry / Orchards",
    desc: "Managed timber and fruit orchards for passive agro-income.",
    Icon: Trees,
    category: "agriculture",
    details: "Eco-friendly farmland plots designed for managed timber, fruit orchards, and sustainable agro-forestry projects. Complete support for high-yield sapling sourcing, automated drip irrigation, and security setups.",
    deliverables: ["Drip Irrigation Integration", "Managed Sapling Sourcing", "Soil Nutrition Log Reports", "Secure Perimeter Fencing", "Yield Estimation Guides"]
  },
  {
    title: "Greenhouse / Polyhouse",
    desc: "Climate-controlled high-yield crop cultivation systems.",
    Icon: Globe,
    category: "agriculture",
    details: "Strategically located farm plots optimized for greenhouse or polyhouse structures. Excellent for flowers, organic vegetables, and hydroponic cash crops with access to power and local trade routes.",
    deliverables: ["Structure Foundations Planning", "Canal Water Sourcing Studies", "Subsidy Eligibility Reports", "Soil & PH Testing", "Market Logistics Consults"]
  },
  {
    title: "Structural Construction",
    desc: "Turnkey building construction with premium structural integrity.",
    Icon: HardHat,
    category: "design",
    details: "Bespoke building construction services from excavation and foundation laying to brickwork, RCC casting, and structural completion. Quality-controlled materials and professional project management.",
    deliverables: ["Soil & Foundation Analysis", "RCC Structural Design Mapping", "High-Quality Raw Material Sourcing", "On-site Supervision Reports", "Turnkey Construction Handover"]
  }
];

function ServiceCard({ svc, idx, t, onSelect }) {
  const { title, desc, Icon } = svc;
  const [hovered, setHovered] = useState(false);

  return (
    <FadeUp delay={idx * 0.035} style={{ height: "100%" }}>
      <div
        onClick={() => onSelect(svc)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ height: "100%", cursor: "pointer" }}
      >
        <TiltCard t={t}>
          {/* Number badge */}
          <motion.div
            animate={hovered ? { color: t.gold, scale: 1.12 } : { color: t.border, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            style={{
              position: "absolute", top: 14, right: 18,
              fontSize: 11, fontWeight: 700,
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: "0.04em",
            }}
          >
            {String(idx + 1).padStart(2, "0")}
          </motion.div>

          {/* Icon box */}
          <motion.div
            animate={hovered ? { scale: 1.08, rotate: 8, background: `linear-gradient(135deg, ${t.terra}40, ${t.terra}20)` } : { scale: 1, rotate: 0, background: `linear-gradient(135deg, ${t.terra}28, ${t.terra}10)` }}
            style={{
              width: 52, height: 52,
              borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18,
              border: `1px solid ${t.terra}30`,
              boxShadow: hovered ? `0 6px 18px ${t.terra}30` : `0 4px 14px ${t.terra}14`,
              color: t.terra,
            }}
          >
            <Icon size={23} />
          </motion.div>

          <h3 style={{ color: t.text1, fontSize: 14, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8, lineHeight: 1.45 }}>{title}</h3>
          <p style={{ color: t.text2, fontSize: 13, lineHeight: 1.75, marginBottom: 20 }}>{desc}</p>

          <div style={{ marginTop: "auto", paddingTop: 10 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              color: hovered ? t.gold : t.terra,
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
              transition: "all 0.25s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
            >
              Explore Deliverables <ArrowUpRight size={12} style={{ transition: "transform 0.25s", transform: hovered ? "translate(2px, -2px)" : "none" }} />
            </span>
          </div>
        </TiltCard>
      </div>
    </FadeUp>
  );
}

function Residential3D({ t }) {
  const dropSpring = { type: "spring", stiffness: 100, damping: 15 };
  const popSpring = { type: "spring", stiffness: 140, damping: 12 };

  return (
    <div style={{ transformStyle: "preserve-3d", width: "200px", height: "220px", position: "relative" }}>
      {/* 1. FIELD BASE PLATE */}
      <motion.div
        initial={{ transform: "translate3d(0px, 200px, 0px) rotateX(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 110px, 0px) rotateX(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.15 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "160px",
          marginLeft: "-100px", marginTop: "-80px",
          background: "repeating-linear-gradient(90deg, #301A0E 0px, #301A0E 5px, #23120A 5px, #23120A 10px)",
          border: `1px solid ${t.border}`,
          transformStyle: "preserve-3d"
        }}
      >
        <div style={{
          position: "absolute",
          left: "15px", top: "40px",
          width: "110px", height: "80px",
          background: `linear-gradient(135deg, ${t.terra}, ${t.gold})`,
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          opacity: 0.85
        }} />

        {/* 3D SIDE WALLS FOR WOOD BLOCK THICKNESS */}
        <div style={{
          position: "absolute", left: 0, top: "160px", width: "200px", height: "16px",
          background: "linear-gradient(to bottom, #23120A, #120905)",
          transform: "rotateX(-90deg)", transformOrigin: "top center"
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, width: "200px", height: "16px",
          background: "linear-gradient(to bottom, #301A0E, #180C07)",
          transform: "rotateX(90deg)", transformOrigin: "top center"
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, width: "16px", height: "160px",
          background: "linear-gradient(to bottom, #23120A, #120905)",
          transform: "rotateY(-90deg)", transformOrigin: "left center"
        }} />
        <div style={{
          position: "absolute", left: "200px", top: 0, width: "16px", height: "160px",
          background: "linear-gradient(to bottom, #301A0E, #180C07)",
          transform: "rotateY(90deg)", transformOrigin: "left center"
        }} />
      </motion.div>

      {/* 2. FIRST FLOOR FLOOR PLATE */}
      <motion.div
        initial={{ transform: "translate3d(0px, 80px, 0px) rotateX(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 0px, 0px) rotateX(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.85 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "160px",
          marginLeft: "-100px", marginTop: "-80px",
          background: "repeating-linear-gradient(90deg, #E5C39C 0px, #E5C39C 6px, #D4AF83 6px, #D4AF83 12px)",
          border: `1px solid ${t.border}`,
          transformStyle: "preserve-3d"
        }}
      />

      {/* 3. ROOF PLATE */}
      <motion.div
        initial={{ transform: "translate3d(0px, -200px, 0px) rotateX(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, -110px, 0px) rotateX(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 1.45 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "160px",
          marginLeft: "-100px", marginTop: "-80px",
          background: "#2A2A2A",
          border: `2px solid ${t.terra}`,
          transformStyle: "preserve-3d"
        }}
      />

      {/* 4. BACK WALL */}
      <motion.div
        initial={{ transform: "translate3d(0px, 0px, -160px)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 0px, -80px)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.35 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "220px",
          marginLeft: "-100px", marginTop: "-110px",
          border: `1.5px solid ${t.border}`,
          transformStyle: "preserve-3d"
        }}
      >
        <div style={{
          position: "absolute", left: 0, bottom: 0,
          width: "200px", height: "110px",
          background: "#16231C",
          borderTop: `2px solid ${t.gold}50`,
          display: "flex", flexDirection: "column", justifyBetween: "space-between", padding: "10px"
        }}>
          <div style={{
            width: "55px", height: "40px",
            background: "linear-gradient(to right, #FF7E5F, #FEB47B)",
            borderRadius: "4px",
            border: `2px solid ${t.gold}`,
            boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
            marginTop: "4px"
          }} />
        </div>
        <div style={{
          position: "absolute", left: 0, top: 0,
          width: "200px", height: "110px",
          background: t.isDark ? "#2C140E" : "#F4ECE1",
          borderBottom: `1px solid ${t.border}`,
          padding: "10px"
        }}>
          <div style={{
            position: "absolute", left: "20px", top: "15px",
            width: "35px", height: "20px",
            background: "linear-gradient(45deg, #FF9E79, #FFA500)",
            borderRadius: "3px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
          }} />
        </div>
      </motion.div>

      {/* 5. LEFT WALL */}
      <motion.div
        initial={{ transform: "translate3d(-180px, 0px, 0px) rotateY(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(-100px, 0px, 0px) rotateY(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.45 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "160px", height: "220px",
          marginLeft: "-80px", marginTop: "-110px",
          background: t.isDark ? "#23150F" : "#EBE1D2",
          border: `1.5px solid ${t.border}`,
          transformStyle: "preserve-3d"
        }}
      >
        <div style={{
          position: "absolute", left: "20px", bottom: "10px",
          width: "18px", height: "80px",
          background: t.gold,
          border: "1px solid rgba(0,0,0,0.2)",
          borderRadius: "2px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
          transform: "translateZ(8px)",
          display: "flex", flexDirection: "column", justifyAround: "space-around", alignItems: "center",
          padding: "4px 0"
        }}>
          {[1, 2, 3].map((v) => (
            <div key={v} style={{ width: "12px", height: "8px", background: v === 1 ? "#FF5252" : v === 2 ? "#3F51B5" : "#4CAF50", borderRadius: "1px" }} />
          ))}
        </div>
      </motion.div>

      {/* 6. SOFA */}
      <motion.div
        initial={{ transform: "translate3d(0px, 20px, 0px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 20px, 0px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.6 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "100px", height: "30px",
          marginLeft: "-85px", marginTop: "55px"
        }}
      >
        <div style={{ position: "absolute", width: "95px", height: "14px", background: t.terra, border: "1px solid rgba(0,0,0,0.18)", boxShadow: "0 4px 8px rgba(0,0,0,0.35)", borderRadius: "3px", transform: "translate3d(0px, 12px, -30px)" }} />
        <div style={{ position: "absolute", width: "95px", height: "20px", background: t.terraDark, borderRadius: "3px", transform: "translate3d(0px, -6px, -36px) rotateX(4deg)" }} />
        <div style={{ position: "absolute", width: "35px", height: "14px", background: t.terra, border: "1px solid rgba(0,0,0,0.18)", borderRadius: "3px", transform: "translate3d(-10px, 12px, -5px)" }} />
      </motion.div>

      {/* 7. COFFEE TABLE */}
      <motion.div
        initial={{ transform: "translate3d(0px, 5px, 10px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 5px, 10px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.7 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "45px", height: "20px",
          marginLeft: "-15px", marginTop: "85px"
        }}
      >
        <div style={{ position: "absolute", width: "45px", height: "4px", background: "rgba(254, 208, 73, 0.45)", borderRadius: "3px", border: `1.5px solid ${t.gold}`, boxShadow: "0 4px 8px rgba(0,0,0,0.25)" }} />
        <div style={{ position: "absolute", left: "18px", top: "-10px", width: "9px", height: "9px", borderRadius: "50%", background: "#FF5252", border: "1.5px solid #4CAF50", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </motion.div>

      {/* 8. TV SCREEN */}
      <motion.div
        initial={{ transform: "translate3d(0px, 5px, -77px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 5px, -77px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.8 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "70px", height: "42px",
          marginLeft: "15px", marginTop: "20px"
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "#080808", border: "2px solid rgba(255,255,255,0.15)", borderRadius: "4px", boxShadow: "0 0 20px rgba(0,229,255,0.45)", display: "flex", alignItems: "center", justifyCenter: "center", overflow: "hidden" }}>
          <motion.div
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0, background: "linear-gradient(45deg, #00C9FF, #92FE9D)" }}
          />
          <div style={{ color: "#FFF", fontSize: "7px", fontWeight: 700, zIndex: 2, letterSpacing: "1px" }}>URBAN BRICKS</div>
        </div>
      </motion.div>

      {/* 9. BED */}
      <motion.div
        initial={{ transform: "translate3d(10px, 15px, -20px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(10px, 15px, -20px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 1.05 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "80px", height: "35px",
          marginLeft: "-80px", marginTop: "-55px"
        }}
      >
        <div style={{ position: "absolute", width: "70px", height: "18px", background: t.isDark ? "#1E0E06" : "#E2D8CC", border: "1px solid rgba(0,0,0,0.18)", borderRadius: "3px", transform: "translate3d(0px, 10px, -25px)" }} />
        <div style={{ position: "absolute", width: "70px", height: "16px", background: `linear-gradient(135deg, ${t.terra}, ${t.gold})`, borderRadius: "3px", transform: "translate3d(0px, 2px, -22px)", boxShadow: "0 3px 6px rgba(0,0,0,0.25)" }} />
        <div style={{ position: "absolute", width: "24px", height: "8px", background: "#FFF", borderRadius: "2px", transform: "translate3d(8px, -2px, -50px)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
        <div style={{ position: "absolute", width: "24px", height: "8px", background: "#FFF", borderRadius: "2px", transform: "translate3d(38px, -2px, -50px)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
      </motion.div>

      {/* 10. LAMP */}
      <motion.div
        initial={{ transform: "translate3d(0px, 10px, -65px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 10px, -65px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 1.15 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "20px", height: "30px",
          marginLeft: "-90px", marginTop: "-65px"
        }}
      >
        <div style={{ position: "absolute", width: "16px", height: "12px", background: t.gold, borderRadius: "2px", transform: "translate3d(0px, 14px, 0px)" }} />
        <div style={{ position: "absolute", left: "5px", top: "0px", width: "6px", height: "6px", borderRadius: "50%", background: "#FFE082", boxShadow: "0 0 16px 5px rgba(254,208,73,0.7)" }} />
      </motion.div>

      {/* 11. DESK */}
      <motion.div
        initial={{ transform: "translate3d(0px, 15px, -30px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 15px, -30px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 1.25 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "65px", height: "35px",
          marginLeft: "20px", marginTop: "-55px"
        }}
      >
        <div style={{ position: "absolute", width: "55px", height: "5px", background: t.isDark ? "#522C1B" : "#B08A6F", borderRadius: "2px", boxShadow: "0 2px 5px rgba(0,0,0,0.25)", transform: "translate3d(0px, 12px, 0px)" }} />
        <div style={{ position: "absolute", width: "2px", height: "14px", background: "#3A3A3A", transform: "translate3d(2px, 17px, 0px)" }} />
        <div style={{ position: "absolute", width: "2px", height: "14px", background: "#3A3A3A", transform: "translate3d(50px, 17px, 0px)" }} />
        <div style={{ position: "absolute", left: "16px", top: "-2px", width: "22px", height: "14px", transform: "translate3d(0px, 0px, 0px) rotateX(-20deg)", transformStyle: "preserve-3d" }}>
          <div style={{ position: "absolute", width: "22px", height: "2px", background: "#A2A2A2", transform: "translate3d(0px, 12px, 0px)" }} />
          <div style={{ position: "absolute", width: "22px", height: "14px", background: "#080808", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "2px", boxShadow: "0 0 12px rgba(0,229,255,0.7)", transform: "translate3d(0px, -2px, -6px) rotateX(75deg)" }} />
        </div>
      </motion.div>

      {/* 12. POTTED MONSTERA */}
      <motion.div
        initial={{ transform: "translate3d(0px, 10px, 35px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 10px, 35px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 1.35 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "25px", height: "45px",
          marginLeft: "65px", marginTop: "-30px"
        }}
      >
        <div style={{ position: "absolute", bottom: 0, left: "4px", width: "14px", height: "16px", background: "#B24C24", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "1px 1px 4px 4px" }} />
        <div style={{ position: "absolute", bottom: "14px", left: "1px", width: "20px", height: "20px", borderRadius: "50%", background: "#2E7D32", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
        <div style={{ position: "absolute", bottom: "24px", left: "6px", width: "12px", height: "12px", borderRadius: "50%", background: "#4CAF50" }} />
      </motion.div>
    </div>
  );
}

function Commercial3D({ t }) {
  const dropSpring = { type: "spring", stiffness: 100, damping: 15 };
  const popSpring = { type: "spring", stiffness: 140, damping: 12 };

  return (
    <div style={{ transformStyle: "preserve-3d", width: "200px", height: "180px", position: "relative" }}>
      {/* 1. BASE PLATE */}
      <motion.div
        initial={{ transform: "translate3d(0px, 180px, 0px) rotateX(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 90px, 0px) rotateX(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.15 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "160px",
          marginLeft: "-100px", marginTop: "-80px",
          background: "linear-gradient(135deg, #1A1F2C, #0F1219)",
          border: `1.5px solid ${t.border}`,
          boxShadow: `0 0 35px ${t.shadow}`,
          transformStyle: "preserve-3d"
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(45deg, transparent 46%, rgba(255,255,255,0.05) 47%, rgba(255,255,255,0.05) 48%, transparent 49%)" }} />

        {/* 3D SIDE WALLS FOR SLATE BLOCK THICKNESS */}
        <div style={{
          position: "absolute", left: 0, top: "160px", width: "200px", height: "16px",
          background: "linear-gradient(to bottom, #0F1219, #050609)",
          transform: "rotateX(-90deg)", transformOrigin: "top center"
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, width: "200px", height: "16px",
          background: "linear-gradient(to bottom, #1A1F2C, #0C0E14)",
          transform: "rotateX(90deg)", transformOrigin: "top center"
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, width: "16px", height: "160px",
          background: "linear-gradient(to bottom, #0F1219, #050609)",
          transform: "rotateY(-90deg)", transformOrigin: "left center"
        }} />
        <div style={{
          position: "absolute", left: "200px", top: 0, width: "16px", height: "160px",
          background: "linear-gradient(to bottom, #1A1F2C, #0C0E14)",
          transform: "rotateY(90deg)", transformOrigin: "left center"
        }} />
      </motion.div>

      {/* 2. CEILING PLATE */}
      <motion.div
        initial={{ transform: "translate3d(0px, -180px, 0px) rotateX(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, -90px, 0px) rotateX(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 1.15 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "160px",
          marginLeft: "-100px", marginTop: "-80px",
          background: "#D1D5DB",
          border: `1px solid ${t.border}`,
          transformStyle: "preserve-3d"
        }}
      >
        {[{ l: "30px", t: "40px" }, { l: "150px", t: "40px" }, { l: "30px", t: "110px" }, { l: "150px", t: "110px" }].map((pos, i) => (
          <div key={i} style={{ position: "absolute", left: pos.l, top: pos.t, width: "20px", height: "10px", background: "#FFF", boxShadow: "0 0 15px 4px #FFE082", borderRadius: "2px" }} />
        ))}
      </motion.div>

      {/* 3. BACK WALL */}
      <motion.div
        initial={{ transform: "translate3d(0px, 0px, -160px)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 0px, -80px)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.35 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "180px",
          marginLeft: "-100px", marginTop: "-90px",
          background: "repeating-linear-gradient(90deg, #1E0E06 0px, #1E0E06 6px, #110502 6px, #110502 8px)",
          border: `1.5px solid ${t.border}`,
          transformStyle: "preserve-3d"
        }}
      >
        <div style={{
          position: "absolute",
          left: "35px", top: "40px",
          width: "130px", height: "70px",
          background: t.isDark ? "#281D1A" : "#ECE4DB",
          border: `1px solid ${t.border}`,
          borderRadius: "6px",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          transform: "translateZ(5px)"
        }}>
          <div style={{
            padding: "6px 14px",
            background: "#080808",
            border: `1.5px solid ${t.gold}`,
            boxShadow: "0 0 20px 3px rgba(0, 255, 102, 0.45)",
            borderRadius: "4px",
            color: "#00FF66",
            textShadow: "0 0 4px #00FF66",
            fontFamily: "monospace",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "2px"
          }}>
            URBAN BRICKS
          </div>
        </div>
      </motion.div>

      {/* 4. LEFT WALL */}
      <motion.div
        initial={{ transform: "translate3d(-180px, 0px, 0px) rotateY(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(-100px, 0px, 0px) rotateY(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.45 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "160px", height: "180px",
          marginLeft: "-80px", marginTop: "-90px",
          background: t.isDark ? "#1E293B" : "#F1F5F9",
          border: `1.5px solid ${t.border}`,
          transformStyle: "preserve-3d"
        }}
      >
        <div style={{
          position: "absolute",
          left: "15px", top: "35px",
          width: "130px", height: "100px",
          background: "#0B0F19",
          borderRadius: "4px",
          border: "2px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          position: "relative"
        }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60px", background: "linear-gradient(to top, #020408, transparent)" }} />
          {[{ l: 20, t: 20 }, { l: 50, t: 30 }, { l: 80, t: 15 }, { l: 110, t: 40 }, { l: 30, t: 60 }, { l: 70, t: 70 }, { l: 100, t: 55 }].map((pt, i) => (
            <div key={i} style={{ position: "absolute", left: `${pt.l}px`, top: `${pt.t}px`, width: "4px", height: "6px", background: i % 2 === 0 ? "#FFE082" : "#90CAF9", boxShadow: "0 0 4px rgba(255,224,130,0.8)" }} />
          ))}
        </div>
      </motion.div>

      {/* 5. WORKSTATIONS */}
      <motion.div
        initial={{ transform: "translate3d(15px, 20px, 0px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(15px, 20px, 0px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.6 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "110px", height: "30px",
          marginLeft: "-55px", marginTop: "35px"
        }}
      >
        <div style={{ position: "absolute", width: "100px", height: "4px", background: "rgba(255, 255, 255, 0.15)", border: "1.5px solid rgba(0, 229, 255, 0.5)", borderRadius: "6px", boxShadow: "0 6px 15px rgba(0, 229, 255, 0.25)" }} />
        <div style={{ position: "absolute", width: "4px", height: "22px", background: "#B0BEC5", transform: "translate3d(15px, 4px, -15px)" }} />
        <div style={{ position: "absolute", width: "4px", height: "22px", background: "#B0BEC5", transform: "translate3d(80px, 4px, -15px)" }} />
        <div style={{ position: "absolute", width: "4px", height: "22px", background: "#B0BEC5", transform: "translate3d(15px, 4px, 15px)" }} />
        <div style={{ position: "absolute", width: "4px", height: "22px", background: "#B0BEC5", transform: "translate3d(80px, 4px, 15px)" }} />
        {[{ x: 22, z: -25, r: 0 }, { x: 62, z: -25, r: 0 }, { x: 22, z: 25, r: 180 }, { x: 62, z: 25, r: 180 }].map((chair, i) => (
          <div key={i} style={{ transformStyle: "preserve-3d", position: "absolute", left: `${chair.x}px`, transform: `translate3d(0px, 10px, ${chair.z}px) rotateY(${chair.r}deg)` }}>
            <div style={{ width: "14px", height: "2px", background: "#212121", borderRadius: "2px" }} />
            <div style={{ width: "14px", height: "14px", background: "#37474F", borderRadius: "2px", transform: "translate3d(0px, -12px, -4px) rotateX(10deg)" }} />
          </div>
        ))}
      </motion.div>

      {/* 6. CORNER TECH MONITOR */}
      <motion.div
        initial={{ transform: "translate3d(0px, 15px, -70px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 15px, -70px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.75 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "60px", height: "35px",
          marginLeft: "35px", marginTop: "40px"
        }}
      >
        <div style={{ position: "absolute", width: "55px", height: "4px", background: "#1E1E1E", borderRadius: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }} />
        <div style={{
          position: "absolute",
          left: "6px", top: "-18px",
          width: "42px", height: "18px",
          background: "#050505",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "3px",
          boxShadow: "0 0 12px 2px rgba(0,255,102,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
          transform: "rotateY(-10deg)"
        }}>
          <motion.div animate={{ scaleY: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 2.5 }} style={{ width: "36px", height: "10px", borderBottom: "1.5px solid #00FF66", borderRadius: "0 0 2px 2px" }} />
        </div>
      </motion.div>

      {/* 7. VERTICAL PLANTER */}
      <motion.div
        initial={{ transform: "translate3d(0px, 10px, 35px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 10px, 35px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.85 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "15px", height: "70px",
          marginLeft: "-98px", marginTop: "-30px"
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "#4E342E", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "2px",
          display: "flex", flexDirection: "column", justifyAround: "space-around", alignItems: "center",
          padding: "4px 0"
        }}>
          {[1, 2, 3, 4].map((v) => (
            <div key={v} style={{ width: "10px", height: "10px", background: "#2E7D32", boxShadow: "0 0 6px #1B5E20", borderRadius: "50%" }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Design3D({ t }) {
  const dropSpring = { type: "spring", stiffness: 100, damping: 15 };
  const popSpring = { type: "spring", stiffness: 140, damping: 12 };

  return (
    <div style={{ transformStyle: "preserve-3d", width: "200px", height: "180px", position: "relative" }}>
      {/* 1. FLOOR PLATE */}
      <motion.div
        initial={{ transform: "translate3d(0px, 180px, 0px) rotateX(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 90px, 0px) rotateX(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.15 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "160px",
          marginLeft: "-100px", marginTop: "-80px",
          background: "#F5EFE6",
          border: `1.5px solid ${t.border}`,
          boxShadow: `0 0 35px ${t.shadow}`,
          transformStyle: "preserve-3d"
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${t.gold}30 1px, transparent 1px)`, backgroundSize: "8px 8px" }} />

        {/* 3D SIDE WALLS FOR WOOD BLOCK THICKNESS */}
        <div style={{
          position: "absolute", left: 0, top: "160px", width: "200px", height: "16px",
          background: "linear-gradient(to bottom, #D7CCC8, #A1887F)",
          transform: "rotateX(-90deg)", transformOrigin: "top center"
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, width: "200px", height: "16px",
          background: "linear-gradient(to bottom, #EFEBE9, #BCAAA4)",
          transform: "rotateX(90deg)", transformOrigin: "top center"
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, width: "16px", height: "160px",
          background: "linear-gradient(to bottom, #D7CCC8, #A1887F)",
          transform: "rotateY(-90deg)", transformOrigin: "left center"
        }} />
        <div style={{
          position: "absolute", left: "200px", top: 0, width: "16px", height: "160px",
          background: "linear-gradient(to bottom, #EFEBE9, #BCAAA4)",
          transform: "rotateY(90deg)", transformOrigin: "left center"
        }} />
      </motion.div>

      {/* 2. CEILING PLATE */}
      <motion.div
        initial={{ transform: "translate3d(0px, -180px, 0px) rotateX(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, -90px, 0px) rotateX(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 1.15 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "160px",
          marginLeft: "-100px", marginTop: "-80px",
          background: "#333",
          border: `1px solid ${t.border}`,
          transformStyle: "preserve-3d"
        }}
      />

      {/* 3. BACK WALL */}
      <motion.div
        initial={{ transform: "translate3d(0px, 0px, -160px)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 0px, -80px)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.35 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "180px",
          marginLeft: "-100px", marginTop: "-90px",
          border: `1.5px solid ${t.border}`,
          transformStyle: "preserve-3d"
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "100px", background: `repeating-linear-gradient(0deg, transparent, transparent 11px, ${t.border} 11px, ${t.border} 12px), repeating-linear-gradient(90deg, #F8FAFC, #F8FAFC 24px, ${t.border} 24px, ${t.border} 25px)` }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "100px",
          background: "#0D1E36",
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px", padding: "10px"
        }}>
          <div style={{ width: "36px", height: "36px", border: "1px dashed rgba(255, 255, 255, 0.25)", borderRadius: "50%", marginTop: "20px", marginLeft: "20px", position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.15)" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.15)" }} />
          </div>
        </div>
      </motion.div>

      {/* 4. LEFT WALL */}
      <motion.div
        initial={{ transform: "translate3d(-180px, 0px, 0px) rotateY(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(-100px, 0px, 0px) rotateY(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.45 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "160px", height: "180px",
          marginLeft: "-80px", marginTop: "-90px",
          background: t.isDark ? "#8C2D11" : "#C65A31",
          border: `1.5px solid ${t.border}`,
          transformStyle: "preserve-3d"
        }}
      />

      {/* 5. KITCHEN ISLAND */}
      <motion.div
        initial={{ transform: "translate3d(0px, 20px, -10px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 20px, -10px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.6 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "60px", height: "30px",
          marginLeft: "-80px", marginTop: "35px"
        }}
      >
        <div style={{ position: "absolute", width: "55px", height: "4px", background: "#FFF", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "2px", boxShadow: "0 4px 8px rgba(0,0,0,0.25)" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(60deg, transparent 40%, rgba(0,0,0,0.06) 42%, transparent 45%)" }} />
        </div>
        <div style={{ position: "absolute", width: "53px", height: "24px", background: "#1E293B", borderRadius: "2px", transform: "translate3d(1px, 4px, -10px)", display: "flex", justifyAround: "space-around", alignItems: "center" }}>
          <div style={{ width: "8px", height: "2px", background: t.gold }} />
          <div style={{ width: "8px", height: "2px", background: t.gold }} />
        </div>
      </motion.div>

      {/* 6. BAR STOOLS */}
      {[{ x: -50, z: 25 }, { x: -28, z: 25 }].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ transform: `translate3d(0px, 0px, ${pos.z}px) scale(0)`, opacity: 0 }}
          animate={{ transform: `translate3d(0px, 0px, ${pos.z}px) scale(1)`, opacity: 1 }}
          transition={{ ...popSpring, delay: 0.65 + i * 0.08 }}
          style={{
            transformStyle: "preserve-3d",
            position: "absolute",
            left: "50%", top: "50%",
            width: "16px", height: "25px",
            marginLeft: `${pos.x}px`, marginTop: "65px"
          }}
        >
          <div style={{ width: "12px", height: "2px", background: "#111", borderRadius: "50%" }} />
          <div style={{ position: "absolute", width: "1.5px", height: "24px", background: t.gold, transform: "translate3d(2px, 2px, 0px) rotateZ(6deg)" }} />
          <div style={{ position: "absolute", width: "1.5px", height: "24px", background: t.gold, transform: "translate3d(8px, 2px, 0px) rotateZ(-6deg)" }} />
        </motion.div>
      ))}

      {/* 7. OVERHEAD CABINETS */}
      <motion.div
        initial={{ transform: "translate3d(0px, 0px, -78px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 0px, -78px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.7 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "70px", height: "25px",
          marginLeft: "-98px", marginTop: "-60px"
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "#4A3B32", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "2px", boxShadow: "0 4px 12px rgba(254,165,0,0.55)" }} />
      </motion.div>

      {/* 8. ARCHITECT DRAFTING TABLE */}
      <motion.div
        initial={{ transform: "translate3d(0px, 20px, -10px) rotateX(-18deg) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 20px, -10px) rotateX(-18deg) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.8 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "60px", height: "35px",
          marginLeft: "25px", marginTop: "35px"
        }}
      >
        <div style={{
          position: "absolute", width: "55px", height: "38px",
          background: "#D4AF37", border: "1.5px solid #8B6508", borderRadius: "3px",
          boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "3px"
        }}>
          <div style={{
            width: "100%", height: "100%", background: "#0091EA", border: "1px solid rgba(255,255,255,0.4)",
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)
            `,
            backgroundSize: "6px 6px", position: "relative"
          }}>
            <div style={{ position: "absolute", left: "6px", top: "6px", width: "32px", height: "20px", border: "1px solid #FFF" }}>
              <div style={{ position: "absolute", top: "-6px", left: "-1px", right: "-1px", height: "6px", border: "1px solid #FFF", borderBottom: "none", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
            </div>
          </div>
        </div>
        <div style={{ transformStyle: "preserve-3d", position: "absolute", left: "40px", top: "-18px", width: "12px", height: "20px", transform: "translate3d(0px, 0px, -10px)" }}>
          <div style={{ position: "absolute", width: "10px", height: "8px", background: "#FBC02D", borderRadius: "4px 4px 1px 1px", boxShadow: "0 0 14px 4px rgba(251,192,45,0.6)" }} />
        </div>
      </motion.div>

      {/* 9. FLOATING COMPASS CIRCLE */}
      <motion.div
        initial={{ transform: "translate3d(0px, 0px, -5px) rotateX(90deg) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 0px, -5px) rotateX(90deg) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.9 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "100px", height: "100px",
          marginLeft: "5px", marginTop: "-30px",
          border: `1.5px dashed ${t.terraLight}`,
          borderRadius: "50%",
          opacity: 0.8,
          pointerEvents: "none"
        }}
      />
    </div>
  );
}

function Agriculture3D({ t }) {
  const dropSpring = { type: "spring", stiffness: 100, damping: 15 };
  const popSpring = { type: "spring", stiffness: 140, damping: 12 };

  // 12-second loop for the tractor path
  const tractorX = [-65, 65, 65, 65, -65, -65, -65];
  const tractorRotY = [90, 90, 180, 270, 270, 360, 450];
  const tractorTimes = [0, 0.4, 0.45, 0.5, 0.9, 0.95, 1.0];

  return (
    <div style={{ transformStyle: "preserve-3d", width: "200px", height: "220px", position: "relative" }}>
      {/* 1. FIELD BASE PLATE (Plowed rows & Dirt track & 3D thickness) */}
      <motion.div
        initial={{ transform: "translate3d(0px, 200px, 0px) rotateX(90deg)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 100px, 0px) rotateX(90deg)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.15 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "200px", height: "160px",
          marginLeft: "-100px", marginTop: "-80px",
          background: `repeating-linear-gradient(90deg, #5D4037 0px, #5D4037 14px, #388E3C 14px, #388E3C 28px)`,
          border: `1px solid ${t.border}`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Dirt road path for the tractor (centered around Z: 20px) */}
        <div style={{
          position: "absolute",
          left: 0,
          top: "85px",
          width: "200px",
          height: "30px",
          background: "#8D6E63",
          borderTop: "1.5px dashed #5D4037",
          borderBottom: "1.5px dashed #5D4037",
          opacity: 0.85,
        }} />

        {/* Tiny green crop dots aligned in rows */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${20 + i * 28}px`,
            top: "10px",
            width: "6px", height: "65px",
            background: "rgba(76, 175, 80, 0.35)",
            borderRadius: "3px"
          }} />
        ))}

        {/* 3D SIDE WALLS FOR 16PX THICKNESS */}
        <div style={{
          position: "absolute", left: 0, top: "160px", width: "200px", height: "16px",
          background: "linear-gradient(to bottom, #4E342E, #2E1C0C)",
          transform: "rotateX(-90deg)", transformOrigin: "top center"
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, width: "200px", height: "16px",
          background: "linear-gradient(to bottom, #3E2723, #1A0E07)",
          transform: "rotateX(90deg)", transformOrigin: "top center"
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, width: "16px", height: "160px",
          background: "linear-gradient(to bottom, #4E342E, #2E1C0C)",
          transform: "rotateY(-90deg)", transformOrigin: "left center"
        }} />
        <div style={{
          position: "absolute", left: "200px", top: 0, width: "16px", height: "160px",
          background: "linear-gradient(to bottom, #3E2723, #1A0E07)",
          transform: "rotateY(90deg)", transformOrigin: "left center"
        }} />
      </motion.div>

      {/* 2. GREENHOUSE / POLYHOUSE */}
      <motion.div
        initial={{ transform: "translate3d(0px, 55px, -25px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(0px, 55px, -25px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.5 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "60px", height: "45px",
          marginLeft: "-30px", marginTop: "-22.5px",
          background: "rgba(179, 229, 252, 0.35)",
          border: "1.5px solid rgba(2, 136, 209, 0.6)",
          borderRadius: "30px 30px 0 0",
          transformStyle: "preserve-3d",
          boxShadow: "0 0 15px rgba(2, 136, 209, 0.2)",
        }}
      >
        <div style={{ position: "absolute", left: "18px", top: 0, bottom: 0, width: "1.5px", background: "rgba(2, 136, 209, 0.6)" }} />
        <div style={{ position: "absolute", left: "40px", top: 0, bottom: 0, width: "1.5px", background: "rgba(2, 136, 209, 0.6)" }} />
      </motion.div>

      {/* 3. WINDMILL / TURBINE */}
      <motion.div
        initial={{ transform: "translate3d(60px, 0px, -55px) scaleY(0)", opacity: 0 }}
        animate={{ transform: "translate3d(60px, 0px, -55px) scaleY(1)", opacity: 1 }}
        transition={{ ...dropSpring, delay: 0.7 }}
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: "6px", height: "110px",
          marginLeft: "-3px", marginTop: "-10px",
          background: "linear-gradient(to bottom, #FFFFFF, #B0BEC5)",
          transformStyle: "preserve-3d",
          transformOrigin: "bottom center"
        }}
      >
        <div style={{ position: "absolute", inset: "0 1px", background: "repeating-linear-gradient(180deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.1) 16px)" }} />
        <div style={{ position: "absolute", bottom: 0, left: "-8px", width: "22px", height: "10px", background: "#37474F", borderRadius: "4px 4px 0 0" }} />

        {/* Blinking beacon */}
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          style={{ position: "absolute", top: "-15px", left: "1px", width: "4px", height: "4px", borderRadius: "50%", background: "#FF1744", boxShadow: "0 0 8px #FF1744", zIndex: 20 }}
        />

        {/* 3D Nacelle Box */}
        <div style={{
          position: "absolute",
          top: "-10px", left: "50%",
          width: "12px", height: "10px",
          marginLeft: "-6px",
          background: "#FFFFFF",
          border: `1px solid ${t.border}`,
          borderRadius: "2px",
          transformStyle: "preserve-3d",
          transform: "translate3d(0, 0, -4px)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
        }}>
          <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", transform: "translateZ(8px)", border: `1px solid ${t.border}`, borderRadius: "1px" }} />
        </div>

        {/* Blades offset forward */}
        <div style={{
          position: "absolute",
          top: "-15px",
          left: "50%",
          width: "40px",
          height: "40px",
          marginLeft: "-20px",
          transformStyle: "preserve-3d",
          transform: "translate3d(0, 0, 12px)"
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
            style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ECEFF1", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
            <div style={{ position: "absolute", bottom: "50%", left: "18px", width: "4px", height: "45px", background: "#FFFFFF", border: "1.5px solid #CFD8DC", borderRadius: "2px", transformOrigin: "bottom center" }} />
            <div style={{ position: "absolute", top: "50%", left: "18px", width: "4px", height: "45px", background: "#FFFFFF", border: "1.5px solid #CFD8DC", borderRadius: "2px", transformOrigin: "top center", transform: "rotate(120deg)" }} />
            <div style={{ position: "absolute", top: "50%", left: "18px", width: "4px", height: "45px", background: "#FFFFFF", border: "1.5px solid #CFD8DC", borderRadius: "2px", transformOrigin: "top center", transform: "rotate(240deg)" }} />
          </motion.div>
        </div>
      </motion.div>

      {/* 4. 3D FARM HUT */}
      <motion.div
        initial={{ transform: "translate3d(-60px, 72px, -30px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(-60px, 72px, -30px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.6 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "36px", height: "35px",
          marginLeft: "-18px", marginTop: "-17.5px"
        }}
      >
        <div style={{ position: "absolute", inset: 0, width: "36px", height: "20px", background: "#8B5A2B", border: "1.5px solid #5C3A21", transform: "translate3d(0px, 15px, 15px)", transformStyle: "preserve-3d" }}>
          <div style={{ position: "absolute", bottom: 0, left: "12px", width: "12px", height: "14px", background: "#3E2723", border: "1px solid #111" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, width: "36px", height: "20px", background: "#8B5A2B", border: "1.5px solid #5C3A21", transform: "translate3d(0px, 15px, -15px) rotateY(180deg)" }} />
        <div style={{ position: "absolute", inset: 0, width: "30px", height: "20px", background: "#704214", border: "1.5px solid #5C3A21", transform: "translate3d(-18px, 15px, 0px) rotateY(-90deg)", transformStyle: "preserve-3d" }}>
          <div style={{ position: "absolute", top: "4px", left: "10px", width: "10px", height: "8px", background: "#FFF9C4", border: "1px solid #FBC02D", boxShadow: "0 0 8px #FFF9C4" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, width: "30px", height: "20px", background: "#704214", border: "1.5px solid #5C3A21", transform: "translate3d(18px, 15px, 0px) rotateY(90deg)" }} />
        <div style={{ position: "absolute", width: "40px", height: "22px", background: "#E6C229", border: "1px solid #C49A13", left: "-2px", top: "0px", transformOrigin: "bottom center", transform: "translate3d(0px, 3px, 8px) rotateX(38deg)" }} />
        <div style={{ position: "absolute", width: "40px", height: "22px", background: "#E6C229", border: "1px solid #C49A13", left: "-2px", top: "0px", transformOrigin: "bottom center", transform: "translate3d(0px, 3px, -8px) rotateX(-38deg)" }} />
      </motion.div>

      {/* 5. WATER SPRINKLER SYSTEM */}
      <motion.div
        initial={{ transform: "translate3d(15px, 78px, 50px) scale(0)", opacity: 0 }}
        animate={{ transform: "translate3d(15px, 78px, 50px) scale(1)", opacity: 1 }}
        transition={{ ...popSpring, delay: 0.9 }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "12px", height: "22px",
          marginLeft: "-6px", marginTop: "-11px"
        }}
      >
        <div style={{ position: "absolute", bottom: 0, left: "5px", width: "2px", height: "18px", background: "#B0BEC5" }} />
        <div style={{ position: "absolute", top: "0px", left: "3px", width: "6px", height: "4px", borderRadius: "2px", background: "#37474F", transformStyle: "preserve-3d" }}>
          {[0, 72, 144, 216, 288].map((angle, j) => (
            <motion.div
              key={j}
              animate={{
                x: [0, Math.cos(angle * Math.PI / 180) * 32],
                y: [0, Math.sin(angle * Math.PI / 180) * 14 - 15],
                opacity: [1, 0.8, 0],
                scale: [0.6, 1.3, 0.4]
              }}
              transition={{ repeat: Infinity, duration: 1.4, delay: j * 0.28, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: "1px", top: "-2px",
                width: "3px", height: "3px",
                borderRadius: "50%",
                background: "#00E5FF",
                boxShadow: "0 0 6px #00E5FF"
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* 6. BIG ANIMATED TRACTOR */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: tractorX,
          z: [20, 20, 20, 20, 20, 20, 20],
          rotateY: tractorRotY,
          y: [62, 60.5, 62, 61, 62]
        }}
        transition={{
          x: { repeat: Infinity, duration: 12, ease: "linear", times: tractorTimes },
          rotateY: { repeat: Infinity, duration: 12, ease: "linear", times: tractorTimes },
          z: { repeat: Infinity, duration: 12, ease: "linear", times: tractorTimes },
          y: { repeat: Infinity, duration: 0.4, ease: "easeInOut" },
          scale: popSpring,
          opacity: popSpring
        }}
        style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "50px", height: "38px",
          marginLeft: "-25px", marginTop: "-19px"
        }}
      >
        <div style={{ position: "absolute", left: "8px", bottom: "8px", width: "24px", height: "14px", background: "#D32F2F", border: "1px solid #991B1B", borderRadius: "2px", transform: "translateZ(0px)", transformStyle: "preserve-3d" }} />
        <div style={{ position: "absolute", left: "32px", bottom: "10px", width: "14px", height: "10px", background: "#E53935", border: "1px solid #991B1B", borderRadius: "2px 0 0 2px", transform: "translateZ(0px)" }} />
        <div style={{ position: "absolute", left: "8px", bottom: "22px", width: "16px", height: "14px", background: "rgba(33, 33, 33, 0.85)", border: "1.5px solid #111", borderRadius: "3px 3px 0 0", display: "flex", alignItems: "center", justifyCenter: "center" }}>
          <div style={{ width: "10px", height: "8px", background: "rgba(255, 235, 59, 0.3)", border: "1px solid rgba(255, 235, 59, 0.5)", borderRadius: "1px" }} />
        </div>
        <div style={{ position: "absolute", left: "36px", bottom: "24px", width: "3px", height: "16px", background: "#212121", transform: "translateZ(0px)" }}>
          {[0, 0.6, 1.2].map((delayTime, idx) => (
            <motion.div
              key={idx}
              animate={{ y: [-4, -30], x: [0, 6], scale: [0.5, 2.2], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: delayTime, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: "-4px", left: "-3px",
                width: "8px", height: "8px",
                borderRadius: "50%",
                background: t.isDark ? "rgba(255,255,255,0.4)" : "rgba(100,100,100,0.25)",
                filter: "blur(0.8px)"
              }}
            />
          ))}
        </div>
        <div style={{ position: "absolute", left: "32px", bottom: "0px", width: "12px", height: "12px", transform: "rotateY(90deg) translateZ(11px)", transformStyle: "preserve-3d" }}>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#212121", border: "1.5px solid #424242", backgroundImage: "conic-gradient(#212121 0% 25%, #424242 25% 50%, #212121 50% 75%, #424242 75% 100%)" }} />
        </div>
        <div style={{ position: "absolute", left: "32px", bottom: "0px", width: "12px", height: "12px", transform: "rotateY(90deg) translateZ(-11px)", transformStyle: "preserve-3d" }}>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#212121", border: "1.5px solid #424242", backgroundImage: "conic-gradient(#212121 0% 25%, #424242 25% 50%, #212121 50% 75%, #424242 75% 100%)" }} />
        </div>
        <div style={{ position: "absolute", left: "6px", bottom: "0px", width: "20px", height: "20px", transform: "rotateY(90deg) translateZ(12px)", transformStyle: "preserve-3d" }}>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#111", border: "2.5px solid #37474F", backgroundImage: "conic-gradient(#111 0% 25%, #37474F 25% 50%, #111 50% 75%, #37474F 75% 100%)" }} />
        </div>
        <div style={{ position: "absolute", left: "6px", bottom: "0px", width: "20px", height: "20px", transform: "rotateY(90deg) translateZ(-12px)", transformStyle: "preserve-3d" }}>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#111", border: "2.5px solid #37474F", backgroundImage: "conic-gradient(#111 0% 25%, #37474F 25% 50%, #111 50% 75%, #37474F 75% 100%)" }} />
        </div>
      </motion.div>

      {/* 7. SWAYING CROPS */}
      {[{ x: -10, z: 40, col: "#F4D08B" }, { x: 30, z: -30, col: "#CCA05A" }, { x: 50, z: 20, col: "#F4D08B" }, { x: -45, z: 20, col: "#CCA05A" }].map((crop, i) => (
        <motion.div
          key={i}
          initial={{ transform: `translate3d(0px, 0px, ${crop.z}px) rotateY(${i * 45}deg) scale(0)`, opacity: 0 }}
          animate={{ transform: `translate3d(0px, 0px, ${crop.z}px) rotateY(${i * 45}deg) scale(1)`, opacity: 1 }}
          transition={{ ...popSpring, delay: 0.8 + i * 0.08 }}
          style={{ position: "absolute", left: "50%", top: "50%", width: "8px", height: "16px", transformStyle: "preserve-3d", marginLeft: `${crop.x}px`, marginTop: "88px" }}
        >
          <motion.div
            animate={{ rotateZ: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.4, ease: "easeInOut" }}
            style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", transformOrigin: "bottom center" }}
          >
            <div style={{ width: "5px", height: "6px", background: crop.col, borderRadius: "50% 50% 0 0", boxShadow: `0 0 6px ${crop.col}88` }} />
            <div style={{ width: "1.5px", height: "10px", background: "#4CAF50" }} />
          </motion.div>
        </motion.div>
      ))}

      {/* 8. 3D TREES */}
      {[{ x: -82, z: -60, delay: 0.95 }, { x: -76, z: 50, delay: 1.15 }, { x: 78, z: 45, delay: 1.3 }, { x: 32, z: -62, delay: 1.45 }].map((tree, i) => (
        <motion.div
          key={i}
          initial={{ transform: `translate3d(${tree.x}px, 62px, ${tree.z}px) scale(0)`, opacity: 0 }}
          animate={{ transform: `translate3d(${tree.x}px, 62px, ${tree.z}px) scale(1)`, opacity: 1 }}
          transition={{ ...popSpring, delay: tree.delay }}
          style={{ transformStyle: "preserve-3d", position: "absolute", left: "50%", top: "50%", width: "20px", height: "55px", marginLeft: "-10px", marginTop: "-27.5px" }}
        >
          {/* Tree Trunk */}
          <div style={{
            position: "absolute", bottom: 0, left: "8px", width: "4px", height: "20px",
            background: "#5D4037", border: "1px solid #3E2723",
            transformStyle: "preserve-3d"
          }} />

          {/* Bottom Foliage Layer */}
          <div style={{
            position: "absolute", bottom: "16px", left: "1px", width: "18px", height: "18px",
            background: "#2E7D32", border: "1.5px solid #1B5E20", borderRadius: "50%",
            transform: "translate3d(0, 0, 0)", boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
          }} />
          <div style={{
            position: "absolute", bottom: "16px", left: "1px", width: "18px", height: "18px",
            background: "#2E7D32", border: "1.5px solid #1B5E20", borderRadius: "50%",
            transform: "rotateY(90deg)"
          }} />

          {/* Top Foliage Layer */}
          <div style={{
            position: "absolute", bottom: "28px", left: "4px", width: "12px", height: "12px",
            background: "#4CAF50", border: "1.2px solid #2E7D32", borderRadius: "50%",
            transform: "translate3d(0, 0, 0)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
          }} />
          <div style={{
            position: "absolute", bottom: "28px", left: "4px", width: "12px", height: "12px",
            background: "#4CAF50", border: "1.2px solid #2E7D32", borderRadius: "50%",
            transform: "rotateY(90deg)"
          }} />
        </motion.div>
      ))}
    </div>
  );
}

function Showcase3D({ activeCategory, t }) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 22, ry: -25, active: false }); // Steeper default tilt rx: 22
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const modelScale = windowWidth < 480 ? 0.95 : windowWidth < 768 ? 1.15 : 1.35;

  const onMove = useCallback((e) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    setTilt({
      rx: 12 + (1 - (e.clientY - r.top) / r.height) * 20, // steeper tilt dynamic range
      ry: -45 + x * 40,
      active: true
    });
  }, []);

  const onLeave = useCallback(() => {
    setTilt({ rx: 22, ry: -25, active: false }); // Steeper default reset rx: 22
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "16px",
        background: t.isDark ? "#120704" : "#F6EBDC",
        border: `1px solid ${t.border}`,
        boxShadow: `0 16px 40px ${t.shadow}`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <div className="blueprint-grid" style={{ opacity: 0.12 }} />

      <div style={{
        perspective: "1200px",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <motion.div
          animate={{
            rotateX: tilt.rx,
            rotateY: tilt.active ? tilt.ry : [-25, 25, -25],
          }}
          transition={tilt.active
            ? { type: "spring", stiffness: 220, damping: 24 }
            : { repeat: Infinity, duration: 16, ease: "easeInOut" }
          }
          style={{
            transformStyle: "preserve-3d",
            width: "200px",
            height: "200px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatePresence mode="wait">
            {activeCategory === "residential" && (
              <motion.div key="res" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: modelScale }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }} style={{ transformStyle: "preserve-3d" }}>
                <Residential3D t={t} />
              </motion.div>
            )}
            {activeCategory === "commercial" && (
              <motion.div key="comm" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: modelScale }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }} style={{ transformStyle: "preserve-3d" }}>
                <Commercial3D t={t} />
              </motion.div>
            )}
            {activeCategory === "agriculture" && (
              <motion.div key="agri" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: modelScale }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }} style={{ transformStyle: "preserve-3d" }}>
                <Agriculture3D t={t} />
              </motion.div>
            )}
            {activeCategory === "design" && (
              <motion.div key="des" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: modelScale }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }} style={{ transformStyle: "preserve-3d" }}>
                <Design3D t={t} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>


    </div>
  );
}

function ServiceModal({ svc, t, onClose }) {
  if (!svc) return null;
  const { title, details, deliverables, Icon } = svc;
  const whatsappUrl = `https://wa.me/919810864670?text=${encodeURIComponent(`Hello Urban Bricks, I am highly interested in your service: "${title}". Please share detailed plans, pricing, and process details.`)}`;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(10, 5, 2, 0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 50, scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "680px",
          background: t.card,
          border: `1px solid ${t.border}`,
          borderLeft: `4px solid ${t.terra}`,
          borderRadius: "16px",
          boxShadow: `0 30px 80px ${t.shadow}`,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        <div className="blueprint-grid" style={{ opacity: 0.08 }} />

        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: `${t.terra}18`,
            border: `1px solid ${t.border}`,
            color: t.text1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <X size={18} />
        </motion.button>

        <div style={{ padding: "40px", overflowY: "auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "14px",
              background: `linear-gradient(135deg, ${t.terra}28, ${t.terra}10)`,
              border: `1px solid ${t.terra}30`,
              color: t.terra,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 14px ${t.terra}14`,
            }}>
              <Icon size={26} />
            </div>
            <div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(24px, 4vw, 32px)",
                fontWeight: 600,
                color: t.text1,
                lineHeight: 1.1,
              }}>{title}</h3>
              <div style={{
                fontSize: 10,
                color: t.gold,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginTop: 4,
                fontWeight: 600,
              }}>Service Overview & Checklist</div>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h4 style={{ color: t.gold, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>The Process</h4>
            <p style={{ color: t.text1, fontSize: 15, lineHeight: 1.8, opacity: 0.9 }}>{details}</p>
          </div>

          {deliverables && deliverables.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h4 style={{ color: t.gold, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Key Deliverables & Standards</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                {deliverables.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: `${t.terra}18`,
                      color: t.terra,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span style={{ color: t.text2, fontSize: 14, fontWeight: 500 }}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: "1 1 200px",
                background: `linear-gradient(135deg, ${t.terra}, ${t.terraDark})`,
                color: "#F2E5CC",
                textAlign: "center",
                padding: "16px 24px",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
                borderRadius: 8,
                boxShadow: `0 6px 22px ${t.terra}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enquire on WhatsApp
            </motion.a>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: "0 0 120px",
                background: "transparent",
                border: `1px solid ${t.border}`,
                color: t.text1,
                padding: "16px 24px",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Services({ t }) {
  const [activeCategory, setActiveCategory] = useState("residential");
  const [selectedService, setSelectedService] = useState(null);

  const categories = useMemo(() => [
    { id: "residential", label: "Residential", Icon: Home },
    { id: "commercial", label: "Commercial", Icon: Building2 },
    { id: "agriculture", label: "Agriculture", Icon: Tractor },
    { id: "design", label: "Construction & Design", Icon: LayoutTemplate }
  ], []);

  const filteredServices = useMemo(() => {
    return SERVICES.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="services" style={{ background: t.bg, padding: "108px 5%", position: "relative", overflow: "hidden", transition: "background 0.5s" }}>
      {/* Blueprint Grid background overlay */}
      <div className="blueprint-grid" style={{ opacity: t.isDark ? 0.35 : 0.45 }} />

      {/* Background ambient light particles */}
      <BackgroundParticles count={5} t={t} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <SectionLabel text="What We Offer" center t={t} />
          <FadeUp delay={0.1}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 600, color: t.text1, lineHeight: 1.08, marginBottom: 14 }}>
              Our Services
            </h2>
          </FadeUp>
          <FadeUp delay={0.18}>
            <p style={{ color: t.text2, fontSize: 15, maxWidth: 500, margin: "0 auto", lineHeight: 1.85 }}>
              Comprehensive real estate solutions — from land acquisition to structural plans and interior styling — all under one roof.
            </p>
          </FadeUp>
        </div>

        {/* Tab Controls with sliding background */}
        <FadeUp delay={0.24}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: 48,
            flexWrap: "wrap",
            padding: "6px",
            background: t.isDark ? "rgba(33, 19, 8, 0.4)" : "rgba(242, 232, 216, 0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: "14px",
            maxWidth: "640px",
            margin: "0 auto 48px",
            border: `1px solid ${t.border}`,
          }}>
            {categories.map((cat) => {
              const CatIcon = cat.Icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    position: "relative",
                    background: "none",
                    border: "none",
                    padding: "12px 22px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: isActive ? "#F2E5CC" : t.text2,
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    transition: "color 0.3s ease",
                    outline: "none",
                  }}
                >
                  {/* Sliding Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, ${t.terra}, ${t.terraDark})`,
                        borderRadius: "10px",
                        boxShadow: `0 4px 14px ${t.terra}44`,
                        zIndex: -1,
                      }}
                      transition={spring}
                    />
                  )}
                  <CatIcon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </FadeUp>

        {/* Two-Column Grid: SVG Blueprint board + Staggered Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}>
          <div className="ub-two-col" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "40px", alignItems: "start" }}>

            {/* Left Column: Architectural Blueprint Canvas */}
            <FadeUp delay={0.3}>
              <Showcase3D activeCategory={activeCategory} t={t} />
            </FadeUp>

            {/* Right Column: Interactive Category Cards */}
            <div>
              <motion.div
                layout
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredServices.map((svc, i) => (
                    <motion.div
                      key={svc.title}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ServiceCard svc={svc} idx={i} t={t} onSelect={setSelectedService} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <ServiceModal svc={selectedService} t={t} onClose={() => setSelectedService(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
//  CONTACT ITEM (Highly Animated & Attractive)
// ══════════════════════════════════════════════════════════════
function ContactItem({ Icon, label, value, href, delay, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeUp delay={delay}>
      <motion.a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.03, x: 8 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          borderRadius: 12,
          background: hovered ? `${t.terra}08` : t.card,
          border: `1px solid ${hovered ? `${t.terra}44` : t.border}`,
          boxShadow: hovered ? `0 8px 24px ${t.shadow}` : `0 2px 8px ${t.shadow}`,
          transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
          textDecoration: "none",
          marginBottom: 16,
        }}
      >
        <motion.div
          animate={hovered ? { scale: 1.15, rotate: 15 } : { scale: 1, rotate: 0 }}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: hovered ? t.terra : `${t.terra}18`,
            color: hovered ? "#FFF" : t.terra,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: hovered ? `0 0 15px ${t.terra}66` : "none",
            transition: "background 0.3s, color 0.3s, box-shadow 0.3s",
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </motion.div>
        <div>
          <div style={{ color: t.gold, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ color: t.text1, fontSize: 14, fontWeight: 500, lineHeight: 1.45 }}>
            {value}
          </div>
        </div>
      </motion.a>
    </FadeUp>
  );
}

function Contact({ t }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const contactItems = [
    { Icon: Phone, label: "Mobile", value: "+91 9810864670", href: "tel:+919810864670" },
    { Icon: Mail, label: "Email", value: "urbanbricks.in@gmail.com", href: "mailto:urbanbricks.in@gmail.com" },
    { Icon: Globe, label: "Website", value: "urbanbricks.in", href: "https://urbanbricks.in" },
    { Icon: MapPinned, label: "Address", value: "1st Floor, Aashish Electricals, Beside Carmel School, Namnakala, Ambikapur, Surguja (C.G.) 497001", href: "https://share.google/ZlY47jk5M6StzRWSf" },
  ];

  const iStyle = {
    width: "100%", background: t.bgAlt,
    border: `1px solid ${t.border}`, borderRadius: 6,
    padding: "12px 16px", color: t.text1, fontSize: 14,
    outline: "none", fontFamily: "'Jost', sans-serif",
    transition: "border-color 0.25s, background 0.3s",
  };
  const lStyle = { display: "block", color: t.text2, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 };

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    // Clear status when typing
    if (status.message) setStatus({ type: "", message: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setStatus({ type: "error", message: "Please fill out both Name and Mobile Number to send your enquiry." });
      return;
    }

    // Format rich pre-filled WhatsApp report
    const text = `Hello Urban Bricks, I would like to submit a property enquiry.

Here are my details:
• Name: ${formData.name.trim()}
• Mobile: ${formData.phone.trim()}
• Email: ${formData.email.trim() || "N/A"}
• Service: ${formData.service || "General Inquiry"}
• Message: ${formData.message.trim() || "N/A"}`;

    const whatsappUrl = `https://wa.me/919810864670?text=${encodeURIComponent(text)}`;

    setStatus({ type: "success", message: "Formulated! Opening WhatsApp to connect with Chandan Soni..." });

    // Open WhatsApp in new tab after a brief delay so they can read success state
    setTimeout(() => {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }, 1500);
  };

  return (
    <section id="contact" style={{ background: t.bgAlt, padding: "clamp(60px, 8vw, 108px) 5%", transition: "background 0.5s" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="ub-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(30px, 6vw, 80px)" }}>

          {/* Left: info */}
          <div>
            <SectionLabel text="Get In Touch" t={t} />
            <FadeUp delay={0.1}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 600, color: t.text1, lineHeight: 1.15, marginBottom: 16 }}>
                Let's Find Your Perfect Property
              </h2>
            </FadeUp>
            <FadeUp delay={0.18}>
              <p style={{ color: t.text2, fontSize: 15, lineHeight: 1.85, marginBottom: 36 }}>
                Reach out to our team for expert guidance on buying, selling, renting, or designing your ideal space.
              </p>
            </FadeUp>

            {/* Contact person card */}
            <FadeUp delay={0.26}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  background: t.card,
                  borderTop: `1px solid ${t.border}`,
                  borderRight: `1px solid ${t.border}`,
                  borderBottom: `1px solid ${t.border}`,
                  borderLeft: `3px solid ${t.terra}`,
                  padding: "20px 24px", borderRadius: "0 12px 12px 0",
                  marginBottom: 28, boxShadow: `0 4px 16px ${t.shadow}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    style={{
                      width: 54, height: 54, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${t.terra}, ${t.terraDark})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "#F2E5CC",
                      boxShadow: `0 4px 14px ${t.terra}44`,
                      flexShrink: 0,
                    }}
                  >CS</motion.div>
                  <div>
                    <div style={{ color: t.text1, fontWeight: 600, fontSize: 17 }}>Chandan Soni</div>
                    <div style={{ color: t.gold, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3, fontWeight: 500 }}>Property Consultant</div>
                  </div>
                </div>

                {/* Direct quick WhatsApp chat */}
                <motion.a
                  href={`https://wa.me/919810864670?text=${encodeURIComponent("Hello Chandan, I would like to discuss a property deal.")}`}
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: "#25D366", color: "#FFF",
                    width: 38, height: 38, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(37,211,102,0.3)",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </motion.a>
              </motion.div>
            </FadeUp>

            {contactItems.map(({ Icon, label, value, href }, i) => (
              <ContactItem
                key={label}
                Icon={Icon}
                label={label}
                value={value}
                href={href}
                delay={0.32 + i * 0.07}
                t={t}
              />
            ))}

            {/* Office Location — Google Maps Card */}
            <FadeUp delay={0.62}>
              <motion.a
                href="https://share.google/ZlY47jk5M6StzRWSf"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  display: "block", marginTop: 28, borderRadius: 16, overflow: "hidden",
                  textDecoration: "none", cursor: "pointer", position: "relative",
                  background: t.isDark
                    ? "linear-gradient(145deg, #1A1008, #0D0705)"
                    : "linear-gradient(145deg, #FDF8F0, #F7EFE2)",
                  border: `1px solid ${t.border}`,
                  boxShadow: `0 8px 32px ${t.shadow}`,
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${t.terra}66`;
                  e.currentTarget.style.boxShadow = `0 12px 40px ${t.terra}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.boxShadow = `0 8px 32px ${t.shadow}`;
                }}
              >
                {/* Decorative Map Illustration */}
                <div style={{
                  height: 120, position: "relative", overflow: "hidden",
                  background: t.isDark
                    ? `linear-gradient(135deg, ${t.terraDark}30, ${t.terra}15, ${t.gold}10)`
                    : `linear-gradient(135deg, ${t.terra}12, ${t.gold}10, ${t.terraLight}08)`,
                }}>
                  {/* Grid lines to simulate map */}
                  <div style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
                    {[...Array(8)].map((_, i) => (
                      <div key={`h-${i}`} style={{ position: "absolute", top: `${i * 15}px`, left: 0, right: 0, height: 1, background: t.text2 }} />
                    ))}
                    {[...Array(12)].map((_, i) => (
                      <div key={`v-${i}`} style={{ position: "absolute", left: `${i * 9}%`, top: 0, bottom: 0, width: 1, background: t.text2 }} />
                    ))}
                  </div>
                  {/* Curved road */}
                  <svg viewBox="0 0 400 120" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
                    <path d="M0 80 C80 20, 160 100, 240 50 S360 90, 400 40" fill="none" stroke={t.terra} strokeWidth="3" strokeDasharray="8 6" />
                    <path d="M0 100 C100 70, 200 110, 300 60 S380 100, 400 80" fill="none" stroke={t.gold} strokeWidth="2" strokeDasharray="5 5" />
                  </svg>
                  {/* Animated Pin */}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${t.terra}, ${t.terraDark})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 6px 24px ${t.terra}55`,
                        border: "2.5px solid #F2E5CC",
                      }}
                    >
                      <MapPinned size={20} color="#F2E5CC" />
                    </motion.div>
                    {/* Pulsing shadow beneath pin */}
                    <motion.div
                      animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.35, 0.1, 0.35] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      style={{
                        width: 30, height: 8, borderRadius: "50%", marginTop: 4,
                        background: t.isDark ? "rgba(201,91,50,0.4)" : "rgba(201,91,50,0.25)",
                        filter: "blur(3px)",
                      }}
                    />
                  </div>
                  {/* Gradient fade at bottom */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
                    background: t.isDark
                      ? "linear-gradient(transparent, #1A1008)"
                      : "linear-gradient(transparent, #FDF8F0)",
                  }} />
                </div>

                {/* Bottom Info Bar */}
                <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg, ${t.terra}18, ${t.gold}12)`,
                    border: `1px solid ${t.terra}22`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Globe size={18} style={{ color: t.terra }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: t.gold, marginBottom: 3 }}>
                      Our Office Location
                    </div>
                    <div style={{ color: t.text1, fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                      Ambikapur, Surguja, Chhattisgarh
                    </div>
                  </div>
                  <div style={{
                    padding: "10px 18px", borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, ${t.terra}, ${t.terraDark})`,
                    color: "#F2E5CC", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    display: "flex", alignItems: "center", gap: 6,
                    boxShadow: `0 4px 14px ${t.terra}33`,
                  }}>
                    <MapPinned size={12} />
                    Open Map
                  </div>
                </div>
              </motion.a>
            </FadeUp>
          </div>

          {/* Right: form */}
          <FadeUp delay={0.22}>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, padding: "clamp(20px, 5vw, 40px)", borderRadius: 12, boxShadow: `0 8px 40px ${t.shadow}` }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: t.text1, marginBottom: 6 }}>
                Send an Enquiry
              </h3>
              <p style={{ color: t.text2, fontSize: 13, marginBottom: 28, lineHeight: 1.7 }}>We respond within 24 hours.</p>

              <form onSubmit={handleSubmit}>
                <AnimatePresence>
                  {status.message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 500,
                        marginBottom: "20px",
                        background: status.type === "success" ? "rgba(37, 211, 102, 0.12)" : "rgba(239, 68, 68, 0.12)",
                        border: `1px solid ${status.type === "success" ? "#25D366" : "#EF4444"}`,
                        color: status.type === "success" ? "#25D366" : "#EF4444",
                        textAlign: "center",
                      }}
                    >
                      {status.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ marginBottom: 18 }}>
                  <label style={lStyle}>Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    style={iStyle}
                    onFocus={(e) => (e.target.style.borderColor = `${t.terra}99`)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={lStyle}>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    style={iStyle}
                    onFocus={(e) => (e.target.style.borderColor = `${t.terra}99`)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={lStyle}>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    style={iStyle}
                    onFocus={(e) => (e.target.style.borderColor = `${t.terra}99`)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={lStyle}>Service Interested In</label>
                  <select
                    value={formData.service}
                    onChange={(e) => handleChange("service", e.target.value)}
                    style={{ ...iStyle, cursor: "pointer" }}
                  >
                    <option value="">Select a service…</option>
                    {SERVICES.map((s) => (
                      <option key={s.title} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={lStyle}>Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your property requirements…"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    style={{ ...iStyle, resize: "vertical" }}
                    onFocus={(e) => (e.target.style.borderColor = `${t.terra}99`)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  style={{
                    width: "100%",
                    background: `linear-gradient(135deg, ${t.terra}, ${t.terraDark})`,
                    color: "#F2E5CC",
                    border: "none",
                    padding: "15px",
                    fontSize: 12,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    cursor: "pointer",
                    borderRadius: 6,
                    fontFamily: "'Jost', sans-serif",
                    boxShadow: `0 6px 22px ${t.terra}44`,
                    transition: "box-shadow 0.25s",
                  }}
                >
                  Send Enquiry →
                </motion.button>
              </form>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
//  FOOTER
// ══════════════════════════════════════════════════════════════
function Footer({ t }) {
  const [emailHovered, setEmailHovered] = useState(false);
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, margin: "-80px" });

  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "About Us", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  const serviceLinks = [
    { label: "Buy Property", icon: <Home size={12} /> },
    { label: "Sell Property", icon: <Tag size={12} /> },
    { label: "Rent / Lease", icon: <Key size={12} /> },
    { label: "Brand Franchisee", icon: <Award size={12} /> },
    { label: "Construction", icon: <HardHat size={12} /> },
  ];

  const contactItems = [
    { icon: <Phone size={14} />, text: "+91 98108 64670", href: "tel:+919810864670" },
    { icon: <Mail size={14} />, text: "urbanbricks.in@gmail.com", href: "mailto:urbanbricks.in@gmail.com" },
    { icon: <MapPinned size={14} />, text: "Ambikapur, Surguja, Chhattisgarh 497001", href: "https://share.google/ZlY47jk5M6StzRWSf" },
  ];

  const socialLinks = [
    {
      label: "WhatsApp", href: `https://wa.me/919810864670?text=${encodeURIComponent("Hello Urban Bricks, I am interested in your real estate services.")}`,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
    },
    {
      label: "Facebook", href: "#",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
    },
    {
      label: "Instagram", href: "#",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
    },
  ];

  return (
    <footer ref={footerRef} style={{ position: "relative", overflow: "hidden", transition: "background 0.5s" }}>
      {/* Animated Decorative Top Border */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${t.terraDark}, ${t.terra}, ${t.gold}, ${t.terraLight}, ${t.terra}, ${t.terraDark})`, backgroundSize: "200% 100%", animation: "footerShimmer 4s linear infinite" }} />

      {/* Decorative floating particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.04, 0.12, 0.04],
              scale: [1, 1.2, 1],
            }}
            transition={{ repeat: Infinity, duration: 5 + i * 1.2, delay: i * 0.6, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 60 + i * 20,
              height: 60 + i * 20,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${i % 2 === 0 ? t.terra : t.gold}08, transparent 70%)`,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          />
        ))}
      </div>

      {/* Main Footer Content */}
      <div style={{
        background: t.isDark
          ? "linear-gradient(180deg, #0D0705 0%, #080403 40%, #050201 100%)"
          : "linear-gradient(180deg, #F7EFE2 0%, #FDFBF7 40%, #F5ECD8 100%)",
        padding: "70px 5% 0",
        position: "relative",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Top Section: Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 30,
              padding: "36px 44px", borderRadius: 20, marginBottom: 60, position: "relative", overflow: "hidden",
              background: t.isDark
                ? "linear-gradient(135deg, rgba(201,91,50,0.12), rgba(212,157,66,0.08))"
                : "linear-gradient(135deg, rgba(201,91,50,0.08), rgba(212,157,66,0.06))",
              border: `1px solid ${t.terra}22`,
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Decorative corner glow */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${t.gold}18, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -30, left: -30, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${t.terra}14, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ flex: "1 1 340px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${t.terra}, ${t.gold})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mail size={18} color="#F2E5CC" />
                </div>
                <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: t.text1, margin: 0 }}>Stay Connected</h4>
              </div>
              <p style={{ color: t.text2, fontSize: 13, lineHeight: 1.6, margin: 0, maxWidth: 400 }}>
                Get exclusive property listings, market insights, and investment opportunities delivered to your inbox.
              </p>
            </div>
            <div style={{ flex: "1 1 300px", display: "flex", gap: 10, maxWidth: 420 }}>
              <div style={{
                flex: 1, position: "relative", borderRadius: 12, overflow: "hidden",
                border: `1px solid ${emailHovered ? t.terra + '55' : t.border}`,
                transition: "border-color 0.3s",
              }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  onMouseEnter={() => setEmailHovered(true)}
                  onMouseLeave={() => setEmailHovered(false)}
                  style={{
                    width: "100%", padding: "14px 18px", border: "none", outline: "none",
                    background: t.isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)",
                    color: t.text1, fontSize: 13, fontFamily: "inherit", borderRadius: 12,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: `0 8px 24px ${t.terra}44` }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: "14px 26px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${t.terra}, ${t.terraDark})`,
                  color: "#F2E5CC", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                  boxShadow: `0 4px 16px ${t.terra}33`,
                }}
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>

          {/* Main 4-Column Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 48,
            paddingBottom: 50,
          }}>

            {/* Column 1: Brand */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div style={{ marginBottom: 24 }}>
                <UBLogo size={36} t={t} showTagline />
              </div>
              <p style={{ color: t.text2, fontSize: 13, lineHeight: 1.8, marginBottom: 28, maxWidth: 280 }}>
                Your trusted partner in premium real estate solutions. Connecting dreams with destinations since 2015.
              </p>
              {/* Social Links */}
              <div style={{ display: "flex", gap: 10 }}>
                {socialLinks.map((s) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: t.isDark ? `${t.terra}14` : `${t.terra}0C`,
                      border: `1px solid ${t.terra}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: t.text2, transition: "all 0.3s", cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${t.terra}30`;
                      e.currentTarget.style.color = t.terra;
                      e.currentTarget.style.borderColor = `${t.terra}55`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = t.isDark ? `${t.terra}14` : `${t.terra}0C`;
                      e.currentTarget.style.color = t.text2;
                      e.currentTarget.style.borderColor = `${t.terra}22`;
                    }}
                  >
                    {s.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Column 2: Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: t.text1,
                marginBottom: 24, position: "relative", paddingBottom: 14,
              }}>
                Quick Links
                <span style={{
                  position: "absolute", bottom: 0, left: 0, width: 32, height: 2.5,
                  background: `linear-gradient(90deg, ${t.terra}, ${t.gold})`, borderRadius: 2,
                }} />
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {quickLinks.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    whileHover={{ x: 6 }}
                    style={{
                      color: t.text2, fontSize: 13, textDecoration: "none", padding: "7px 0",
                      display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = t.terra)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = t.text2)}
                  >
                    <ChevronRight size={12} style={{ opacity: 0.5 }} />
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Column 3: Our Services */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: t.text1,
                marginBottom: 24, position: "relative", paddingBottom: 14,
              }}>
                Our Services
                <span style={{
                  position: "absolute", bottom: 0, left: 0, width: 32, height: 2.5,
                  background: `linear-gradient(90deg, ${t.terra}, ${t.gold})`, borderRadius: 2,
                }} />
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {serviceLinks.map((svc) => (
                  <motion.div
                    key={svc.label}
                    whileHover={{ x: 6 }}
                    style={{
                      color: t.text2, fontSize: 13, padding: "7px 0",
                      display: "flex", alignItems: "center", gap: 10, cursor: "default", transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = t.terra)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = t.text2)}
                  >
                    <span style={{ opacity: 0.6 }}>{svc.icon}</span>
                    {svc.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Column 4: Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: t.text1,
                marginBottom: 24, position: "relative", paddingBottom: 14,
              }}>
                Get In Touch
                <span style={{
                  position: "absolute", bottom: 0, left: 0, width: 32, height: 2.5,
                  background: `linear-gradient(90deg, ${t.terra}, ${t.gold})`, borderRadius: 2,
                }} />
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {contactItems.map((item, ci) => (
                  <div key={ci} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 1,
                      background: t.isDark ? `${t.terra}14` : `${t.terra}0C`,
                      border: `1px solid ${t.terra}18`,
                      display: "flex", alignItems: "center", justifyContent: "center", color: t.terra,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          style={{ color: t.text2, fontSize: 13, textDecoration: "none", lineHeight: 1.6, transition: "color 0.2s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = t.terra)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = t.text2)}
                        >
                          {item.text}
                        </a>
                      ) : (
                        <span style={{ color: t.text2, fontSize: 13, lineHeight: 1.6 }}>{item.text}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              <div style={{
                marginTop: 22, padding: "14px 16px", borderRadius: 12,
                background: t.isDark ? `${t.gold}08` : `${t.gold}0A`,
                border: `1px solid ${t.gold}18`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: t.gold, marginBottom: 8 }}>
                  Business Hours
                </div>
                <div style={{ fontSize: 12, color: t.text2, lineHeight: 1.7 }}>
                  Mon – Sat: 9:00 AM – 7:00 PM<br />
                  Sunday: By Appointment
                </div>
              </div>
            </motion.div>
          </div>

          {/* Divider with decorative element */}
          <div style={{ position: "relative", marginTop: 10 }}>
            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${t.border}, ${t.terra}44, ${t.border}, transparent)` }} />
            <div style={{
              position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
              width: 20, height: 20, borderRadius: "50%", background: t.isDark ? "#0D0705" : "#F7EFE2",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: `linear-gradient(135deg, ${t.terra}, ${t.gold})` }} />
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
            padding: "28px 0 36px",
          }}>
            <div style={{ color: t.text2, fontSize: 12, opacity: 0.7 }}>
              © 2015 – {new Date().getFullYear()} <span style={{ color: t.terra, fontWeight: 600 }}>Urban Bricks</span>. All rights reserved.
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {["Privacy Policy", "Terms of Service", "Disclaimer"].map((lk) => (
                <a key={lk} href="#"
                  style={{ color: t.text2, fontSize: 11, opacity: 0.6, textDecoration: "none", letterSpacing: "0.06em", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = t.terra; e.currentTarget.style.opacity = "1"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = t.text2; e.currentTarget.style.opacity = "0.6"; }}
                >
                  {lk}
                </a>
              ))}
            </div>
            <div style={{ fontSize: 11, color: t.text2, opacity: 0.4, letterSpacing: "0.04em" }}>
              Crafted with ♥ in India
            </div>
          </div>
        </div>
      </div>

      {/* CSS Keyframe for shimmer animation */}
      <style>{`
        @keyframes footerShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </footer>
  );
}

// ══════════════════════════════════════════════════════════════
//  WHATSAPP FAB
// ══════════════════════════════════════════════════════════════
function WhatsAppFAB() {
  const url = `https://wa.me/919810864670?text=${encodeURIComponent("Hello Urban Bricks, I am interested in your real estate services. Please connect with me.")}`;
  return (
    <motion.a href={url} target="_blank" rel="noopener noreferrer"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.88 }}
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 50,
        width: 62, height: 62, borderRadius: "50%",
        background: "#25D366",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 22px rgba(37,211,102,0.45)", cursor: "pointer",
      }}
    >
      <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </motion.a>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN SITE
// ══════════════════════════════════════════════════════════════
function BrandLogo({ brand, t }) {
  const isDark = t.isDark;

  const getBrandDetails = (name) => {
    switch (name) {
      case "Zudio":
        return {
          bg: "#080808",
          border: "1px solid #444",
          color: "#FFFFFF",
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          letterSpacing: "3px",
          text: "ZUDIO",
          icon: <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D49D42", marginRight: 8 }} />
        };
      case "Lenskart":
        return {
          bg: isDark ? "#0A121E" : "#F4F7FC",
          border: "1px solid #1E40AF",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFA500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="12" r="3" />
                <line x1="9" y1="12" x2="15" y2="12" />
              </svg>
              <span style={{ color: isDark ? "#93C5FD" : "#1E40AF", fontWeight: 700 }}>lens</span>
              <span style={{ color: "#FFA500", fontWeight: 800 }}>kart</span>
            </div>
          )
        };
      case "ICICI Bank":
        return {
          bg: isDark ? "#2A0E0B" : "#FFF7F2",
          border: "1.5px solid #C2410C",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#C2410C", fontWeight: 800, fontSize: 15, fontFamily: "Georgia, serif", fontStyle: "italic" }}>i</span>
              <span style={{ color: "#C2410C", fontWeight: 700 }}>ICICI Bank</span>
            </div>
          )
        };
      case "Apollo Pharmacy":
        return {
          bg: isDark ? "#061A14" : "#F0FDF4",
          border: "1px solid #15803D",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#E53935">
                <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
              </svg>
              <span style={{ color: isDark ? "#4ADE80" : "#15803D", fontWeight: 800, fontSize: 12, letterSpacing: "1px" }}>APOLLO</span>
              <span style={{ color: "#E53935", fontWeight: 600, fontSize: 10 }}>PHARMACY</span>
            </div>
          )
        };
      case "Cantabile":
        return {
          bg: isDark ? "#1E1B4B" : "#EEF2FF",
          border: "1px solid #4338CA",
          color: "#4338CA",
          fontFamily: "Georgia, serif",
          fontWeight: 600,
          fontStyle: "italic",
          text: "Cantabile",
          icon: (
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style={{ marginRight: 6 }}>
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )
        };
      case "Mufti":
        return {
          bg: isDark ? "#1E293B" : "#F1F5F9",
          border: "1px solid #475569",
          color: isDark ? "#E2E8F0" : "#0F172A",
          fontFamily: "'Courier New', monospace",
          fontWeight: 700,
          letterSpacing: "3px",
          text: "MUFTI"
        };
      case "Dulhe Sahab":
        return {
          bg: isDark ? "#271E0C" : "#FDF8E4",
          border: "1px solid #D49D42",
          color: "#D49D42",
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
          text: "Dulhe Sahab",
          icon: <span style={{ color: "#D49D42", marginRight: 6, fontSize: 14 }}>❖</span>
        };
      case "Policybazaar":
        return {
          bg: isDark ? "#081E2E" : "#F0F8FF",
          border: "1px solid #0284C7",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "#0284C7", fontWeight: 700 }}>policy</span>
              <span style={{ color: "#F59E0B", fontWeight: 800 }}>bazaar</span>
              <span style={{ fontSize: 9, padding: "1px 4px", background: "#0284C7", color: "#FFF", borderRadius: 3, fontWeight: 700, marginLeft: 2 }}>pb</span>
            </div>
          )
        };
      case "Muthoot Finance":
        return {
          bg: isDark ? "#270E0F" : "#FEF2F2",
          border: "1px solid #DC2626",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#F59E0B", fontSize: 11 }}>● Muthoot</span>
              <span style={{ color: "#DC2626", fontWeight: 700 }}>Finance</span>
            </div>
          )
        };
      case "Campus":
        return {
          bg: "#991B1B",
          border: "1px solid #B91C1C",
          color: "#FFFFFF",
          fontFamily: "'Arial Black', sans-serif",
          fontStyle: "italic",
          letterSpacing: "1px",
          text: "CAMPUS",
          icon: <div style={{ width: 10, height: 2, background: "#FFF", transform: "skewX(-20deg)", marginRight: 6 }} />
        };
      case "3C Group":
        return {
          bg: isDark ? "#061F17" : "#ECFDF5",
          border: "1px solid #059669",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "#059669", fontWeight: 900, fontSize: 15 }}>3C</span>
              <span style={{ color: isDark ? "#A7F3D0" : "#047857", fontWeight: 500, fontSize: 11, letterSpacing: "1px" }}>GROUP</span>
            </div>
          )
        };
      case "JM Housing":
        return {
          bg: isDark ? "#082F49" : "#F0F9FF",
          border: "1px solid #0284C7",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0284C7" strokeWidth="2.5">
                <path d="M3 21h18M3 21V8l9-4 9 4v13M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
              </svg>
              <span style={{ color: "#0284C7", fontWeight: 800 }}>JM</span>
              <span style={{ color: isDark ? "#7DD3FC" : "#0369A1", fontSize: 12 }}>Housing</span>
            </div>
          )
        };
      case "Supertech":
        return {
          bg: isDark ? "#172554" : "#EFF6FF",
          border: "1px solid #2563EB",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "#2563EB", fontWeight: 800, letterSpacing: "0.5px" }}>SUPER</span>
              <span style={{ color: "#D49D42", fontWeight: 700 }}>TECH</span>
            </div>
          )
        };
      case "Elite Group":
        return {
          bg: isDark ? "#1E1E1E" : "#FAF5FF",
          border: "1px solid #8B5CF6",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "#D49D42", fontWeight: 600 }}>♛</span>
              <span style={{ color: isDark ? "#DDD6FE" : "#6D28D9", fontWeight: 700, fontFamily: "Georgia, serif" }}>ELITE</span>
            </div>
          )
        };
      case "Ajnara Group":
        return {
          bg: isDark ? "#2E1005" : "#FFF7ED",
          border: "1px solid #C2410C",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "#C2410C", fontWeight: 800, letterSpacing: "1px" }}>AJNARA</span>
            </div>
          )
        };
      case "Panchsheel Group":
        return {
          bg: isDark ? "#112F28" : "#F0FDF4",
          border: "1px solid #16A34A",
          customRender: (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#16A34A", fontWeight: 800 }}>★</span>
              <span style={{ color: isDark ? "#86EFAC" : "#15803D", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.5px" }}>PANCHSHEEL</span>
            </div>
          )
        };
      default:
        return {
          bg: t.card,
          border: `1.5px solid ${t.border}`,
          color: t.text1,
          fontWeight: 600,
          text: name
        };
    }
  };

  const details = getBrandDetails(brand);
  const borderCol = details.border.split(" ").slice(2).join(" ");

  return (
    <div
      style={{
        padding: "12px 28px",
        background: details.bg,
        border: details.border,
        borderRadius: "12px",
        color: details.color || t.text1,
        fontFamily: details.fontFamily || "'Jost', sans-serif",
        fontWeight: details.fontWeight || 600,
        fontSize: "13px",
        letterSpacing: details.letterSpacing || "normal",
        fontStyle: details.fontStyle || "normal",
        boxShadow: `0 8px 24px ${t.shadow}12`,
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        transition: "all 0.3s",
        transformStyle: "preserve-3d"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
        e.currentTarget.style.boxShadow = `0 12px 30px ${t.terra}28`;
        e.currentTarget.style.borderColor = `${t.terra}aa`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = `0 8px 24px ${t.shadow}12`;
        e.currentTarget.style.borderColor = borderCol;
      }}
    >
      {details.customRender ? details.customRender : (
        <div style={{ display: "flex", alignItems: "center" }}>
          {details.icon}
          {details.text}
        </div>
      )}
    </div>
  );
}

function FounderProfile({ t }) {
  const brands = [
    "Zudio", "Lenskart", "ICICI Bank", "Apollo Pharmacy", "Cantabile", "Mufti", "Dulhe Sahab",
    "Policybazaar", "Muthoot Finance", "Campus", "3C Group", "JM Housing", "Supertech",
    "Elite Group", "Ajnara Group", "Panchsheel Group"
  ];
  const duplicatedBrands = [...brands, ...brands];

  const fadeSpring = { type: "spring", stiffness: 100, damping: 20 };

  return (
    <section id="founder" style={{ background: t.bgAlt, padding: "100px 5% 108px 5%", transition: "background 0.5s", position: "relative", overflow: "hidden" }}>
      <div className="blueprint-grid" style={{ opacity: t.isDark ? 0.25 : 0.35 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <SectionLabel text="Leadership & Founder" center t={t} />
        <div style={{ textAlign: "center", marginBottom: 54 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 4.5vw, 48px)", fontWeight: 600, color: t.text1, lineHeight: 1.15 }}>
            Meet Our Founder
          </h2>
        </div>

        <div className="ub-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "50px", alignItems: "center", marginBottom: 72 }}>
          {/* Portrait Column */}
          <FadeUp delay={0.1}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <motion.div
                whileHover={{ scale: 1.03, rotate: -2 }}
                transition={fadeSpring}
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "320px",
                  aspectRatio: "3/4",
                  borderRadius: "20px",
                  background: `linear-gradient(135deg, ${t.card}, rgba(30,15,10,0.1))`,
                  border: `1px solid ${t.border}`,
                  padding: "12px",
                  boxShadow: `0 20px 50px ${t.shadow}`,
                }}
              >
                {/* Dual offset outline frames */}
                <div style={{ position: "absolute", inset: "-4px", borderRadius: "24px", border: `1.5px solid ${t.gold}`, opacity: 0.45, pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: "4px", borderRadius: "16px", border: `1px solid ${t.terra}`, opacity: 0.3, pointerEvents: "none" }} />

                {/* Photo frame */}
                <div style={{
                  width: "100%", height: "100%", borderRadius: "14px", overflow: "hidden", position: "relative",
                  background: "linear-gradient(145deg, #2D1810, #140804)", display: "flex", alignItems: "center", justifyCenter: "center"
                }}>
                  <div className="blueprint-grid" style={{ opacity: 0.12 }} />
                  <motion.img
                    src={founderImg}
                    alt="Chandan Soni"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }}
                  />
                  {/* Luxury Monogram circular badge */}
                  <div style={{
                    position: "absolute", bottom: 12, right: 12,
                    width: 50, height: 50, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${t.gold}, ${t.terraDark})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${t.text1}`, boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                  }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "#F2E5CC" }}>CS</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeUp>

          {/* Description Card */}
          <FadeUp delay={0.2}>
            <div style={{
              background: t.card, border: `1px solid ${t.border}`, borderLeft: `4px solid ${t.terra}`,
              borderRadius: "16px", padding: "40px", boxShadow: `0 15px 45px ${t.shadow}`, position: "relative"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: t.text1 }}>Chandan Soni</h3>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: t.gold, fontWeight: 600, marginTop: 4 }}>
                    Founder & Property Consultant
                  </div>
                </div>
                <div style={{ padding: "6px 14px", background: `${t.terra}18`, color: t.terra, borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", border: `1px solid ${t.terra}33` }}>
                  16+ Years Experience
                </div>
              </div>
              <p style={{ color: t.text2, fontSize: 14.5, lineHeight: 1.8, marginBottom: 14, opacity: 0.95 }}>
                Chandan Soni brings over <strong>16 years of distinguished experience</strong> in real estate consulting, specializing in high-value commercial and residential sales, rentals, and leasing. His impressive career includes successful collaborations with industry giants in Noida, such as the <strong>3C Group, JM Housing, Supertech, Elite Group, Ajnara Group, and Panchsheel Group</strong>.
              </p>
              <p style={{ color: t.text2, fontSize: 14.5, lineHeight: 1.8, marginBottom: 14, opacity: 0.95 }}>
                Over the past six years, Chandan has pivotally expanded his footprint in Chhattisgarh, successfully facilitating premium property leases for leading national brands, including <strong>Zudio, Lenskart, ICICI Bank, Apollo Pharmacy, Cantabile, Mufti, Dulhe Sahab, Policybazaar, Muthoot Finance, and Campus</strong>.
              </p>
              <p style={{ color: t.text2, fontSize: 14.5, lineHeight: 1.8, opacity: 0.95 }}>
                Known for his strategic vision and operational excellence, Chandan excels at driving growth, maximizing efficiency, and optimizing transactional costs for his clients. Demonstrating a strong entrepreneurial drive, he founded Urbanbricks—a premier real estate portal dedicated to delivering world-class leasing and rental solutions.
              </p>
            </div>
          </FadeUp>
        </div>

        {/* Brand Collaborations marquee */}
        <FadeUp delay={0.3}>
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 48 }}>
            <div style={{ textAlign: "center", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: t.gold, fontWeight: 600, marginBottom: 32 }}>
              Successful Collaborations & Brand Leases
            </div>
            <div className="marquee-container">
              <div className="marquee-track">
                {duplicatedBrands.map((brand, idx) => (
                  <BrandLogo key={`${brand}-${idx}`} brand={brand} t={t} />
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function MainSite({ t, isDark, onToggle }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
      <Navbar t={t} isDark={isDark} onToggle={onToggle} />
      <Hero t={t} isDark={isDark} />
      <About t={t} />
      <Services t={t} />
      <Contact t={t} />
      <FounderProfile t={t} />
      <Footer t={t} />
      <WhatsAppFAB />
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════════════
export default function UrbanBricks() {
  const [done, setDone] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("ub-theme") !== "light"; } catch { return true; }
  });

  const t = isDark ? DARK : LIGHT;

  const toggleTheme = useCallback(() => {
    setIsDark((d) => {
      const next = !d;
      try { localStorage.setItem("ub-theme", next ? "dark" : "light"); } catch { }
      return next;
    });
  }, []);

  useFonts();

  return (
    <>
      <GlobalStyles t={t} />
      <AnimatePresence mode="wait">
        {!done && <Preloader key="pre" onComplete={() => setDone(true)} t={t} />}
      </AnimatePresence>
      <AnimatePresence>
        {done && <MainSite key="main" t={t} isDark={isDark} onToggle={toggleTheme} />}
      </AnimatePresence>
    </>
  );
}
