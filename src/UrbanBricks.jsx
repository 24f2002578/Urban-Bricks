// src/UrbanBricks.jsx  –  Full redesign: 3D building, day/night sky, light/dark theme, 3D tilt cards
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Home, Building2, Tractor, MapPin, Trees, Store, Factory,
  LayoutTemplate, Layers, Palette, Sofa, Phone, Mail,
  Globe, MapPinned, Menu, X, ChevronRight, ArrowUpRight,
  Sun, Moon, Tag, Key, Award, Utensils, Film,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════
//  THEME TOKENS
// ══════════════════════════════════════════════════════════════
const DARK = {
  bg:         "#080403", // Premium mahogany black
  bgAlt:      "#130906", // Dark clay warm background
  card:       "rgba(26, 14, 10, 0.85)", // Glassmorphic amber-cocoa card
  border:     "rgba(184, 92, 56, 0.22)", // Rich terracotta outline
  text1:      "#F6ECD9", // Warm parchment white
  text2:      "#C5B09E", // Soft bronze-grey
  terra:      "#C95B32", // Vibrant sunset terracotta
  terraDark:  "#8C2D11", // Deep warm brick red
  terraLight: "#FF7E5F", // Glowing coral accent
  gold:       "#D49D42", // Refined honey gold
  goldLight:  "#FED049", // Vivid radiant saffron
  shadow:     "rgba(0,0,0,0.75)",
  glass:      "rgba(13,6,4,0.92)",
  skyA:       "#020714",
  skyB:       "#0C1428",
  skyC:       "#180C05",
  isDark:     true,
};

const LIGHT = {
  bg:         "#FDFBF7", // Luxurious warm pearl sand
  bgAlt:      "#F7EFE2", // Warm sand clay
  card:       "rgba(255, 255, 255, 0.88)", // Warm white glass
  border:     "rgba(198, 90, 49, 0.16)", // Warm terracotta outline
  text1:      "#281102", // Deep mahogany espresso
  text2:      "#745239", // Refined cocoa brown
  terra:      "#C65A31", // Sunset terracotta accent
  terraDark:  "#9C3511", // Deep clay red
  terraLight: "#F07A54", // Saffron sunset orange
  gold:       "#CCA05A", // Radiant warm gold
  goldLight:  "#F4D08B", // Saffron gold highlight
  shadow:     "rgba(139, 69, 19, 0.08)",
  glass:      "rgba(253, 251, 247, 0.93)",
  skyA:       "#FF7E5F", // Sunset coral
  skyB:       "#FEB47B", // Sunset peach
  skyC:       "#FFE5B4", // Sunset saffron
  isDark:     false,
};

const spring = { type: "spring", stiffness: 360, damping: 28 };
const ease   = { duration: 0.65, ease: [0.22, 1, 0.36, 1] };

