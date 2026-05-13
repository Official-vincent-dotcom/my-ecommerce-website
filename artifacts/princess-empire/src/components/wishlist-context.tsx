import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface WishlistProduct {
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
}

interface WishlistContextType {
  items: WishlistProduct[];
  toggleWishlist: (product: WishlistProduct) => void;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>(() => {
    try {
      const saved = localStorage.getItem("pe_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("pe_wishlist", JSON.stringify(items));
  }, [items]);

  const isInWishlist = (productId: number) => items.some((item) => item.id === productId);

  const toggleWishlist = (product: WishlistProduct) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        toast.info("Removed from wishlist");
        return prev.filter((item) => item.id !== product.id);
      } else {
        toast.success("Added to wishlist");
        return [...prev, product];
      }
    });
  };

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}
