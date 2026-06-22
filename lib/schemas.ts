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
  z.object({ type: z.literal('text'), content: z.string(), bold: z.boolean().optional() }),
  z.object({ type: z.literal('heading'), content: z.string(), level: z.number().min(1).max(6) }),
  z.object({ type: z.literal('image'), url: z.string(), alt: z.string().optional() }),
])

export const landingConfigSchema = z.object({
  colors: z.object({
    primary: z.string().optional(),
    accent: z.string().optional(),
    cta: z.string().optional(),
    red: z.string().optional(),
    bg: z.string().optional(),
  }).optional(),
  sections: z.object({
    hero: z.object({ active: z.boolean().optional(), subtitle: z.string().optional() }).optional(),
    urgency: z.object({ active: z.boolean().optional(), duration_hours: z.number().optional() }).optional(),
    problem: z.object({ active: z.boolean().optional(), title: z.string().optional(), copy: z.string().optional(), image_url: z.string().optional() }).optional(),
    benefits: z.object({ active: z.boolean().optional(), title: z.string().optional() }).optional(),
    specs: z.object({ active: z.boolean().optional() }).optional(),
    testimonials: z.object({
      active: z.boolean().optional(),
      title: z.string().optional(),
      items: z.array(z.object({
        author: z.string().optional(),
        city: z.string().optional(),
        rating: z.number().optional(),
        comment: z.string().optional(),
        avatar: z.string().optional(),
      })).optional(),
    }).optional(),
    pricing: z.object({ active: z.boolean().optional() }).optional(),
  }).optional(),
}).optional().nullable().transform(val => val ?? {} as {
  colors?: { primary?: string; accent?: string; cta?: string; red?: string; bg?: string };
  sections?: {
    hero?: { active?: boolean; subtitle?: string };
    urgency?: { active?: boolean; duration_hours?: number };
    problem?: { active?: boolean; title?: string; copy?: string; image_url?: string };
    benefits?: { active?: boolean; title?: string };
    specs?: { active?: boolean };
    testimonials?: {
      active?: boolean;
      title?: string;
      items?: Array<{
        author?: string;
        city?: string;
        rating?: number;
        comment?: string;
        avatar?: string;
      }>;
    };
    pricing?: { active?: boolean };
  };
})


export const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  images: z.array(z.string()).default([]),
  video_url: z.string().optional().nullable(),
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
  rich_content_video_url: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  active: z.boolean().nullable().transform(v => v === null ? true : v).default(true),
  brand_color: z.string().optional(),
  reviews: z.array(z.object({
    author: z.string(),
    rating: z.number(),
    comment: z.string(),
  })).optional(),
  landing_config: landingConfigSchema.default(() => ({})),
  product_type: z.enum(['landing', 'ecommerce']).default('landing'),
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
  tracking_number: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  order_items: z.array(orderItemSchema).optional(),
})

// ─── Ecommerce Product Schema ──────────────────────────────────────────────────
// Versión reducida de productSchema para el flujo de creación rápida.
// Construida con .pick() para reutilizar definiciones sin duplicar.
export const ecommerceProductSchema = productSchema.pick({
  id: true,
  slug: true,
  name: true,
  description: true,
  price: true,
  originalPrice: true,
  images: true,
  category: true,
  stock: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  featured: true,
  active: true,
  product_type: true,
  specifications: true,
})
