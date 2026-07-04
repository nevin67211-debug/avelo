const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type ProductRecord = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  badge: string;
  image: string;
  created_at?: string;
};

export type OrderRecord = {
  id: string;
  user_id: string;
  customer: string;
  total: number;
  status: string;
  items: string;
  created_at?: string;
};

export type AnalyticsOverview = {
  revenue: number;
  orders: number;
  products: number;
  events: number;
};

export async function fetchProducts(): Promise<ProductRecord[]> {
  return request<ProductRecord[]>("/products");
}

export async function fetchOrders(): Promise<OrderRecord[]> {
  return request<OrderRecord[]>("/orders");
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  return request<AnalyticsOverview>("/analytics/overview");
}
