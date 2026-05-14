import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/components/cart-context";
import { WishlistProvider } from "@/components/wishlist-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";

import HomePage from "@/pages/home";
import ShopPage from "@/pages/shop";
import ProductDetailPage from "@/pages/product-detail";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import WishlistPage from "@/pages/wishlist";
import AccountPage from "@/pages/account";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import { AdminNewProduct, AdminEditProduct } from "@/pages/admin/product-form";
import AdminOrders from "@/pages/admin/orders";
import AdminCategories from "@/pages/admin/categories";
import AdminSettings from "@/pages/admin/settings";
import LandingPage from "@/pages/landing";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function Router() {
  return (
    <Switch>
      {/* Landing page */}
      <Route path="/landing" component={LandingPage} />

      {/* Public store */}
      <Route path="/" component={() => <StoreLayout><HomePage /></StoreLayout>} />
      <Route path="/shop" component={() => <StoreLayout><ShopPage /></StoreLayout>} />
      <Route path="/product/:id" component={() => <StoreLayout><ProductDetailPage /></StoreLayout>} />
      <Route path="/cart" component={() => <StoreLayout><CartPage /></StoreLayout>} />
      <Route path="/checkout" component={() => <StoreLayout><CheckoutPage /></StoreLayout>} />
      <Route path="/wishlist" component={() => <StoreLayout><WishlistPage /></StoreLayout>} />
      <Route path="/account" component={() => <StoreLayout><AccountPage /></StoreLayout>} />

      {/* Admin */}
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/new" component={AdminNewProduct} />
      <Route path="/admin/products/:id/edit" component={AdminEditProduct} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/settings" component={AdminSettings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="pe-theme">
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
