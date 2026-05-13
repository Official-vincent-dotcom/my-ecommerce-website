import { useState } from "react";
import { Link } from "wouter";
import { Heart, Star, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";
import { Badge } from "@/components/ui/badge";

export interface ProductCardProduct {
  id: number;
  name: string;
  price: number;
  oldPrice?: number | null;
  discount?: number | null;
  images: string[];
  categoryName?: string | null;
  brand?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  stock: number;
  featured?: boolean | null;
  bestSeller?: boolean | null;
  flashSale?: boolean | null;
  flashSaleEndsAt?: string | null;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imgIdx, setImgIdx] = useState(0);
  const inWishlist = isInWishlist(product.id);

  const img = product.images[imgIdx] || `https://picsum.photos/seed/${product.id}/400/500`;

  return (
    <div
      className="group relative bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      data-testid={`card-product-${product.id}`}
    >
      {/* Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-muted"
        onMouseEnter={() => product.images[1] && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}
      >
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.flashSale && <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">Flash Sale</Badge>}
          {product.bestSeller && <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">Best Seller</Badge>}
          {product.featured && <Badge className="bg-foreground text-background text-xs px-2 py-0.5">Featured</Badge>}
          {product.discount && <Badge className="bg-green-600 text-white text-xs px-2 py-0.5">-{product.discount}%</Badge>}
          {product.stock === 0 && <Badge className="bg-muted-foreground text-white text-xs px-2 py-0.5">Sold Out</Badge>}
        </div>

        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className={`w-8 h-8 rounded-full shadow flex items-center justify-center transition-colors ${inWishlist ? "bg-red-500 text-white" : "bg-white text-foreground hover:bg-red-500 hover:text-white"}`}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} />
          </button>
          <Link
            href={`/product/${product.id}`}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-foreground"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Add to cart - bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (product.stock > 0) addToCart(product, 1);
            }}
            disabled={product.stock === 0}
            className="w-full py-3 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            data-testid={`button-add-cart-${product.id}`}
          >
            <ShoppingBag className="w-4 h-4" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Info */}
      <Link href={`/product/${product.id}`} className="block p-3">
        {product.categoryName && (
          <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
        )}
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>

        {/* Rating */}
        {product.rating != null && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.rating!) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
              ))}
            </div>
            {product.reviewCount != null && <span className="text-xs text-muted-foreground">({product.reviewCount})</span>}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary" data-testid={`text-price-${product.id}`}>₦{product.price.toLocaleString()}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">₦{product.oldPrice.toLocaleString()}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
