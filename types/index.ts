export interface ProductFAQ {
  question: string
  answer: string
}

export interface ProductOption {
  name: string        // Ej: "Color", "Talla"
  values: string[]    // Ej: ["Rojo", "Azul", "Verde"]
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  stock: number
  rating: number
  reviewCount: number
  createdAt: Date
  faq: ProductFAQ[]
  options: ProductOption[]
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface User {
  id: string
  name: string
  email: string
  role: "customer" | "seller" | "admin"
}

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  products?: {
    name: string
    images: string[]
  }
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  shipping_address: ShippingAddress
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}
