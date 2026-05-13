import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string | null;
  color?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: { id: number; name: string; price: number; images: string[] }, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: number, size?: string | null, color?: string | null) => void;
  updateQuantity: (productId: number, quantity: number, size?: string | null, color?: string | null) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("pe_cart");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("pe_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: { id: number; name: string; price: number; images: string[] }, quantity: number, size?: string, color?: string) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.size === (size ?? null) && item.color === (color ?? null)
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.size === (size ?? null) && item.color === (color ?? null)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images[0] || `https://picsum.photos/seed/${product.id}/400/500`,
          size: size ?? null,
          color: color ?? null,
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: number, size?: string | null, color?: string | null) => {
    setItems((prev) => prev.filter(
      (item) => !(item.productId === productId && item.size === size && item.color === color)
    ));
    toast.info("Removed from cart");
  };

  const updateQuantity = (productId: number, quantity: number, size?: string | null, color?: string | null) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.size === size && item.color === color
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
