import { useMemo, useState } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";
import { COUPONS, FREE_SHIP, SHIP_FEE, getCoupon, getProduct, money, setCoupon } from "../lib/products";
import { Garment } from "../components/Garment";
import { Btn, Reveal, IcBag, IcMinus, IcPlus, IcTrash, IcArrow } from "../components/ui";

export function CartPage() {
  const { t, lang, cart, setQty, removeItem, clearCart, navigate, toast, cartSubtotal, user } = useApp();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(getCoupon());
  const [codeMsg, setCodeMsg] = useState<"ok" | "err" | null>(applied ? "ok" : null);

  const items = useMemo(
    () =>
      cart
        .map((ci, idx) => {
          const p = getProduct(ci.id);
          if (!p) return null;
          const c = p.colors.find((x) => x.id === ci.colorId);
          return p && c ? { ci, idx, p, c } : null;
        })
        .filter(Boolean) as { ci: (typeof cart)[number]; idx: number; p: NonNullable<ReturnType<typeof getProduct>>; c: NonNullable<ReturnType<typeof getProduct>>["colors"][number] }[],
    [cart]
  );

  const discount = applied && COUPONS[applied] ? Math.round(cartSubtotal * COUPONS[applied]) : 0;
  const shipping = cartSubtotal - discount >= FREE_SHIP || items.length === 0 ? 0 : SHIP_FEE;
  const total = cartSubtotal - discount + shipping;
  const toFree = FREE_SHIP - (cartSubtotal - discount);

  const tryCode = () => {
    const c = code.trim().toUpperCase();
    if (COUPONS[c]) {
      setApplied(c);
      setCoupon(c);
      setCodeMsg("ok");
    } else {
      setApplied(null);
      setCoupon(null);
      setCodeMsg("err");
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-32">
        <div className="mx-auto max-w-xl px-6 text-center">
          <Reveal>
            <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-cream-2">
              <IcBag className="h-10 w-10 text-wine-800" />
            </span>
            <h1 className="mt-8 font-display text-5xl font-medium">{t("cart.empty")}</h1>
            <p className="mt-3 text-mute">{t("cart.empty.sub")}</p>
            <Btn className="mt-8" onClick={() => navigate("/shop")}>{t("cart.browse")} <IcArrow className="h-4 w-4" /></Btn>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <h1 className="font-display text-5xl font-medium">{t("cart.title")}</h1>
          <p className="mt-2 text-sm text-mute">{t("cart.noLogin")} <a href="#/account" className="text-wine-800 underline underline-offset-4">{t("cart.login")}</a></p>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* lines */}
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {items.map(({ ci, idx, p, c }) => (
              <div key={`${ci.id}-${ci.colorId}-${ci.size}`} className="flex gap-4 py-6">
                <a href={`#/product/${p.id}`} className="block w-24 sm:w-28 shrink-0 overflow-hidden bg-cream-2 rounded-sm border border-ink/10 aspect-[4/5] relative">
                  {c.image || p.image ? (
                    <img src={c.image || p.image} alt={p.name[lang]} className="absolute inset-0 h-full w-full object-cover object-center" />
                  ) : (
                    <Garment type={p.type} color={c.hex} view="front" label={p.name[lang]} className="aspect-[4/5] w-full" />
                  )}
                </a>
                <div className="flex flex-1 flex-col justify-between gap-3 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <a href={`#/product/${p.id}`} className="font-medium hover:text-wine-800 transition-colors">{p.name[lang]}</a>
                      <p className="mt-1 text-xs text-mute">
                        {t("cart.color")}: {c.name[lang]} · {t("cart.size")}: {ci.size}
                      </p>
                    </div>
                    <p className="font-medium tabular-nums shrink-0">{money(p.price * ci.qty, lang)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center border border-ink/20">
                      <button
                        type="button"
                        aria-label={t("cart.decrease")}
                        onClick={() => (ci.qty <= 1 ? removeItem(idx) : setQty(idx, ci.qty - 1))}
                        className="grid h-9 w-9 place-items-center hover:bg-cream-2 transition-colors"
                      >
                        <IcMinus className="h-4 w-4" />
                      </button>
                      <span className="w-9 text-center text-sm tabular-nums" aria-live="polite">{ci.qty}</span>
                      <button
                        type="button"
                        aria-label={t("cart.increase")}
                        onClick={() => setQty(idx, ci.qty + 1)}
                        disabled={ci.qty >= 9}
                        className="grid h-9 w-9 place-items-center hover:bg-cream-2 transition-colors disabled:opacity-30"
                      >
                        <IcPlus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => { removeItem(idx); toast(t("toast.removed")); }}
                      className="inline-flex items-center gap-1.5 text-xs text-mute hover:text-wine-800 transition-colors"
                    >
                      <IcTrash className="h-4 w-4" /> {t("cart.remove")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-5">
              <button onClick={() => navigate("/shop")} className="inline-flex items-center gap-2 text-sm text-wine-800 hover:underline underline-offset-4">
                <IcArrow className="h-4 w-4 rotate-180" /> {t("cart.continue")}
              </button>
              <button onClick={() => { clearCart(); toast(t("toast.removed")); }} className="text-xs text-mute hover:text-ink">
                {t("cart.clear")}
              </button>
            </div>
          </div>

          {/* summary */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="border border-ink/15 bg-cream-2/50 p-6">
              <h2 className="font-display text-2xl">{t("cart.summary")}</h2>

              {/* free shipping progress */}
              <div className="mt-5">
                <p className={cn("text-xs", toFree > 0 ? "text-mute" : "text-green-800 font-medium")}>
                  {toFree > 0 ? t("cart.freeProgress", { n: toFree.toLocaleString("en-US") }) : t("cart.freeUnlocked")}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-wine-800 transition-all duration-700"
                    style={{ width: `${Math.min(100, ((cartSubtotal - discount) / FREE_SHIP) * 100)}%` }}
                  />
                </div>
              </div>

              {/* coupon */}
              <div className="mt-6">
                <label htmlFor="coupon" className="text-[0.68rem] uppercase tracking-[0.22em] text-mute">{t("cart.coupon")}</label>
                <div className="mt-2 flex">
                  <input
                    id="coupon"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setCodeMsg(null); }}
                    onKeyDown={(e) => e.key === "Enter" && tryCode()}
                    placeholder={t("cart.couponPlaceholder")}
                    className="w-full border border-ink/25 bg-cream px-3 py-2.5 text-sm outline-none focus:border-wine-800"
                  />
                  <button onClick={tryCode} className="shrink-0 border border-s-0 border-ink/25 px-4 text-[0.7rem] uppercase tracking-[0.18em] hover:bg-ink hover:text-cream transition-colors">
                    {t("cart.applyCoupon")}
                  </button>
                </div>
                {codeMsg === "ok" && (
                  <p className="mt-2 text-xs text-green-800 flex items-center justify-between">
                    {t("cart.couponOk")}
                    {applied && (
                      <button onClick={() => { setApplied(null); setCoupon(null); setCodeMsg(null); }} className="text-mute underline underline-offset-2 hover:text-ink">
                        {t("cart.removeCoupon")}
                      </button>
                    )}
                  </p>
                )}
                {codeMsg === "err" && <p className="mt-2 text-xs text-wine-800" role="alert">{t("cart.couponInvalid")}</p>}
              </div>

              <dl className="mt-6 space-y-2.5 text-sm border-t border-ink/10 pt-5">
                <div className="flex justify-between">
                  <dt className="text-mute">{t("cart.subtotal")}</dt>
                  <dd className="tabular-nums">{money(cartSubtotal, lang)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-800">
                    <dt>{t("cart.discount")} ({applied})</dt>
                    <dd className="tabular-nums">−{money(discount, lang)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-mute">{t("cart.shipping")}</dt>
                  <dd className={cn("tabular-nums", shipping === 0 && "text-green-800 font-medium")}>
                    {shipping === 0 ? t("cart.free") : money(shipping, lang)}
                  </dd>
                </div>
                <p className="text-[0.68rem] text-mute">{t("cart.shippingFlat")}</p>
                <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium">
                  <dt>{t("cart.total")}</dt>
                  <dd className="tabular-nums">{money(total, lang)}</dd>
                </div>
              </dl>

              {user ? (
                <div className="mt-6 space-y-3">
                  <Btn
                    className="w-full py-4 uppercase tracking-wider font-semibold text-sm flex items-center justify-center gap-2"
                    onClick={() => navigate("/checkout")}
                    data-testid="checkout-btn"
                  >
                    {t("cart.checkout")} <IcArrow className="h-4 w-4 rtl:rotate-180" />
                  </Btn>
                  <p className="text-center text-xs text-mute">
                    {t("acc.welcome")}, {user.name}
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {/* Two Buttons: Guest Checkout & Create Account */}
                  {/* Button 1: Guest Checkout */}
                  <div className="rounded-sm border-2 border-wine-800/80 bg-wine-50/60 p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span className="text-[0.72rem] font-bold uppercase tracking-wider text-wine-950">
                        {lang === "ar" ? "الخيار الأسرع · بدون حساب" : "Fastest Option · No Account"}
                      </span>
                    </div>
                    <Btn
                      className="w-full py-3.5 text-sm font-bold uppercase tracking-wide bg-wine-800 hover:bg-wine-900 text-cream shadow-sm flex items-center justify-center gap-2"
                      onClick={() => navigate("/checkout")}
                      data-testid="checkout-guest-btn"
                    >
                      {lang === "ar" ? "إتمام الشراء كزائر (الرقم والعنوان فقط)" : "Checkout as Guest (Phone & Delivery)"}
                      <IcArrow className="h-4 w-4 rtl:rotate-180" />
                    </Btn>
                    <p className="mt-2 text-xs text-emerald-900 font-medium">
                      {lang === "ar"
                        ? "✓ بيانات التوصيل فقط (الاسم، الرقم، العنوان) بدون تسجيل"
                        : "✓ Delivery details only (name, phone, address) without signup"}
                    </p>
                  </div>

                  {/* Button 2: Create Account / Sign in to complete purchase */}
                  <div className="rounded-sm border border-ink/15 bg-cream p-3.5 text-center space-y-2">
                    <button
                      type="button"
                      onClick={() => navigate("/account?tab=register&redirect=checkout")}
                      className="w-full py-3 px-3 rounded-sm border border-wine-800/50 bg-cream-2/70 hover:bg-cream-3 text-wine-950 font-semibold text-xs sm:text-sm tracking-wide transition-colors flex items-center justify-center gap-1.5"
                      data-testid="checkout-register-btn"
                    >
                      <span>{lang === "ar" ? "إنشاء حساب لإتمام الشراء" : "Create Account to Checkout"}</span>
                      <IcArrow className="h-3.5 w-3.5 rtl:rotate-180" />
                    </button>
                    <p className="text-[0.7rem] text-mute">
                      {lang === "ar"
                        ? "لديك حساب بالفعل؟ "
                        : "Already have an account? "}
                      <a
                        href="#/account?tab=login&redirect=checkout"
                        className="font-semibold text-wine-800 hover:underline"
                      >
                        {lang === "ar" ? "تسجيل الدخول" : "Sign in"}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
