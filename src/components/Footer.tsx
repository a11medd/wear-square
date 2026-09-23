import { useState } from "react";
import { useApp } from "../lib/store";
import { Logo, IcGlobe } from "./ui";

export function Footer() {
  const { t, lang, setLang, toast } = useApp();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  const submit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setState("err"); return; }
    setState("ok");
    setEmail("");
  };

  const col = (title: string, items: { label: string; to?: string }[]) => (
    <div>
      <h3 className="text-[0.7rem] uppercase tracking-[0.28em] text-cream/50 mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((i) => (
          <li key={i.label}>
            {i.to ? (
              <a href={`#${i.to}`} className="text-sm text-cream/80 hover:text-cream transition-colors">{i.label}</a>
            ) : (
              <button onClick={() => toast(i.label)} className="text-sm text-cream/80 hover:text-cream transition-colors">{i.label}</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-wine-950 text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/65">{t("footer.tagline")}</p>
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2 text-sm hover:bg-cream/10 transition-colors"
            >
              <IcGlobe className="h-4 w-4" />
              {t("footer.language")}: {lang === "en" ? "العربية" : "English"}
            </button>
          </div>
          {col(t("footer.shop"), [
            { label: t("nav.men"), to: "/shop?cat=men" },
            { label: t("nav.women"), to: "/shop?cat=women" },
            { label: t("nav.kids"), to: "/shop?cat=kids" },
            { label: t("nav.new"), to: "/shop?flag=new" },
            { label: t("nav.sale"), to: "/shop?flag=sale" },
          ])}
          {col(t("footer.help"), [
            { label: t("footer.delivery"), to: "/shop" },
            { label: t("footer.exchange"), to: "/shop" },
            { label: t("footer.sizeGuide"), to: "/shop" },
            { label: t("footer.faq"), to: "/account" },
            { label: t("footer.contact"), to: "/account" },
          ])}
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-[0.28em] text-cream/50 mb-4">{t("news.title")}</h3>
            <div className="flex border-b border-cream/30 focus-within:border-cream transition-colors">
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={t("news.placeholder")}
                aria-label={t("news.placeholder")}
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-cream/40"
              />
              <button onClick={submit} className="px-3 text-[0.7rem] uppercase tracking-[0.2em] text-cream/80 hover:text-cream">
                {t("news.button")}
              </button>
            </div>
            {state === "ok" && <p className="mt-3 text-xs text-cream/70">{t("news.success")}</p>}
            {state === "err" && <p className="mt-3 text-xs text-wine-200">{t("news.error")}</p>}
            <p className="mt-6 text-xs text-cream/50 leading-relaxed">{t("footer.contactLine")}<br />{t("footer.hours")}</p>
          </div>
        </div>

        <div className="mt-14 border-t border-cream/10 pt-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 md:justify-between text-xs text-cream/45">
          <p>{t("footer.copyright")}</p>
          <p>{t("footer.payments")}</p>
          <p className="text-cream/35">{t("footer.demo")}</p>
        </div>
      </div>
    </footer>
  );
}
