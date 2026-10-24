import { useRef, useState } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";
import { PRODUCTS, type Category } from "../lib/products";
import { ProductCard } from "../components/ProductCard";
import { Reveal, SectionHead, Btn, IcArrow, IcShield, IcTruck, IcSwap, IcCoin, IcBagSimple, IcDoc } from "../components/ui";

const px = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

const FAMILY: { key: Category; img: string; alt: { en: string; ar: string } }[] = [
  {
    key: "men",
    img: "/categories/men_model.jpg",
    alt: { en: "Men collection — model in Oxford cotton shirt", ar: "أزياء الرجال — عارض يرتدي قميص أكسفورد القطني وبنطال تشينو من التشكيلة" },
  },
  {
    key: "women",
    img: "/categories/women_model.jpg",
    alt: { en: "Women collection — model in terracotta wrap dress", ar: "أزياء النساء — عارضة ترتدي الفستان الملفوف بلون التيراكوتا من التشكيلة" },
  },
  {
    key: "kids",
    img: "/categories/kids_model.jpg",
    alt: { en: "Kids collection — model in organic cotton hoodie", ar: "أزياء الأطفال — طفل يرتدي هودي وبنطال قطني مريح من التشكيلة" },
  },
];

export function Home() {
  const { t, lang, navigate } = useApp();
  const newOnes = PRODUCTS.filter((p) => p.newArrival).slice(0, 6);
  const best = PRODUCTS.filter((p) => p.bestseller).slice(0, 8);
  const railRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const scrollRail = (dirn: number) => {
    const el = railRef.current;
    if (!el) return;
    const w = el.clientWidth * 0.8;
    el.scrollBy({ left: dirn * w * (lang === "ar" ? -1 : 1), behavior: "smooth" });
  };

  return (
    <div>
      {/* ================= HERO COMMERCIAL VIDEO SHOWCASE ================= */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink" aria-label="Wear Square brand commercial film">
        {/* Brand Commercial Video - Fullscreen, unobstructed and vivid */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          poster="/images/campaign/scene1_family.jpg"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-100 contrast-100"
          data-testid="hero-commercial-video"
          key="wear-square-hero-film"
        >
          <source src="/videos/hero_family.webm" type="video/webm" />
          <source src="/videos/hero_family.mp4" type="video/mp4" />
        </video>

        {/* Minimal subtle gradient for top navigation bar legibility only */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/80 via-ink/25 to-transparent pointer-events-none" />

        {/* Subtle Bottom Vignette for Scroll Indicator Readability */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent pointer-events-none" />

        {/* Minimalist & Prestigious Scroll Down Button */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("campaign-editorial");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          aria-label={lang === "ar" ? "الانتقال للأسفل واستكشاف التشكيلة" : "Scroll down to explore collection"}
          className="pointer-events-auto absolute bottom-6 start-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white/80 hover:text-white transition-all duration-300 group cursor-pointer"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase font-light text-white/75 group-hover:text-white transition-colors">
            {lang === "ar" ? "استكشف التشكيلة" : "Scroll to explore"}
          </span>
          <div className="w-6 h-10 rounded-full border border-white/35 bg-black/25 backdrop-blur-md flex items-start justify-center p-1.5 group-hover:border-white/70 group-hover:bg-black/40 transition-all shadow-lg">
            <span className="w-1 h-2 rounded-full bg-white/90 animate-bounce mt-0.5" />
          </div>
        </button>
      </section>

      {/* ================= DEDICATED CAMPAIGN EDITORIAL & HERO STATEMENT ================= */}
      {/* مكان مخصص وأنيق لكلمات الحملة الترويجية وأزرار الشراء بعيداً عن حجب الإعلان */}
      <section
        id="campaign-editorial"
        className="relative bg-[#121011] text-cream py-14 sm:py-18 md:py-24 border-b border-cream/10"
        aria-label="Wear Square campaign introduction"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            {/* Title & Collection Tag */}
            <div className="lg:col-span-7">
              <p className="mb-4 inline-flex items-center gap-2 text-[0.72rem] sm:text-xs uppercase tracking-[0.38em] text-amber-300/90 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                W S — {lang === "ar" ? "أزياء العائلة اليومية · تشكيلة الموسم" : "Everyday Family Fashion · Autumn Campaign"}
              </p>
              <h1 className="font-display text-cream text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-medium tracking-tight leading-[1.06]">
                <span className="block">{t("hero.title1")}</span>
                <span className="block italic text-cream-3 mt-1">{t("hero.title2")}</span>
              </h1>
            </div>

            {/* Description & Action Buttons */}
            <div className="lg:col-span-5 flex flex-col justify-end">
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-cream/85 mb-8 max-w-xl">
                {t("hero.sub")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5">
                <Btn onClick={() => navigate("/shop")} className="w-full sm:w-auto px-8 py-3.5 text-sm font-medium shadow-xl">
                  {t("hero.ctaShop")}
                </Btn>
                <Btn
                  variant="cream"
                  onClick={() => navigate("/shop?flag=new")}
                  className="w-full sm:w-auto px-8 py-3.5 text-sm font-medium border border-cream/35 bg-white/5 backdrop-blur-xs text-cream hover:bg-cream hover:text-ink transition-colors"
                >
                  {t("hero.ctaNew")}
                </Btn>
              </div>
            </div>
          </div>

          {/* Luxury Trust & Benefits Cards */}
          <div className="mt-14 pt-10 border-t border-cream/10 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="p-4 sm:p-5 rounded-xl border border-cream/10 bg-white/[0.03] backdrop-blur-xs flex items-center gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-wine-800/40 text-amber-300 border border-wine-700/50">
                <IcShield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-cream">{t("hero.trust1")}</p>
                <p className="text-[0.68rem] text-cream/60 mt-0.5">{lang === "ar" ? "أقمشة طبيعية 100% عالية الجودة" : "100% Natural premium fabrics"}</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl border border-cream/10 bg-white/[0.03] backdrop-blur-xs flex items-center gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-wine-800/40 text-amber-300 border border-wine-700/50">
                <IcTruck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-cream">{t("hero.trust3")}</p>
                <p className="text-[0.68rem] text-cream/60 mt-0.5">{lang === "ar" ? "تغطية كاملة لجميع المحافظات الـ 27" : "Fast delivery across all governorates"}</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl border border-cream/10 bg-white/[0.03] backdrop-blur-xs flex items-center gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-wine-800/40 text-amber-300 border border-wine-700/50">
                <IcSwap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-cream">{t("hero.trust2")}</p>
                <p className="text-[0.68rem] text-cream/60 mt-0.5">{lang === "ar" ? "معاينة قبل الاستلام واستبدال فوري" : "Hassle-free 14-day exchange"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TICKER ================= */}
      <div className="marquee overflow-hidden bg-ink py-3.5 text-cream" dir="ltr" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {["ticker.1", "ticker.2", "ticker.3", "ticker.4"].map((k) => (
                <span key={`${dup}-${k}`} className="mx-8 flex items-center gap-8 whitespace-nowrap text-[0.72rem] uppercase tracking-[0.35em]">
                  {t(k)} <span className="text-wine-500">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ================= SHOP BY FAMILY ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead kicker={t("family.kicker")} title={t("family.title")} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {FAMILY.map((f, i) => {
            const label = t(`family.${f.key}`);
            const sub = t(`family.${f.key}.sub`);
            return (
              <Reveal key={f.key} delay={i * 120}>
                <a
                  href={`#/shop?cat=${f.key}`}
                  className="group relative block overflow-hidden bg-cream-2 aspect-[4/5] md:aspect-[3/3.8]"
                  aria-label={`${label} — ${t("family.explore")}`}
                >
                  <img
                    src={f.img}
                    alt={f.alt[lang]}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wine-950/85 via-wine-950/25 to-transparent transition-opacity duration-700 group-hover:from-wine-900/90" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 text-cream">
                    <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cream/70 mb-2">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="font-display text-4xl md:text-5xl font-medium tracking-tight transition-transform duration-700 group-hover:-translate-y-1">
                      {label}
                    </h3>
                    <p className="mt-2 max-w-[26ch] text-sm text-cream/75 leading-relaxed">{sub}</p>
                    <span className={cn(
                      "mt-5 inline-flex items-center gap-2 border-b border-cream/60 pb-1 text-[0.72rem] uppercase tracking-[0.25em]",
                      "transition-all duration-500 group-hover:gap-4 group-hover:border-cream"
                    )}>
                      {t("family.explore")} <IcArrow className="h-4 w-4" />
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ================= NEW ARRIVALS ================= */}
      <section className="bg-cream-2/60 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead kicker={t("new.kicker")} title={t("new.title")} />
            <div className="mb-10 md:mb-14 hidden md:flex items-center gap-2">
              <button onClick={() => scrollRail(-1)} aria-label="prev" className="grid h-11 w-11 place-items-center rounded-full border border-ink/25 hover:bg-ink hover:text-cream transition-colors rtl:rotate-180">
                <IcArrow className="h-4 w-4 rotate-180" />
              </button>
              <button onClick={() => scrollRail(1)} aria-label="next" className="grid h-11 w-11 place-items-center rounded-full border border-ink/25 hover:bg-ink hover:text-cream transition-colors rtl:rotate-180">
                <IcArrow className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div ref={railRef} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
            {newOnes.map((p) => (
              <div key={p.id} className="w-[76vw] sm:w-[44vw] md:w-[31vw] lg:w-[23.5vw] shrink-0 snap-start">
                <ProductCard dense p={p} onClick={() => navigate(`/product/${p.id}`)} />
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Btn variant="outline" onClick={() => navigate("/shop?flag=new")}>{t("new.viewAll")}</Btn>
          </div>
        </div>
      </section>

      {/* ================= FEATURED / EDITORIAL ================= */}
      <section className="relative overflow-hidden bg-wine-950 text-cream">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[380px] lg:min-h-[640px] overflow-hidden">
            <img
              src="/categories/capsule_autumn.jpg"
              alt={lang === "ar" ? "تشكيلة عطلة نهاية الأسبوع المتناسقة للعائلة" : "Coordinated family weekend capsule look"}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-[center_35%] transition-transform duration-[2.5s] ease-out hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine-950/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-wine-950/70" />
          </div>
          <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16 lg:py-24">
            <Reveal><p className="text-[0.7rem] uppercase tracking-[0.4em] text-cream/60">{t("featured.kicker")}</p></Reveal>
            <Reveal delay={100}>
              <h2 className="mt-4 font-display text-5xl md:text-6xl font-medium leading-[1.05]">{t("featured.title")}</h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-md leading-relaxed text-cream/75">{t("featured.text")}</p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-10">
                <Btn variant="cream" onClick={() => navigate("/shop")}>{t("featured.cta")}<IcArrow className="h-4 w-4" /></Btn>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= BESTSELLERS ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
        <SectionHead kicker={t("best.kicker")} title={t("best.title")} center />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {best.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 90}>
              <ProductCard p={p} onClick={() => navigate(`/product/${p.id}`)} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="border-y border-ink/10 bg-cream-2/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-24">
          <SectionHead kicker={t("values.kicker")} title={t("values.title")} center />
          <div className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4 border border-ink/10">
            {([
              ["values.1", IcShield],
              ["values.2", IcCoin],
              ["values.3", IcBagSimple],
              ["values.4", IcDoc],
            ] as const).map(([k, Icon], i) => (
              <Reveal key={k} delay={i * 100} className="bg-cream">
                <div className="group h-full p-8 transition-colors duration-500 hover:bg-wine-900">
                  <Icon className="h-8 w-8 text-wine-800 transition-colors duration-500 group-hover:text-cream" />
                  <h3 className="mt-5 font-display text-2xl transition-colors duration-500 group-hover:text-cream">{t(`${k}.t`)}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-mute transition-colors duration-500 group-hover:text-cream/70">{t(`${k}.d`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAMILY STATEMENT ================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal mask className="order-2 lg:order-1">
            <div className="relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80"
                alt={lang === "ar" ? "عائلة من أجيال مختلفة بإطلالات أنيقة" : "A multi-generational family in elegant coordinated outfits"}
                loading="lazy"
                className="w-full object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-ink/10" />
              <div className="absolute bottom-0 start-0 bg-wine-900 px-5 py-3 text-cream text-[0.68rem] uppercase tracking-[0.25em]">
                W S — {lang === "ar" ? "لكل العائلة" : "Every family"}
              </div>
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <Reveal><p className="text-[0.7rem] uppercase tracking-[0.35em] text-wine-700">{t("statement.kicker")}</p></Reveal>
            <Reveal delay={100}>
              <h2 className="mt-4 font-display text-4xl md:text-5xl leading-[1.1] font-medium">{t("statement.title")}</h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-5 max-w-lg leading-relaxed text-ink/70">{t("statement.sub")}</p>
            </Reveal>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-ink/10 pt-8">
              {(["statement.stat1", "statement.stat2", "statement.stat3"] as const).map((k, i) => (
                <Reveal key={k} delay={250 + i * 100}>
                  <p className="font-display text-4xl md:text-5xl text-wine-800">{t(`${k}.n`)}</p>
                  <p className="mt-1.5 text-xs uppercase tracking-[0.15em] text-mute leading-snug">{t(`${k}.l`)}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={500}>
              <div className="mt-10">
                <Btn onClick={() => navigate("/shop")}>{t("statement.cta")}</Btn>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
