import { useState } from "react";
import { useLocation } from "wouter";
import { User, Package, Heart, LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWishlist } from "@/components/wishlist-context";
import { useCart } from "@/components/cart-context";
import { Link } from "wouter";

const SAMPLE_ORDERS = [
  { id: 1001, date: "2026-05-10", status: "delivered", total: 45000, items: 3 },
  { id: 1002, date: "2026-05-08", status: "shipped", total: 28500, items: 2 },
  { id: 1003, date: "2026-05-01", status: "pending", total: 67000, items: 5 },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("pe_user_email"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const { items: wishlistItems } = useWishlist();
  const { itemCount } = useCart();
  const [, navigate] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setLoginError("Please fill in all fields"); return; }
    localStorage.setItem("pe_user_email", email);
    setIsLoggedIn(true);
    setLoginError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("pe_user_email");
    setIsLoggedIn(false);
  };

  const userEmail = localStorage.getItem("pe_user_email") || email;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center pb-16">
        <div className="w-full max-w-md px-4">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground text-sm mt-1">Sign in to your Princess Empire account</p>
            </div>

            {loginError && (
              <div className="mb-4 px-4 py-3 bg-destructive/10 text-destructive rounded-xl text-sm">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  data-testid="input-password"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl py-5" data-testid="button-login">
                Sign In
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <button className="text-primary hover:underline font-medium">Create one</button>
            </p>

            <div className="mt-6 pt-5 border-t border-border text-center">
              <p className="text-xs text-muted-foreground mb-2">Are you an admin?</p>
              <Link href="/admin" className="text-xs text-primary hover:underline">Admin Login →</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">My Account</h1>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 rounded-xl">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Package, label: "Orders", value: SAMPLE_ORDERS.length },
            { icon: Heart, label: "Wishlist", value: wishlistItems.length },
            { icon: ShoppingBag, label: "Cart Items", value: itemCount },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border border-border rounded-xl p-1 mb-6 bg-muted w-fit">
          {(["profile", "orders", "wishlist"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md">
            <h2 className="font-semibold text-foreground mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={userEmail} readOnly className="mt-1 bg-muted" />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input placeholder="Your name" className="mt-1" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input placeholder="+234..." className="mt-1" />
              </div>
              <Button className="rounded-xl">Save Changes</Button>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            {SAMPLE_ORDERS.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-foreground">Order #{order.id}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.date} · {order.items} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">₦{order.total.toLocaleString()}</p>
                  <button className="text-xs text-primary hover:underline mt-1">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No saved items yet</p>
                <Link href="/shop"><Button variant="outline" size="sm" className="mt-4 rounded-xl">Browse Products</Button></Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlistItems.map((p) => (
                  <Link key={p.id} href={`/product/${p.id}`} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                    <img src={p.images[0] || `https://picsum.photos/seed/${p.id}/200/250`} alt={p.name} className="w-full aspect-square object-cover" />
                    <div className="p-3">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{p.name}</p>
                      <p className="text-primary font-bold text-sm mt-1">₦{p.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
