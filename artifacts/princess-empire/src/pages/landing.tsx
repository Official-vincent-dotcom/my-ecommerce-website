import { Link } from "wouter";
import { Crown, Truck, RotateCcw, ShieldCheck, Star, ArrowRight, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { name: "Clothing", slug: "clothing", desc: "Ankara prints, bodycon dresses, co-ord sets, and everyday Nigerian fashion.", icon: "👗" },
  { name: "Shoes", slug: "shoes", desc: "Platform heels, sandals, sneakers, and all the footwear to match every look.", icon: "👠" },
  { name: "Perfumes", slug: "perfumes", desc: "Luxury fragrances — from oriental oud to fresh florals — for every occasion.", icon: "🌸" },
  { name: "Beauty", slug: "beauty", desc: "Skincare, makeup, and grooming essentials curated for the African complexion.", icon: "✨" },
  { name: "Bags", slug: "bags", desc: "Designer-inspired handbags, totes, clutches, and backpacks for every style.", icon: "👜" },
  { name: "Jewellery", slug: "jewellery", desc: "Gold chains, beaded accessories, earrings, and statement pieces.", icon: "💎" },
  { name: "Accessories", slug: "accessories", desc: "Scarves, belts, sunglasses, and finishing touches that complete any outfit.", icon: "🧣" },
  { name: "Lingerie", slug: "lingerie", desc: "Elegant, comfortable lingerie sets for every body type and occasion.", icon: "🎀" },
];

const TRUST = [
  { icon: Truck, title: "Free Delivery", desc: "On all orders over ₦15,000 nationwide across Nigeria." },
  { icon: ShieldCheck, title: "100% Authentic", desc: "Every product is genuine — no replicas, no surprises." },
  { icon: RotateCcw, title: "7-Day Returns", desc: "Not satisfied? Return within 7 days, hassle-free." },
  { icon: Star, title: "Thousands of Reviews", desc: "Loved by customers in Lagos, Abuja, Port Harcourt and beyond." },
];

const FAQS = [
  {
    q: "Where does Princess Empire deliver to?",
    a: "We deliver to all states in Nigeria. Standard delivery takes 2–5 business days depending on your location. Lagos and Abuja orders are often delivered within 1–2 days.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bank transfers, debit/credit cards, and pay-on-delivery for select locations. All transactions are secure and encrypted.",
  },
  {
    q: "Are all products authentic?",
    a: "Yes. Every item stocked by Princess Empire is 100% authentic. We source directly from verified suppliers and brands.",
  },
  {
    q: "How do I return an item?",
    a: "If you're not satisfied, contact us via WhatsApp or email within 7 days of delivery. Items must be unused and in original packaging.",
  },
  {
    q: "Do you sell Ankara and African print clothing?",
    a: "Absolutely. Our clothing category features a wide selection of Ankara wrap dresses, co-ord sets, and African print pieces that celebrate Nigerian culture and fashion.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-serif font-bold text-lg text-foreground">Princess Empire</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">Shop</Link>
          <Link href="/">
            <Button size="sm">Enter Store</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80 text-background py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Nigeria's Premium Fashion Destination</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Shop African Fashion,<br />
            <span className="text-primary">Delivered to Your Door</span>
          </h1>
          <p className="text-background/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Princess Empire is Nigeria's curated online fashion store — offering premium clothing, shoes, perfumes, beauty products, bags, jewellery, accessories, and lingerie at prices that celebrate you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button size="lg" className="text-base px-8 py-6 rounded-full">
                Shop All Products <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-full border-background/30 text-background hover:bg-background/10">
                Visit Homepage
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-14 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-5">
              Where African Elegance Meets Modern Style
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Princess Empire was founded with a singular mission: to make premium fashion accessible to every Nigerian woman and man. We believe that style should never be compromised by availability or price.
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              From the vibrant Ankara prints of West Africa to world-class luxury fragrances, our curated catalogue spans over 35 hand-picked products across 8 categories. Every piece is selected for quality, cultural resonance, and everyday wearability.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Serving customers in Lagos, Abuja, Port Harcourt, Kano, and beyond — we deliver elegance to your doorstep.
            </p>
            <Link href="/shop">
              <Button variant="outline" className="rounded-full">
                Browse All Products <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://picsum.photos/seed/land1/400/500" alt="African fashion clothing" className="rounded-2xl w-full object-cover aspect-[4/5]" />
            <img src="https://picsum.photos/seed/land2/400/500" alt="Nigerian jewellery and accessories" className="rounded-2xl w-full object-cover aspect-[4/5] mt-8" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">Shop by Category</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Eight thoughtfully curated categories covering everything you need to look and feel your best.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`}>
                <div className="group bg-background border border-border rounded-2xl p-6 hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                  <span className="text-3xl mb-3 block">{cat.icon}</span>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-5">Why Nigerians Choose Princess Empire</h2>
          <p className="text-muted-foreground mb-10 text-lg">Thousands of satisfied customers across Nigeria trust us for their fashion and beauty needs.</p>
          <div className="space-y-5 text-left">
            {[
              { heading: "Curated for the African Woman & Man", body: "Our buyers select products that reflect African beauty standards, skin tones, and cultural aesthetics — not generic Western catalogues." },
              { heading: "Real Prices in Nigerian Naira (₦)", body: "Every price is listed in ₦ Naira. No hidden FX conversions, no dollar surprises at checkout. What you see is what you pay." },
              { heading: "Secure and Simple Checkout", body: "Our checkout is fast, validated, and secure. Place an order in under 3 minutes with full order tracking." },
              { heading: "Active Customer Support via WhatsApp", body: "Have a question? Chat with us directly on WhatsApp. Our team responds within minutes during business hours." },
            ].map(({ heading, body }) => (
              <div key={heading} className="bg-muted/40 border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-1">{heading}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-background border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-10">We're here to help — reach out via any of the channels below.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl px-6 py-4">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium text-foreground">Lagos, Nigeria</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl px-6 py-4">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">hello@princessempire.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl px-6 py-4">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="text-sm font-medium text-foreground">Chat with us anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-foreground text-background text-center">
        <div className="max-w-3xl mx-auto">
          <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Ready to Shop Premium African Fashion?
          </h2>
          <p className="text-background/70 mb-8 text-lg">
            Join thousands of customers who trust Princess Empire for authentic Nigerian and African fashion.
          </p>
          <Link href="/shop">
            <Button size="lg" className="text-base px-10 py-6 rounded-full">
              Start Shopping — Free Delivery Over ₦15,000 <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Princess Empire. All rights reserved. | Premium African Fashion Store, Nigeria.</p>
        <div className="flex flex-wrap justify-center gap-4 mt-3">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <Link href="/shop?category=clothing" className="hover:text-primary transition-colors">Clothing</Link>
          <Link href="/shop?category=shoes" className="hover:text-primary transition-colors">Shoes</Link>
          <Link href="/shop?category=perfumes" className="hover:text-primary transition-colors">Perfumes</Link>
          <Link href="/shop?category=beauty" className="hover:text-primary transition-colors">Beauty</Link>
          <Link href="/shop?category=jewellery" className="hover:text-primary transition-colors">Jewellery</Link>
        </div>
      </footer>
    </div>
  );
}
