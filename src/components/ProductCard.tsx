import { useState, type MouseEvent } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";
import { discountPct, firstAvailableColor, money, productInStock, type Product } from "../lib/products";
import { Garment } from "./Garment";
import { IcPlus } from "./ui";

export function ProductCard({ p, onClick, dense = false }: { p: Product; onClick?: () => void; dense?: boolean }) {
  const { t, lang, addToCart, toast } = useApp();
  const inStock = productInStock(p);
  const pct = discountPct(p);
  const firstColor = firstAvailableColor(p) ?? p.colors[0];
  const [activeColor, setActiveColor] = useState(firstColor);
  const totalStock = p.colors.reduce((a, c) => a + Object.values(c.stock).reduce((x, y) => x + y, 0), 0);

  const displayImage = activeColor?.image || p.image;

  const quickAdd = (e: MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    const c = activeColor || firstColor;
    if (!c) return;
    const size = p.sizes.find((s) => (c.stock[s] ?? 0) > 0);
    if (!size) return;
    const res = addToCart(p, c.id, size);
    toast(res === "added" ? t("toast.added", { n: 1 }) : t("toast.updated"));
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-sm p-1.5 border border-ink/10 bg-cream/70 hover:border-wine-800/40 hover:bg-cream transition-all duration-500",
        dense && "min-w-[78vw] sm:min-w-0"
      )}
      data-testid="product-card"
    >
      {/* image inner core */}
      <div className="relative overflow-hidden bg-cream-2 rounded-xs transition-colors duration-500 group-hover:bg-cream-3/60">
        <div
          onClick={onClick}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
          tabIndex={0}
          role="link"
          aria-label={p.name[lang]}
          className="card-img-wrap relative aspect-[4/5] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-800"
        >
          {displayImage ? (
            <div className="card-zoom absolute inset-0">
              <img
                src={displayImage}
                alt={`${p.name[lang]} - ${activeColor?.name[lang] || ""}`}
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          ) : (
            <>
              <div className="card-zoom absolute inset-0">
                <Garment type={p.type} color={activeColor?.hex || firstColor.hex} view="front" label={p.name[lang]} className="h-full w-full" />
              </div>
              <div className="crossfade-b card-zoom absolute inset-0">
                <Garment type={p.type} color={activeColor?.hex || firstColor.hex} view="back" label={`${p.name[lang]} — back`} className="h-full w-full" />
              </div>
            </>
          )}
        </div>

        {/* badges */}
        <div className="pointer-events-none absolute top-3 start-3 flex flex-col items-start gap-1.5">
          {!inStock && (
            <span className="bg-ink/85 text-cream text-[0.62rem] font-medium uppercase tracking-[0.18em] px-2.5 py-1">{t("p.outOfStock")}</span>
          )}
          {inStock && pct > 0 && (
            <span className="bg-wine-800 text-cream text-[0.62rem] font-semibold uppercase tracking-[0.18em] px-2.5 py-1">
              {t("common.off", { n: pct })}
            </span>
          )}
          {inStock && p.newArrival && pct === 0 && (
            <span className="bg-ink/85 text-cream text-[0.62rem] font-medium uppercase tracking-[0.18em] px-2.5 py-1">{t("p.newBadge")}</span>
          )}
        </div>
        {/* 3D Interactive Badge */}
        <span
          className="pointer-events-none absolute top-3 end-3 flex items-center gap-1 bg-ink/80 backdrop-blur-xs text-cream text-[0.58rem] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border border-cream/25 shadow-xs"
          title={lang === "ar" ? "معاينة تفاعلية ثلاثية الأبعاد 3D" : "Interactive 3D view"}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          3D
        </span>
        {p.bestseller && inStock && (
          <span className="pointer-events-none absolute bottom-3 start-3 bg-cream/95 text-ink text-[0.58rem] font-medium uppercase tracking-[0.16em] px-2 py-0.5 border border-ink/10 shadow-xs">
            {t("p.bestBadge")}
          </span>
        )}

        {/* quick add */}
        {inStock && (
          <button
            type="button"
            onClick={quickAdd}
            aria-label={`${t("p.add")} — ${p.name[lang]}`}
            data-testid="quick-add-btn"
            className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center gap-2 bg-wine-900/95 text-cream py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] opacity-0 translate-y-3 transition-all duration-400 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-ink shadow-md"
          >
            <IcPlus className="h-4 w-4" /> {t("p.add")}
          </button>
        )}
      </div>

      {/* info */}
      <div className="flex flex-1 flex-col pt-3.5 gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-[0.95rem] leading-snug">{p.name[lang]}</h3>
          <div className="text-end shrink-0">
            <p className="font-medium tabular-nums">{money(p.price, lang)}</p>
            {p.oldPrice && <p className="text-xs text-mute line-through tabular-nums">{money(p.oldPrice, lang)}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1.5" aria-label={t("p.color")}>
            {p.colors.map((c) => (
              <button
                type="button"
                key={c.id}
                title={c.name[lang]}
                onClick={(e) => { e.stopPropagation(); setActiveColor(c); }}
                onMouseEnter={() => setActiveColor(c)}
                className={cn(
                  "h-4 w-4 rounded-full border border-ink/20 transition-all cursor-pointer hover:scale-125 focus:outline-none",
                  c.id === (activeColor?.id || firstColor.id)
                    ? "ring-2 ring-wine-800 ring-offset-1 ring-offset-cream scale-110 shadow-xs"
                    : "opacity-80 hover:opacity-100"
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <p className={cn("text-[0.68rem] tracking-wide", inStock ? (totalStock < 20 ? "text-wine-700" : "text-mute") : "text-mute/70")}>
            {!inStock ? t("p.outOfStock") : totalStock < 20 ? t("p.lowStock") : t("p.inStock")}
          </p>
        </div>
      </div>
    </div>
  );
}
