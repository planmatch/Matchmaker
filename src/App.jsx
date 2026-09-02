import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  PLANS,
  STYLES,
  FEATURES,
  TRUOBA_URL,
} from "./data/plans.js";
import { parseDescription, scorePlan } from "./lib/matching.js";
import { extractCriteriaWithLLM, generateMatchCopy } from "./lib/apiClient.js";

/* ---------------------------------------------------------
   UI PRIMITIVES
--------------------------------------------------------- */
function TitleBlock({ sheet, scale, fields }) {
  return (
    <div className="border border-[#9CAF88] bg-[#1B2C4F] text-[10px] sm:text-xs font-mono text-[#FAF8F3] w-full max-w-xs ml-auto">
      <div className="border-b border-[#9CAF88] px-2 py-1 flex justify-between">
        <span className="font-semibold tracking-wide">SHEET</span>
        <span>{sheet}</span>
      </div>
      {fields.map(([label, val]) => (
        <div key={label} className="border-b border-[#9CAF88]/30 px-2 py-1 flex justify-between last:border-b-0">
          <span className="opacity-70">{label}</span>
          <span className="font-semibold">{val}</span>
        </div>
      ))}
      <div className="px-2 py-1 flex justify-between">
        <span className="opacity-70">SCALE</span>
        <span>{scale}</span>
      </div>
    </div>
  );
}

