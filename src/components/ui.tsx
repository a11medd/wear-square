import React, { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";

// ---------- Logo ----------
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  const stroke = light ? "#f6f1e8" : "#451020";
  return (
    <span className={cn("inline-flex items-center gap-3 select-none", className)}>
      <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
        <rect x="2.5" y="2.5" width="43" height="43" rx="9" fill="none" stroke={stroke} strokeWidth="2.4" />
        <path d="M10,17.2 L13.6,30.8 L17.2,20.8 L20.8,30.8 L24.4,17.2"
          fill="none" stroke={stroke} strokeWidth="2.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M39.3,19.7 C39.3,16.8 36.6,15.3 33.4,15.3 C30.2,15.3 27.7,17.1 27.7,19.9 C27.7,22.8 30.3,23.6 33.4,24.6 C36.7,25.6 39.3,26.8 39.3,29.6 C39.3,32.5 36.5,33.9 33.3,33.9 C30.1,33.9 27.6,32.4 27.5,29.7"
          fill="none" stroke={stroke} strokeWidth="2.9" strokeLinecap="round" />
      </svg>
      <span className={cn("leading-none flex flex-col", light ? "text-cream" : "text-ink")}>
        <span className="font-display text-[1.2rem] font-semibold tracking-[0.2em]">WEAR SQUARE</span>
        <span className="text-[0.55rem] tracking-[0.45em] opacity-70 mt-1.5" dir="ltr">FAMILY FASHION</span>
      </span>
    </span>
  );
}

// ---------- Reveal on scroll ----------
export function Reveal({
  children, delay = 0, className, mask = false, as: Tag = "div",
}: {
  children: React.ReactNode; delay?: number; className?: string; mask?: boolean; as?: "div" | "section" | "span" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVis(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(mask ? "reveal-mask" : "reveal", vis && "reveal-in", className)}
    >
      {children}
    </Tag>
  );
}

// ---------- Icons (minimal line) ----------
type IconP = { className?: string };
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const IcSearch = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg>
);
export const IcBag = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="M6 8h12l1.2 12.2a1.6 1.6 0 0 1-1.6 1.8H6.4a1.6 1.6 0 0 1-1.6-1.8Z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></svg>
);
export const IcUser = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></svg>
);
export const IcMenu = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);
export const IcClose = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
);
export const IcChevron = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={cn("rtl:-scale-x-100", className)} {...S} aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
);
export const IcArrow = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={cn("rtl:-scale-x-100", className)} {...S} aria-hidden="true"><path d="M4 12h16m0 0-6-6m6 6-6 6" /></svg>
);
export const IcPlus = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
);
export const IcMinus = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="M5 12h14" /></svg>
);
export const IcTrash = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" /><path d="M10 11v6m4-6v6" /></svg>
);
export const IcCheck = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IcRuler = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><rect x="3" y="9" width="18" height="6" rx="1.5" /><path d="M7 9v3m4-3v3m4-3v3" /></svg>
);
export const IcTruck = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="M2.5 6h11v11h-11zM13.5 10h4l3 3.5V17h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>
);
export const IcSwap = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5" /></svg>
);
export const IcShield = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="M12 3 5 6v5c0 4.4 3 8.4 7 10 4-1.6 7-5.6 7-10V6Z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>
);
export const IcCoin = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v9m3-7.2c-.6-.9-1.8-1.4-3-1.4-1.7 0-3 .9-3 2.1 0 2.7 6 1.4 6 4.1 0 1.2-1.3 2.1-3 2.1-1.2 0-2.4-.5-3-1.4" /></svg>
);
export const IcBagSimple = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="M6 8h12l1 12H5Z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /><path d="M9.5 13.5c.6 1.6 1.5 2.5 2.5 2.5s1.9-.9 2.5-2.5" /></svg>
);
export const IcDoc = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><path d="M7 3.5h7L19 8v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" /><path d="M13.5 3.5V8H19M9.5 12h5m-5 4h5" /></svg>
);
export const IcGlobe = ({ className }: IconP) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.4 3.8 5.2 3.8 8.5s-1.3 6.1-3.8 8.5c-2.5-2.4-3.8-5.2-3.8-8.5s1.3-6.1 3.8-8.5Z" /></svg>
);