// ══════════════════════════════════════════════════════════════
//  FONT LOADER
// ══════════════════════════════════════════════════════════════
function useFonts() {
  useEffect(() => {
    const el = document.createElement("link");
    el.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap";
    el.rel  = "stylesheet";
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
          ? <motion.span key="sun"   initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}  transition={{ duration: 0.2 }}><Sun  size={16} /></motion.span>
          : <motion.span key="moon" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon size={16} /></motion.span>
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
      <div style={{ position: "absolute", left: "28%", bottom: "26%", width: 7,  height: 7,  borderRadius: "50%", background: "rgba(175,158,70,0.28)" }} />
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
    {[0,45,90,135,180,225,270,315].map((deg, i) => (
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
      <Cloud left="6%"  top="22%" scale={1.4} />
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
    { x: 34,  y: 28, w: 28,  h: 62 },
    { x: 59,  y: 38, w: 32,  h: 52 },
    { x: 128, y: 22, w: 36,  h: 68 },
    { x: 176, y: 32, w: 30,  h: 58 },
    { x: 202, y: 10, w: 40,  h: 80 },
    { x: 284, y: 26, w: 34,  h: 64 },
    { x: 334, y: 36, w: 30,  h: 54 },
    { x: 360, y: 12, w: 44,  h: 78 },
    { x: 416, y: 30, w: 36,  h: 60 },
    { x: 470, y: 22, w: 32,  h: 68 },
    { x: 516, y: 24, w: 42,  h: 66 },
    { x: 574, y: 38, w: 30,  h: 52 },
    { x: 600, y: 10, w: 36,  h: 80 },
    { x: 650, y: 30, w: 32,  h: 60 },
    { x: 702, y: 22, w: 40,  h: 68 },
    { x: 758, y: 28, w: 42,  h: 62 },
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
      <rect x="0"   y="55" width="38"  height="35" fill={col} />
      <rect x="34"  y="28" width="28"  height="62" fill={col} />
      <rect x="57"  y="15" width="5"   height="75" fill={col} />
      <rect x="59"  y="38" width="32"  height="52" fill={col} />
      <rect x="87"  y="60" width="26"  height="30" fill={col} />
      <rect x="110" y="42" width="22"  height="48" fill={col} />
      <rect x="128" y="22" width="36"  height="68" fill={col} />
      <rect x="160" y="50" width="20"  height="40" fill={col} />
      <rect x="176" y="32" width="30"  height="58" fill={col} />
      <rect x="202" y="10" width="40"  height="80" fill={col} />
      <rect x="238" y="45" width="22"  height="45" fill={col} />
      <rect x="256" y="58" width="32"  height="32" fill={col} />
      <rect x="284" y="26" width="34"  height="64" fill={col} />
      <rect x="314" y="48" width="24"  height="42" fill={col} />
      <rect x="334" y="36" width="30"  height="54" fill={col} />
      <rect x="360" y="12" width="44"  height="78" fill={col} />
      <rect x="400" y="52" width="20"  height="38" fill={col} />
      <rect x="416" y="30" width="36"  height="60" fill={col} />
      <rect x="448" y="58" width="26"  height="32" fill={col} />
      <rect x="470" y="22" width="32"  height="68" fill={col} />
      <rect x="498" y="44" width="22"  height="46" fill={col} />
      <rect x="516" y="24" width="42"  height="66" fill={col} />
      <rect x="554" y="54" width="24"  height="36" fill={col} />
      <rect x="574" y="38" width="30"  height="52" fill={col} />
      <rect x="600" y="10" width="36"  height="80" fill={col} />
      <rect x="632" y="48" width="22"  height="42" fill={col} />
      <rect x="650" y="30" width="32"  height="60" fill={col} />
      <rect x="678" y="58" width="28"  height="32" fill={col} />
      <rect x="702" y="22" width="40"  height="68" fill={col} />
      <rect x="738" y="44" width="24"  height="46" fill={col} />
      <rect x="758" y="28" width="42"  height="62" fill={col} />
      
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
      side:  Math.random() > 0.38,
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
        style={{ position: "absolute", bottom: 0, left: 0, height: 3, zIndex: 3,
          background: `linear-gradient(90deg, ${t.terra}, ${t.gold})` }}
        initial={{ width: "0%" }} animate={{ width: "100%" }}
        transition={{ duration: 4.4, ease: "easeInOut" }}
      />

      {/* Corner ornaments */}
      {[0,1,2,3].map((qi) => (
        <motion.div key={qi}
          initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: 0.5 }}
          style={{
            position: "absolute", width: 40, height: 40, zIndex: 3,
            [qi < 2 ? "top" : "bottom"]: 22,
            [qi % 2 === 0 ? "left" : "right"]: 22,
            borderTop:    qi < 2 ? `1.5px solid ${t.terra}` : "none",
            borderBottom: qi >= 2 ? `1.5px solid ${t.terra}` : "none",
            borderLeft:   qi % 2 === 0 ? `1.5px solid ${t.terra}` : "none",
            borderRight:  qi % 2 !== 0 ? `1.5px solid ${t.terra}` : "none",
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
    { label: "Home",     href: "#home"     },
    { label: "Services", href: "#services" },
    { label: "About",    href: "#about"    },
    { label: "Contact",  href: "#contact"  },
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
            style={{ position: "absolute", top: 72, left: 0, right: 0,
              background: t.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              padding: "20px 5%", borderBottom: `1px solid ${t.border}` }}
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
      side:  Math.random() > 0.35,
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
          {[["100+", "Properties Dealt"], ["11", "Services Offered"], ["Trusted", "Since Day One"]].map(([num, lbl]) => (
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
                <Cloud left="6%"  top="24%" scale={0.75} />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 0.7 }}>
                <Cloud left="54%" top="16%" scale={0.6} />
              </motion.div>
            </>
          )}

        {/* Mini city silhouette */}
        <CitySilhouette t={t} />

        {/* Small 3D building */}
        <div style={{ position: "relative", zIndex: 2, marginBottom: 18 }}>
          <Building3D
            numFloors={6} floorH={26} bW={80} bD={48}
            t={t} windowData={heroWindowData} animated={false} small
          />
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
    { label: "Buy Property",     Icon: Home },
    { label: "Sell Property",    Icon: Tag },
    { label: "Rent / Lease",     Icon: Key },
    { label: "Brand Franchisee", Icon: Award },
    { label: "Food & Fun Zone",  Icon: Utensils },
    { label: "Movie Theatre",    Icon: Film },
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
                      whileHover={{ scale: 1.04, y: -4 }} transition={spring}
                      style={{
                        background: t.card, border: `1px solid ${t.border}`,
                        padding: "22px 18px", borderRadius: 10, cursor: "default",
                        transition: "border-color 0.25s, box-shadow 0.25s",
                        boxShadow: `0 2px 8px ${t.shadow}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${t.terra}88`; e.currentTarget.style.boxShadow = `0 10px 30px ${t.terra}22`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = `0 2px 8px ${t.shadow}`; }}
                    >
                      <div style={{
                        width: 40, height: 40,
                        background: `${t.terra}14`,
                        color: t.terra,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s",
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = t.terra; e.currentTarget.style.color = "#FFF"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = `${t.terra}14`; e.currentTarget.style.color = t.terra; }}
                      >
                        <DealIcon size={18} />
                      </div>
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
    const y = (e.clientY - r.top)  / r.height;
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
    category: "commercial",
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
  return (
    <div style={{ transformStyle: "preserve-3d", width: "200px", height: "220px", position: "relative" }}>
      {/* 1. FLOOR (Ground Floor Wood Floor) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "200px", height: "160px",
        marginLeft: "-100px", marginTop: "-80px",
        background: `repeating-linear-gradient(90deg, #301A0E 0px, #301A0E 5px, #23120A 5px, #23120A 10px)`,
        border: `1px solid ${t.border}`,
        transform: "translate3d(0px, 110px, 0px) rotateX(90deg)",
        transformStyle: "preserve-3d",
      }}>
        {/* Colorful Living Room Rug */}
        <div style={{
          position: "absolute", left: "15px", top: "40px",
          width: "110px", height: "80px",
          background: `linear-gradient(135deg, ${t.terra}, ${t.gold})`,
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          opacity: 0.85,
        }} />
      </div>

      {/* 2. FIRST FLOOR FLOOR PLATE (Light Laminate) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "200px", height: "160px",
        marginLeft: "-100px", marginTop: "-80px",
        background: `repeating-linear-gradient(90deg, #E5C39C 0px, #E5C39C 6px, #D4AF83 6px, #D4AF83 12px)`,
        border: `1px solid ${t.border}`,
        transform: "translate3d(0px, 0px, 0px) rotateX(90deg)",
        transformStyle: "preserve-3d",
      }} />

      {/* 3. ROOF PLATE (Charcoal concrete with terracotta trim) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "200px", height: "160px",
        marginLeft: "-100px", marginTop: "-80px",
        background: "#2A2A2A",
        border: `2px solid ${t.terra}`,
        transform: "translate3d(0px, -110px, 0px) rotateX(90deg)",
        transformStyle: "preserve-3d",
      }} />

      {/* 4. BACK WALL (Split wallpaper) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "200px", height: "220px",
        marginLeft: "-100px", marginTop: "-110px",
        border: `1.5px solid ${t.border}`,
        transform: "translate3d(0px, 0px, -80px)",
        transformStyle: "preserve-3d",
      }}>
        {/* Ground Floor Wall Panel (Dark Forest Green) */}
        <div style={{
          position: "absolute", left: 0, bottom: 0,
          width: "200px", height: "110px",
          background: "#16231C",
          borderTop: `2px solid ${t.gold}50`,
          display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px",
        }}>
          {/* Framed Wall Painting */}
          <div style={{
            width: "55px", height: "40px",
            background: "linear-gradient(to right, #FF7E5F, #FEB47B)",
            borderRadius: "4px",
            border: `2px solid ${t.gold}`,
            boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
            marginTop: "4px",
          }} />
        </div>

        {/* First Floor Wall Panel (Terracotta plaster) */}
        <div style={{
          position: "absolute", left: 0, top: 0,
          width: "200px", height: "110px",
          background: t.isDark ? "#2C140E" : "#F4ECE1",
          borderBottom: `1px solid ${t.border}`,
          padding: "10px",
        }}>
          {/* Accent Panel or Wall lights */}
          <div style={{
            position: "absolute", left: "20px", top: "15px",
            width: "35px", height: "20px",
            background: "linear-gradient(45deg, #FF9E79, #FFA500)",
            borderRadius: "3px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }} />
        </div>
      </div>

      {/* 5. LEFT WALL (Sand-pearl plaster) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "160px", height: "220px",
        marginLeft: "-80px", marginTop: "-110px",
        background: t.isDark ? "#23150F" : "#EBE1D2",
        border: `1.5px solid ${t.border}`,
        transform: "translate3d(-100px, 0px, 0px) rotateY(90deg)",
        transformStyle: "preserve-3d",
      }}>
        {/* Bookshelf on Ground Floor */}
        <div style={{
          position: "absolute", left: "20px", bottom: "10px",
          width: "18px", height: "80px",
          background: t.gold,
          border: "1px solid rgba(0,0,0,0.2)",
          borderRadius: "2px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
          transform: "translateZ(8px)",
          display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center", padding: "4px 0",
        }}>
          {[1, 2, 3].map((bi) => (
            <div key={bi} style={{
              width: "12px", height: "8px",
              background: bi === 1 ? "#FF5252" : bi === 2 ? "#3F51B5" : "#4CAF50",
              borderRadius: "1px",
            }} />
          ))}
        </div>
      </div>

      {/* ── GROUND FLOOR FURNISHING ── */}
      {/* L-Shaped Sectional Sofa */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "100px", height: "30px",
        marginLeft: "-85px", marginTop: "55px",
        transform: "translate3d(0px, 20px, 0px)",
      }}>
        {/* Main Base */}
        <div style={{
          position: "absolute", width: "95px", height: "14px",
          background: t.terra,
          border: "1px solid rgba(0,0,0,0.18)",
          boxShadow: `0 4px 8px rgba(0,0,0,0.35)`,
          borderRadius: "3px",
          transform: "translate3d(0px, 12px, -30px)",
        }} />
        {/* Sofa Backrest */}
        <div style={{
          position: "absolute", width: "95px", height: "20px",
          background: t.terraDark,
          borderRadius: "3px",
          transform: "translate3d(0px, -6px, -36px) rotateX(4deg)",
        }} />
        {/* L-Cushion extending forward */}
        <div style={{
          position: "absolute", width: "35px", height: "14px",
          background: t.terra,
          border: "1px solid rgba(0,0,0,0.18)",
          borderRadius: "3px",
          transform: "translate3d(-10px, 12px, -5px)",
        }} />
      </div>

      {/* Coffee Table */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "45px", height: "20px",
        marginLeft: "-15px", marginTop: "85px",
        transform: "translate3d(0px, 5px, 10px)",
      }}>
        {/* Glass Top */}
        <div style={{
          position: "absolute", width: "45px", height: "4px",
          background: "rgba(254, 208, 73, 0.45)",
          borderRadius: "3px",
          border: `1.5px solid ${t.gold}`,
          boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
        }} />
        {/* Tiny potted flower */}
        <div style={{
          position: "absolute", left: "18px", top: "-10px",
          width: "9px", height: "9px",
          borderRadius: "50%",
          background: "#FF5252",
          border: "1.5px solid #4CAF50",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </div>

      {/* TV Screen with animated sunset flow and cyan glow */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "70px", height: "42px",
        marginLeft: "15px", marginTop: "20px",
        transform: "translate3d(0px, 5px, -77px)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "#080808",
          border: "2px solid rgba(255,255,255,0.15)",
          borderRadius: "4px",
          boxShadow: "0 0 20px rgba(0,229,255,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          <motion.div
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(45deg, #00C9FF, #92FE9D)",
            }}
          />
          <div style={{ color: "#FFF", fontSize: "7px", fontWeight: 700, zIndex: 2, letterSpacing: "1px" }}>URBAN BRICKS</div>
        </div>
      </div>

      {/* ── FIRST FLOOR FURNISHING ── */}
      {/* Luxury Bed */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "80px", height: "35px",
        marginLeft: "-80px", marginTop: "-55px",
        transform: "translate3d(10px, 15px, -20px)",
      }}>
        {/* Bed Base */}
        <div style={{
          position: "absolute", width: "70px", height: "18px",
          background: t.isDark ? "#1E0E06" : "#E2D8CC",
          border: "1px solid rgba(0,0,0,0.18)",
          borderRadius: "3px",
          transform: "translate3d(0px, 10px, -25px)",
        }} />
        {/* Duvet (warm clay saffron) */}
        <div style={{
          position: "absolute", width: "70px", height: "16px",
          background: `linear-gradient(135deg, ${t.terra}, ${t.gold})`,
          borderRadius: "3px",
          transform: "translate3d(0px, 2px, -22px)",
          boxShadow: "0 3px 6px rgba(0,0,0,0.25)",
        }} />
        {/* Pillows */}
        <div style={{
          position: "absolute", width: "24px", height: "8px",
          background: "#FFF",
          borderRadius: "2px",
          transform: "translate3d(8px, -2px, -50px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }} />
        <div style={{
          position: "absolute", width: "24px", height: "8px",
          background: "#FFF",
          borderRadius: "2px",
          transform: "translate3d(38px, -2px, -50px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }} />
      </div>

      {/* Bedside Lamp with glowing bulb */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "20px", height: "30px",
        marginLeft: "-90px", marginTop: "-65px",
        transform: "translate3d(0px, 10px, -65px)",
      }}>
        {/* Tiny Table */}
        <div style={{
          position: "absolute", width: "16px", height: "12px",
          background: t.gold,
          borderRadius: "2px",
          transform: "translate3d(0px, 14px, 0px)",
        }} />
        {/* Glowing bulb */}
        <div style={{
          position: "absolute", left: "5px", top: "0px",
          width: "6px", height: "6px",
          borderRadius: "50%",
          background: "#FFE082",
          boxShadow: "0 0 16px 5px rgba(254,208,73,0.7)",
        }} />
      </div>

      {/* Study Desk & Laptop with glowing neon-blue screen */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "65px", height: "35px",
        marginLeft: "20px", marginTop: "-55px",
        transform: "translate3d(0px, 15px, -30px)",
      }}>
        {/* Desk Base */}
        <div style={{
          position: "absolute", width: "55px", height: "5px",
          background: t.isDark ? "#522C1B" : "#B08A6F",
          borderRadius: "2px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
          transform: "translate3d(0px, 12px, 0px)",
        }} />
        {/* Desk Legs */}
        <div style={{ position: "absolute", width: "2px", height: "14px", background: "#3A3A3A", transform: "translate3d(2px, 17px, 0px)" }} />
        <div style={{ position: "absolute", width: "2px", height: "14px", background: "#3A3A3A", transform: "translate3d(50px, 17px, 0px)" }} />
        {/* Open Laptop */}
        <div style={{
          position: "absolute",
          left: "16px", top: "-2px",
          width: "22px", height: "14px",
          transform: "translate3d(0px, 0px, 0px) rotateX(-20deg)",
          transformStyle: "preserve-3d",
        }}>
          {/* Laptop base */}
          <div style={{ position: "absolute", width: "22px", height: "2px", background: "#A2A2A2", transform: "translate3d(0px, 12px, 0px)" }} />
          {/* Laptop screen with cyan glow */}
          <div style={{
            position: "absolute", width: "22px", height: "14px",
            background: "#080808",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "2px",
            boxShadow: "0 0 12px rgba(0,229,255,0.7)",
            transform: "translate3d(0px, -2px, -6px) rotateX(75deg)",
          }} />
        </div>
      </div>

      {/* Tall Potted Monstera */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "25px", height: "45px",
        marginLeft: "65px", marginTop: "-30px",
        transform: "translate3d(0px, 10px, 35px)",
      }}>
        {/* Pot */}
        <div style={{
          position: "absolute", bottom: 0, left: "4px",
          width: "14px", height: "16px",
          background: "#B24C24",
          border: "1px solid rgba(0,0,0,0.15)",
          borderRadius: "1px 1px 4px 4px",
        }} />
        {/* Layered monstera leaves */}
        <div style={{ position: "absolute", bottom: "14px", left: "1px", width: "20px", height: "20px", borderRadius: "50%", background: "#2E7D32", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
        <div style={{ position: "absolute", bottom: "24px", left: "6px", width: "12px", height: "12px", borderRadius: "50%", background: "#4CAF50" }} />
      </div>
    </div>
  );
}

function Commercial3D({ t }) {
  return (
    <div style={{ transformStyle: "preserve-3d", width: "200px", height: "180px", position: "relative" }}>
      {/* 1. FLOOR (Polished Marble) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "200px", height: "160px",
        marginLeft: "-100px", marginTop: "-80px",
        background: `linear-gradient(135deg, #1A1F2C, #0F1219)`,
        border: `1.5px solid ${t.border}`,
        boxShadow: `0 0 35px ${t.shadow}`,
        transform: "translate3d(0px, 90px, 0px) rotateX(90deg)",
        transformStyle: "preserve-3d",
      }}>
        {/* Fine white marble vein */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(45deg, transparent 46%, rgba(255,255,255,0.05) 47%, rgba(255,255,255,0.05) 48%, transparent 49%)",
        }} />
      </div>

      {/* 2. CEILING SLAB (Warm LEDs panel lights) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "200px", height: "160px",
        marginLeft: "-100px", marginTop: "-80px",
        background: "#D1D5DB",
        border: `1px solid ${t.border}`,
        transform: "translate3d(0px, -90px, 0px) rotateX(90deg)",
        transformStyle: "preserve-3d",
      }}>
        {/* Embedded spotlight panel glows */}
        {[
          { l: "30px", t: "40px" }, { l: "150px", t: "40px" },
          { l: "30px", t: "110px" }, { l: "150px", t: "110px" }
        ].map((sp, idx) => (
          <div key={idx} style={{
            position: "absolute", left: sp.l, top: sp.t,
            width: "20px", height: "10px",
            background: "#FFF",
            boxShadow: "0 0 15px 4px #FFE082",
            borderRadius: "2px",
          }} />
        ))}
      </div>

      {/* 3. BACK WALL (Vertical acoustic wooden slats) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "200px", height: "180px",
        marginLeft: "-100px", marginTop: "-90px",
        background: `repeating-linear-gradient(90deg, #1E0E06 0px, #1E0E06 6px, #110502 6px, #110502 8px)`,
        border: `1.5px solid ${t.border}`,
        transform: "translate3d(0px, 0px, -80px)",
        transformStyle: "preserve-3d",
      }}>
        {/* Central Brand Presentation Wall */}
        <div style={{
          position: "absolute", left: "35px", top: "40px",
          width: "130px", height: "70px",
          background: t.isDark ? "#281D1A" : "#ECE4DB",
          border: `1px solid ${t.border}`,
          borderRadius: "6px",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
          transform: "translateZ(5px)",
        }}>
          {/* Glowing Green Brand Badge */}
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
            letterSpacing: "2px",
          }}>
            URBAN BRICKS
          </div>
        </div>
      </div>

      {/* 4. LEFT WALL (Office grey plaster + Windows) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "160px", height: "180px",
        marginLeft: "-80px", marginTop: "-90px",
        background: t.isDark ? "#1E293B" : "#F1F5F9",
        border: `1.5px solid ${t.border}`,
        transform: "translate3d(-100px, 0px, 0px) rotateY(90deg)",
        transformStyle: "preserve-3d",
      }}>
        {/* Skyline Window cutout block */}
        <div style={{
          position: "absolute", left: "15px", top: "35px",
          width: "130px", height: "100px",
          background: "#0B0F19",
          borderRadius: "4px",
          border: "2px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Cityscape window grids at night */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "60px",
            background: "linear-gradient(to top, #020408, transparent)",
          }} />
          {[
            { l: 20, t: 20 }, { l: 50, t: 30 }, { l: 80, t: 15 }, { l: 110, t: 40 },
            { l: 30, t: 60 }, { l: 70, t: 70 }, { l: 100, t: 55 }
          ].map((wn, idx) => (
            <div key={idx} style={{
              position: "absolute", left: `${wn.l}px`, top: `${wn.t}px`,
              width: "4px", height: "6px",
              background: idx % 2 === 0 ? "#FFE082" : "#90CAF9",
              boxShadow: "0 0 4px rgba(255,224,130,0.8)",
            }} />
          ))}
        </div>
      </div>

      {/* ── INTERIOR FURNISHING ── */}
      {/* Central Glass-and-Chrome Conference Table */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "110px", height: "30px",
        marginLeft: "-55px", marginTop: "35px",
        transform: "translate3d(15px, 20px, 0px)",
      }}>
        {/* Table Glass Top */}
        <div style={{
          position: "absolute", width: "100px", height: "4px",
          background: "rgba(255, 255, 255, 0.15)",
          border: "1.5px solid rgba(0, 229, 255, 0.5)",
          borderRadius: "6px",
          boxShadow: "0 6px 15px rgba(0, 229, 255, 0.25)",
        }} />
        {/* Chrome support legs */}
        <div style={{ position: "absolute", width: "4px", height: "22px", background: "#B0BEC5", transform: "translate3d(15px, 4px, -15px)" }} />
        <div style={{ position: "absolute", width: "4px", height: "22px", background: "#B0BEC5", transform: "translate3d(80px, 4px, -15px)" }} />
        <div style={{ position: "absolute", width: "4px", height: "22px", background: "#B0BEC5", transform: "translate3d(15px, 4px, 15px)" }} />
        <div style={{ position: "absolute", width: "4px", height: "22px", background: "#B0BEC5", transform: "translate3d(80px, 4px, 15px)" }} />

        {/* 4 Miniature Executive Chairs */}
        {[
          { x: 22, z: -25, r: 0 }, { x: 62, z: -25, r: 0 },
          { x: 22, z: 25, r: 180 }, { x: 62, z: 25, r: 180 }
        ].map((ch, idx) => (
          <div key={idx} style={{
            transformStyle: "preserve-3d",
            position: "absolute",
            left: `${ch.x}px`,
            transform: `translate3d(0px, 10px, ${ch.z}px) rotateY(${ch.r}deg)`,
          }}>
            {/* Chair Seat */}
            <div style={{ width: "14px", height: "2px", background: "#212121", borderRadius: "2px" }} />
            {/* Chair Backrest */}
            <div style={{ width: "14px", height: "14px", background: "#37474F", borderRadius: "2px", transform: "translate3d(0px, -12px, -4px) rotateX(10deg)" }} />
          </div>
        ))}
      </div>

      {/* Tech Workstation with curved monitor display */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "60px", height: "35px",
        marginLeft: "35px", marginTop: "40px",
        transform: "translate3d(0px, 15px, -70px)",
      }}>
        {/* Table Top */}
        <div style={{
          position: "absolute", width: "55px", height: "4px",
          background: "#1E1E1E",
          borderRadius: "2px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }} />
        {/* Curved dual monitors with glowing curves */}
        <div style={{
          position: "absolute", left: "6px", top: "-18px",
          width: "42px", height: "18px",
          background: "#050505",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "3px",
          boxShadow: "0 0 12px 2px rgba(0,255,102,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          transform: "rotateY(-10deg)",
        }}>
          {/* Animated stock glow charts */}
          <motion.div
            animate={{ scaleY: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{
              width: "36px", height: "10px",
              borderBottom: "1.5px solid #00FF66",
              borderRadius: "0 0 2px 2px",
            }}
          />
        </div>
      </div>

      {/* Corporate Green Planter Wall */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "15px", height: "70px",
        marginLeft: "-98px", marginTop: "-30px",
        transform: "translate3d(0px, 10px, 35px)",
      }}>
        {/* Vertical Planter slats */}
        <div style={{
          position: "absolute", inset: 0,
          background: "#4E342E",
          border: "1px solid rgba(0,0,0,0.2)",
          borderRadius: "2px",
          display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center", padding: "4px 0",
        }}>
          {[1, 2, 3, 4].map((pi) => (
            <div key={pi} style={{
              width: "10px", height: "10px",
              background: "#2E7D32",
              boxShadow: "0 0 6px #1B5E20",
              borderRadius: "50%",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Design3D({ t }) {
  return (
    <div style={{ transformStyle: "preserve-3d", width: "200px", height: "180px", position: "relative" }}>
      {/* 1. FLOOR (Terrazzo Tile) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "200px", height: "160px",
        marginLeft: "-100px", marginTop: "-80px",
        background: "#F5EFE6",
        border: `1.5px solid ${t.border}`,
        boxShadow: `0 0 35px ${t.shadow}`,
        transform: "translate3d(0px, 90px, 0px) rotateX(90deg)",
        transformStyle: "preserve-3d",
      }}>
        {/* Faint grid flecks */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(${t.gold}30 1px, transparent 1px)`,
          backgroundSize: "8px 8px",
        }} />
      </div>

      {/* 2. CEILING (Industrial spot bars) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "200px", height: "160px",
        marginLeft: "-100px", marginTop: "-80px",
        background: "#333",
        border: `1px solid ${t.border}`,
        transform: "translate3d(0px, -90px, 0px) rotateX(90deg)",
        transformStyle: "preserve-3d",
      }} />

      {/* 3. BACK WALL (Split kitchen & blueprints navy grid) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "200px", height: "180px",
        marginLeft: "-100px", marginTop: "-90px",
        border: `1.5px solid ${t.border}`,
        transform: "translate3d(0px, 0px, -80px)",
        transformStyle: "preserve-3d",
      }}>
        {/* Left Side: Modular Kitchen white tiled backsplash */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: "100px",
          background: `repeating-linear-gradient(0deg, transparent, transparent 11px, ${t.border} 11px, ${t.border} 12px), repeating-linear-gradient(90deg, #F8FAFC, #F8FAFC 24px, ${t.border} 24px, ${t.border} 25px)`,
        }} />

        {/* Right Side: Architectural Blueprint Navy Grid */}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0,
          width: "100px",
          background: "#0D1E36",
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          padding: "10px",
        }}>
          {/* Blueprint Drafting Coordinates */}
          <div style={{
            width: "36px", height: "36px",
            border: "1px dashed rgba(255, 255, 255, 0.25)",
            borderRadius: "50%",
            marginTop: "20px",
            marginLeft: "20px",
            position: "relative",
          }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.15)" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.15)" }} />
          </div>
        </div>
      </div>

      {/* 4. LEFT WALL (Terracotta clay plaster) */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "160px", height: "180px",
        marginLeft: "-80px", marginTop: "-90px",
        background: t.isDark ? "#8C2D11" : "#C65A31",
        border: `1.5px solid ${t.border}`,
        transform: "translate3d(-100px, 0px, 0px) rotateY(90deg)",
        transformStyle: "preserve-3d",
      }} />

      {/* ── MODULAR KITCHEN AREA (Left) ── */}
      {/* Kitchen Island Counter */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "60px", height: "30px",
        marginLeft: "-80px", marginTop: "35px",
        transform: "translate3d(0px, 20px, -10px)",
      }}>
        {/* Marble Top */}
        <div style={{
          position: "absolute", width: "55px", height: "4px",
          background: "#FFF",
          border: "1px solid rgba(0,0,0,0.15)",
          borderRadius: "2px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
        }}>
          {/* Marble vein */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(60deg, transparent 40%, rgba(0,0,0,0.06) 42%, transparent 45%)" }} />
        </div>
        {/* Charcoal Island Cabinets */}
        <div style={{
          position: "absolute", width: "53px", height: "24px",
          background: "#1E293B",
          borderRadius: "2px",
          transform: "translate3d(1px, 4px, -10px)",
          display: "flex", justifyContent: "space-around", alignItems: "center",
        }}>
          {/* Gold handles */}
          <div style={{ width: "8px", height: "2px", background: t.gold }} />
          <div style={{ width: "8px", height: "2px", background: t.gold }} />
        </div>
      </div>

      {/* Two High Bar Stools */}
      {[
        { x: -50, z: 25 }, { x: -28, z: 25 }
      ].map((st, idx) => (
        <div key={idx} style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "50%", top: "50%",
          width: "16px", height: "25px",
          marginLeft: `${st.x}px`, marginTop: "65px",
          transform: `translate3d(0px, 0px, ${st.z}px)`,
        }}>
          {/* Stool Seat */}
          <div style={{ width: "12px", height: "2px", background: "#111", borderRadius: "50%" }} />
          {/* Stool Gold Legs */}
          <div style={{ position: "absolute", width: "1.5px", height: "24px", background: t.gold, transform: "translate3d(2px, 2px, 0px) rotateZ(6deg)" }} />
          <div style={{ position: "absolute", width: "1.5px", height: "24px", background: t.gold, transform: "translate3d(8px, 2px, 0px) rotateZ(-6deg)" }} />
        </div>
      ))}

      {/* Floating Overhead Kitchen Cabinets with orange LED wash */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "70px", height: "25px",
        marginLeft: "-98px", marginTop: "-60px",
        transform: "translate3d(0px, 0px, -78px)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "#4A3B32",
          border: "1px solid rgba(0,0,0,0.2)",
          borderRadius: "2px",
          boxShadow: `0 4px 12px rgba(254,165,0,0.55)`,
        }} />
      </div>

      {/* ── ARCHITECT'S STUDIO AREA (Right) ── */}
      {/* Tilted Drafting Table */}
      <div style={{
        transformStyle: "preserve-3d",
        position: "absolute",
        left: "50%", top: "50%",
        width: "60px", height: "35px",
        marginLeft: "25px", marginTop: "35px",
        transform: "translate3d(0px, 20px, -10px) rotateX(-18deg)",
      }}>
        {/* Drawing Board Wood */}
        <div style={{
          position: "absolute", width: "55px", height: "38px",
          background: "#D4AF37",
          border: "1.5px solid #8B6508",
          borderRadius: "3px",
          boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "3px",
        }}>
          {/* Blueprint Layout Paper on desk */}
          <div style={{
            width: "100%", height: "100%",
            background: "#0091EA",
            border: "1px solid rgba(255,255,255,0.4)",
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)
            `,
            backgroundSize: "6px 6px",
            position: "relative",
          }}>
            {/* White house outline sketch */}
            <div style={{
              position: "absolute", left: "6px", top: "6px",
              width: "32px", height: "20px",
              border: "1px solid #FFF",
            }}>
              <div style={{ position: "absolute", top: "-6px", left: "-1px", right: "-1px", height: "6px", border: "1px solid #FFF", borderBottom: "none", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
            </div>
          </div>
        </div>

        {/* Architect Yellow Angle-poise Lamp */}
        <div style={{
          transformStyle: "preserve-3d",
          position: "absolute",
          left: "40px", top: "-18px",
          width: "12px", height: "20px",
          transform: "translate3d(0px, 0px, -10px)",
        }}>
          {/* Yellow Lamp shade */}
          <div style={{
            position: "absolute", width: "10px", height: "8px",
            background: "#FBC02D",
            borderRadius: "4px 4px 1px 1px",
            boxShadow: "0 0 14px 4px rgba(251,192,45,0.6)",
          }} />
        </div>
      </div>

      {/* Floating Holographic Compass Guideline Circle */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "100px", height: "100px",
        marginLeft: "5px", marginTop: "-30px",
        border: `1.5px dashed ${t.terraLight}`,
        borderRadius: "50%",
        transform: "translate3d(0px, 0px, -5px) rotateX(90deg)",
        opacity: 0.8,
        pointerEvents: "none",
      }} />
    </div>
  );
}

function Showcase3D({ activeCategory, t }) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 15, ry: -25, active: false });
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
    const y = (e.clientY - r.top)  / r.height;
    setTilt({
      rx: 8 + (1 - y) * 22,
      ry: -45 + x * 40,
      active: true
    });
  }, []);

  const onLeave = useCallback(() => {
    setTilt({ rx: 15, ry: -25, active: false });
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
            rotateY: tilt.active ? tilt.ry : [-25, 335],
          }}
          transition={tilt.active
            ? { type: "spring", stiffness: 220, damping: 24 }
            : { repeat: Infinity, duration: 24, ease: "linear" }
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
            {activeCategory === "design" && (
              <motion.div key="des" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: modelScale }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }} style={{ transformStyle: "preserve-3d" }}>
                <Design3D t={t} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div style={{ position: "absolute", top: 14, left: 16, fontSize: "9px", fontFamily: "monospace", color: t.gold, opacity: 0.6, letterSpacing: "1px" }}>
        RENDER MODE: REAL-TIME 3D CSS
      </div>
      <div style={{ position: "absolute", bottom: 14, right: 16, fontSize: "9px", fontFamily: "monospace", color: t.gold, opacity: 0.6, letterSpacing: "1px" }}>
        PERSPECTIVE: 1200PX · ORBIT ACTIVE
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
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
    { id: "commercial",  label: "Commercial",  Icon: Building2 },
    { id: "design",      label: "Architecture & Design", Icon: LayoutTemplate }
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
    { Icon: Phone,     label: "Mobile",  value: "+91 9810864670",                   href: "tel:+919810864670" },
    { Icon: Mail,      label: "Email",   value: "chandan.urbanbricks@gmail.com",    href: "mailto:chandan.urbanbricks@gmail.com" },
    { Icon: Globe,     label: "Website", value: "urbanbricks.in",                   href: "https://urbanbricks.in" },
    { Icon: MapPinned, label: "Address", value: "1st Floor, Aashish Electricals, Beside Carmel School, Namnakala, Ambikapur, Surguja (C.G.) 497001", href: "#" },
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
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
                    onBlur={(e)  => (e.target.style.borderColor = t.border)}
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
                    onBlur={(e)  => (e.target.style.borderColor = t.border)}
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
                    onBlur={(e)  => (e.target.style.borderColor = t.border)}
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
                    onBlur={(e)  => (e.target.style.borderColor = t.border)}
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
  return (
    <footer style={{ background: t.bg, borderTop: `1px solid ${t.border}`, padding: "50px 5%", transition: "background 0.5s" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <UBLogo size={34} t={t} showTagline />
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["Home", "Services", "About", "Contact"].map((lk) => (
              <a key={lk} href={`#${lk.toLowerCase()}`}
                style={{ color: t.text2, padding: "6px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.target.style.color = t.terra)}
                onMouseLeave={(e) => (e.target.style.color = t.text2)}
              >{lk}</a>
            ))}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: t.text2, fontSize: 12 }}>© 2025 Urban Bricks. All rights reserved.</div>
            <div style={{ color: t.text2, fontSize: 10, marginTop: 4, opacity: 0.55 }}>Ambikapur · Surguja · Chhattisgarh 497001</div>
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Call Us",   href: "tel:+919810864670",                   icon: <Phone size={13} /> },
            { label: "Email",     href: "mailto:chandan.urbanbricks@gmail.com", icon: <Mail  size={13} /> },
            { label: "WhatsApp",  href: `https://wa.me/919810864670?text=${encodeURIComponent("Hello Urban Bricks, I am interested in your real estate services. Please connect with me.")}`,
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
            },
          ].map(({ label, href, icon }) => (
            <a key={label} href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 7, color: t.text2, fontSize: 12, letterSpacing: "0.08em", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.terra)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.text2)}
            >{icon} {label}</a>
          ))}
        </div>
      </div>
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
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </motion.a>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN SITE
// ══════════════════════════════════════════════════════════════
function MainSite({ t, isDark, onToggle }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
      <Navbar t={t} isDark={isDark} onToggle={onToggle} />
      <Hero    t={t} isDark={isDark} />
      <About   t={t} />
      <Services t={t} />
      <Contact  t={t} />
      <Footer   t={t} />
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
      try { localStorage.setItem("ub-theme", next ? "dark" : "light"); } catch {}
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
