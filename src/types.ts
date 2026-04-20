export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  power: string;
  area: string;
  description: string;
  image?: string;
  modelUrl?: string;
  specs?: Record<string, string>;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}
