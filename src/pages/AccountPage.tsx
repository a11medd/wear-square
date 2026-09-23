import { useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { useApp } from "../lib/store";
import { money, GOVERNORATES } from "../lib/products";
import { Btn, Reveal, IcCheck, IcTrash } from "../components/ui";

type Tab = "profile" | "orders" | "addresses" | "login" | "register";

export function AccountPage() {
  const { t, lang, route, navigate, user, login, logout, orders, addresses, removeAddress, toast } = useApp();
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

        <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* sidebar */}
          <aside className="border border-ink/15 self-start lg:sticky lg:top-28">
            <div className="flex items-center gap-3 border-b border-ink/10 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-wine-800 font-display text-lg text-cream">
                {user ? user.name[0]?.toUpperCase() : "G"}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{user ? user.name : t("acc.guest")}</p>
                <p className="truncate text-xs text-mute">{user ? user.email : ""}</p>
              </div>
            </div>
            <nav className="p-2" aria-label="Account">
              {user ? (
                <>
                  {tabBtn("profile", t("acc.profile"))}
                  {tabBtn("orders", t("acc.orders"))}
                  {tabBtn("addresses", t("acc.addresses"))}
                  <button
                    onClick={() => { logout(); toast(t("toast.logout")); setTab("login"); }}
                    className="flex w-full items-center gap-3 border-s-2 border-transparent px-4 py-3.5 text-sm text-wine-800 hover:bg-wine-100/60"
                  >
                    {t("acc.logout")}
                  </button>
                </>
              ) : (
                <>
                  {tabBtn("login", t("acc.login"))}
                  {tabBtn("register", t("acc.register"))}
                </>
              )}
            </nav>
          </aside>

          {/* panel */}
          <div className="min-w-0">
            {/* -------- LOGIN -------- */}
            {tab === "login" && !user && (
              <div className="anim-fade-up max-w-md">
                <h2 className="font-display text-3xl">{t("acc.login")}</h2>
                <p className="mt-2 text-sm text-mute">{t("acc.loginSub")}</p>
                <div className="mt-7 space-y-4">
                  <Field id="l-email" label={t("acc.email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" />
                  <Field id="l-pass" label={t("acc.password")} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••" />
                  {err && <p className="text-xs text-wine-800" role="alert">{err}</p>}
                  <Btn className="w-full py-3.5" onClick={doLogin}>{t("acc.loginBtn")}</Btn>
                </div>
                <p className="mt-5 text-sm text-mute">
                  {t("acc.noAccount")}{" "}
                  <button onClick={() => { setTab("register"); setErr(null); }} className="text-wine-800 underline underline-offset-4">{t("acc.register")}</button>
                </p>
                <button onClick={() => navigate("/shop")} className="mt-6 text-sm text-ink/70 hover:text-ink underline underline-offset-4">
                  {t("common.guest")}
                </button>
              </div>
            )}

            {/* -------- REGISTER -------- */}
            {tab === "register" && !user && (
              <div className="anim-fade-up max-w-md">
                <h2 className="font-display text-3xl">{t("acc.register")}</h2>
                <p className="mt-2 text-sm text-mute">{t("acc.registerSub")}</p>
                <div className="mt-7 space-y-4">
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
