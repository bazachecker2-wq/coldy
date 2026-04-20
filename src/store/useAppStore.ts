import { create } from "zustand";
import { Product, CartItem, ChatMessage } from "../types";

interface AppState {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // AI Agent
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  isAgentOpen: boolean;
  toggleAgent: () => void;

  // Catalog
  products: Product[];
  setProducts: (products: Product[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  searchProducts: (query: string) => Promise<void>;
  generatedModel: {
    color: string;
    scale: [number, number, number];
    wireframe: boolean;
    description: string;
  } | null;
  setGeneratedModel: (model: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  cart: [],
  addToCart: (product) => 
    set((state) => {
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((item) => 
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { cart: [...state.cart, { ...product, quantity: 1 }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),
  clearCart: () => set({ cart: [] }),

  messages: [
    { role: "model", text: "Привет! Я ваш инженер-консультант ClimaDraft. Чем могу помочь?" }
  ],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  isAgentOpen: false,
  toggleAgent: () => set((state) => ({ isAgentOpen: !state.isAgentOpen })),

  products: [],
  setProducts: (products) => set({ products }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product, generatedModel: null }),
  generatedModel: null,
  setGeneratedModel: (model) => set({ generatedModel: model }),
  searchProducts: async (query) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${window.location.origin}/api/products/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      set({ products: data });
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
