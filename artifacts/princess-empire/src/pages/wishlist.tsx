import { Link } from "wouter";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/components/wishlist-context";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function WishlistPage() {
  const { items, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center py-24 max-w-sm mx-auto px-4">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold font-serif text-foreground mb-2">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground text-sm mb-8">Save items you love and come back to them anytime.</p>
          <Link href="/shop">
            <Button className="gap-2 rounded-full px-8">Discover Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">My Wishlist</h1>
            <p className="text-muted-foreground text-sm mt-1">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((product) => (
            <div
              key={product.id}
              className="group relative bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              data-testid={`card-wishlist-${product.id}`}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Link href={`/product/${product.id}`}>
                  <img
                    src={product.images[0] || `https://picsum.photos/seed/${product.id}/400/500`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.flashSale && <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">Flash Sale</Badge>}
                  {product.discount && <Badge className="bg-green-600 text-white text-xs px-1.5 py-0.5">-{product.discount}%</Badge>}
                </div>

                {/* Remove */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  data-testid={`button-remove-wishlist-${product.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Add to cart */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    onClick={() => product.stock > 0 && addToCart(product, 1)}
                    disabled={product.stock === 0}
                    className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    data-testid={`button-add-cart-${product.id}`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>

              <Link href={`/product/${product.id}`} className="block p-3">
                {product.categoryName && (
                  <p className="text-xs text-muted-foreground mb-0.5">{product.categoryName}</p>
                )}
                <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                {product.rating != null && (
                  <div className="flex items-center gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(product.rating!) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-primary text-sm">₦{product.price.toLocaleString()}</span>
                  {product.oldPrice && (
                    <span className="text-xs text-muted-foreground line-through">₦{product.oldPrice.toLocaleString()}</span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
