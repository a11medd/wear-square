import { useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";
import { money, GOVERNORATES } from "../lib/products";
import { Btn, Reveal, IcCheck, IcTrash, IcArrow } from "../components/ui";

type Tab = "profile" | "orders" | "addresses" | "login" | "register";

export function AccountPage() {
  const { t, lang, route, navigate, user, login, logout, orders, addresses, removeAddress, toast, cart } = useApp();
  const initialTab = (route.query.get("tab") as Tab | null) ?? (user ? "profile" : "login");
  const [tab, setTab] = useState<Tab>(initialTab);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [openOrder, setOpenOrder] = useState<string | null>(null);

  const doLogin = () => {
    const em = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em) || form.password.length < 4) {
      setErr(t("acc.errLogin"));
      return;
    }
    const name = form.name.trim() || em.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    login(name, em);
    setErr(null);
    setForm({ name: "", email: "", password: "" });
    toast(t("toast.welcome", { name: name.split(" ")[0] }));
    setTab("profile");
  };

  const doRegister = () => {
    if (form.name.trim().length < 3) { setErr(t("acc.errName")); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) { setErr(t("acc.errLogin")); return; }
    if (form.password.length < 4) { setErr(t("acc.errPass")); return; }
    login(form.name.trim(), form.email.trim());
    setErr(null);
    setForm({ name: "", email: "", password: "" });
    toast(t("toast.welcome", { name: form.name.trim().split(" ")[0] }));
    setTab("profile");
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  const tabBtn = (id: Tab, label: string, icon?: ReactNode) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5 text-sm transition-colors border-s-2",
        tab === id ? "border-wine-800 bg-wine-100/60 text-wine-900 font-medium" : "border-transparent text-ink/70 hover:bg-cream-2"
      )}
    >
      {icon}{label}
    </button>
  );

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h1 className="font-display text-5xl font-medium">
            {user ? `${t("acc.welcome")}, ${user.name.split(" ")[0]}` : t("nav.account")}
          </h1>
          <p className="mt-2 text-sm text-mute">{t("acc.demoNote")}</p>
        </Reveal>

        {!user ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-12 items-start">
            {/* Column 1: Standalone Guest Checkout Card */}
            <div className="lg:col-span-5 rounded-sm border-2 border-wine-800 bg-wine-50/50 p-6 md:p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1 text-xs font-semibold mb-4">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                {lang === "ar" ? "الخيار الأسرع للشراء" : "Fastest Option"}
              </div>

              <h2 className="font-display text-2xl md:text-3xl text-wine-950 font-medium">
                {lang === "ar" ? "إتمام الشراء السريع كزائر" : "Continue as Guest"}
              </h2>

              <p className="mt-3 text-sm text-ink/75 leading-relaxed">
                {lang === "ar"
                  ? "أتمم طلبك فوراً بدون إنشاء حساب أو تذكر كلمة مرور. سنطلب منك فقط معلومات التوصيل لاستلام الشحنة."
                  : "Complete your order immediately without creating an account or remembering passwords. We will only ask for delivery details."}
              </p>

              <ul className="mt-6 space-y-3 text-xs text-ink/80">
                <li className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-700 text-cream text-[0.65rem] font-bold">✓</span>
                  <span className="font-medium">{lang === "ar" ? "بدون تسجيل دخول أو إنشاء حساب نهائياً" : "Zero registration or password required"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-700 text-cream text-[0.65rem] font-bold">✓</span>
                  <span className="font-medium">{lang === "ar" ? "معلومات التوصيل فقط (الاسم، التليفون، العنوان)" : "Delivery info only (name, phone, address)"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-700 text-cream text-[0.65rem] font-bold">✓</span>
                  <span className="font-medium">{lang === "ar" ? "الدفع عند الاستلام متاح لجميع أنحاء الجمهورية" : "Cash on delivery available nationwide"}</span>
                </li>
              </ul>

              <div className="mt-8 pt-4 border-t border-wine-800/20">
                <Btn
                  className="w-full py-4 text-sm font-bold uppercase tracking-wide bg-wine-800 hover:bg-wine-900 text-cream shadow-md flex items-center justify-center gap-2"
                  onClick={() => navigate(cart.length > 0 ? "/checkout" : "/shop")}
                  data-testid="account-guest-btn"
                >
                  {lang === "ar" ? "المتابعة كزائر وإتمام الشراء" : "Proceed as Guest"}
                  <IcArrow className="h-4 w-4 rtl:rotate-180" />
                </Btn>
                {cart.length === 0 && (
                  <p className="mt-2 text-center text-xs text-mute">
                    {lang === "ar" ? "سلتك فارغة حالياً — سينقلك لتصفح المنتجات" : "Your cart is empty — opens shop"}
                  </p>
                )}
              </div>
            </div>

            {/* Column 2: Account Login & Register Card */}
            <div className="lg:col-span-7 rounded-sm border border-ink/15 bg-cream p-6 md:p-8">
              <div className="flex border-b border-ink/10 mb-6">
                <button
                  onClick={() => { setTab("login"); setErr(null); }}
                  className={cn(
                    "pb-3 px-4 text-sm font-medium border-b-2 transition-colors",
                    tab === "login" ? "border-wine-800 text-wine-900 font-bold" : "border-transparent text-mute hover:text-ink"
                  )}
                >
                  {t("acc.login")}
                </button>
                <button
                  onClick={() => { setTab("register"); setErr(null); }}
                  className={cn(
                    "pb-3 px-4 text-sm font-medium border-b-2 transition-colors",
                    tab === "register" ? "border-wine-800 text-wine-900 font-bold" : "border-transparent text-mute hover:text-ink"
                  )}
                >
                  {t("acc.register")}
                </button>
              </div>

              {tab === "login" ? (
                <div>
                  <h3 className="font-display text-2xl font-medium">{t("acc.login")}</h3>
                  <p className="mt-1 text-xs text-mute">{t("acc.loginSub")}</p>
                  <div className="mt-6 space-y-4">
                    <Field id="l-email" label={t("acc.email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" />
                    <Field id="l-pass" label={t("acc.password")} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••" />
                    {err && <p className="text-xs text-wine-800" role="alert">{err}</p>}
                    <Btn className="w-full py-3.5" onClick={doLogin}>{t("acc.loginBtn")}</Btn>
                  </div>
                  <p className="mt-5 text-sm text-mute">
                    {t("acc.noAccount")}{" "}
                    <button onClick={() => { setTab("register"); setErr(null); }} className="text-wine-800 underline underline-offset-4">{t("acc.register")}</button>
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="font-display text-2xl font-medium">{t("acc.register")}</h3>
                  <p className="mt-1 text-xs text-mute">{t("acc.registerSub")}</p>
                  <div className="mt-6 space-y-4">
                    <Field id="r-name" label={t("acc.name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder={lang === "ar" ? "الاسم بالكامل" : "Full name"} />
                    <Field id="r-email" label={t("acc.email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" />
                    <Field id="r-pass" label={t("acc.password")} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••" />
                    {err && <p className="text-xs text-wine-800" role="alert">{err}</p>}
                    <Btn className="w-full py-3.5" onClick={doRegister}>{t("acc.registerBtn")}</Btn>
                  </div>
                  <p className="mt-5 text-sm text-mute">
                    {t("acc.haveAccount")}{" "}
                    <button onClick={() => { setTab("login"); setErr(null); }} className="text-wine-800 underline underline-offset-4">{t("acc.login")}</button>
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
            {/* sidebar */}
            <aside className="border border-ink/15 self-start lg:sticky lg:top-28">
              <div className="flex items-center gap-3 border-b border-ink/10 p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-wine-800 font-display text-lg text-cream">
                  {user.name[0]?.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{user.name}</p>
                  <p className="truncate text-xs text-mute">{user.email}</p>
                </div>
              </div>
              <nav className="p-2" aria-label="Account">
                {tabBtn("profile", t("acc.profile"))}
                {tabBtn("orders", t("acc.orders"))}
                {tabBtn("addresses", t("acc.addresses"))}
                <button
                  onClick={() => { logout(); toast(t("toast.logout")); setTab("login"); }}
                  className="flex w-full items-center gap-3 border-s-2 border-transparent px-4 py-3.5 text-sm text-wine-800 hover:bg-wine-100/60"
                >
                  {t("acc.logout")}
                </button>
              </nav>
            </aside>

            {/* panel */}
            <div className="min-w-0">

            {/* -------- PROFILE -------- */}
            {tab === "profile" && user && (
              <div className="anim-fade-up">
                <h2 className="font-display text-3xl">{t("acc.profile")}</h2>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="border border-ink/15 p-4">
                    <dt className="text-[0.62rem] uppercase tracking-[0.22em] text-mute">{t("acc.name")}</dt>
                    <dd className="mt-1.5 text-sm font-medium">{user.name}</dd>
                  </div>
                  <div className="border border-ink/15 p-4">
                    <dt className="text-[0.62rem] uppercase tracking-[0.22em] text-mute">{t("acc.email")}</dt>
                    <dd className="mt-1.5 text-sm font-medium" dir="ltr">{user.email}</dd>
                  </div>
                  <div className="border border-ink/15 p-4 sm:col-span-2">
                    <dt className="text-[0.62rem] uppercase tracking-[0.22em] text-mute">{t("acc.memberSince")}</dt>
                    <dd className="mt-1.5 text-sm font-medium">{fmt(user.since)}</dd>
                  </div>
                </dl>
                <div className="mt-6 border border-ink/15 bg-cream-2/60 p-4 text-sm text-mute flex gap-2.5">
                  <IcCheck className="h-4 w-4 shrink-0 mt-0.5 text-wine-800" />
                  {t("acc.guestSub")}
                </div>
              </div>
            )}

            {/* -------- ORDERS -------- */}
            {tab === "orders" && user && (
              <div className="anim-fade-up">
                <h2 className="font-display text-3xl">{t("acc.orders")}</h2>
                {orders.length === 0 ? (
                  <div className="mt-6 border border-dashed border-ink/20 p-10 text-center">
                    <p className="font-display text-xl">{t("acc.ordersEmpty")}</p>
                    <p className="mt-2 text-sm text-mute">{t("acc.ordersEmpty.sub")}</p>
                    <Btn variant="outline" className="mt-6" onClick={() => navigate("/shop")}>{t("acc.shopNow")}</Btn>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {orders.map((o) => (
                      <div key={o.no} className="border border-ink/15">
                        <button
                          onClick={() => setOpenOrder(openOrder === o.no ? null : o.no)}
                          className="flex w-full flex-wrap items-center gap-x-6 gap-y-1 p-4 text-start hover:bg-cream-2/60 transition-colors"
                          aria-expanded={openOrder === o.no}
                        >
                          <span className="font-display text-lg text-wine-800" dir="ltr">{o.no}</span>
                          <span className="text-xs text-mute">{t("acc.orderDate")} {fmt(o.date)}</span>
                          <span className="text-xs text-mute">{t("acc.expectedLabel")} {o.expected.from} → {o.expected.to}</span>
                          <span className="ms-auto text-sm font-medium tabular-nums">{money(o.total, lang)}</span>
                        </button>
                        {openOrder === o.no && (
                          <div className="border-t border-ink/10 divide-y divide-ink/10">
                            {o.lines.map((l, i) => (
                              <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                                <span className="h-3 w-3 rounded-full border border-ink/20 shrink-0" style={{ backgroundColor: l.hex }} />
                                <span className="min-w-0 flex-1 truncate">{l.name[lang]}</span>
                                <span className="text-xs text-mute">{l.colorName[lang]} · {l.size} · ×{l.qty}</span>
                                <span className="tabular-nums">{money(l.price * l.qty, lang)}</span>
                              </div>
                            ))}
                            <div className="px-4 py-3">
                              <a href={`#/order/${o.no}`} className="text-sm text-wine-800 underline underline-offset-4">{t("conf.summary")}</a>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* -------- ADDRESSES -------- */}
            {tab === "addresses" && user && (
              <div className="anim-fade-up">
                <h2 className="font-display text-3xl">{t("acc.addresses")}</h2>
                {addresses.length === 0 ? (
                  <div className="mt-6 border border-dashed border-ink/20 p-10 text-center">
                    <p className="font-display text-xl">{t("acc.addressEmpty")}</p>
                    <p className="mt-2 text-sm text-mute">{t("acc.addressEmpty.sub")}</p>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {addresses.map((a) => {
                      const g = GOVERNORATES.find((x) => x.en === a.gov);
                      return (
                        <div key={a.savedAt} className="border border-ink/15 p-4">
                          <p className="text-sm font-medium">{g ? (lang === "ar" ? g.ar : g.en) : a.gov} — {a.area}</p>
                          <p className="mt-1 text-sm text-mute leading-relaxed">{a.building} · {a.address}{a.apartment && <> · {a.apartment}</>}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[0.65rem] text-mute">{t("acc.savedOn", { d: fmt(a.savedAt) })}</span>
                            <button
                              onClick={() => removeAddress(a.savedAt)}
                              className="inline-flex items-center gap-1 text-xs text-mute hover:text-wine-800 transition-colors"
                            >
                              <IcTrash className="h-3.5 w-3.5" /> {t("acc.delete")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* fallback when logged out but on a signed-in tab */}
            {user === null && ["profile", "orders", "addresses"].includes(tab) && (
              <div className="anim-fade-up max-w-md">
                <h2 className="font-display text-3xl">{t("acc.login")}</h2>
                <p className="mt-2 text-sm text-mute">{t("acc.guestSub")}</p>
                <Btn className="mt-6" onClick={() => setTab("login")}>{t("acc.loginBtn")}</Btn>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  id, label, value, onChange, type = "text", placeholder,
}: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-[0.68rem] uppercase tracking-[0.2em] text-mute">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={type === "email" ? "ltr" : undefined}
        className="mt-1.5 w-full border border-ink/25 bg-cream px-3.5 py-3 text-sm outline-none transition-colors focus:border-wine-800 placeholder:text-mute/50"
      />
    </div>
  );
}
