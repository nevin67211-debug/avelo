export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  badge: string;
  image: string;
};

export const products: Product[] = [
  {
    id: "aurora-bag",
    name: "Aurora Tote",
    price: 49,
    description: "A soft structured tote with room for daily essentials.",
    badge: "Best Seller",
    image: "👜",
  },
  {
    id: "luna-sneaker",
    name: "Luna Runner",
    price: 79,
    description: "Lightweight sneaker with cloud-soft cushioning for all-day wear.",
    badge: "New Drop",
    image: "👟",
  },
  {
    id: "echo-watch",
    name: "Echo Smart Watch",
    price: 129,
    description: "Track wellness, notifications, and workouts from your wrist.",
    badge: "Trending",
    image: "⌚",
  },
  {
    id: "nova-lamp",
    name: "Nova Desk Lamp",
    price: 35,
    description: "Warm ambient lighting with touch dimming and USB charging.",
    badge: "Home Pick",
    image: "💡",
  },
  {
    id: "solis-hoodie",
    name: "Solis Hoodie",
    price: 59,
    description: "Premium fleece with a relaxed fit and minimalist design.",
    badge: "Limited",
    image: "🧥",
  },
  {
    id: "atlas-bottle",
    name: "Atlas Bottle",
    price: 24,
    description: "Double-wall insulation to keep drinks hot or cold for hours.",
    badge: "Eco Pick",
    image: "🥤",
  },
];
