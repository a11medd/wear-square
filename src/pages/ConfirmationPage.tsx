import { useState } from "react";
import { useApp } from "../lib/store";
import { money } from "../lib/products";
import { Garment } from "../components/Garment";
import { Btn, IcCheck, IcTruck } from "../components/ui";

export function ConfirmationPage({ no }: { no: string }) {
  const { t, lang, orders, navigate, user, toast } = useApp();
  const [showAccount, setShowAccount] = useState(true);
  const order = orders.find((o) => o.no === no);

  if (!order) {
    return (
      <div className="pt-36 pb-32 text-center px-6">
        <h1 className="font-display text-4xl">{t("conf.notFound")}</h1>
        <Btn className="mt-8" onClick={() => navigate("/")}>{t("conf.backHome")}</Btn>
      </div>
    );
  }

  const fmtDate = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { weekday: "long", day: "numeric", month: "long" });

  const copyNo = async () => {
    try {
      await navigator.clipboard.writeText(order.no);
      toast(t("toast.copied"));
    } catch { /* ignore */ }
  };

  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* check */}
        <div className="text-center">
          <span className="anim-pop mx-auto grid h-20 w-20 place-items-center rounded-full bg-wine-800">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-cream" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h1 className="mt-6 font-display text-5xl font-medium">{t("conf.title")}</h1>
          <p className="mt-4 text-ink/80">
            {order.customer.name.trim()
              ? t("conf.thanks", { name: order.customer.name.trim().split(" ")[0] })
              : t("conf.thanksGuest")}
          </p>
          <p className="mt-1.5 text-sm text-mute">{t("conf.sub", { phone: order.customer.phone })}</p>
        </div>

        {/* order meta */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <button
            onClick={copyNo}
            className="border border-ink/15 bg-cream-2/60 p-4 text-start transition-colors hover:border-wine-800"
            aria-label={`${t("conf.orderNo")} — copy`}
          >
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-mute">{t("conf.orderNo")}</p>
            <p className="mt-1.5 font-display text-2xl text-wine-800" dir="ltr">{order.no}</p>
          </button>
          <div className="border border-ink/15 bg-cream-2/60 p-4">
            <p className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.22em] text-mute"><IcTruck className="h-3.5 w-3.5" /> {t("conf.expected")}</p>
            <p className="mt-1.5 text-sm font-medium leading-snug">{fmtDate(order.expected.from)} — {fmtDate(order.expected.to)}</p>
          </div>
          <div className="border border-ink/15 bg-cream-2/60 p-4">
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-mute">{t("co.payWith")}</p>
            <p className="mt-1.5 text-sm font-medium">{t(order.payment === "card" ? "co.cardLabel" : "co.codLabel")}</p>
          </div>
        </div>

        {/* delivery */}
        <div className="mt-4 border border-ink/15 p-5">
          <p className="text-[0.62rem] uppercase tracking-[0.22em] text-mute">{t("conf.deliveryTo")}</p>
          <p className="mt-2 text-sm font-medium">{order.customer.name} · <span dir="ltr">{order.customer.phone}</span></p>
          <p className="mt-1 text-sm text-ink/75 leading-relaxed">
            {order.delivery.gov} — {order.delivery.area}<br />
            {order.delivery.building} · {order.delivery.address}
            {order.delivery.apartment && <> · {order.delivery.apartment}</>}
            {order.delivery.notes && <><br /><span className="text-xs text-mute italic">“{order.delivery.notes}”</span></>}
          </p>
        </div>

        {/* items */}
        <div className="mt-4 border border-ink/15">
          <p className="border-b border-ink/10 px-5 py-3 text-[0.62rem] uppercase tracking-[0.22em] text-mute">{t("conf.summary")}</p>
          <div className="divide-y divide-ink/10">
            {order.lines.map((l, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="w-11 shrink-0 overflow-hidden bg-cream-2 border border-ink/10">
                  <Garment type={l.type} color={l.hex} view="front" label="" className="aspect-[4/5] w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.name[lang]}</p>
                  <p className="text-xs text-mute">{l.colorName[lang]} · {l.size} · ×{l.qty}</p>
                </div>
                <p className="text-sm tabular-nums">{money(l.price * l.qty, lang)}</p>
              </div>
            ))}
          </div>
          <dl className="border-t border-ink/10 px-5 py-4 text-sm space-y-1.5">
            <div className="flex justify-between"><dt className="text-mute">{t("cart.subtotal")}</dt><dd className="tabular-nums">{money(order.subtotal, lang)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-green-800"><dt>{t("cart.discount")}</dt><dd className="tabular-nums">−{money(order.discount, lang)}</dd></div>}
            <div className="flex justify-between"><dt className="text-mute">{t("cart.shipping")}</dt><dd className="tabular-nums">{order.shipping === 0 ? t("cart.free") : money(order.shipping, lang)}</dd></div>
            <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-medium"><dt>{t("cart.total")}</dt><dd className="tabular-nums">{money(order.total, lang)}</dd></div>
          </dl>
        </div>

        {/* account prompt */}
        {showAccount && !user && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-wine-200 bg-wine-100/50 p-5">
            <p className="text-sm">{t("conf.account")}</p>
            <div className="flex gap-2">
              <Btn className="py-2.5 px-5" onClick={() => navigate("/account?tab=register")}>{t("conf.accountCta")}</Btn>
              <Btn variant="outline" className="py-2.5 px-5" onClick={() => setShowAccount(false)}>{t("conf.later")}</Btn>
            </div>
          </div>
        )}

        {/* support + CTA */}
        <div className="mt-6 border border-ink/15 bg-cream-2/60 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{t("conf.support")}</p>
            <p className="mt-1 text-xs text-mute">{t("conf.supportSub")}</p>
          </div>
          <a href="tel:19901" className="inline-flex items-center gap-2 border border-ink/25 px-5 py-2.5 text-sm hover:bg-ink hover:text-cream transition-colors">
            {t("conf.supportCta")}
          </a>
        </div>

        <div className="mt-10 text-center">
          <Btn variant="outline" onClick={() => navigate("/shop")}>{t("conf.shopMore")}</Btn>
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-[0.68rem] text-mute">
          <IcCheck className="h-3.5 w-3.5" /> {t("footer.demo")}
        </p>
      </div>
    </div>
  );
}
