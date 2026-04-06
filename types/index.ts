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
