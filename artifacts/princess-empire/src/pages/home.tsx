import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Zap, Clock } from "lucide-react";
import { useGetFeaturedProducts, useGetBestSellers, useGetFlashSales, useGetRecentProducts, useListCategories, getGetFeaturedProductsQueryKey, getGetBestSellersQueryKey, getGetFlashSalesQueryKey, getGetRecentProductsQueryKey, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

function SectionHeader({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <Skeleton className="aspect-[3/4]" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function FlashSaleCountdown({ endsAt }: { endsAt: string | null }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = endsAt ? new Date(endsAt).getTime() : Date.now() + 24 * 3600 * 1000;
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-4 h-4 text-red-400" />
      <span className="text-sm text-red-400 font-mono font-semibold">
        {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
      </span>
    </div>
  );
}

const CATEGORY_IMAGES: Record<string, string> = {
  Clothing: "https://picsum.photos/seed/cat-clothing/300/200",
  Shoes: "https://picsum.photos/seed/cat-shoes/300/200",
  Perfumes: "https://picsum.photos/seed/cat-perfumes/300/200",
  Beauty: "https://picsum.photos/seed/cat-beauty/300/200",
  Accessories: "https://picsum.photos/seed/cat-accessories/300/200",
  Bags: "https://picsum.photos/seed/cat-bags/300/200",
  Lingerie: "https://picsum.photos/seed/cat-lingerie/300/200",
  Jewellery: "https://picsum.photos/seed/cat-jewellery/300/200",
};

const BRANDS = ["Afrique", "VelvetLux", "GlowUp", "StepQueenz", "Maison Elite", "LipQueen", "Luxe Gems", "ChicBag Co", "DenimDiva", "BohoChic"];

const HERO_SLIDES = [
  {
    title: "New Season",
    subtitle: "Arrivals",
    desc: "Discover the latest trends in African fashion — where tradition meets modern elegance.",
    cta: "Shop Now",
    href: "/shop",
    bg: "from-amber-950 to-amber-800",
    img: "https://picsum.photos/seed/hero1/800/600",
  },
  {
    title: "Flash Sale",
    subtitle: "Up to 25% Off",
    desc: "Limited time deals on your favourite brands. Shop before they're gone.",
    cta: "Grab Deals",
    href: "/shop?flashSale=true",
    bg: "from-rose-950 to-rose-800",
    img: "https://picsum.photos/seed/hero2/800/600",
  },
  {
    title: "Premium",
    subtitle: "Fragrances",
    desc: "International and African perfumes for the discerning nose. Long-lasting, luxurious scents.",
    cta: "Explore Perfumes",
    href: "/shop?category=Perfumes",
    bg: "from-purple-950 to-purple-800",
    img: "https://picsum.photos/seed/hero3/800/600",
  },
];

export default function HomePage() {
  const [heroIdx, setHeroIdx] = useState(0);

  const { data: featured, isLoading: featLoading } = useGetFeaturedProducts({ limit: 8 }, { query: { queryKey: getGetFeaturedProductsQueryKey({ limit: 8 }) } });
  const { data: bestSellers, isLoading: bsLoading } = useGetBestSellers({ limit: 8 }, { query: { queryKey: getGetBestSellersQueryKey({ limit: 8 }) } });
  const { data: flashSales, isLoading: fsLoading } = useGetFlashSales({ limit: 4 }, { query: { queryKey: getGetFlashSalesQueryKey({ limit: 4 }) } });
  const { data: recent, isLoading: recentLoading } = useGetRecentProducts({ limit: 8 }, { query: { queryKey: getGetRecentProductsQueryKey({ limit: 8 }) } });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });

  useEffect(() => {
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const hero = HERO_SLIDES[heroIdx];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className={`relative bg-gradient-to-br ${hero.bg} text-white overflow-hidden min-h-[85vh] flex items-center`}>
        <div className="absolute inset-0">
          <img src={hero.img} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-xl">
            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-3 animate-in fade-in duration-700">Princess Empire Collection</p>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {hero.title}<br />
              <span className="text-primary">{hero.subtitle}</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              {hero.desc}
            </p>
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link href={hero.href} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                {hero.cta} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/shop" className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-colors">
                Browse All
              </Link>
            </div>
          </div>
        </div>
        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === heroIdx ? "bg-primary w-6" : "bg-white/40"}`}
            />
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "🚚", label: "Free Delivery", sub: "On orders over ₦15,000" },
              { icon: "✅", label: "100% Authentic", sub: "Genuine products only" },
              { icon: "🔄", label: "Easy Returns", sub: "7-day return policy" },
              { icon: "🔒", label: "Secure Payment", sub: "Safe & encrypted" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-2">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeader title="Shop by Category" subtitle="Explore our curated collections" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(categories || [
            { id: 1, name: "Clothing" }, { id: 2, name: "Shoes" },
            { id: 3, name: "Perfumes" }, { id: 4, name: "Beauty" },
            { id: 5, name: "Accessories" }, { id: 6, name: "Bags" },
            { id: 7, name: "Lingerie" }, { id: 8, name: "Jewellery" },
          ]).map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.name}`}
              className="relative group rounded-2xl overflow-hidden aspect-square bg-muted hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              data-testid={`link-category-${cat.id}`}
            >
              <img
                src={CATEGORY_IMAGES[cat.name] || `https://picsum.photos/seed/cat-${cat.id}/300/300`}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-semibold text-sm">{cat.name}</p>
                {(cat as { productCount?: number | null }).productCount != null && (
                  <p className="text-white/70 text-xs">{(cat as { productCount?: number | null }).productCount} items</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Uploads */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="New Arrivals" subtitle="Just landed — be the first to own them" href="/shop?sort=newest" />
          {recentLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(recent || []).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Flash Sales */}
      {(flashSales && flashSales.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-red-500 fill-red-500" />
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Flash Sales</h2>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground text-sm">Limited time offers — ends in:</p>
                <FlashSaleCountdown endsAt={flashSales[0]?.flashSaleEndsAt ?? null} />
              </div>
            </div>
            <Link href="/shop?flashSale=true" className="flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {fsLoading ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />) :
              flashSales.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="bg-card py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Featured Products" subtitle="Handpicked by our style experts" href="/shop?featured=true" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featLoading ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />) :
              (featured || []).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeader title="Best Sellers" subtitle="What our customers love most" href="/shop?bestSeller=true" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {bsLoading ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />) :
            (bestSellers || []).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Brands Carousel */}
      <section className="border-y border-border bg-card py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">Our Brands</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {BRANDS.map((brand) => (
              <Link
                key={brand}
                href={`/shop?brand=${brand}`}
                className="px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground/70 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Stay in the Loop</h2>
          <p className="text-muted-foreground mb-6">Get exclusive deals, new arrivals, and style tips delivered straight to your inbox.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-full border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium text-sm hover:bg-primary/90 transition-colors shadow-md">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
