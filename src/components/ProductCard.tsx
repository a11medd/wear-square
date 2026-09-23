import type { MouseEvent } from "react";
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
  const totalStock = p.colors.reduce((a, c) => a + Object.values(c.stock).reduce((x, y) => x + y, 0), 0);

  const quickAdd = (e: MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    const c = firstColor;
    if (!c) return;
    const size = p.sizes.find((s) => (c.stock[s] ?? 0) > 0);
    if (!size) return;
    const res = addToCart(p, c.id, size);
    toast(res === "added" ? t("toast.added", { n: 1 }) : t("toast.updated"));
  };

  return (
    <article
      className={cn("group relative flex flex-col cursor-pointer transition-colors duration-500", dense && "min-w-[78vw] sm:min-w-0")}
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
      aria-label={p.name[lang]}
    >
      {/* image */}
      <div className="relative overflow-hidden bg-cream-2 transition-colors duration-500 group-hover:bg-cream-3/70">
        <div className="card-img-wrap relative aspect-[4/5]">
          <div className="card-zoom absolute inset-0">
            <Garment type={p.type} color={firstColor.hex} view="front" label={p.name[lang]} className="h-full w-full" />
          </div>
          <div className="crossfade-b card-zoom absolute inset-0">
            <Garment type={p.type} color={firstColor.hex} view="back" label={`${p.name[lang]} — back`} className="h-full w-full" />
          </div>
        </div>

        {/* badges */}
        <div className="absolute top-3 start-3 flex flex-col items-start gap-1.5">
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
        {p.bestseller && inStock && (
          <span className="absolute top-3 end-3 bg-cream/90 text-ink text-[0.6rem] font-medium uppercase tracking-[0.18em] px-2.5 py-1 border border-ink/10">
            {t("p.bestBadge")}
          </span>
        )}

        {/* quick add */}
        {inStock && (
          <button
            onClick={quickAdd}
            aria-label={`${t("p.add")} — ${p.name[lang]}`}
            className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center gap-2 bg-wine-900/95 text-cream py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] opacity-0 translate-y-3 transition-all duration-400 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-ink"
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
              <span
                key={c.id}
                title={c.name[lang]}
                className={cn("h-3.5 w-3.5 rounded-full border border-ink/20 transition-transform group-hover:scale-110", c.id === firstColor.id && "ring-1 ring-wine-800 ring-offset-1 ring-offset-cream")}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <p className={cn("text-[0.68rem] tracking-wide", inStock ? (totalStock < 20 ? "text-wine-700" : "text-mute") : "text-mute/70")}>
            {!inStock ? t("p.outOfStock") : totalStock < 20 ? t("p.lowStock") : t("p.inStock")}
          </p>
        </div>
      </div>
    </article>
  );
}
