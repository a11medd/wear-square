import { useEffect, useMemo, useState } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";
import { PRODUCTS, SIZES, FILTER_COLORS, productInStock, searchProducts, type Category, type Product } from "../lib/products";
import { ProductCard } from "../components/ProductCard";
import { Reveal, Btn, IcClose, IcBag } from "../components/ui";

const MAXP = 1200;

const CAT_BANNERS: Record<Category, { img: string; subtitle: { en: string; ar: string } }> = {
  men: {
    img: "/categories/men_model.jpg",
    subtitle: { en: "Tailored everyday staples, Oxford shirts & casual chinos", ar: "قمصان أكسفورد وبناطيل تشينو وقطع أساسية مريحة" },
  },
  women: {
    img: "/categories/women_model.jpg",
    subtitle: { en: "Midi wrap dresses, linen shirts & quiet luxury silhouettes", ar: "فساتين ملفوفة أنيقة، قمصان كتان وتصاميم راقية" },
  },
  kids: {
    img: "/categories/kids_model.jpg",
    subtitle: { en: "Soft organic cotton sets built for free movement and play", ar: "أطقم قطنية ناعمة وهوديز مريحة لحرية الحركة واللعب" },
  },
};

interface Filters {
  cat: Category | "";
  flagNew: boolean;
  flagSale: boolean;
  sizes: Set<string>;
  colors: Set<string>;
  maxPrice: number;
  inStockOnly: boolean;
  saleOnly: boolean;
  sort: "featured" | "cheap" | "dear" | "new";
}

function readInitial(query: URLSearchParams): Filters {
  const cat = query.get("cat");
  return {
    cat: cat === "men" || cat === "women" || cat === "kids" ? cat : "",
    flagNew: query.get("flag") === "new",
    flagSale: query.get("flag") === "sale",
    sizes: new Set(),
    colors: new Set(),
    maxPrice: MAXP,
    inStockOnly: false,
    saleOnly: query.get("flag") === "sale",
    sort: "featured",
  };
}

