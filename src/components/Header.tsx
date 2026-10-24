import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";
import { searchProducts, type Product } from "../lib/products";
import { Logo, IcSearch, IcBag, IcUser, IcMenu, IcClose, IcGlobe, IcArrow } from "./ui";
import { ProductCard } from "./ProductCard";

const POPULAR = ["Tee", "Hoodie", "Dress", "Jeans", "فستان", "تيشيرت", "هودي"];

export function Header({ overHero }: { overHero: boolean }) {
  const { t, lang, setLang, cartCount, navigate, route, searchOpen, setSearchOpen, drawerOpen, setDrawerOpen, setCartDrawerOpen } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const solid = !overHero || scrolled || drawerOpen || searchOpen;

  const links = [
    { to: "/shop?cat=men", label: t("nav.men"), key: "men" },
    { to: "/shop?cat=women", label: t("nav.women"), key: "women" },
    { to: "/shop?cat=kids", label: t("nav.kids"), key: "kids" },
    { to: "/shop?flag=new", label: t("nav.new"), key: "new" },
    { to: "/shop?flag=sale", label: t("nav.sale"), key: "sale" },
  ];
  const activeKey = useMemo(() => {
    if (route.path !== "shop") return null;
    const cat = route.query.get("cat");
    if (cat === "men" || cat === "women" || cat === "kids") return cat;
    if (route.query.get("flag") === "new") return "new";
    if (route.query.get("flag") === "sale") return "sale";
    return null;
  }, [route]);

  const go = (to: string) => {
    setDrawerOpen(false);
    navigate(to);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid ? "bg-wine-900/95 backdrop-blur-md shadow-lg shadow-wine-950/20" : "bg-transparent"
        )}
      >
        <div className={cn("mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 transition-all duration-500", solid ? "h-16 md:h-[4.5rem]" : "h-20 md:h-24")}>
          <div className="flex items-center gap-2 lg:gap-3">
            <button className="lg:hidden text-cream p-2 -ms-2" aria-label={t("nav.menu")} onClick={() => setDrawerOpen(true)}>
              <IcMenu className="h-6 w-6" />
            </button>
            <a href="#/" aria-label="Wear Square — home" className={cn("transition-opacity hover:opacity-80", !solid && "opacity-95")}>
              <Logo light={solid ? true : true} className={solid ? "" : "scale-95"} />
            </a>
          </div>

          <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
            {links.map((l) => (
              <a
                key={l.key}
                href={`#${l.to}`}
                className={cn(
                  "nav-link text-[0.78rem] font-medium tracking-[0.2em] uppercase transition-colors",
                  activeKey === l.key ? "active text-cream" : "text-cream/75 hover:text-cream"
                )}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1 text-cream">
            <button
              aria-label={lang === "en" ? "التبديل إلى العربية" : "Switch to English"}
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              data-testid="header-lang-btn"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-cream/30 px-3 py-1.5 text-[0.72rem] font-medium tracking-wider hover:bg-cream/10 transition-colors"
            >
              <IcGlobe className="h-4 w-4" />
              {lang === "en" ? "عربي" : "EN"}
            </button>
            <button
              className="p-2.5 hover:bg-cream/10 rounded-full transition-colors"
              aria-label={t("nav.search")}
              data-testid="header-search-btn"
              onClick={() => setSearchOpen(true)}
            >
              <IcSearch className="h-5 w-5" />
            </button>
            <button
              className="p-2.5 hover:bg-cream/10 rounded-full transition-colors hidden sm:block"
              aria-label={t("nav.account")}
              data-testid="header-account-btn"
              onClick={() => go("/account")}
            >
              <IcUser className="h-5 w-5" />
            </button>
            <button
              className="relative p-2.5 hover:bg-cream/10 rounded-full transition-colors"
              aria-label={`${t("nav.cart")} (${cartCount})`}
              data-testid="header-cart-btn"
              onClick={() => setCartDrawerOpen(true)}
            >
              <IcBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span key={cartCount} className="anim-pop absolute -top-0.5 -end-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-cream px-1 text-[0.65rem] font-bold text-wine-900">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <div className={cn("fixed inset-0 z-[60] lg:hidden", !drawerOpen && "pointer-events-none")}>
        <button
          aria-label={t("nav.close")}
          className={cn("absolute inset-0 bg-ink/60 transition-opacity duration-500", drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawerOpen(false)}
        />
        <aside className={cn("ws-drawer absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col bg-wine-950 text-cream", drawerOpen && "ws-drawer-open")} aria-label={t("nav.menu")}>
          <div className="flex items-center justify-between border-b border-cream/10 px-5 py-4">
            <Logo light />
            <button aria-label={t("nav.close")} className="p-2 hover:bg-cream/10 rounded-full" onClick={() => setDrawerOpen(false)}>
              <IcClose className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
            {links.map((l, i) => (
              <a
                key={l.key}
                href={`#${l.to}`}
                onClick={() => setDrawerOpen(false)}
                style={{ transitionDelay: drawerOpen ? `${80 + i * 50}ms` : "0ms" }}
                className={cn(
                  "flex items-center justify-between border-b border-cream/10 py-4 font-display text-2xl transition-all duration-500",
                  drawerOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
                  activeKey === l.key ? "text-cream" : "text-cream/70"
                )}
              >
                {l.label}
                <IcArrow className="h-5 w-5 opacity-50" />
              </a>
            ))}
            <a href="#/account" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 py-4 font-display text-2xl text-cream/70">
              <IcUser className="h-6 w-6" /> {t("nav.account")}
            </a>
          </nav>
          <div className="border-t border-cream/10 px-5 py-5">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-4 py-2 text-sm hover:bg-cream/10 transition-colors"
            >
              <IcGlobe className="h-4 w-4" />
              {lang === "en" ? "العربية" : "English"}
            </button>
          </div>
        </aside>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} go={go} popular={POPULAR} onResults={(p) => go(`/product/${p.id}`)} onMore={(q) => go(`/shop?q=${encodeURIComponent(q)}`)} t={t} />
    </>
  );
}

// ---------- search overlay ----------
function SearchOverlay({
  open, onClose, popular, t, onResults, onMore,
}: {
  open: boolean; onClose: () => void; go: (to: string) => void;
  popular: string[]; onResults: (p: Product) => void; onMore: (q: string) => void;
  t: ReturnType<typeof useApp>["t"];
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchProducts(q), [q]);
  const showResults = q.trim().length > 0;

  useEffect(() => {
    if (open) {
      setQ("");
      document.body.style.overflow = "hidden";
      window.setTimeout(() => inputRef.current?.focus(), 60);
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      document.addEventListener("keydown", onKey);
      return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={t("search.title")}>
      <button aria-label={t("common.close")} className="absolute inset-0 bg-ink/60 anim-fade-in cursor-default" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 bg-cream shadow-2xl anim-fade-up max-h-[92vh] overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12">
          <div className="flex items-center gap-3 border-b-2 border-ink pb-3">
            <IcSearch className="h-6 w-6 text-wine-800" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search.placeholder")}
              aria-label={t("search.title")}
              className="w-full bg-transparent text-lg md:text-2xl font-display outline-none placeholder:text-mute/60"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-xs uppercase tracking-widest text-mute hover:text-ink" aria-label={t("search.clear")}>
                {t("search.clear")}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-cream-2 rounded-full" aria-label={t("common.close")}>
              <IcClose className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-3 text-xs tracking-wider text-mute uppercase">{t("search.hint")}</p>

          {!showResults && (
            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-mute mb-3">{t("search.popular")}</p>
              <div className="flex flex-wrap gap-2">
                {popular.map((w) => (
                  <button key={w} onClick={() => setQ(w)} className="rounded-full border border-ink/20 px-4 py-2 text-sm hover:border-wine-800 hover:text-wine-800 transition-colors">
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showResults && results.length > 0 && (
            <>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-mute">{t("search.results", { n: results.length })}</p>
                <button onClick={() => onMore(q)} className="text-sm font-medium text-wine-800 hover:underline inline-flex items-center gap-1">
                  {t("best.viewAll")} <IcArrow className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 pb-6">
                {results.slice(0, 6).map((p) => (
                  <ProductCard key={p.id} p={p} onClick={() => onResults(p)} />
                ))}
              </div>
            </>
          )}

          {showResults && results.length === 0 && (
            <div className="mt-14 pb-16 text-center">
              <p className="font-display text-2xl">“{q}”</p>
              <p className="mt-3 text-lg text-ink/80">{t("search.noResults", { q })}</p>
              <p className="mt-1 text-sm text-mute">{t("search.noResults.sub")}</p>
              <button onClick={() => setQ("")} className="mt-6 rounded-full border border-ink/30 px-6 py-2.5 text-sm hover:bg-ink hover:text-cream transition-colors">
                {t("search.clear")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
