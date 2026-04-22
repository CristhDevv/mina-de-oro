import { z } from 'zod'
import {
  productFAQSchema,
  productOptionSchema,
  richContentBlockSchema,
  productSchema,
  categorySchema,
  userSchema,
  shippingAddressSchema,
  orderItemSchema,
  orderSchema
} from '@/lib/schemas'

export type ProductFAQ = z.infer<typeof productFAQSchema>
export type ProductOption = z.infer<typeof productOptionSchema>
export type RichContentBlock = z.infer<typeof richContentBlockSchema>
export type Product = z.infer<typeof productSchema>
export type Category = z.infer<typeof categorySchema>

export interface CartItem {
  product: Product
  quantity: number
}

export type User = z.infer<typeof userSchema>
export type ShippingAddress = z.infer<typeof shippingAddressSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type Order = z.infer<typeof orderSchema>

export interface HeroBannerSettings {
  label: string
  title: string
  description: string
  buttonText: string
  alignment: 'left' | 'center' | 'right'
}
