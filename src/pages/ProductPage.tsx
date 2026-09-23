import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";
import {
  colorInStock, discountPct, getProduct, money, productInStock, related, type View,
} from "../lib/products";
import { Garment } from "../components/Garment";
import { ProductCard } from "../components/ProductCard";
import { Btn, Reveal, IcCheck, IcRuler, IcTruck, IcSwap, IcArrow, Modal, SizeGuideTable } from "../components/ui";

const VIEWS: View[] = ["front", "back", "detail"];

export function ProductPage({ id }: { id: string }) {
  const { t, lang, navigate, addToCart, toast } = useApp();
  const p = getProduct(id);

  const [colorId, setColorId] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [viewIdx, setViewIdx] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [guide, setGuide] = useState(false);
  const galRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!p) return;
    const first = p.colors.find(colorInStock) ?? p.colors[0];
    setColorId(first?.id ?? null);
    setSize(null);
    setViewIdx(0);
    setErr(null);
    setAdded(false);
    galRef.current?.scrollTo({ left: 0 });
  }, [p]);

  const onGalScroll = () => {
    const el = galRef.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.min(2, Math.max(0, Math.round(Math.abs(el.scrollLeft) / el.clientWidth)));
    setViewIdx(i);
  };
  const jumpTo = (i: number) => {
    const el = galRef.current;
    if (!el) return;
    const mul = document.documentElement.dir === "rtl" ? -1 : 1;
    el.scrollTo({ left: i * el.clientWidth * mul, behavior: "smooth" });
  };

  const color = useMemo(() => p?.colors.find((c) => c.id === colorId) ?? null, [p, colorId]);

  if (!p) {
    return (
      <div className="pt-40 pb-32 text-center">
        <p className="font-display text-4xl">404</p>
        <p className="mt-3 text-mute">{lang === "ar" ? "المنتج غير موجود" : "Product not found"}</p>
        <Btn className="mt-8" onClick={() => navigate("/shop")}>{t("p.back")}</Btn>
      </div>
    );
  }

  const inStock = productInStock(p);
  const colorAvailable = !!color && colorInStock(color);
  const pct = discountPct(p);
  const colorTotal = color ? Object.values(color.stock).reduce((a, b) => a + b, 0) : 0;

  const chooseColor = (cid: string) => {
    setColorId(cid);
    setSize(null);
    setErr(null);
  };

  const onAdd = () => {
    if (!inStock) return;
    if (!color || !colorAvailable) { setErr(t("p.colorOutOfStock")); return; }
    if (!size) { setErr(t("p.selectSize")); return; }
    const res = addToCart(p, color.id, size);
    setErr(null);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
    toast(res === "added" ? t("toast.added", { n: 1 }) : t("toast.updated"));
  };

  return (
    <div className="pt-24 md:pt-32 pb-28 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-mute" aria-label="Breadcrumb">
          <a href="#/" className="hover:text-ink transition-colors">{lang === "ar" ? "الرئيسية" : "Home"}</a>
          <span aria-hidden="true">/</span>
          <a href={`#/shop?cat=${p.category}`} className="hover:text-ink transition-colors">{t(`nav.${p.category}`)}</a>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{p.name[lang]}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* ============ gallery (swipeable) ============ */}
          <div className="lg:sticky lg:top-28 self-start">
            <div className="relative overflow-hidden bg-cream-2">
              <div
                ref={galRef}
                onScroll={onGalScroll}
                className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
                aria-label={p.name[lang]}
              >
                {VIEWS.map((v) => (
                  <div key={v} className="w-full shrink-0 snap-center">
                    {color && (
                      <Garment
                        type={p.type}
                        color={color.hex}
                        view={v}
                        label={`${p.name[lang]} — ${color.name[lang]} — ${t(`p.gallery.${v}`)}`}
                        className="aspect-[4/5] h-auto w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute top-4 start-4 flex flex-col gap-1.5">
                {pct > 0 && <span className="bg-wine-800 text-cream text-[0.62rem] font-semibold uppercase tracking-[0.18em] px-2.5 py-1">{t("common.off", { n: pct })}</span>}
                {p.newArrival && <span className="bg-ink/85 text-cream text-[0.62rem] uppercase tracking-[0.18em] px-2.5 py-1">{t("p.newBadge")}</span>}
                {p.bestseller && <span className="bg-cream/90 text-ink border border-ink/10 text-[0.62rem] uppercase tracking-[0.18em] px-2.5 py-1">{t("p.bestBadge")}</span>}
              </div>
              {/* view dots */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                {VIEWS.map((v, i) => (
                  <span key={v} className={cn("h-1.5 rounded-full transition-all duration-300", viewIdx === i ? "w-5 bg-wine-800" : "w-1.5 bg-ink/25")} aria-hidden="true" />
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {VIEWS.map((v, i) => (
                <button
                  key={v}
                  onClick={() => jumpTo(i)}
                  aria-label={t(`p.gallery.${v}`)}
                  aria-pressed={viewIdx === i}
                  className={cn(
                    "overflow-hidden border transition-all",
                    viewIdx === i ? "border-wine-800 ring-1 ring-wine-800" : "border-ink/10 opacity-70 hover:opacity-100"
                  )}
                >
                  <Garment type={p.type} color={color?.hex ?? "#ccc"} view={v} label="" className="aspect-[4/5] w-full" />
                </button>
              ))}
            </div>
          </div>

          {/* ============ info ============ */}
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-wine-700">{t(`nav.${p.category}`)}</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium leading-tight">{p.name[lang]}</h1>

            <div className="mt-4 flex items-baseline gap-3">
              <p className="text-2xl font-medium tabular-nums">{money(p.price, lang)}</p>
              {p.oldPrice && <p className="text-lg text-mute line-through tabular-nums">{money(p.oldPrice, lang)}</p>}
            </div>

            <p className={cn("mt-3 inline-flex items-center gap-2 text-sm font-medium", !inStock ? "text-mute" : "text-ink")} aria-live="polite">
              <span className={cn("h-2 w-2 rounded-full", !inStock ? "bg-mute/50" : colorAvailable ? "bg-green-700" : "bg-amber-600")} />
              {!inStock ? t("p.outOfStock") : !colorAvailable ? t("p.colorOutOfStock") : colorTotal < 20 ? t("p.lowStock") : t("p.inStock")}
            </p>

            <p className="mt-5 leading-relaxed text-ink/75">{p.desc[lang]}</p>

            {!inStock && (
              <div className="mt-6 border border-ink/15 bg-cream-2/70 p-4 text-sm leading-relaxed">
                <p className="font-medium">{t("p.outTitle")}</p>
                <p className="mt-1 text-mute">{t("p.outSub")}</p>
              </div>
            )}

            {/* color */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[0.72rem] uppercase tracking-[0.25em]">{t("p.color")}: <span className="text-mute normal-case tracking-normal">{color?.name[lang]}</span></h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {p.colors.map((c) => {
                  const avail = colorInStock(c);
                  return (
                    <button
                      key={c.id}
                      onClick={() => chooseColor(c.id)}
                      aria-label={`${c.name[lang]}${avail ? "" : ` — ${t("p.outOfStock")}`} ${c.name.en}`}
                      aria-pressed={colorId === c.id}
                      title={c.name[lang]}
                      className={cn(
                        "relative h-11 w-11 rounded-full border border-ink/20 transition-all duration-300",
                        colorId === c.id ? "ring-2 ring-wine-800 ring-offset-2 ring-offset-cream scale-105" : "hover:scale-110",
                        !avail && "opacity-60"
                      )}
                      style={{ backgroundColor: c.hex }}
                    >
                      {!avail && (
                        <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
                          <span className="block h-px w-7 rotate-45 bg-ink/60" />
                        </span>
                      )}
                      {colorId === c.id && avail && (
                        <IcCheck className="absolute inset-0 m-auto h-5 w-5 text-cream drop-shadow" />
                      )}
                    </button>
                  );
                })}
              </div>
              {color && !colorAvailable && (
                <p className="mt-3 text-sm text-wine-800 bg-wine-100/70 border border-wine-200 px-3 py-2 rounded-sm" role="alert">
                  {t("p.colorOutOfStock")}
                </p>
              )}
            </div>

            {/* size */}
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <h3 className="text-[0.72rem] uppercase tracking-[0.25em]">{t("p.size")}</h3>
                <button onClick={() => setGuide(true)} className="inline-flex items-center gap-1.5 text-xs text-wine-800 underline underline-offset-4 hover:text-wine-900">
                  <IcRuler className="h-4 w-4" /> {t("p.sizeGuide")}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {p.sizes.map((s) => {
                  const stock = color?.stock[s] ?? 0;
                  const dis = !color || !colorAvailable || stock === 0;
                  return (
                    <button
                      key={s}
                      disabled={dis}
                      onClick={() => { setSize(s); setErr(null); }}
                      aria-pressed={size === s}
                      aria-label={`${s} — ${t(`sg.${s.toLowerCase()}`)}${dis ? ` (${t("p.outOfStock")})` : ""}`}
                      className={cn(
                        "h-12 min-w-16 px-3 border text-sm font-medium transition-all duration-200",
                        size === s ? "border-wine-800 bg-wine-800 text-cream" : "border-ink/25 hover:border-ink",
                        dis && "cursor-not-allowed opacity-35 line-through"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {err && (
              <p className="mt-4 text-sm text-wine-800 bg-wine-100/70 border border-wine-200 px-3 py-2 rounded-sm" role="alert">
                {err}
              </p>
            )}

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3">
              <Btn
                onClick={onAdd}
                disabled={!inStock || !colorAvailable}
                className={cn("w-full py-4 text-sm", added && "bg-green-800 hover:bg-green-800")}
              >
                {added ? <><IcCheck className="h-5 w-5" /> {t("p.added")}</> : !inStock ? t("p.outOfStock") : t("p.add")}
              </Btn>
            </div>

            {/* info rows */}
            <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
              {[
                ["p.description", null],
                ["p.fabric", null],
              ].map((row) => (
                <div key={row[0]} className="grid grid-cols-[110px_1fr] gap-4 py-4 text-sm">
                  <h4 className="text-[0.68rem] uppercase tracking-[0.22em] text-mute pt-0.5">{t(row[0] as string)}</h4>
                  <p className="leading-relaxed text-ink/75">{row[0] === "p.description" ? p.desc[lang] : p.fabric[lang]}</p>
                </div>
              ))}
              <div className="grid grid-cols-[110px_1fr] gap-4 py-4 text-sm">
                <h4 className="text-[0.68rem] uppercase tracking-[0.22em] text-mute pt-0.5">{t("p.care")}</h4>
                <p className="leading-relaxed text-ink/75">{p.care[lang]}</p>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-4 py-4 text-sm">
                <span className="flex items-start gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-mute"><IcTruck className="h-4 w-4 mt-0.5" />{t("p.delivery")}</span>
                <p className="leading-relaxed text-ink/75">{t("p.delivery.text")}</p>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-4 py-4 text-sm">
                <span className="flex items-start gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-mute"><IcSwap className="h-4 w-4 mt-0.5" />{t("p.exchange")}</span>
                <p className="leading-relaxed text-ink/75">{t("p.exchange.text")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* related */}
        <section className="mt-24">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-medium">{t("p.related")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related(p).map((rp, i) => (
              <Reveal key={rp.id} delay={i * 80}>
                <ProductCard p={rp} onClick={() => navigate(`/product/${rp.id}`)} />
              </Reveal>
            ))}
          </div>
          <div className="mt-14">
            <Btn variant="outline" onClick={() => navigate(`/shop?cat=${p.category}`)}>
              {t("p.back")} <IcArrow className="h-4 w-4 rotate-180" />
            </Btn>
          </div>
        </section>
      </div>

      {/* mobile sticky add bar */}
      <div className={cn(
        "fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-ink/10 bg-cream/95 backdrop-blur px-4 py-3 transition-transform duration-400",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      )}>
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.name[lang]}</p>
            <p className="text-xs text-mute tabular-nums">
              {money(p.price, lang)}
              {color && ` · ${color.name[lang]}`}
              {size && ` · ${size}`}
            </p>
          </div>
          <Btn onClick={onAdd} disabled={!inStock || !colorAvailable} className="shrink-0 px-6 py-3">
            {added ? <><IcCheck className="h-4 w-4" /> {t("p.added")}</> : t("p.add")}
          </Btn>
        </div>
      </div>

      {/* size guide */}
      <Modal open={guide} onClose={() => setGuide(false)} label={t("sg.title")} wide>
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl">{t("sg.title")}</h2>
            <button onClick={() => setGuide(false)} className="p-2 text-sm text-mute hover:text-ink" aria-label={t("sg.close")}>{t("sg.close")}</button>
          </div>
          <p className="mt-2 text-sm text-mute">{t("sg.sub")}</p>
          <div className="mt-6 space-y-6">
            <SizeGuideTable kids={false} />
            <SizeGuideTable kids />
          </div>
        </div>
      </Modal>
    </div>
  );
}
