import { ReactNode, ReactElement } from "react";
import { Link, useLocation } from "wouter";
import {
  Crown, LayoutDashboard, Package, ShoppingCart, Settings, FolderOpen, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-foreground transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-background/10">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Crown className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-serif text-background font-bold leading-tight">Princess Empire</p>
            <p className="text-background/40 text-xs">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 flex-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "text-background/60 hover:bg-background/10 hover:text-background"}`}
                data-testid={`nav-admin-${label.toLowerCase()}`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-background/10 mt-auto">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/40 hover:text-background/70 hover:bg-background/10 transition-colors mb-1">
            <Package className="w-4 h-4" /> View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-background/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-sm font-medium text-muted-foreground">
              {NAV.find((n) => location === n.href || (n.href !== "/admin" && location.startsWith(n.href)))?.label ?? "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-foreground">Administrator</p>
              <p className="text-xs text-muted-foreground">admin@princessempire.com</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function requireAdmin(Component: () => ReactElement) {
  return function ProtectedAdmin() {
    const [, navigate] = useLocation();
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      navigate("/admin");
      return null;
    }
    return <Component />;
  };
}