// ---------- Toasts ----------
export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-5 inset-x-0 z-[90] flex flex-col items-center gap-2 px-4 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="anim-toast pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-cream text-sm shadow-xl shadow-ink/20">
          <IcCheck className="h-4 w-4 text-cream-3" />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Modal ----------
export function Modal({
  open, onClose, children, label, wide = false,
}: { open: boolean; onClose: () => void; children: React.ReactNode; label: string; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={label}>
      <button aria-label="close" className="absolute inset-0 bg-ink/55 anim-fade-in cursor-default" onClick={onClose} />
      <div className={cn(
        "relative anim-fade-up w-full bg-cream sm:rounded-t-2xl sm:rounded-b-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto",
        wide ? "sm:max-w-3xl" : "sm:max-w-lg"
      )}>
        {children}
      </div>
    </div>
  );
}

// ---------- Size guide ----------
const ADULT = [
  ["sg.chest", "96–100", "102–108", "110–116", "118–124"],
  ["sg.waist", "82–86", "88–94", "96–102", "104–110"],
  ["sg.hips", "94–98", "100–106", "108–114", "116–122"],
  ["sg.length", "68", "70", "72", "74"],
];
const KIDS = [
  ["sg.chest", "58–62", "64–68", "70–74", "76–80"],
  ["sg.waist", "50–54", "56–60", "62–66", "68–72"],
  ["sg.hips", "58–62", "64–68", "70–74", "76–80"],
  ["sg.length", "50", "54", "58", "62"],
];

export function SizeGuideTable({ kids }: { kids: boolean }) {
  const { t } = useApp();
  const rows = kids ? KIDS : ADULT;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <caption className="sr-only">{t("sg.title")}</caption>
        <thead>
          <tr className="text-start">
            <th className="border-b border-ink/15 px-3 py-2 text-start font-medium text-mute">{t(kids ? "sg.kids" : "sg.adults")}</th>
            <th className="border-b border-ink/15 px-3 py-2 font-display text-lg">S</th>
            <th className="border-b border-ink/15 px-3 py-2 font-display text-lg">M</th>
            <th className="border-b border-ink/15 px-3 py-2 font-display text-lg">L</th>
            <th className="border-b border-ink/15 px-3 py-2 font-display text-lg">XL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border-b border-ink/10 px-3 py-2 text-mute">{t(r[0])}</td>
              {r.slice(1).map((v, j) => (
                <td key={j} className="border-b border-ink/10 px-3 py-2 tabular-nums" dir="ltr">{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-mute">cm</p>
    </div>
  );
}

// ---------- Buttons ----------
export function Btn({
  children, onClick, variant = "primary", className, disabled, type = "button",
}: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "outline" | "ghost" | "cream";
  className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[0.82rem] font-medium tracking-[0.14em] uppercase transition-all duration-300 select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        variant === "primary" && "bg-wine-800 text-cream hover:bg-wine-900 active:bg-wine-950 shadow-sm hover:shadow-md",
        variant === "outline" && "border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-cream",
        variant === "ghost" && "text-ink hover:text-wine-800",
        variant === "cream" && "bg-cream text-ink hover:bg-cream-2",
        className
      )}
    >
      {children}
    </button>
  );
}

// ---------- Section heading ----------
export function SectionHead({ kicker, title, center = false }: { kicker: string; title: string; center?: boolean }) {
  return (
    <div className={cn("mb-10 md:mb-14", center && "text-center")}>
      <Reveal>
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-wine-700 font-medium">{kicker}</p>
      </Reveal>
      <Reveal delay={100}>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium tracking-tight">{title}</h2>
      </Reveal>
    </div>
  );
}
