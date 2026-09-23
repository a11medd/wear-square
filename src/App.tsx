import { AppProvider, useApp } from "./lib/store";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Toasts } from "./components/ui";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { AccountPage } from "./pages/AccountPage";

function Shell() {
  const { route } = useApp();
  const [head, arg] = route.parts;
  const isHome = !head;
  const isPdp = head === "product" && !!arg;

  return (
    <div className="flex min-h-screen flex-col">
      <Header overHero={isHome} />
      <main id="main" className="flex-1">
        {isHome && <Home />}
        {head === "shop" && <Shop />}
        {isPdp && <ProductPage id={arg} />}
        {head === "cart" && <CartPage />}
        {head === "checkout" && <CheckoutPage />}
        {head === "order" && arg && <ConfirmationPage no={arg} />}
        {head === "account" && <AccountPage />}
        {!isHome && head !== "shop" && !isPdp && head !== "cart" && head !== "checkout" && head !== "order" && head !== "account" && (
          <div className="pt-40 pb-32 text-center">
            <p className="font-display text-6xl text-wine-800">404</p>
            <a href="#/" className="mt-6 inline-block text-sm underline underline-offset-4">
              <span dir="auto">Wear Square</span>
            </a>
          </div>
        )}
      </main>
      <Footer />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
