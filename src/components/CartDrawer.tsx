import { useEffect } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";
import { FREE_SHIP, getProduct, money } from "../lib/products";
import { Garment } from "./Garment";
import { Btn, IcClose, IcMinus, IcPlus, IcTrash, IcBag, IcArrow } from "./ui";

export function CartDrawer() {
  const {
    t,
    lang,
    cart,
    cartCount,
    cartSubtotal,
    cartDrawerOpen,
    setCartDrawerOpen,
    setQty,
    removeItem,
    navigate,
  } = useApp();

  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartDrawerOpen(false);
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
  }, [cartDrawerOpen, setCartDrawerOpen]);

  if (!cartDrawerOpen) return null;

  const items = cart
    .map((ci, idx) => {
      const p = getProduct(ci.id);
      if (!p) return null;
      const c = p.colors.find((x) => x.id === ci.colorId);
      return p && c ? { ci, idx, p, c } : null;
    })
    .filter(Boolean) as {
    ci: (typeof cart)[number];
    idx: number;
    p: NonNullable<ReturnType<typeof getProduct>>;
    c: NonNullable<ReturnType<typeof getProduct>>["colors"][number];
  }[];

  const toFree = Math.max(0, FREE_SHIP - cartSubtotal);
  const progressPct = Math.min(100, Math.round((cartSubtotal / FREE_SHIP) * 100));

  const goCheckout = () => {
    setCartDrawerOpen(false);
    navigate("/checkout");
  };

  const goFullCart = () => {
    setCartDrawerOpen(false);
    navigate("/cart");
  };

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label={t("cart.title")}
      data-testid="cart-drawer"
    >
      {/* Backdrop */}
      <button
        aria-label={t("common.close")}
        className="absolute inset-0 bg-ink/60 anim-fade-in backdrop-blur-xs cursor-default"
        onClick={() => setCartDrawerOpen(false)}
        data-testid="close-cart-drawer"
      />

      {/* Drawer surface */}
      <aside
        className={cn(
          "absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-500",
          "border-s border-ink/10"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5 bg-cream-2/70">
          <div className="flex items-center gap-2.5">
            <IcBag className="h-5 w-5 text-wine-800" />
            <h2 className="font-display text-2xl font-medium tracking-tight">
              {t("cart.title")}
            </h2>
            <span className="rounded-full bg-wine-800 text-cream px-2 py-0.5 text-xs font-bold tabular-nums">
              {cartCount}
            </span>
          </div>
          <button
            onClick={() => setCartDrawerOpen(false)}
            aria-label={t("common.close")}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 hover:bg-cream-3 transition-colors"
          >
            <IcClose className="h-5 w-5" />
          </button>
        </div>

        {/* Free shipping progress bar */}
        <div className="border-b border-ink/10 bg-cream px-6 py-3.5">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span>
              {toFree <= 0
                ? t("cart.freeUnlocked")
                : t("cart.freeProgress", { n: toFree })}
            </span>
            <span className="tabular-nums text-mute">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-3">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                toFree <= 0 ? "bg-green-700" : "bg-wine-700"
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-ink/10">
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream-2 text-wine-800">
                <IcBag className="h-8 w-8" />
              </span>
              <p className="mt-4 font-display text-2xl font-medium">{t("cart.empty")}</p>
              <p className="mt-1.5 text-xs text-mute">{t("cart.empty.sub")}</p>
              <Btn
                className="mt-6 text-xs py-2.5"
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate("/shop");
                }}
              >
                {t("cart.browse")}
              </Btn>
            </div>
          ) : (
            items.map(({ ci, idx, p, c }) => (
              <div key={`${ci.id}-${ci.colorId}-${ci.size}`} className="flex gap-4 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setCartDrawerOpen(false);
                    navigate(`/product/${p.id}`);
                  }}
                  className="block w-20 shrink-0 overflow-hidden bg-cream-2 border border-ink/10 rounded-sm aspect-[4/5] relative"
                >
                  {c.image || p.image ? (
                    <img src={c.image || p.image} alt={p.name[lang]} className="absolute inset-0 h-full w-full object-cover object-center" />
                  ) : (
                    <Garment
                      type={p.type}
                      color={c.hex}
                      view="front"
                      label={p.name[lang]}
                      className="h-full w-full"
                    />
                  )}
                </button>
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCartDrawerOpen(false);
                        navigate(`/product/${p.id}`);
                      }}
                      className="text-start font-medium text-sm leading-snug hover:text-wine-800 transition-colors truncate"
                    >
                      {p.name[lang]}
                    </button>
                    <p className="font-semibold text-sm tabular-nums shrink-0 text-wine-900">
                      {money(p.price * ci.qty, lang)}
                    </p>
                  </div>
                  <p className="text-[0.72rem] text-mute">
                    {c.name[lang]} · {t("cart.size")}: {ci.size}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="inline-flex items-center border border-ink/20 bg-cream-2/40 rounded-sm">
                      <button
                        type="button"
                        aria-label={t("cart.decrease")}
                        onClick={() => (ci.qty <= 1 ? removeItem(idx) : setQty(idx, ci.qty - 1))}
                        className="grid h-7 w-7 place-items-center hover:bg-cream-3 transition-colors text-ink/80"
                      >
                        <IcMinus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold tabular-nums">
                        {ci.qty}
                      </span>
                      <button
                        type="button"
                        aria-label={t("cart.increase")}
                        onClick={() => setQty(idx, ci.qty + 1)}
                        className="grid h-7 w-7 place-items-center hover:bg-cream-3 transition-colors text-ink/80"
                      >
                        <IcPlus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={t("cart.remove")}
                      onClick={() => removeItem(idx)}
                      className="text-xs text-mute hover:text-wine-800 transition-colors inline-flex items-center gap-1"
                    >
                      <IcTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="border-t border-ink/10 bg-cream-2/80 p-5 space-y-3">
            <div className="flex items-center justify-between text-base pb-1">
              <span className="font-medium text-sm text-mute">{t("cart.subtotal")}</span>
              <span className="font-semibold text-lg tabular-nums text-wine-950">
                {money(cartSubtotal, lang)}
              </span>
            </div>

            {/* Two Explicit Checkout Buttons: Guest & Create Account */}
            <div className="space-y-2">
              {/* Button 1: Guest Checkout (Phone & Address only) */}
              <button
                type="button"
                onClick={goCheckout}
                className="w-full py-3.5 px-4 rounded-sm bg-wine-800 hover:bg-wine-900 text-cream font-semibold text-xs sm:text-sm tracking-wide shadow-sm flex flex-col items-center justify-center gap-0.5 transition-colors group"
                data-testid="guest-checkout-btn"
              >
                <span className="inline-flex items-center gap-2">
                  {lang === "ar" ? "إتمام الشراء كزائر (الرقم والعنوان فقط)" : "Checkout as Guest (Phone & Delivery)"}
                  <IcArrow className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[0.68rem] text-cream/80 font-normal">
                  {lang === "ar" ? "✓ بدون حساب أو كلمة مرور · بيانات التوصيل فقط" : "✓ No account required · Delivery info only"}
                </span>
              </button>

              {/* Button 2: Create Account / Sign in to complete purchase */}
              <button
                type="button"
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate("/account?tab=register&redirect=checkout");
                }}
                className="w-full py-3 px-4 rounded-sm border border-wine-800/40 bg-cream hover:bg-cream-2 text-wine-950 font-medium text-xs sm:text-sm tracking-wide flex flex-col items-center justify-center gap-0.5 transition-colors"
                data-testid="account-checkout-btn"
              >
                <span className="inline-flex items-center gap-1.5 font-semibold text-wine-900">
                  {lang === "ar" ? "إنشاء حساب لإتمام الشراء" : "Create Account to Checkout"}
                </span>
                <span className="text-[0.66rem] text-mute">
                  {lang === "ar" ? "لحفظ العنوان وتتبع شحنتك بسهولة" : "Save address & track orders anytime"}
                </span>
              </button>
            </div>

            {/* Secondary Action: View Full Cart */}
            <button
              type="button"
              onClick={goFullCart}
              className="w-full py-2 text-xs uppercase tracking-widest text-ink/75 hover:text-ink font-medium border border-ink/20 hover:border-ink/40 transition-colors rounded-sm"
              data-testid="view-full-cart-btn"
            >
              {t("cart.viewCart")}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
