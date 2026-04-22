import { z } from 'zod'

export const productFAQSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

export const productOptionSchema = z.object({
  name: z.string(),
  values: z.array(z.string()),
})

export const richContentBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), content: z.string() }),
  z.object({ type: z.literal('image'), url: z.string(), alt: z.string().optional() }),
])

export const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  images: z.array(z.string()).default([]),
  category: z.string(),
  stock: z.number(),
  rating: z.number().nullable().transform(n => n === null ? 0 : Number(n)).default(0),
  reviewCount: z.number().default(0),
  createdAt: z.string().or(z.date()).transform(d => new Date(d)),
  faq: z.array(productFAQSchema).default([]),
  options: z.array(productOptionSchema).default([]),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  features: z.array(z.string()).optional(),
  rich_content: z.array(richContentBlockSchema).optional(),
  featured: z.boolean().default(false),
})

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string(),
})

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['customer', 'seller', 'admin']),
})

export const shippingAddressSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
})

export const orderItemSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  product_id: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  products: z.object({
    name: z.string(),
    images: z.array(z.string()),
  }).optional(),
})

export const orderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  payment_method: z.enum(['wompi', 'contraentrega']).default('wompi'),
  total: z.number(),
  shipping_address: shippingAddressSchema,
  created_at: z.string(),
  updated_at: z.string(),
  order_items: z.array(orderItemSchema).optional(),
})
