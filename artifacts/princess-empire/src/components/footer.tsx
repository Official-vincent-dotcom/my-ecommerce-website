import { Link } from "wouter";
import { Crown, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Crown className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-bold">Princess Empire</span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed mb-4">
              Your destination for premium fashion, beauty, and lifestyle products. Elegance for everyone, delivered to your door across Nigeria and Africa.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/80">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/shop", label: "Shop All" },
                { href: "/shop?featured=true", label: "Featured" },
                { href: "/shop?bestSeller=true", label: "Best Sellers" },
                { href: "/shop?flashSale=true", label: "Flash Sales" },
                { href: "/wishlist", label: "My Wishlist" },
                { href: "/cart", label: "My Cart" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/60 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/80">Categories</h3>
            <ul className="space-y-2">
              {["Clothing", "Shoes", "Perfumes", "Beauty", "Accessories", "Bags", "Lingerie", "Jewellery"].map((cat) => (
                <li key={cat}>
                  <Link href={`/shop?category=${cat}`} className="text-sm text-background/60 hover:text-primary transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/80">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-background/60">Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-background/60">+234 801 234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-background/60">hello@princessempire.com</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">Newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-lg bg-background/10 border border-background/20 text-sm text-background placeholder:text-background/40 outline-none focus:border-primary"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/40 text-xs">© {new Date().getFullYear()} Princess Empire. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-background/40 hover:text-background/70 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-background/40 hover:text-background/70 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-background/40 hover:text-background/70 transition-colors">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
