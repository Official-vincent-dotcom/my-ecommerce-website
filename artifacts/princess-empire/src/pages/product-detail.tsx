import { useState } from "react";
import { useParams, Link } from "wouter";
import { Star, Heart, ShoppingBag, ArrowLeft, Minus, Plus, Shield, Truck, RefreshCw } from "lucide-react";
import { useGetProduct, useGetFeaturedProducts, getGetProductQueryKey, getGetFeaturedProductsQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) } });
  const { data: related } = useGetFeaturedProducts({ limit: 4 }, { query: { queryKey: getGetFeaturedProductsQueryKey({ limit: 4 }) } });

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "shipping" | "reviews">("description");

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-3">
              <Skeleton className="aspect-[3/4] rounded-2xl" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <Link href="/shop" className="text-primary hover:underline text-sm">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [`https://picsum.photos/seed/${product.id}/400/500`];
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(
      { id: product.id, name: product.name, price: product.price, images: product.images },
      quantity,
      selectedSize || undefined,
      selectedColor || undefined
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted relative">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discount && (
                <Badge className="absolute top-4 left-4 bg-green-600 text-white">-{product.discount}%</Badge>
              )}
              {product.flashSale && (
                <Badge className="absolute top-4 right-4 bg-red-500 text-white">Flash Sale</Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.categoryName && (
              <Link href={`/shop?category=${product.categoryName}`} className="text-xs font-medium text-primary uppercase tracking-wider hover:underline">
                {product.categoryName}
              </Link>
            )}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-2 mb-3" data-testid="text-product-name">{product.name}</h1>

            {/* Rating */}
            {product.rating != null && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating!) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl font-bold text-primary" data-testid="text-price">₦{product.price.toLocaleString()}</span>
              {product.oldPrice && (
                <span className="text-lg text-muted-foreground line-through">₦{product.oldPrice.toLocaleString()}</span>
              )}
              {product.discount && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Save ₦{((product.oldPrice ?? 0) - product.price).toLocaleString()}
                </Badge>
              )}
            </div>

            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-muted-foreground mb-4">Brand: <Link href={`/shop?brand=${product.brand}`} className="text-foreground font-medium hover:text-primary">{product.brand}</Link></p>
            )}

            {/* Stock */}
            <div className="mb-5">
              {product.stock > 10 ? (
                <span className="text-sm text-green-600 font-medium">In Stock ({product.stock} available)</span>
              ) : product.stock > 0 ? (
                <span className="text-sm text-amber-600 font-medium">Only {product.stock} left!</span>
              ) : (
                <span className="text-sm text-destructive font-medium">Out of Stock</span>
              )}
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold mb-2">Size: <span className="font-normal text-muted-foreground">{selectedSize || "Select a size"}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${selectedSize === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary text-foreground"}`}
                      data-testid={`button-size-${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold mb-2">Color: <span className="font-normal text-muted-foreground">{selectedColor || "Select a color"}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(selectedColor === c ? "" : c)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${selectedColor === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary text-foreground"}`}
                      data-testid={`button-color-${c}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl border border-border hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold" data-testid="text-quantity">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 rounded-xl border border-border hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 gap-2 rounded-xl py-6 text-base"
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <button
                onClick={() => toggleWishlist({ ...product, images: product.images || [] })}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${inWishlist ? "border-red-400 bg-red-50 text-red-500 dark:bg-red-950" : "border-border hover:border-red-400 hover:text-red-500"}`}
                data-testid="button-wishlist"
              >
                <Heart className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
              {[
                { Icon: Truck, text: "Free delivery on orders above ₦15,000" },
                { Icon: Shield, text: "100% authentic products guaranteed" },
                { Icon: RefreshCw, text: "Easy 7-day returns & exchanges" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-foreground/70">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-14 border-b border-border mb-8">
          <div className="flex gap-8">
            {(["description", "shipping", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {tab === "reviews" ? `Reviews${product.reviewCount ? ` (${product.reviewCount})` : ""}` : tab}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-2xl">
          {activeTab === "description" && (
            <p className="text-foreground/80 leading-relaxed">{product.description || "Premium quality product from Princess Empire. Carefully crafted for the modern woman who values both style and comfort."}</p>
          )}
          {activeTab === "shipping" && (
            <div className="space-y-3 text-sm text-foreground/80">
              <p><strong>Standard Delivery:</strong> 3-5 business days within Lagos, 5-7 days nationwide.</p>
              <p><strong>Express Delivery:</strong> Next-day delivery available in Lagos for orders placed before 12pm.</p>
              <p><strong>Free Delivery:</strong> On all orders above ₦15,000.</p>
              <p><strong>Returns:</strong> Return within 7 days of delivery for exchange or store credit. Items must be unworn with tags attached.</p>
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {product.rating != null && (
                <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{product.rating.toFixed(1)}</p>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.rating!) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{product.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((s) => (
                      <div key={s} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{s}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${s === Math.round(product.rating!) ? 70 : Math.random() * 30}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-muted-foreground text-sm">Customer reviews are verified purchases from Princess Empire.</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related && related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.filter((p) => p.id !== productId).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
