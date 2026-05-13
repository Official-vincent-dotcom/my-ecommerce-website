import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { SlidersHorizontal, Grid3X3, List, X, Search, ChevronDown } from "lucide-react";
import { useListProducts, useListCategories, getListProductsQueryKey, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

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

export default function ShopPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [searchQ, setSearchQ] = useState(params.get("search") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "newest");
  const [brand, setBrand] = useState(params.get("brand") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [featured, setFeatured] = useState(params.get("featured") === "true");
  const [bestSeller, setBestSeller] = useState(params.get("bestSeller") === "true");
  const [flashSale, setFlashSale] = useState(params.get("flashSale") === "true");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const queryParams = {
    search: searchQ || undefined,
    category: category || undefined,
    sort: (sort as "newest" | "price_asc" | "price_desc" | "popular") || undefined,
    brand: brand || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    featured: featured ? true : undefined,
    bestSeller: bestSeller ? true : undefined,
    flashSale: flashSale ? true : undefined,
    page,
    limit: 12,
  };

  const { data, isLoading } = useListProducts(queryParams, { query: { queryKey: getListProductsQueryKey(queryParams) } });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });

  const totalPages = data ? Math.ceil(data.total / 12) : 1;

  const activeFilters = [
    searchQ && `Search: ${searchQ}`,
    category && `Category: ${category}`,
    brand && `Brand: ${brand}`,
    minPrice && `Min: ₦${Number(minPrice).toLocaleString()}`,
    maxPrice && `Max: ₦${Number(maxPrice).toLocaleString()}`,
    featured && "Featured",
    bestSeller && "Best Sellers",
    flashSale && "Flash Sale",
  ].filter(Boolean) as string[];

  const clearFilter = (filter: string) => {
    if (filter.startsWith("Search:")) setSearchQ("");
    if (filter.startsWith("Category:")) setCategory("");
    if (filter.startsWith("Brand:")) setBrand("");
    if (filter.startsWith("Min:")) setMinPrice("");
    if (filter.startsWith("Max:")) setMaxPrice("");
    if (filter === "Featured") setFeatured(false);
    if (filter === "Best Sellers") setBestSeller(false);
    if (filter === "Flash Sale") setFlashSale(false);
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/20 py-10 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Shop All Products</h1>
          <p className="text-muted-foreground mt-1">{data?.total ?? "Loading..."} products available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products, brands, categories..."
              value={searchQ}
              onChange={(e) => { setSearchQ(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
              data-testid="input-shop-search"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
              data-testid="select-sort"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="gap-2 rounded-xl"
              data-testid="button-filters"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
            <div className="flex border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map((f) => (
              <Badge key={f} variant="secondary" className="gap-1.5 pr-1.5 cursor-pointer" onClick={() => clearFilter(f)}>
                {f} <X className="w-3 h-3" />
              </Badge>
            ))}
            <button
              onClick={() => { setSearchQ(""); setCategory(""); setBrand(""); setMinPrice(""); setMaxPrice(""); setFeatured(false); setBestSeller(false); setFlashSale(false); setPage(1); }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filters panel */}
        {filtersOpen && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Category */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none"
                data-testid="select-category"
              >
                <option value="">All Categories</option>
                {(categories || []).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            {/* Price */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Price Range (₦)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none"
                />
              </div>
            </div>
            {/* Brand */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Brand</label>
              <input
                type="text"
                placeholder="Filter by brand"
                value={brand}
                onChange={(e) => { setBrand(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none"
              />
            </div>
            {/* Checkboxes */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Product Type</label>
              <div className="space-y-2">
                {[
                  { label: "Featured", value: featured, set: setFeatured },
                  { label: "Best Sellers", value: bestSeller, set: setBestSeller },
                  { label: "Flash Sale", value: flashSale, set: setFlashSale },
                ].map(({ label, value, set }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => { set(e.target.checked); setPage(1); }}
                      className="accent-primary"
                    />
                    <span className="text-sm text-foreground/80">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {isLoading ? (
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`}>
            {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : data && data.products.length > 0 ? (
          <>
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {data.products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"}`}
                  >
                    {p}
                  </button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">👗</p>
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters or search term.</p>
            <Button onClick={() => { setSearchQ(""); setCategory(""); setBrand(""); setMinPrice(""); setMaxPrice(""); setFeatured(false); setBestSeller(false); setFlashSale(false); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
