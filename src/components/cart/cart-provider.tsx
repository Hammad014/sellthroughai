"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  addToCart,
  clearCart,
  getProductsByIds,
  mergeGuestCart,
  removeFromCart,
} from "@/lib/actions/cart";
import type { Product } from "@/lib/supabase/types";

const STORAGE_KEY = "aiselling-cart";

type CartContextValue = {
  items: Product[];
  count: number;
  isAuthed: boolean;
  has: (productId: string) => boolean;
  add: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function CartProvider({
  isAuthed,
  initialItems,
  children,
}: {
  isAuthed: boolean;
  initialItems: Product[];
  children: React.ReactNode;
}) {
  // For guests, server passes []. For users, the DB cart.
  const [items, setItems] = useState<Product[]>(initialItems);

  // On mount / auth change: merge a guest cart on login, or hydrate the
  // guest cart from localStorage. All setState happens post-await.
  useEffect(() => {
    let cancelled = false;
    const localIds = readLocal();

    async function sync() {
      if (isAuthed) {
        if (localIds.length > 0) {
          const merged = await mergeGuestCart(localIds);
          if (!cancelled) {
            setItems(merged);
            writeLocal([]);
          }
        }
        // else: initialItems already holds the DB cart.
      } else if (localIds.length > 0) {
        const products = await getProductsByIds(localIds);
        if (!cancelled) {
          setItems(products);
          writeLocal(products.map((p) => p.id)); // prune stale ids
        }
      }
    }

    void sync();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  const has = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items],
  );

  const add = useCallback(
    (product: Product) => {
      setItems((prev) =>
        prev.some((p) => p.id === product.id) ? prev : [product, ...prev],
      );
      if (isAuthed) {
        void addToCart(product.id);
      } else {
        writeLocal([
          product.id,
          ...readLocal().filter((id) => id !== product.id),
        ]);
      }
    },
    [isAuthed],
  );

  const remove = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((p) => p.id !== productId));
      if (isAuthed) {
        void removeFromCart(productId);
      } else {
        writeLocal(readLocal().filter((id) => id !== productId));
      }
    },
    [isAuthed],
  );

  const clear = useCallback(() => {
    setItems([]);
    if (isAuthed) {
      void clearCart();
    } else {
      writeLocal([]);
    }
  }, [isAuthed]);

  return (
    <CartContext.Provider
      value={{ items, count: items.length, isAuthed, has, add, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
