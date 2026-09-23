import { useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";
import { COUPONS, FREE_SHIP, GOVERNORATES, SHIP_FEE, getCoupon, getProduct, money, setCoupon } from "../lib/products";
import { Garment } from "../components/Garment";
import { Btn, IcCheck, IcArrow, IcShield, IcCoin } from "../components/ui";

type PayState = "idle" | "processing" | "failed" | "cancelled";

interface Form {
  name: string; phone: string; email: string;
  gov: string; area: string; address: string; building: string; apartment: string; notes: string;
  method: "card" | "cod";
  cardNumber: string; cardName: string; expiry: string; cvv: string;
}

const EMPTY: Form = {
  name: "", phone: "", email: "",
  gov: "", area: "", address: "", building: "", apartment: "", notes: "",
  method: "cod", cardNumber: "", cardName: "", expiry: "", cvv: "",
};

export function CheckoutPage() {
  const { t, lang, cart, navigate, placeOrder, cartSubtotal, user } = useApp();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pay, setPay] = useState<PayState>("idle");
  const timer = useRef<number | null>(null);
  const applied = getCoupon();
  const discount = applied && COUPONS[applied] ? Math.round(cartSubtotal * COUPONS[applied]) : 0;
  const shipping = cartSubtotal - discount >= FREE_SHIP || cart.length === 0 ? 0 : SHIP_FEE;
  const total = cartSubtotal - discount + shipping;

  const items = useMemo(
    () =>
      cart
        .map((ci) => {
          const p = getProduct(ci.id);
          const c = p?.colors.find((x) => x.id === ci.colorId);
          return p && c ? { ci, p, c } : null;
        })
        .filter(Boolean) as { ci: (typeof cart)[number]; p: NonNullable<ReturnType<typeof getProduct>>; c: NonNullable<ReturnType<typeof getProduct>>["colors"][number] }[],
    [cart]
  );

  const set = (k: keyof Form, v: string) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const steps = [t("co.step1"), t("co.step2"), t("co.step3"), t("co.step4")];

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-32 text-center px-6">
        <h1 className="font-display text-4xl font-medium">{t("co.emptyTitle")}</h1>
        <p className="mt-3 text-mute">{t("co.emptySub")}</p>
        <Btn className="mt-8" onClick={() => navigate("/shop")}>{t("co.toShop")}</Btn>
      </div>
    );
  }

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      // Guest checkout: only the contact number is required.
      if (!/^01[0125][0-9]{8}$/.test(f.phone.trim())) e.phone = t("err.phone");
      if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = t("err.email");
    }
    if (s === 1) {
      if (!f.gov) e.gov = t("err.gov");
      if (f.area.trim().length < 2) e.area = t("err.area");
      if (f.address.trim().length < 10) e.address = t("err.addressMin");
      if (f.building.trim().length < 2) e.building = t("err.building");
    }
    if (s === 2 && f.method === "card") {
      const digits = f.cardNumber.replace(/\D/g, "");
      if (digits.length !== 16) e.cardNumber = t("err.cardNumber");
      if (f.cardName.trim().length < 3) e.cardName = t("err.cardName");
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(f.expiry.trim())) {
        e.expiry = t("err.expiry");
      } else {
        const [mm, yy] = f.expiry.split("/").map(Number);
        const now = new Date();
        if (yy + 2000 < now.getFullYear() || (yy + 2000 === now.getFullYear() && mm < now.getMonth() + 1)) e.expiry = t("err.expiryPast");
      }
      if (!/^\d{3,4}$/.test(f.cvv.trim())) e.cvv = t("err.cvv");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) { setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    if (pay === "processing") return; // duplicate-submission guard
    if (f.method === "cod") {
      const order = placeOrder({ lines: buildLines(), subtotal: cartSubtotal, shipping, discount, total, customer: { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim() }, delivery: buildDelivery(), payment: "cod" });
      setCoupon(null);
      navigate(`/order/${order.no}`);
      return;
    }
    setPay("processing");
    const digits = f.cardNumber.replace(/\D/g, "");
    timer.current = window.setTimeout(() => {
      if (digits.endsWith("0002")) {
        setPay("failed");
        return;
      }
      const order = placeOrder({ lines: buildLines(), subtotal: cartSubtotal, shipping, discount, total, customer: { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim() }, delivery: buildDelivery(), payment: "card" });
      setCoupon(null);
      navigate(`/order/${order.no}`);
    }, 1900);
  };

  const cancelPayment = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setPay("cancelled");
  };

  function buildLines() {
    return items.map(({ ci, p, c }) => ({
      id: p.id, name: p.name, colorName: c.name, hex: c.hex, type: p.type, size: ci.size, qty: ci.qty, price: p.price,
    }));
  }
  function buildDelivery() {
    const g = GOVERNORATES.find((x) => x.en === f.gov);
    return {
      gov: g ? (lang === "ar" ? g.ar : g.en) : f.gov,
      area: f.area.trim(), address: f.address.trim(), building: f.building.trim(),
      apartment: f.apartment.trim(), notes: f.notes.trim(), savedAt: "",
    };
  }

  const field = (
    key: keyof Form, label: string, opts: { placeholder?: string; optional?: boolean; type?: string; className?: string } = {}
  ) => (
    <div className={opts.className}>
      <label htmlFor={`f-${key}`} className="text-[0.68rem] uppercase tracking-[0.2em] text-mute">
        {label} {opts.optional && <span className="opacity-60 normal-case tracking-normal">({t("co.optional")})</span>}
      </label>
      <input
        id={`f-${key}`}
        type={opts.type || "text"}
        value={f[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={opts.placeholder}
        dir={key === "phone" || key === "cardNumber" || key === "expiry" || key === "cvv" ? "ltr" : undefined}
        className={cn(
          "mt-1.5 w-full border bg-cream px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-mute/50",
          errors[key] ? "border-wine-700 bg-wine-100/40" : "border-ink/25 focus:border-wine-800"
        )}
        aria-invalid={!!errors[key]}
      />
      {errors[key] && <p className="mt-1.5 text-xs text-wine-800" role="alert">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-display text-5xl font-medium">{t("co.title")}</h1>
          {!user && (
            <span className="inline-flex items-center gap-2 rounded-full bg-wine-100 border border-wine-200 px-3.5 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-wine-900">
              <IcShield className="h-3.5 w-3.5" /> {t("co.guestBadge")}
            </span>
          )}
        </div>
        {!user && (
          <p className="mt-3 max-w-2xl text-sm text-mute leading-relaxed">{t("co.guestNote")}</p>
        )}

        {/* stepper */}
        <ol className="mt-8 flex items-center gap-1.5 sm:gap-3" aria-label={t("co.title")}>
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-1.5 sm:gap-3 flex-1 last:flex-none">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn(
                  "flex items-center gap-2 text-[0.65rem] sm:text-xs uppercase tracking-[0.14em] transition-colors",
                  i === step ? "text-ink font-medium" : i < step ? "text-wine-800 hover:text-wine-900" : "text-mute/50"
                )}
              >
                <span className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[0.7rem] transition-colors",
                  i < step ? "bg-wine-800 border-wine-800 text-cream" : i === step ? "border-ink" : "border-ink/25"
                )}>
                  {i < step ? <IcCheck className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="hidden md:inline">{s}</span>
              </button>
              {i < steps.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-wine-800" : "bg-ink/15")} />}
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="border border-ink/15 p-6 md:p-8 bg-cream">
            {/* ============ STEP 1: customer (guest-first) ============ */}
            {step === 0 && (
              <div className="anim-fade-up space-y-5">
                <h2 className="font-display text-3xl">{t("co.step1")}</h2>
                <p className="-mt-2 text-sm text-mute">{t("co.guestNote")}</p>
                {field("phone", t("co.phone"), { placeholder: "01012345678", type: "tel" })}
                {field("name", t("co.fullName"), { placeholder: lang === "ar" ? "محمد أحمد" : "Mohamed Ahmed", optional: true })}
                {field("email", t("co.email"), { placeholder: "you@example.com", optional: true, type: "email" })}
              </div>
            )}

            {/* ============ STEP 2: delivery ============ */}
            {step === 1 && (
              <div className="anim-fade-up space-y-5">
                <h2 className="font-display text-3xl">{t("co.step2")}</h2>
                <div>
                  <label htmlFor="f-gov" className="text-[0.68rem] uppercase tracking-[0.2em] text-mute">{t("co.gov")}</label>
                  <select
                    id="f-gov"
                    value={f.gov}
                    onChange={(e) => set("gov", e.target.value)}
                    className={cn(
                      "mt-1.5 w-full border bg-cream px-3.5 py-3 text-sm outline-none transition-colors",
                      errors.gov ? "border-wine-700 bg-wine-100/40" : "border-ink/25 focus:border-wine-800"
                    )}
                    aria-invalid={!!errors.gov}
                  >
                    <option value="">{t("co.govPlaceholder")}</option>
                    {GOVERNORATES.map((g) => (
                      <option key={g.en} value={g.en}>{lang === "ar" ? g.ar : g.en}</option>
                    ))}
                  </select>
                  {errors.gov && <p className="mt-1.5 text-xs text-wine-800" role="alert">{errors.gov}</p>}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {field("area", t("co.area"), { placeholder: lang === "ar" ? "المعادي، الدقي، سموحة…" : "New Maadi, Dokki, Smouha…" })}
                  {field("building", t("co.building"), { placeholder: lang === "ar" ? "برج / شارع" : "Tower / Street" })}
                </div>
                {field("address", t("co.address"), { placeholder: lang === "ar" ? "العنوان بالتفصيل: الحي، المنطقة المحيطة…" : "Full address: district, surroundings…" })}
                <div className="grid gap-5 sm:grid-cols-2">
                  {field("apartment", t("co.apartment"), { optional: true, placeholder: lang === "ar" ? "شقة 12، الدور 5" : "Apt 12, Floor 5" })}
                  {field("notes", t("co.notes"), { optional: true, placeholder: t("co.notesPlaceholder") })}
                </div>
              </div>
            )}

            {/* ============ STEP 3: payment ============ */}
            {step === 2 && (
              <div className="anim-fade-up space-y-6">
                <h2 className="font-display text-3xl">{t("co.step3")}</h2>

                {pay === "failed" && (
                  <div className="border border-wine-700 bg-wine-100/60 p-5" role="alert">
                    <p className="font-medium text-wine-900">{t("pay.failed")}</p>
                    <p className="mt-1 text-sm text-wine-900/75">{t("pay.failedSub")}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Btn onClick={() => setPay("idle")} className="py-2.5 px-5">{t("pay.retry")}</Btn>
                      <Btn variant="outline" onClick={() => { set("method", "cod"); setPay("idle"); }} className="py-2.5 px-5">{t("pay.switchCod")}</Btn>
                    </div>
                  </div>
                )}
                {pay === "cancelled" && (
                  <div className="border border-ink/25 bg-cream-2/70 p-5" role="alert">
                    <p className="font-medium">{t("pay.cancelled")}</p>
                    <p className="mt-1 text-sm text-mute">{t("pay.cancelledSub")}</p>
                    <Btn variant="outline" className="mt-4 py-2.5 px-5" onClick={() => setPay("idle")}>{t("pay.retry")}</Btn>
                  </div>
                )}

                {pay === "processing" ? (
                  <div className="py-10 text-center">
                    <span className="mx-auto block h-12 w-12 rounded-full border-2 border-ink/15 border-t-wine-800 animate-spin" aria-hidden="true" />
                    <p className="mt-5 font-display text-2xl">{t("pay.processing")}</p>
                    <p className="mt-2 text-sm text-mute">{t("pay.processingSub")}</p>
                    <button onClick={cancelPayment} className="mt-6 text-sm text-mute underline underline-offset-4 hover:text-ink">
                      {t("pay.cancel")}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => set("method", "card")}
                        aria-pressed={f.method === "card"}
                        className={cn(
                          "border p-4 text-start transition-all",
                          f.method === "card" ? "border-wine-800 bg-wine-800 text-cream shadow-md" : "border-ink/20 hover:border-ink"
                        )}
                      >
                        <span className="flex items-center gap-2.5 font-medium"><IcShield className="h-5 w-5" /> {t("co.card")}</span>
                        <span className={cn("mt-1 block text-xs", f.method === "card" ? "text-cream/70" : "text-mute")}>{t("co.card.sub")}</span>
                      </button>
                      <button
                        onClick={() => set("method", "cod")}
                        aria-pressed={f.method === "cod"}
                        className={cn(
                          "border p-4 text-start transition-all",
                          f.method === "cod" ? "border-wine-800 bg-wine-800 text-cream shadow-md" : "border-ink/20 hover:border-ink"
                        )}
                      >
                        <span className="flex items-center gap-2.5 font-medium"><IcCoin className="h-5 w-5" /> {t("co.cod")}</span>
                        <span className={cn("mt-1 block text-xs", f.method === "cod" ? "text-cream/70" : "text-mute")}>{t("co.cod.sub")}</span>
                      </button>
                    </div>

                    {f.method === "card" && (
                      <div className="anim-fade-up space-y-5 border border-ink/15 bg-cream-2/50 p-5">
                        <p className="text-xs text-mute leading-relaxed">{t("co.cardDemo")}</p>
                        {field("cardNumber", t("co.cardNumber"), { placeholder: "4242 4242 4242 4242" })}
                        {field("cardName", t("co.cardName"), { placeholder: lang === "ar" ? "كما هو على البطاقة" : "As printed on card" })}
                        <div className="grid grid-cols-2 gap-5">
                          {field("expiry", t("co.expiry"), { placeholder: "MM/YY" })}
                          {field("cvv", t("co.cvv"), { placeholder: "123" })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ============ STEP 4: review ============ */}
            {step === 3 && (
              <div className="anim-fade-up space-y-6">
                <h2 className="font-display text-3xl">{t("co.reviewTitle")}</h2>
                <div className="divide-y divide-ink/10 border border-ink/15">
                  <div className="flex items-start justify-between gap-4 p-4">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-mute">{t("co.step1")}</p>
                      <p className="mt-1.5 text-sm font-medium">{f.name.trim() || t("common.guest")}</p>
                      <p className="text-sm text-mute" dir="ltr">{f.phone}{f.email && ` · ${f.email}`}</p>
                    </div>
                    <button onClick={() => setStep(0)} className="text-xs text-wine-800 underline underline-offset-4">{t("co.edit")}</button>
                  </div>
                  <div className="flex items-start justify-between gap-4 p-4">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-mute">{t("co.step2")}</p>
                      <p className="mt-1.5 text-sm font-medium">{f.gov} — {f.area}</p>
                      <p className="text-sm text-mute">{f.building} · {f.address}{f.apartment && ` · ${f.apartment}`}</p>
                      {f.notes && <p className="mt-1 text-xs text-mute italic">“{f.notes}”</p>}
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs text-wine-800 underline underline-offset-4">{t("co.edit")}</button>
                  </div>
                  <div className="flex items-start justify-between gap-4 p-4">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-mute">{t("co.step3")}</p>
                      <p className="mt-1.5 text-sm font-medium">
                        {t(f.method === "card" ? "co.card" : "co.cod")}
                        {f.method === "card" && f.cardNumber && (
                          <span className="text-mute font-normal" dir="ltr"> ····{f.cardNumber.replace(/\D/g, "").slice(-4)}</span>
                        )}
                      </p>
                    </div>
                    <button onClick={() => setStep(2)} className="text-xs text-wine-800 underline underline-offset-4">{t("co.edit")}</button>
                  </div>
                </div>
                <div className="border border-ink/15 divide-y divide-ink/10">
                  {items.map(({ ci, p, c }) => (
                    <div key={`${ci.id}-${ci.colorId}-${ci.size}`} className="flex items-center gap-3 p-3">
                      <div className="w-12 shrink-0 bg-cream-2 overflow-hidden">
                        <Garment type={p.type} color={c.hex} view="front" label="" className="aspect-[4/5] w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name[lang]}</p>
                        <p className="text-xs text-mute">{c.name[lang]} · {ci.size} · ×{ci.qty}</p>
                      </div>
                      <p className="text-sm tabular-nums">{money(p.price * ci.qty, lang)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* nav buttons */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink/10 pt-6">
              {step > 0 ? (
                <Btn variant="outline" onClick={back} disabled={pay === "processing"}>
                  <IcArrow className="h-4 w-4 rotate-180" /> {t("co.back")}
                </Btn>
              ) : (
                <Btn variant="ghost" onClick={() => navigate("/cart")}>{t("cart.continue")}</Btn>
              )}
              {step < 3 ? (
                <Btn onClick={next}>{t("co.continue")} <IcArrow className="h-4 w-4" /></Btn>
              ) : (
                <Btn
                  onClick={finish}
                  disabled={pay === "processing"}
                  className={cn("min-w-56", pay === "processing" && "shimmer")}
                >
                  {pay === "processing" ? t("co.placing") : f.method === "card" ? t("co.pay", { n: total.toLocaleString("en-US") }) : t("co.placeOrder")}
                </Btn>
              )}
            </div>
          </div>

          {/* summary sidebar */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="border border-ink/15 bg-cream-2/50 p-6">
              <h2 className="font-display text-2xl">{t("cart.summary")}</h2>
              <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pe-1">
                {items.map(({ ci, p, c }) => (
                  <div key={`${ci.id}-${ci.colorId}-${ci.size}`} className="flex items-center gap-3">
                    <div className="w-10 shrink-0 bg-cream-2 overflow-hidden border border-ink/10">
                      <Garment type={p.type} color={c.hex} view="front" label="" className="aspect-[4/5] w-full" />
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm">{p.name[lang]} <span className="text-mute">×{ci.qty}</span></p>
                    <p className="text-sm tabular-nums">{money(p.price * ci.qty, lang)}</p>
                  </div>
                ))}
              </div>
              <dl className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-mute">{t("cart.subtotal")}</dt><dd className="tabular-nums">{money(cartSubtotal, lang)}</dd></div>
                {discount > 0 && <div className="flex justify-between text-green-800"><dt>{t("cart.discount")} ({applied})</dt><dd className="tabular-nums">−{money(discount, lang)}</dd></div>}
                <div className="flex justify-between"><dt className="text-mute">{t("cart.shipping")}</dt><dd className={cn("tabular-nums", shipping === 0 && "text-green-800 font-medium")}>{shipping === 0 ? t("cart.free") : money(shipping, lang)}</dd></div>
                <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium"><dt>{t("cart.total")}</dt><dd className="tabular-nums">{money(total, lang)}</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
