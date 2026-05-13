import { Link } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center py-24 max-w-sm mx-auto px-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold font-serif text-foreground mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground text-sm mb-8">Looks like you haven't added anything yet. Discover our beautiful collection.</p>
          <Link href="/shop">
            <Button className="gap-2 rounded-full px-8">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shipping = total >= 15000 ? 0 : 2500;
  const orderTotal = total + shipping;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Shopping Cart</h1>
          <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-destructive transition-colors">
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}-${i}`}
                className="flex gap-4 bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-shadow"
                data-testid={`card-cart-item-${item.productId}`}
              >
                <Link href={`/product/${item.productId}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl bg-muted"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.productId}`}>
                    <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 mb-1">{item.name}</h3>
                  </Link>
                  {(item.size || item.color) && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-primary mb-3" data-testid={`text-item-price-${item.productId}`}>₦{item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                        className="px-2.5 py-1.5 hover:bg-accent transition-colors text-foreground"
                        data-testid={`button-decrease-${item.productId}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                        className="px-2.5 py-1.5 hover:bg-accent transition-colors text-foreground"
                        data-testid={`button-increase-${item.productId}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Subtotal: <strong className="text-foreground">₦{(item.price * item.quantity).toLocaleString()}</strong>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId, item.size, item.color)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  data-testid={`button-remove-${item.productId}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-lg text-foreground mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span className="font-medium" data-testid="text-subtotal">₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span className="font-medium">₦{shipping.toLocaleString()}</span>
                  )}
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground bg-primary/5 px-3 py-2 rounded-lg">
                    Add ₦{(15000 - total).toLocaleString()} more for free delivery
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary text-lg" data-testid="text-total">₦{orderTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-5">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none"
                  />
                </div>
                <Button variant="outline" size="sm" className="rounded-xl">Apply</Button>
              </div>

              <Link href="/checkout">
                <Button className="w-full gap-2 rounded-xl py-6 text-base" data-testid="button-checkout">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/shop" className="block text-center mt-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
