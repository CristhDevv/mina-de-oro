import { Product, Category } from '@/types'

export const mockCategories: Category[] = [
  { id: '1', name: 'Ropa', slug: 'ropa', icon: '👕' },
  { id: '2', name: 'Hogar', slug: 'hogar', icon: '🏠' },
  { id: '3', name: 'Cocina', slug: 'cocina', icon: '🍳' },
  { id: '4', name: 'Juguetes', slug: 'juguetes', icon: '🧸' },
  { id: '5', name: 'Belleza', slug: 'belleza', icon: '💄' },
  { id: '6', name: 'Electró', slug: 'electronica', icon: '📱' },
]

export const mockProducts: Product[] = [
  {
    id: '1', slug: 'camiseta-basica-blanca', name: 'Camiseta Básica',
    description: 'Camiseta de algodón 100%', price: 15900,
    originalPrice: 25000, images: [], category: 'ropa',
    stock: 50, rating: 4.5, reviewCount: 128, createdAt: new Date(),
  },
  {
    id: '2', slug: 'set-bowls-colores', name: 'Set Bowls x6',
    description: 'Bowls plásticos resistentes con tapa', price: 22900,
    originalPrice: 38000, images: [], category: 'cocina',
    stock: 30, rating: 4.8, reviewCount: 95, createdAt: new Date(),
  },
  {
    id: '3', slug: 'camiseta-polo', name: 'Camiseta Polo',
    description: 'Polo clásico para hombre', price: 29900,
    originalPrice: 45000, images: [], category: 'ropa',
    stock: 40, rating: 4.2, reviewCount: 67, createdAt: new Date(),
  },
  {
    id: '4', slug: 'set-toallas-hogar', name: 'Set Toallas x3',
    description: 'Toallas suaves de microfibra', price: 18900,
    originalPrice: 32000, images: [], category: 'hogar',
    stock: 25, rating: 4.6, reviewCount: 43, createdAt: new Date(),
  },
  {
    id: '5', slug: 'organizador-cocina', name: 'Organizador Cocina',
    description: 'Organizador multiusos plástico', price: 12900,
    originalPrice: 22000, images: [], category: 'cocina',
    stock: 60, rating: 4.3, reviewCount: 89, createdAt: new Date(),
  },
  {
    id: '6', slug: 'pantaloneta-deportiva', name: 'Pantaloneta Deportiva',
    description: 'Pantaloneta ligera para ejercicio', price: 19900,
    originalPrice: 35000, images: [], category: 'ropa',
    stock: 35, rating: 4.4, reviewCount: 56, createdAt: new Date(),
  },
]
