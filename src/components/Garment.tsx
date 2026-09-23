import React, { createContext, useContext, useId } from "react";
import type { GarmentType, View } from "../lib/products";

// ---------- color helpers ----------
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function shade(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = amt > 0 ? 255 : 0;
  const a = Math.abs(amt);
  return rgbToHex(r + (t - r) * a, g + (t - g) * a, b + (t - b) * a);
}
function lum(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

interface Pal {
  base: string; light: string; dark: string; seam: string; thread: string;
}
const makePal = (hex: string): Pal => ({
  base: hex,
  light: shade(hex, 0.16),
  dark: shade(hex, -0.24),
  seam: shade(hex, -0.38),
  thread: lum(hex) > 0.55 ? "#a9853f" : "#d9b46b",
});

// unique gradient id per instance
const Gid = createContext("g");
const useG = () => useContext(Gid);

// ---------- silhouettes ----------
const TEE_OUT = (neck: number) =>
  `M172,124 C165,126 149,131 141,137 L84,175 L112,226 L153,201 C152,246 151,330 151,438 C168,447 232,447 249,438 C249,330 248,246 247,201 L288,226 L316,175 L259,137 C251,131 235,126 228,124 C218,${neck} 182,${neck} 172,124 Z`;
const SHIRT_OUT =
  "M168,120 C159,122 147,128 141,134 L97,168 L80,350 L126,360 L146,204 C145,262 144,350 144,442 C162,452 238,452 256,442 C256,350 255,262 254,204 L274,360 L320,350 L303,168 L259,134 C253,128 241,122 232,120 L200,148 Z";
const TROUSER_OUT =
  "M148,134 L252,134 L258,244 L245,458 C232,462 218,462 207,458 L200,272 L193,458 C182,462 168,462 155,458 L142,244 Z";
const HOODIE_OUT =
  "M174,118 C166,120 150,126 142,132 L88,170 L114,224 L154,200 C153,250 152,330 152,442 C170,452 230,452 248,442 C248,330 247,250 246,200 L286,224 L312,170 L258,132 C250,126 234,120 226,118 C220,132 180,132 174,118 Z";
const JACKET_OUT =
  "M166,118 C156,120 144,126 138,132 L92,166 L78,352 L124,362 L144,206 C143,266 142,352 142,436 C160,446 240,446 258,436 C258,352 257,266 256,206 L276,362 L322,352 L308,166 L262,132 C256,126 244,120 234,118 L200,150 Z";
const DRESS_OUT = (neck: number) =>
  `M170,122 C162,126 152,132 148,140 L120,176 L142,218 L164,196 C162,216 160,230 160,242 C140,318 120,390 110,446 C150,464 250,464 290,446 C280,390 260,318 240,242 C240,230 238,216 236,196 L258,218 L280,176 L252,140 C248,132 238,126 230,122 C220,${neck} 180,${neck} 170,122 Z`;
const SKIRT_OUT = "M150,136 L250,136 L288,448 C230,466 170,466 112,448 Z";
const SHORTS_OUT =
  "M148,134 L252,134 L260,296 C246,304 220,304 207,298 L200,238 L193,298 C180,304 154,304 140,296 Z";

const DETAIL_POINT: Record<GarmentType, number> = {
  tee: 195, shirt: 210, jeans: 205, trousers: 205, hoodie: 215,
  jacket: 250, dress: 255, sweater: 215, skirt: 225, shorts: 200,
};

// ---------- per-type art ----------
function TeeArt({ p, front }: { p: Pal; front: boolean }) {
  const gid = useG();
  const d = TEE_OUT(front ? 146 : 134);
  return (
    <g>
      <path d={d} fill={`url(#${gid})`} stroke={p.seam} strokeOpacity="0.25" strokeWidth="1.5" />
      {front ? (
        <>
          <path d="M171,122 C181,144 219,144 229,122" fill="none" stroke={p.dark} strokeWidth="9" strokeLinecap="round" opacity="0.9" />
          <path d="M175,122 C184,137 216,137 225,122" fill="none" stroke={p.seam} strokeWidth="1" opacity="0.5" />
        </>
      ) : (
        <path d="M172,121 C183,137 217,137 228,121" fill="none" stroke={p.dark} strokeWidth="8" strokeLinecap="round" opacity="0.9" />
      )}
      <path d="M93,183 L114,224" stroke={p.seam} strokeWidth="1.5" opacity="0.55" />
      <path d="M307,183 L286,224" stroke={p.seam} strokeWidth="1.5" opacity="0.55" />
      <path d="M154,429 C170,438 230,438 246,429" fill="none" stroke={p.seam} strokeWidth="1.5" opacity="0.55" />
      <path d="M158,206 L158,426" stroke={p.seam} strokeWidth="1" opacity="0.18" />
      <path d="M242,206 L242,426" stroke={p.seam} strokeWidth="1" opacity="0.18" />
      {!front && <path d="M156,208 C174,199 226,199 244,208" fill="none" stroke={p.seam} strokeWidth="1" opacity="0.35" />}
    </g>
  );
}

function ShirtArt({ p, front }: { p: Pal; front: boolean }) {
  const gid = useG();
  return (
    <g>
      <path d={SHIRT_OUT} fill={`url(#${gid})`} stroke={p.seam} strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M168,118 Q200,98 232,118 L229,127 Q200,109 171,127 Z" fill={p.dark} opacity="0.9" />
      {front ? (
        <>
          <path d="M166,118 L200,150 L176,165 L158,140 Z" fill={shade(p.base, -0.12)} stroke={p.seam} strokeOpacity="0.4" />
          <path d="M234,118 L200,150 L224,165 L242,140 Z" fill={shade(p.base, -0.12)} stroke={p.seam} strokeOpacity="0.4" />
          <line x1="196" y1="152" x2="196" y2="440" stroke={p.seam} strokeWidth="1" opacity="0.35" />
          <line x1="204" y1="152" x2="204" y2="440" stroke={p.seam} strokeWidth="1" opacity="0.35" />
          {[182, 228, 274, 320, 366, 412].map((y) => (
            <circle key={y} cx="200" cy={y} r="2.7" fill={p.seam} opacity="0.75" />
          ))}
        </>
      ) : (
        <path d="M152,192 C170,204 230,204 248,192" fill="none" stroke={p.seam} strokeWidth="1.2" opacity="0.4" />
      )}
      <path d="M82,341 L124,351" stroke={p.seam} strokeWidth="1.5" opacity="0.55" />
      <path d="M318,341 L276,351" stroke={p.seam} strokeWidth="1.5" opacity="0.55" />
      <path d="M147,433 C164,442 236,442 253,433" fill="none" stroke={p.seam} strokeWidth="1.5" opacity="0.5" />
    </g>
  );
}

function TrouserArt({ p, front, denim }: { p: Pal; front: boolean; denim?: boolean }) {
  const gid = useG();
  const st = { stroke: denim ? p.thread : p.seam, strokeWidth: 1.3, opacity: denim ? 0.6 : 0.5, strokeDasharray: denim ? "3 3" : undefined };
  return (
    <g>
      <path d={TROUSER_OUT} fill={`url(#${gid})`} stroke={p.seam} strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M146,126 L254,126 L256,145 L144,145 Z" fill={p.dark} opacity="0.55" />
      {[152, 181, 215, 243].map((x) => (
        <rect key={x} x={x} y="127" width="5" height="15" fill={p.dark} opacity="0.7" rx="1" />
      ))}
      <circle cx="200" cy="141" r="3" fill={p.seam} opacity="0.8" />
      {front ? (
        <>
          <path d="M200,146 L200,222" {...st} fill="none" />
          <path d="M152,150 Q174,168 176,192" {...st} fill="none" />
          <path d="M248,150 Q226,168 224,192" {...st} fill="none" />
          <path d="M179,258 L182,448" stroke={p.seam} strokeWidth="1" opacity="0.14" />
          <path d="M221,258 L218,448" stroke={p.seam} strokeWidth="1" opacity="0.14" />
        </>
      ) : (
        <>
          <path d="M150,178 Q200,196 250,178" {...st} fill="none" />
          <rect x="158" y="198" width="34" height="32" rx="5" fill="none" {...st} />
          <rect x="208" y="198" width="34" height="32" rx="5" fill="none" {...st} />
          <path d="M200,150 L200,240" stroke={p.seam} strokeWidth="1" opacity="0.25" />
        </>
      )}
      <path d="M147,149 L253,149" fill="none" {...st} />
      <path d="M150,450 L206,454" fill="none" {...st} />
      <path d="M250,450 L194,454" fill="none" {...st} />
    </g>
  );
}

function HoodieArt({ p, front }: { p: Pal; front: boolean }) {
  const gid = useG();
  return (
    <g>
      {front ? (
        <path d="M160,120 C166,80 234,80 240,120 C226,100 174,100 160,120 Z" fill={p.dark} opacity="0.95" />
      ) : (
        <path d="M162,116 C168,76 232,76 238,116 L244,148 C216,132 184,132 156,148 Z" fill={p.dark} opacity="0.95" />
      )}
      <path d={HOODIE_OUT} fill={`url(#${gid})`} stroke={p.seam} strokeOpacity="0.25" strokeWidth="1.5" />
      {front ? (
        <>
          <path d="M160,120 C150,132 148,146 154,158 C162,146 170,136 178,128 Z" fill={shade(p.base, -0.1)} stroke={p.seam} strokeOpacity="0.3" />
          <path d="M240,120 C250,132 252,146 246,158 C238,146 230,136 222,128 Z" fill={shade(p.base, -0.1)} stroke={p.seam} strokeOpacity="0.3" />
          <path d="M174,120 C184,135 216,135 226,120" fill="none" stroke={p.dark} strokeWidth="7" strokeLinecap="round" opacity="0.9" />
          <path d="M189,131 L186,184" stroke={p.seam} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <path d="M211,131 L214,184" stroke={p.seam} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <circle cx="186" cy="187" r="2.6" fill={p.seam} opacity="0.8" />
          <circle cx="214" cy="187" r="2.6" fill={p.seam} opacity="0.8" />
          <path d="M160,338 L240,338 L234,412 C212,418 188,418 166,412 Z" fill={p.light} fillOpacity="0.2" stroke={p.seam} strokeOpacity="0.5" strokeWidth="1.3" />
          <path d="M160,338 L167,408" stroke={p.seam} strokeWidth="1.3" opacity="0.5" />
          <path d="M240,338 L233,408" stroke={p.seam} strokeWidth="1.3" opacity="0.5" />
        </>
      ) : (
        <path d="M200,152 L200,430" stroke={p.seam} strokeWidth="1" opacity="0.18" />
      )}
      <path d="M90,172 L112,221" stroke={p.dark} strokeWidth="7" opacity="0.4" strokeLinecap="round" />
      <path d="M310,172 L288,221" stroke={p.dark} strokeWidth="7" opacity="0.4" strokeLinecap="round" />
      <path d="M154,428 C172,439 228,439 246,428" fill="none" stroke={p.dark} strokeWidth="8" opacity="0.45" />
    </g>
  );
}

function JacketArt({ p, front }: { p: Pal; front: boolean }) {
  const gid = useG();
  return (
    <g>
      <path d={JACKET_OUT} fill={`url(#${gid})`} stroke={p.seam} strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M166,118 Q200,98 234,118 L231,128 Q200,109 169,128 Z" fill={p.dark} opacity="0.9" />
      {front ? (
        <>
          <path d="M164,116 L200,152 L176,170 L154,140 Z" fill={shade(p.base, -0.14)} stroke={p.seam} strokeOpacity="0.4" />
          <path d="M236,116 L200,152 L224,170 L246,140 Z" fill={shade(p.base, -0.14)} stroke={p.seam} strokeOpacity="0.4" />
          <line x1="200" y1="152" x2="200" y2="434" stroke={p.seam} strokeWidth="1.2" opacity="0.35" />
          {[192, 242, 292, 342, 392].map((y) => (
            <circle key={y} cx="200" cy={y} r="4" fill={p.seam} opacity="0.8" />
          ))}
          <rect x="156" y="230" width="38" height="32" rx="4" fill="none" stroke={p.seam} strokeOpacity="0.55" strokeWidth="1.3" />
          <rect x="206" y="230" width="38" height="32" rx="4" fill="none" stroke={p.seam} strokeOpacity="0.55" strokeWidth="1.3" />
          <line x1="156" y1="242" x2="194" y2="242" stroke={p.seam} strokeWidth="1.2" opacity="0.5" />
          <line x1="206" y1="242" x2="244" y2="242" stroke={p.seam} strokeWidth="1.2" opacity="0.5" />
        </>
      ) : (
        <>
          <path d="M150,190 C170,202 230,202 250,190" fill="none" stroke={p.seam} strokeWidth="1.2" opacity="0.4" />
          <path d="M200,336 L200,434" stroke={p.seam} strokeWidth="1.2" opacity="0.35" />
        </>
      )}
      <path d="M80,344 L124,354" stroke={p.seam} strokeWidth="1.5" opacity="0.55" />
      <path d="M320,344 L276,354" stroke={p.seam} strokeWidth="1.5" opacity="0.55" />
      <path d="M144,427 C162,436 238,436 256,427" fill="none" stroke={p.seam} strokeWidth="2" opacity="0.5" />
    </g>
  );
}

function DressArt({ p, front }: { p: Pal; front: boolean }) {
  const gid = useG();
  const d = DRESS_OUT(front ? 138 : 126);
  return (
    <g>
      <path d={d} fill={`url(#${gid})`} stroke={p.seam} strokeOpacity="0.25" strokeWidth="1.5" />
      <path d={front ? "M170,120 C180,140 220,140 230,120" : "M172,120 C182,132 218,132 228,120"} fill="none" stroke={p.dark} strokeWidth="6" strokeLinecap="round" opacity="0.8" />
      <path d="M160,242 C180,254 220,254 240,242" fill="none" stroke={p.seam} strokeWidth="1.3" opacity="0.5" />
      <path d="M150,262 C144,320 134,380 126,442" fill="none" stroke={p.seam} strokeWidth="1" opacity="0.13" />
      <path d="M180,268 C178,322 174,382 172,450" fill="none" stroke={p.seam} strokeWidth="1" opacity="0.13" />
      <path d="M220,268 C222,322 226,382 228,450" fill="none" stroke={p.seam} strokeWidth="1" opacity="0.13" />
      <path d="M250,262 C256,320 266,380 274,442" fill="none" stroke={p.seam} strokeWidth="1" opacity="0.13" />
      {front ? (
        <path d="M164,196 C172,206 180,214 182,228" fill="none" stroke={p.seam} strokeWidth="1.2" opacity="0.35" />
      ) : (
        <>
          <path d="M200,132 L200,240" stroke={p.seam} strokeWidth="1" opacity="0.3" strokeDasharray="4 3" />
          <path d="M200,412 L200,452" stroke={p.seam} strokeWidth="1" opacity="0.35" />
        </>
      )}
    </g>
  );
}

function SweaterArt({ p, front }: { p: Pal; front: boolean }) {
  const gid = useG();
  return (
    <g>
      <path d={SHIRT_OUT} fill={`url(#${gid})`} stroke={p.seam} strokeOpacity="0.25" strokeWidth="1.5" />
      <path d={front ? "M168,118 C178,144 222,144 232,118" : "M170,118 C180,136 220,136 230,118"} fill="none" stroke={p.dark} strokeWidth="10" strokeLinecap="round" opacity="0.65" />
      <path d="M144,424 L256,424 L256,443 C238,453 162,453 144,443 Z" fill={p.dark} opacity="0.45" />
      {[152, 164, 176, 188, 200, 212, 224, 236, 248].map((x) => (
        <line key={x} x1={x} y1="426" x2={x} y2="446" stroke={p.base} strokeWidth="1.5" opacity="0.5" />
      ))}
      <path d="M80,344 L126,354 L124,364 L79,354 Z" fill={p.dark} opacity="0.5" />
      <path d="M320,344 L274,354 L276,364 L321,354 Z" fill={p.dark} opacity="0.5" />
      {!front && <path d="M154,200 C172,210 228,210 246,200" fill="none" stroke={p.seam} strokeWidth="1.2" opacity="0.35" />}
      <line x1="158" y1="210" x2="158" y2="420" stroke={p.seam} strokeWidth="1" opacity="0.15" />
      <line x1="242" y1="210" x2="242" y2="420" stroke={p.seam} strokeWidth="1" opacity="0.15" />
    </g>
  );
}

function SkirtArt({ p, front }: { p: Pal; front: boolean }) {
  const gid = useG();
  return (
    <g>
      <path d={SKIRT_OUT} fill={`url(#${gid})`} stroke={p.seam} strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M146,126 L254,126 L256,145 L144,145 Z" fill={p.dark} opacity="0.55" />
      <path d="M172,150 L152,446" stroke={p.seam} strokeWidth="1" opacity="0.15" />
      <path d="M200,150 L198,454" stroke={p.seam} strokeWidth="1" opacity="0.15" />
      <path d="M228,150 L250,446" stroke={p.seam} strokeWidth="1" opacity="0.15" />
      {!front && (
        <>
          <path d="M200,150 L199,452" stroke={p.seam} strokeWidth="1" opacity="0.3" />
          <path d="M200,410 L200,452" stroke={p.seam} strokeWidth="1.2" opacity="0.4" />
        </>
      )}
    </g>
  );
}

function ShortsArt({ p }: { p: Pal }) {
  const gid = useG();
  return (
    <g>
      <path d={SHORTS_OUT} fill={`url(#${gid})`} stroke={p.seam} strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M146,126 L254,126 L255,144 L145,144 Z" fill={p.dark} opacity="0.55" />
      <circle cx="200" cy="139" r="3" fill={p.seam} opacity="0.8" />
      <path d="M200,146 L200,214" stroke={p.seam} strokeWidth="1.3" strokeDasharray="3 3" opacity="0.5" fill="none" />
      <path d="M152,150 Q174,166 176,188" stroke={p.seam} strokeWidth="1.3" opacity="0.5" fill="none" />
      <path d="M248,150 Q226,166 224,188" stroke={p.seam} strokeWidth="1.3" opacity="0.5" fill="none" />
      <path d="M142,286 L205,293" stroke={p.dark} strokeWidth="8" opacity="0.4" strokeLinecap="round" />
      <path d="M195,293 L258,286" stroke={p.dark} strokeWidth="8" opacity="0.4" strokeLinecap="round" />
    </g>
  );
}

// ---------- main component ----------
export function Garment({
  type,
  color,
  view = "front",
  className,
  label,
}: {
  type: GarmentType;
  color: string;
  view?: View;
  className?: string;
  label?: string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const p = makePal(color);
  const gid = `g${uid}`;
  const isDetail = view === "detail";

  let art: React.ReactNode;
  switch (type) {
    case "tee": art = <TeeArt p={p} front={view !== "back"} />; break;
    case "shirt": art = <ShirtArt p={p} front={view !== "back"} />; break;
    case "trousers": art = <TrouserArt p={p} front={view !== "back"} />; break;
    case "jeans": art = <TrouserArt p={p} front={view !== "back"} denim />; break;
    case "hoodie": art = <HoodieArt p={p} front={view !== "back"} />; break;
    case "jacket": art = <JacketArt p={p} front={view !== "back"} />; break;
    case "dress": art = <DressArt p={p} front={view !== "back"} />; break;
    case "sweater": art = <SweaterArt p={p} front={view !== "back"} />; break;
    case "skirt": art = <SkirtArt p={p} front={view !== "back"} />; break;
    case "shorts": art = <ShortsArt p={p} />; break;
  }

  const cy = DETAIL_POINT[type];
  const s = 2.3;

  return (
    <Gid.Provider value={gid}>
      <svg viewBox="0 0 400 520" className={className} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.light} />
            <stop offset="55%" stopColor={p.base} />
            <stop offset="100%" stopColor={shade(p.base, -0.07)} />
          </linearGradient>
          <radialGradient id={`v${uid}`} cx="0.5" cy="0.42" r="0.75">
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(30,15,10,0.10)" />
          </radialGradient>
          <filter id={`b${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <pattern id={`t${uid}`} width="7" height="7" patternUnits="userSpaceUse" patternTransform="rotate(6)">
            <path d="M0,3.5 Q3.5,0.5 7,3.5" fill="none" stroke={p.seam} strokeWidth="0.8" opacity="0.35" />
          </pattern>
          <clipPath id={`c${uid}`}><rect x="0" y="0" width="400" height="520" /></clipPath>
        </defs>

        <rect width="400" height="520" fill="#f1eadf" />
        <rect width="400" height="520" fill={`url(#v${uid})`} />

        <g clipPath={`url(#c${uid})`}>
          {isDetail ? (
            <g transform={`translate(${200 - 200 * s} ${cy - cy * s}) scale(${s})`}>
              {art}
              <rect x="0" y="0" width="400" height="520" fill={`url(#t${uid})`} opacity="0.5" />
            </g>
          ) : (
            <>
              <ellipse cx="200" cy="474" rx="118" ry="13" fill="rgba(20,10,5,0.16)" filter={`url(#b${uid})`} />
              {art}
              <rect x="189" y="452" width="22" height="14" rx="1.5" fill="#f4efe4" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
              <text x="200" y="462.5" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={p.seam} style={{ fontFamily: "Jost, sans-serif", letterSpacing: "1px" }}>
                WS
              </text>
            </>
          )}
        </g>
      </svg>
    </Gid.Provider>
  );
}