export function Shop() {
  const { t, lang, route, navigate } = useApp();
  const q = route.query.get("q") || "";
  const [f, setF] = useState<Filters>(() => readInitial(route.query));
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState<Filters | null>(null);

  // re-init when navigating between shop views
  useEffect(() => {
    setF(readInitial(route.query));
  }, [route]);

  const apply = (next: Filters) => setF(next);
  const openSheet = () => { setDraft(structuredCloneFilters(f)); setSheet(true); };
  function structuredCloneFilters(x: Filters): Filters {
    return { ...x, sizes: new Set(x.sizes), colors: new Set(x.colors) };
  }

  const results = useMemo(() => {
    let list: Product[] = PRODUCTS.filter((p) => {
      if (f.cat && p.category !== f.cat) return false;
      if (f.flagNew && !p.newArrival) return false;
      if (f.flagSale && !p.oldPrice) return false;
      if (f.saleOnly && !p.oldPrice) return false;
      if (f.inStockOnly && !productInStock(p)) return false;
      if (p.price > f.maxPrice) return false;
      if (f.sizes.size && !p.colors.some((c) => p.sizes.some((s) => f.sizes.has(s) && (c.stock[s] ?? 0) > 0))) return false;
      if (f.colors.size && !p.colors.some((c) => f.colors.has(c.family))) return false;
      return true;
    });
    if (q.trim()) list = list.filter((p) => searchProducts(q).includes(p));
    const score = (p: Product) => (p.featured ? 2 : 0) + (p.bestseller ? 1 : 0) + (p.newArrival ? 0.5 : 0);
    list = [...list].sort((a, b) => {
      if (f.sort === "cheap") return a.price - b.price;
      if (f.sort === "dear") return b.price - a.price;
      if (f.sort === "new") return Number(!!b.newArrival) - Number(!!a.newArrival) || score(b) - score(a);
      return score(b) - score(a);
    });
    return list;
  }, [f, q]);

  const activeCount =
    f.sizes.size + f.colors.size + (f.inStockOnly ? 1 : 0) + (f.saleOnly ? 1 : 0) + (f.maxPrice < MAXP ? 1 : 0);

  const title = q
    ? `“${q}”`
    : f.flagNew ? t("nav.new") : f.flagSale ? t("nav.sale") : t(`shop.title.${f.cat || "all"}`);

  const toggleSet = (set: Set<string>, v: string) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v); else n.add(v);
    return n;
  };

  const FilterPanel = ({ value, onChange }: { value: Filters; onChange: (f: Filters) => void }) => (
    <div className="space-y-7">
      {/* category */}
      <div>
        <h4 className="mb-3 text-[0.7rem] uppercase tracking-[0.25em] text-mute">{t("shop.category")}</h4>
        <div className="flex flex-wrap gap-2">
          {(["", "men", "women", "kids"] as const).map((c) => (
            <button
              key={c || "all"}
              onClick={() => onChange({ ...value, cat: c })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                value.cat === c ? "border-wine-800 bg-wine-800 text-cream" : "border-ink/20 hover:border-ink"
              )}
            >
              {c ? t(`nav.${c}`) : t("shop.all")}
            </button>
          ))}
        </div>
      </div>
      {/* size */}
      <div>
        <h4 className="mb-3 text-[0.7rem] uppercase tracking-[0.25em] text-mute">{t("shop.size")}</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ ...value, sizes: toggleSet(value.sizes, s) })}
              aria-pressed={value.sizes.has(s)}
              className={cn(
                "h-11 w-14 border text-sm transition-colors",
                value.sizes.has(s) ? "border-wine-800 bg-wine-800 text-cream" : "border-ink/20 hover:border-ink"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {/* color */}
      <div>
        <h4 className="mb-3 text-[0.7rem] uppercase tracking-[0.25em] text-mute">{t("shop.color")}</h4>
        <div className="flex flex-wrap gap-2.5">
          {FILTER_COLORS.map((c) => (
            <button
              key={c.id}
              title={lang === "ar" ? c.ar : c.en}
              aria-label={lang === "ar" ? c.ar : c.en}
              aria-pressed={value.colors.has(c.id)}
              onClick={() => onChange({ ...value, colors: toggleSet(value.colors, c.id) })}
              className={cn(
                "h-8 w-8 rounded-full border border-ink/20 transition-all",
                value.colors.has(c.id) ? "ring-2 ring-wine-800 ring-offset-2 ring-offset-cream scale-105" : "hover:scale-110"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
      {/* price */}
      <div>
        <h4 className="mb-3 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.25em] text-mute">
          {t("shop.price")}
          <span className="normal-case tracking-normal text-ink font-medium">{t("shop.price.upTo", { n: f.maxPrice.toLocaleString("en-US") })}</span>
        </h4>
        <input
          type="range" min={200} max={MAXP} step={50}
          value={value.maxPrice}
          onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
          className="w-full"
          aria-label={t("shop.price")}
        />
      </div>
      {/* availability */}
      <div>
        <h4 className="mb-3 text-[0.7rem] uppercase tracking-[0.25em] text-mute">{t("shop.availability")}</h4>
        <label className="flex items-center gap-3 py-1 cursor-pointer">
          <input type="checkbox" checked={value.inStockOnly} onChange={(e) => onChange({ ...value, inStockOnly: e.target.checked })} className="h-4 w-4 accent-wine-800" />
          <span className="text-sm">{t("shop.inStock")}</span>
        </label>
        <label className="flex items-center gap-3 py-1 cursor-pointer">
          <input type="checkbox" checked={value.saleOnly} onChange={(e) => onChange({ ...value, saleOnly: e.target.checked })} className="h-4 w-4 accent-wine-800" />
          <span className="text-sm">{t("shop.saleOnly")}</span>
        </label>
      </div>
      {activeCount > 0 && (
        <button onClick={() => onChange({ ...readInitial(route.query), maxPrice: MAXP })} className="text-sm text-wine-800 underline underline-offset-4 hover:text-wine-900">
          {t("shop.clear")}
        </button>
      )}
    </div>
  );

  return (
    <div className="pt-24 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <Reveal>
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-wine-700">{t("shop.sub")}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-5xl md:text-6xl font-medium">{title}</h1>
            <p className="text-sm text-mute" aria-live="polite">{t("shop.results", { n: results.length })}</p>
          </div>
          {f.cat && CAT_BANNERS[f.cat] && (
            <div className="mt-6 relative h-40 sm:h-52 md:h-60 rounded-sm overflow-hidden border border-ink/10">
              <img
                src={CAT_BANNERS[f.cat].img}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-wine-950/85 via-wine-950/50 to-transparent rtl:bg-gradient-to-l" />
              <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-7 text-cream">
                <span className="text-[0.65rem] sm:text-xs uppercase tracking-[0.25em] text-cream/70 mb-1">
                  {lang === "ar" ? "تشكيلة حصرية" : "Collection Spotlight"}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight">
                  {t(`family.${f.cat}`)}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-cream/80 max-w-md">
                  {CAT_BANNERS[f.cat].subtitle[lang]}
                </p>
              </div>
            </div>
          )}
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <h3 className="mb-6 text-[0.7rem] uppercase tracking-[0.3em] text-ink">{t("shop.filters")}</h3>
              <FilterPanel value={f} onChange={apply} />
            </div>
          </aside>

          {/* grid */}
          <div>
            {/* mobile sort row */}
            <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
              <button
                onClick={openSheet}
                className="inline-flex items-center gap-2 border border-ink/25 px-4 py-2.5 text-sm hover:border-ink transition-colors"
              >
                {t("shop.mobileFilters")}
                {activeCount > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-wine-800 text-[0.65rem] text-cream">{activeCount}</span>}
              </button>
              <select
                value={f.sort}
                onChange={(e) => apply({ ...f, sort: e.target.value as Filters["sort"] })}
                aria-label={t("shop.sort")}
                className="border border-ink/25 bg-cream px-3 py-2.5 text-sm"
              >
                <option value="featured">{t("shop.sort.featured")}</option>
                <option value="new">{t("shop.sort.new")}</option>
                <option value="cheap">{t("shop.sort.cheap")}</option>
                <option value="dear">{t("shop.sort.dear")}</option>
              </select>
            </div>

            {/* desktop sort */}
            <div className="mb-6 hidden lg:flex justify-end">
              <select
                value={f.sort}
                onChange={(e) => apply({ ...f, sort: e.target.value as Filters["sort"] })}
                aria-label={t("shop.sort")}
                className="border border-ink/25 bg-cream px-4 py-2.5 text-sm"
              >
                <option value="featured">{t("shop.sort")}: {t("shop.sort.featured")}</option>
                <option value="new">{t("shop.sort")}: {t("shop.sort.new")}</option>
                <option value="cheap">{t("shop.sort")}: {t("shop.sort.cheap")}</option>
                <option value="dear">{t("shop.sort")}: {t("shop.sort.dear")}</option>
              </select>
            </div>

            {results.length === 0 ? (
              <div className="grid place-items-center border border-dashed border-ink/20 py-24 text-center px-6">
                <IcBag className="h-12 w-12 text-ink/25" />
                <h3 className="mt-5 font-display text-2xl">{t("shop.noResults")}</h3>
                <p className="mt-2 max-w-sm text-sm text-mute">{t("shop.noResults.sub")}</p>
                <Btn variant="outline" className="mt-6" onClick={() => apply({ ...readInitial(route.query), maxPrice: MAXP, sort: "featured" })}>
                  {t("shop.clear")}
                </Btn>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                {results.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 4) * 70}>
                    <ProductCard p={p} onClick={() => navigate(`/product/${p.id}`)} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* mobile bottom sheet */}
      <div className={cn("fixed inset-0 z-[70] lg:hidden", !sheet && "pointer-events-none")}>
        <button aria-label={t("common.close")} className={cn("absolute inset-0 bg-ink/60 transition-opacity duration-400", sheet ? "opacity-100" : "opacity-0")} onClick={() => setSheet(false)} />
        <div className={cn("ws-sheet absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-cream p-6 pb-24", sheet && "ws-sheet-open")}>
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink/20" />
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-2xl">{t("shop.mobileFilters")}</h3>
            <button onClick={() => setSheet(false)} className="p-2 -m-2 hover:bg-cream-2 rounded-full" aria-label={t("common.close")}>
              <IcClose className="h-5 w-5" />
            </button>
          </div>
          {draft && (
            <>
              <FilterPanel value={draft} onChange={setDraft} />
              <div className="mt-8">
                <Btn className="w-full" onClick={() => { apply(draft); setSheet(false); }}>
                  {t("shop.apply", { n: results.length })}
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
