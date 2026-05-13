import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Crown, ShoppingBag, Heart, User, Search, Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";
import { useTheme } from "./theme-provider";
import { useGetSearchSuggestions } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { theme, setTheme } = useTheme();
  const searchRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: suggestions } = useGetSearchSuggestions(
    { q: debouncedQ },
    { query: { enabled: debouncedQ.length >= 2, queryKey: ["search-suggestions", debouncedQ] } }
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
  ];

  const isAdmin = location.startsWith("/admin");

  if (isAdmin) return null;

  const handleSearch = (q: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-background/80 backdrop-blur-sm"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Crown className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-serif text-xl font-bold text-foreground tracking-wide">Princess Empire</span>
              <p className="text-xs text-muted-foreground leading-none">Elegance for Everyone</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-foreground/70"}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                Categories <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2">
                {["Clothing", "Shoes", "Perfumes", "Beauty", "Accessories", "Bags", "Lingerie", "Jewellery"].map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop?category=${cat}`}
                    className="block px-3 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-accent rounded-lg transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full hover:bg-accent transition-colors text-foreground/70 hover:text-primary"
                data-testid="button-search-toggle"
              >
                <Search className="w-5 h-5" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-12 w-72 sm:w-80 bg-card border border-border rounded-2xl shadow-xl p-3 z-50">
                  <input
                    autoFocus
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && searchQuery) handleSearch(searchQuery); }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    data-testid="input-search"
                  />
                  {suggestions && suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(s)}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-foreground/80"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-accent transition-colors text-foreground/70 hover:text-primary"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 rounded-full hover:bg-accent transition-colors text-foreground/70 hover:text-primary" data-testid="link-wishlist">
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground">{wishlistItems.length}</Badge>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-accent transition-colors text-foreground/70 hover:text-primary" data-testid="link-cart">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground">{itemCount}</Badge>
              )}
            </Link>

            {/* Account */}
            <Link href="/account" className="hidden sm:flex p-2 rounded-full hover:bg-accent transition-colors text-foreground/70 hover:text-primary" data-testid="link-account">
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-accent transition-colors text-foreground/70"
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-xl text-sm font-medium transition-colors ${location === link.href ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-accent hover:text-primary"}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border">
              <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</p>
              {["Clothing", "Shoes", "Perfumes", "Beauty", "Accessories", "Bags", "Lingerie", "Jewellery"].map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=${cat}`}
                  className="block px-4 py-2 rounded-xl text-sm text-foreground/70 hover:bg-accent hover:text-primary transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
            <Link href="/account" className="block px-4 py-2 rounded-xl text-sm text-foreground/70 hover:bg-accent transition-colors">My Account</Link>
          </div>
        </div>
      )}
    </header>
  );
}
