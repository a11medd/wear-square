import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { makeT, type Lang, type TFn } from "./i18n";
import { getProduct, type Product } from "./products";

// ---------- types ----------
export interface CartItem {
  id: string;
  colorId: string;
  size: string;
  qty: number;
}

export interface OrderLine {
  id: string;
  name: { en: string; ar: string };
  colorName: { en: string; ar: string };
  hex: string;
  type: Product["type"];
  size: string;
  qty: number;
  price: number;
}

export interface Address {
  gov: string;
  area: string;
  address: string;
  building: string;
  apartment: string;
  notes: string;
  savedAt: string;
}

export interface Order {
  no: string;
  date: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  customer: { name: string; phone: string; email: string };
  delivery: Address;
  expected: { from: string; to: string };
  payment: "card" | "cod";
}

export interface AccountUser {
  name: string;
  email: string;
  since: string;
}

export interface Route {
  path: string;
  parts: string[];
  query: URLSearchParams;
}

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFn;
  dir: "ltr" | "rtl";
  route: Route;
  navigate: (to: string) => void;
  cart: CartItem[];
  addToCart: (p: Product, colorId: string, size: string) => "added" | "updated";
  setQty: (idx: number, qty: number) => void;
  removeItem: (idx: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  toasts: { id: number; text: string }[];
  toast: (text: string) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  user: AccountUser | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  orders: Order[];
  placeOrder: (o: Omit<Order, "no" | "date" | "expected">) => Order;
  addresses: Address[];
  removeAddress: (savedAt: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

// ---------- persistence ----------
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

// ---------- router ----------
function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, "");
  const [p, q] = h.split("?");
  return { path: p || "", parts: (p || "").split("/").filter(Boolean), query: new URLSearchParams(q || "") };
}

// ---------- provider ----------
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => load<Lang>("ws_lang", "en"));
  const [route, setRoute] = useState<Route>(parseHash);
  const [cart, setCart] = useState<CartItem[]>(() => load<CartItem[]>("ws_cart", []));
  const [orders, setOrders] = useState<Order[]>(() => load<Order[]>("ws_orders", []));
  const [addresses, setAddresses] = useState<Address[]>(() => load<Address[]>("ws_addresses", []));
  const [user, setUser] = useState<AccountUser | null>(() => load<AccountUser | null>("ws_user", null));
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toastId = useRef(0);

  const t = useMemo(() => makeT(lang), [lang]);
  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => save("ws_cart", cart), [cart]);
  useEffect(() => save("ws_orders", orders), [orders]);
  useEffect(() => save("ws_addresses", addresses), [addresses]);
  useEffect(() => save("ws_user", user), [user]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    save("ws_lang", l);
  }, []);

  // route changes
  useEffect(() => {
    const onHash = () => {
      const next = parseHash();
      setRoute((prev) => {
        if (prev.path !== next.path) window.scrollTo({ top: 0, behavior: "auto" });
        return next;
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((to: string) => {
    const target = to.startsWith("/") ? to : `/${to}`;
    if (window.location.hash === `#${target}`) return;
    window.location.hash = target;
  }, []);

  const toast = useCallback((text: string) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts.slice(-2), { id, text }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3200);
  }, []);

  const addToCart = useCallback((p: Product, colorId: string, size: string): "added" | "updated" => {
    let result: "added" | "updated" = "added";
    setCart((c) => {
      const idx = c.findIndex((i) => i.id === p.id && i.colorId === colorId && i.size === size);
      if (idx >= 0) {
        result = "updated";
        const next = [...c];
        next[idx] = { ...next[idx], qty: Math.min(9, next[idx].qty + 1) };
        return next;
      }
      return [...c, { id: p.id, colorId, size, qty: 1 }];
    });
    return result;
  }, []);

  const setQty = useCallback((idx: number, qty: number) => {
    setCart((c) => c.map((i, n) => (n === idx ? { ...i, qty: Math.max(1, Math.min(9, qty)) } : i)));
  }, []);

  const removeItem = useCallback((idx: number) => {
    setCart((c) => c.filter((_, n) => n !== idx));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((a, i) => a + i.qty, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((a, i) => a + (getProduct(i.id)?.price ?? 0) * i.qty, 0),
    [cart]
  );

  const login = useCallback((name: string, email: string) => {
    setUser({ name, email, since: new Date().toISOString() });
  }, []);
  const logout = useCallback(() => setUser(null), []);

  const placeOrder = useCallback((o: Omit<Order, "no" | "date" | "expected">): Order => {
    const d = new Date();
    const no = `WS-${d.getFullYear().toString().slice(2)}${String(Math.floor(Math.random() * 90000) + 10000)}`;
    const fmt = (dt: Date) => dt.toISOString().slice(0, 10);
    const from = new Date(d.getTime() + 3 * 864e5);
    const to = new Date(d.getTime() + 6 * 864e5);
    const order: Order = { ...o, no, date: d.toISOString(), expected: { from: fmt(from), to: fmt(to) } };
    setOrders((os) => [order, ...os]);
    setAddresses((as) =>
      [{ ...o.delivery, savedAt: d.toISOString() }, ...as.filter((a) => a.savedAt !== o.delivery.savedAt)].slice(0, 4)
    );
    setCart([]);
    return order;
  }, []);

  const removeAddress = useCallback((savedAt: string) => {
    setAddresses((as) => as.filter((a) => a.savedAt !== savedAt));
  }, []);

  const value: AppCtx = {
    lang, setLang, t, dir,
    route, navigate,
    cart, addToCart, setQty, removeItem, clearCart, cartCount, cartSubtotal,
    toasts, toast,
    searchOpen, setSearchOpen,
    drawerOpen, setDrawerOpen,
    user, login, logout,
    orders, placeOrder,
    addresses, removeAddress,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