function BlueprintGrid() {
  return (
    <div
      className="absolute inset-0 opacity-[0.35] pointer-events-none"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(250,248,243,0.08) 0px, rgba(250,248,243,0.08) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(250,248,243,0.08) 0px, rgba(250,248,243,0.08) 1px, transparent 1px, transparent 32px)",
      }}
    />
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-colors ${
        active
          ? "bg-[#C1502E] border-[#C1502E] text-[#FAF8F3]"
          : "bg-transparent border-[#FAF8F3]/25 text-[#FAF8F3]/70 hover:border-[#C1502E]"
      }`}
    >
      {label}
    </button>
  );
}

/* ---------------------------------------------------------
   SPLASH — jigsaw-puzzle house build, ported from the
   piece-of-home-splash.html reference
--------------------------------------------------------- */
const SPLASH_NAVY = "#1C2B45";
const SPLASH_WARM = "#F3ECE1";
const SPLASH_CHAR = "#2B2723";
const SPLASH_TERRA = "#C2694A";
const SPLASH_SAGE = "#7E8B6B";

function buildPuzzleHouse(svg) {
  const NS = "http://www.w3.org/2000/svg";
  svg.innerHTML = "";

  const originX = 60,
    originY = 20,
    gw = 180,
    gh = 240;
  const cols = 5,
    rows = 6;
  const cellW = gw / cols,
    cellH = gh / rows;

  function pt(i, j) {
    return { x: originX + i * cellW, y: originY + j * cellH };
  }

  // deterministic pseudo-random so the puzzle looks the same every load
  let seed = 42;
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  function sign() {
    return rand() > 0.5 ? 1 : -1;
  }

  function tab(p0, p1, s) {
    const dx = p1.x - p0.x,
      dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy);
    const tx = dx / len,
      ty = dy / len;
    const nx = -ty,
      ny = tx;
    const a = len * 0.27 * s;
    const neck = len * 0.06;

    const p1a = { x: p0.x + tx * len * 0.32, y: p0.y + ty * len * 0.32 };
    const p4a = { x: p0.x + tx * len * 0.68, y: p0.y + ty * len * 0.68 };
    const mid = { x: p0.x + tx * len * 0.5, y: p0.y + ty * len * 0.5 };
    const peak = { x: mid.x + nx * a, y: mid.y + ny * a };

    const c1 = { x: p1a.x + nx * a * 0.85 + tx * neck, y: p1a.y + ny * a * 0.85 + ty * neck };
    const c2 = { x: peak.x - tx * len * 0.1, y: peak.y - ty * len * 0.1 };
    const c3 = { x: peak.x + tx * len * 0.1, y: peak.y + ty * len * 0.1 };
    const c4 = { x: p4a.x + nx * a * 0.85 - tx * neck, y: p4a.y + ny * a * 0.85 - ty * neck };

    const forward = `L ${p1a.x},${p1a.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${peak.x},${peak.y} C ${c3.x},${c3.y} ${c4.x},${c4.y} ${p4a.x},${p4a.y} L ${p1.x},${p1.y}`;
    const reverse = `L ${p4a.x},${p4a.y} C ${c4.x},${c4.y} ${c3.x},${c3.y} ${peak.x},${peak.y} C ${c2.x},${c2.y} ${c1.x},${c1.y} ${p1a.x},${p1a.y} L ${p0.x},${p0.y}`;
    return { forward, reverse };
  }

  function straight(p0, p1) {
    return { forward: `L ${p1.x},${p1.y}`, reverse: `L ${p0.x},${p0.y}` };
  }

  const hEdges = [],
    vEdges = [];
  for (let j = 0; j <= rows; j++) {
    hEdges[j] = [];
    for (let i = 0; i < cols; i++) {
      const p0 = pt(i, j),
        p1 = pt(i + 1, j);
      hEdges[j][i] = j === 0 || j === rows ? straight(p0, p1) : tab(p0, p1, sign());
    }
  }
  for (let i = 0; i <= cols; i++) {
    vEdges[i] = [];
    for (let j = 0; j < rows; j++) {
      const p0 = pt(i, j),
        p1 = pt(i, j + 1);
      vEdges[i][j] = i === 0 || i === cols ? straight(p0, p1) : tab(p0, p1, sign());
    }
  }

  function cellPath(i, j) {
    const TL = pt(i, j);
    const top = hEdges[j][i].forward;
    const right = vEdges[i + 1][j].forward;
    const bottom = hEdges[j + 1][i].reverse;
    const left = vEdges[i][j].reverse;
    return `M ${TL.x},${TL.y} ${top} ${right} ${bottom} ${left} Z`;
  }

  function colorFor(i, j) {
    if (i === 2 && j === 5) return "FLOAT"; // the door — the last piece
    if (j <= 1) return (i + j) % 2 === 0 ? SPLASH_NAVY : SPLASH_CHAR; // roof
    if (j === 2) return i === 4 ? SPLASH_TERRA : i % 2 === 0 ? SPLASH_NAVY : SPLASH_WARM; // eaves / chimney
    if ((i === 1 || i === 3) && j === 4) return SPLASH_SAGE; // windows
    return SPLASH_WARM; // facade
  }

  const defs = document.createElementNS(NS, "defs");
  const clip = document.createElementNS(NS, "clipPath");
  clip.setAttribute("id", "houseClip");
  const clipPath = document.createElementNS(NS, "path");
  clipPath.setAttribute("clip-rule", "evenodd");
  clipPath.setAttribute(
    "d",
    "M150,20 L240,140 L60,140 Z " +
      "M70,140 L230,140 L230,260 L70,260 Z " +
      "M185,50 L205,50 L205,140 L185,140 Z " +
      "M118,220 L152,220 L152,260 L118,260 Z"
  );
  clip.appendChild(clipPath);
  defs.appendChild(clip);
  svg.appendChild(defs);

  const group = document.createElementNS(NS, "g");
  group.setAttribute("clip-path", "url(#houseClip)");
  svg.appendChild(group);

  let floatCellD = null;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const c = colorFor(i, j);
      if (c === "FLOAT") {
        floatCellD = cellPath(i, j);
        continue;
      }
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", cellPath(i, j));
      path.setAttribute("class", "hpmm-splash-piece");
      path.setAttribute("fill", c);
      group.appendChild(path);
    }
  }

  const outline = document.createElementNS(NS, "path");
  outline.setAttribute("class", "hpmm-splash-silhouette-edge");
  outline.setAttribute("d", "M150,20 L240,140 M60,140 L150,20 M70,140 L70,260 L230,260 L230,140");
  svg.appendChild(outline);

  if (floatCellD) {
    const fg = document.createElementNS(NS, "g");
    fg.setAttribute("class", "hpmm-splash-float-piece");
    const fp = document.createElementNS(NS, "path");
    fp.setAttribute("d", floatCellD);
    fg.appendChild(fp);
    svg.appendChild(fg);
    setTimeout(() => fg.classList.add("settled"), 1450);
  }
}

function Splash({ onEnter }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) buildPuzzleHouse(svgRef.current);
  }, []);

  useEffect(() => {
    function handleKey() {
      onEnter();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onEnter]);

  return (
    <div
      onClick={onEnter}
      role="button"
      tabIndex={0}
      aria-label="Enter House Plan Match Maker"
      className="hpmm-splash-outer fixed inset-0 z-50 cursor-pointer select-none"
    >
      <div className="hpmm-splash-inner">
        <div className="hpmm-splash-grain" />

        <div className="hpmm-splash-title-block">
          <span className="hpmm-splash-eyebrow">Matched to how you live</span>
          <div className="hpmm-splash-stack-word">
            <span>House</span>
            <span>Plan</span>
          </div>
        </div>

        <div className="hpmm-splash-puzzle-wrap">
          <svg ref={svgRef} viewBox="0 0 300 300" />
        </div>

        <div className="hpmm-splash-base">
          <div className="hpmm-splash-stack-word">
            <span>Match</span>
            <span>Maker</span>
          </div>
          <p className="hpmm-splash-tagline">Every house has its match.</p>
          <div className="hpmm-splash-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <style>{`
        .hpmm-splash-outer {
          background:
            radial-gradient(120% 70% at 50% -10%, rgba(28,43,69,0.16), transparent 60%),
            radial-gradient(120% 70% at 50% 110%, rgba(28,43,69,0.20), transparent 60%),
            ${SPLASH_WARM};
          overflow: hidden;
        }
        .hpmm-splash-inner {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 480px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 9% 8% 7%;
          font-family: 'Space Grotesk', sans-serif;
        }
        .hpmm-splash-grain {
          position: absolute; inset: 0;
          opacity: 0.05;
          mix-blend-mode: multiply;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .hpmm-splash-title-block { text-align: center; line-height: 1; }
        .hpmm-splash-eyebrow {
          display: block;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.62rem;
          letter-spacing: 0.42em;
          color: ${SPLASH_SAGE};
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .hpmm-splash-stack-word {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: clamp(1.7rem, 8vw, 2.3rem);
          color: ${SPLASH_NAVY};
          line-height: 0.98;
        }
        .hpmm-splash-stack-word span { display: block; }
        .hpmm-splash-puzzle-wrap {
          width: 58%;
          max-width: 190px;
          filter: drop-shadow(0 18px 26px rgba(28,20,14,0.16));
        }
        .hpmm-splash-puzzle-wrap svg { width: 100%; height: auto; display: block; overflow: visible; }
        .hpmm-splash-piece {
          stroke: ${SPLASH_CHAR};
          stroke-opacity: 0.22;
          stroke-width: 1.4;
          stroke-linejoin: round;
        }
        .hpmm-splash-silhouette-edge {
          fill: none;
          stroke: ${SPLASH_CHAR};
          stroke-opacity: 0.55;
          stroke-width: 2.2;
          stroke-linejoin: round;
        }
        .hpmm-splash-float-piece {
          transform-origin: 150px 245px;
          animation: hpmm-drop 1.15s cubic-bezier(.22,1.4,.36,1) 0.25s both;
        }
        .hpmm-splash-float-piece path {
          fill: ${SPLASH_TERRA};
          stroke: ${SPLASH_WARM};
          stroke-opacity: 0.9;
          stroke-width: 1.6;
        }
        @keyframes hpmm-drop {
          0% { transform: translate(4px,-92px) rotate(-16deg) scale(1.08); opacity: 0; }
          62% { transform: translate(0,4px) rotate(3deg) scale(1.02); opacity: 1; }
          100% { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .hpmm-splash-float-piece.settled { animation: hpmm-pulse 3.2s ease-in-out infinite; }
        }
        @keyframes hpmm-pulse {
          0%, 100% { filter: drop-shadow(0 0 0 rgba(194,105,74,0)); transform: translateY(0); }
          50% { filter: drop-shadow(0 4px 10px rgba(194,105,74,0.35)); transform: translateY(-2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hpmm-splash-float-piece { animation: none; }
        }
        .hpmm-splash-base { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .hpmm-splash-tagline {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 500;
          font-size: 0.95rem;
          color: ${SPLASH_CHAR};
          opacity: 0.62;
          letter-spacing: 0.01em;
        }
        .hpmm-splash-dots { display: flex; gap: 8px; }
        .hpmm-splash-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          opacity: 0.25;
          animation: hpmm-beat 1.3s ease-in-out infinite;
        }
        .hpmm-splash-dots span:nth-child(1) { background: ${SPLASH_NAVY}; animation-delay: 0s; }
        .hpmm-splash-dots span:nth-child(2) { background: ${SPLASH_TERRA}; animation-delay: 0.18s; }
        .hpmm-splash-dots span:nth-child(3) { background: ${SPLASH_CHAR}; animation-delay: 0.36s; }
        @keyframes hpmm-beat {
          0%, 80%, 100% { opacity: 0.25; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.25); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hpmm-splash-dots span { animation: none; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#FAF8F3]/15 mt-4">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#FAF8F3]/50">
        <span>© {new Date().getFullYear()} AI House Plan Matchmaker, LLC</span>
        <a href="/privacy-policy.html" className="hover:text-[#9CAF88]">
          Privacy Policy
        </a>
        <a href="/terms.html" className="hover:text-[#9CAF88]">
          Terms of Service
        </a>
        <a href="/affiliate-disclosure.html" className="hover:text-[#9CAF88]">
          Affiliate Disclosure
        </a>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */
export default function App() {
  const [stage, setStage] = useState("splash"); // splash | landing | results
  const [description, setDescription] = useState("");
  const [chipStyle, setChipStyle] = useState(null);
  const [chipFeatures, setChipFeatures] = useState([]);
  const [results, setResults] = useState([]);
  const [criteria, setCriteria] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }),
    []
  );

  function toggleFeature(f) {
    setChipFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  async function runMatch() {
    if (!description.trim() && !chipStyle && chipFeatures.length === 0) return;

    let fullText = description;
    if (chipStyle) fullText += ` ${chipStyle} style.`;
    if (chipFeatures.length) fullText += ` Wants ${chipFeatures.join(", ")}.`;

    setLoading(true);
    setUsedFallback(false);
    setLoadingLabel("Reading your brief…");

    let parsed;
    try {
      parsed = await extractCriteriaWithLLM(fullText);
    } catch (err) {
      console.error("LLM extraction failed, falling back to keyword parsing:", err);
      parsed = parseDescription(fullText);
      setUsedFallback(true);
    }
    // Chips are an explicit, trusted signal — make sure they always land
    // even if the model's free-text read missed them.
    if (chipStyle && !(parsed.styles || []).includes(chipStyle)) {
      parsed.styles = [...(parsed.styles || []), chipStyle];
    }
    chipFeatures.forEach((f) => {
      if (!(parsed.features || []).includes(f)) {
        parsed.features = [...(parsed.features || []), f];
      }
    });
    setCriteria(parsed);

    const scored = PLANS.map((p) => ({ plan: p, ...scorePlan(p, parsed) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);

    setLoadingLabel("Writing up why each plan fits…");
    try {
      const notes = await generateMatchCopy(fullText, scored);
      scored.forEach((r) => {
        if (notes[r.plan.id]) r.llmNote = notes[r.plan.id];
      });
    } catch (err) {
      console.error("LLM match copy failed, using rule-based reasons only:", err);
    }

    setResults(scored);
    setLoading(false);
    setStage("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function criteriaSummary(c) {
    if (!c) return [];
    const out = [];
    if (c.beds !== undefined) out.push(`${c.beds} bed`);
    if (c.baths !== undefined) out.push(`${c.baths} bath`);
    if (c.stories !== undefined) out.push(`${c.stories}-story`);
    if (c.sqftMax !== undefined) out.push(`under ${c.sqftMax.toLocaleString()} sqft`);
    else if (c.sqft !== undefined) out.push(`~${c.sqft.toLocaleString()} sqft`);
    if (c.budgetMax !== undefined) out.push(`under $${c.budgetMax.toLocaleString()}`);
    if (c.garage !== undefined) out.push(`${c.garage}-car garage`);
    c.styles?.forEach((s) => out.push(s));
    c.features?.forEach((f) => out.push(f));
    return out;
  }

  return (
    <div className="min-h-screen w-full bg-[#12213D] text-[#FAF8F3] font-sans">
      {stage === "splash" && <Splash onEnter={() => setStage("landing")} />}

      {stage === "landing" && (
        <Landing
          description={description}
          setDescription={setDescription}
          chipStyle={chipStyle}
          setChipStyle={setChipStyle}
          chipFeatures={chipFeatures}
          toggleFeature={toggleFeature}
          onSubmit={runMatch}
          today={today}
          loading={loading}
          loadingLabel={loadingLabel}
        />
      )}

      {stage === "results" && (
        <Results
          results={results}
          criteria={criteria}
          criteriaSummary={criteriaSummary(criteria)}
          onBack={() => {
            setStage("landing");
            setResults([]);
          }}
          today={today}
          usedFallback={usedFallback}
        />
      )}

      {stage !== "splash" && <Footer />}
    </div>
  );
}

/* ---------------------------------------------------------
   LANDING
--------------------------------------------------------- */
function Landing({
  description,
  setDescription,
  chipStyle,
  setChipStyle,
  chipFeatures,
  toggleFeature,
  onSubmit,
  today,
  loading,
  loadingLabel,
}) {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#FAF8F3]/15 bg-[#1B2C4F]">
        <BlueprintGrid />
        <div className="relative max-w-3xl mx-auto px-5 pt-10 pb-8 sm:px-8 sm:pt-14 sm:pb-10">
          <div className="flex items-center justify-between mb-8">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[#9CAF88] uppercase">
              PlanMatch
            </span>
            <span className="font-mono text-[11px] text-[#FAF8F3]/50">{today}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-semibold leading-[1.05] text-[#FAF8F3]">
            Describe your dream
            <br />
            house. We'll draw
            <br />
            the shortlist.
          </h1>

          <p className="mt-4 text-[#FAF8F3]/70 text-sm sm:text-base max-w-md">
            Tell us how you want to live — bedrooms, style, budget, a porch you can't live
            without. We'll match it against the plan catalog and rank what fits.
          </p>

          <div className="mt-8">
            <TitleBlock
              sheet="A-001"
              scale="NTS"
              fields={[
                ["PROJECT", "Your Home"],
                ["CATALOG", `${PLANS.length} plans`],
                ["STATUS", "Awaiting brief"],
              ]}
            />
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-[#FAF8F3]/70 mb-2">
          Describe your home
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. A single-story, 3 bedroom farmhouse under 2,000 sq ft with a big front porch and a home office. Budget under $250,000."
          rows={5}
          className="w-full border border-[#FAF8F3]/20 bg-[#1B2C4F] rounded-md px-4 py-3 text-sm sm:text-base text-[#FAF8F3] placeholder:text-[#FAF8F3]/40 focus:outline-none focus:ring-2 focus:ring-[#C1502E] focus:border-[#C1502E]"
        />

        <div className="mt-6">
          <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#FAF8F3]/70 mb-2">
            Style (optional)
          </div>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Chip
                key={s}
                label={s}
                active={chipStyle === s}
                onClick={() => setChipStyle(chipStyle === s ? null : s)}
              />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#FAF8F3]/70 mb-2">
            Must-haves (optional)
          </div>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <Chip key={f} label={f} active={chipFeatures.includes(f)} onClick={() => toggleFeature(f)} />
            ))}
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading || (!description.trim() && !chipStyle && chipFeatures.length === 0)}
          className="mt-8 w-full sm:w-auto px-6 py-3 rounded-md bg-[#C1502E] text-[#FAF8F3] font-display font-semibold text-sm sm:text-base hover:bg-[#9CAF88] hover:text-[#12213D] disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="h-3.5 w-3.5 border-2 border-[#FAF8F3]/40 border-t-[#FAF8F3] rounded-full animate-spin" />
          )}
          {loading ? loadingLabel : "Find my matches →"}
        </button>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------
   RESULTS
--------------------------------------------------------- */
function Results({ results, criteriaSummary, onBack, today, usedFallback }) {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-[#FAF8F3]/15 bg-[#1B2C4F]">
        <BlueprintGrid />
        <div className="relative max-w-3xl mx-auto px-5 pt-8 pb-6 sm:px-8 sm:pt-10">
          <button
            onClick={onBack}
            className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#9CAF88] mb-6"
          >
            ← Edit brief
          </button>

          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#FAF8F3]">
            Your shortlist
          </h1>
          <p className="mt-1 text-xs text-[#FAF8F3]/50">
            Plan links open Truoba's modern house plan catalog. Some links on this page are
            affiliate links — we may earn a commission if you make a purchase, at no extra cost
            to you.{" "}
            <a href="/affiliate-disclosure.html" className="underline hover:text-[#9CAF88]">
              Learn more
            </a>
            .
          </p>

          {usedFallback && (
            <p className="mt-2 text-xs text-[#C1502E]">
              Matching ran on keyword search — the AI reader was unavailable for this request.
            </p>
          )}

          {criteriaSummary.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {criteriaSummary.map((c) => (
                <span
                  key={c}
                  className="text-[11px] font-mono px-2 py-1 bg-[#9CAF88]/15 text-[#9CAF88] rounded"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6">
            <TitleBlock
              sheet="A-002"
              scale="NTS"
              fields={[
                ["MATCHES", `${results.length} plans`],
                ["TOP SCORE", `${results[0]?.pct ?? 0}%`],
                ["DATE", today],
              ]}
            />
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-8 space-y-5">
        {results.map(({ plan, pct, reasons, misses, llmNote }, i) => (
          <article
            key={plan.id}
            className="border border-[#FAF8F3]/12 rounded-lg bg-[#1B2C4F] overflow-hidden"
          >
            <div className="flex items-start justify-between px-5 pt-5">
              <div>
                <span className="font-mono text-[10px] text-[#FAF8F3]/40">
                  #{i + 1} · {plan.id}
                </span>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-[#FAF8F3] mt-0.5">
                  {plan.name}
                </h2>
                <span className="text-xs text-[#FAF8F3]/60 capitalize">{plan.style}</span>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="font-display text-xl font-bold text-[#C1502E]">{pct}%</div>
                <div className="font-mono text-[10px] text-[#FAF8F3]/40 uppercase">match</div>
              </div>
            </div>

            <div className="px-5 mt-3">
              <div className="h-1.5 w-full bg-[#12213D] rounded-full overflow-hidden">
                <div className="h-full bg-[#C1502E] rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="px-5 mt-4 grid grid-cols-4 gap-2 font-mono text-[11px] text-[#FAF8F3]/60">
              <div>
                <div className="text-[#FAF8F3]/40">BEDS</div>
                <div className="font-semibold text-[#FAF8F3]">{plan.beds}</div>
              </div>
              <div>
                <div className="text-[#FAF8F3]/40">BATHS</div>
                <div className="font-semibold text-[#FAF8F3]">{plan.baths}</div>
              </div>
              <div>
                <div className="text-[#FAF8F3]/40">SQFT</div>
                <div className="font-semibold text-[#FAF8F3]">{plan.sqft.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[#FAF8F3]/40">STORIES</div>
                <div className="font-semibold text-[#FAF8F3]">{plan.stories}</div>
              </div>
            </div>

            <p className="px-5 mt-4 text-sm text-[#FAF8F3]/70">{plan.blurb}</p>

            {llmNote && <p className="px-5 mt-3 text-sm text-[#FAF8F3] font-medium">"{llmNote}"</p>}

            {reasons.length > 0 && (
              <ul className="px-5 mt-3 space-y-1">
                {reasons.slice(0, 4).map((r) => (
                  <li key={r} className="text-xs text-[#9CAF88] flex gap-1.5">
                    <span>✓</span>
                    <span className="capitalize">{r}</span>
                  </li>
                ))}
              </ul>
            )}
            {misses.length > 0 && (
              <ul className="px-5 mt-1 space-y-1">
                {misses.slice(0, 2).map((m) => (
                  <li key={m} className="text-xs text-[#C1502E] flex gap-1.5">
                    <span>–</span>
                    <span className="capitalize">{m}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="px-5 py-4 mt-3 border-t border-[#FAF8F3]/10">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-[#FAF8F3]">
                  ${plan.price.toLocaleString()}
                </span>
              </div>
              <div className="mt-3">
                <a
                  href={TRUOBA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 rounded-md bg-[#C1502E] text-[#FAF8F3] text-sm font-medium hover:bg-[#9CAF88] hover:text-[#12213D] transition-colors text-center"
                >
                  See on Truoba →
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
