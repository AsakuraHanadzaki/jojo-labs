// Database types for Supabase tables

export interface Product {
  id: string
  name: string
  name_ru: string
  name_hy: string
  description: string
  description_ru: string
  description_hy: string
  price: number
  original_price?: number
  image: string
  category_id: string
  brand: string
  size: string
  benefits: string[]
  benefits_ru: string[]
  benefits_hy: string[]
  how_to_use: string
  how_to_use_ru: string
  how_to_use_hy: string
  ingredients: string[]
  skin_type: string[]
  skin_type_ru: string[]
  skin_type_hy: string[]
  texture: string
  rating: number
  reviews_count: number
  stock: number
  low_stock_threshold: number
  in_stock: boolean
  is_new: boolean
  is_bestseller: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  slug: string
  name: string
  name_ru: string
  name_hy: string
  description: string
  description_ru: string
  description_hy: string
  image: string
  display_order: number
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  shipping_city: string
  shipping_country: string
  shipping_postal_code?: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  payment_method?: string
  payment_status: "pending" | "paid" | "failed" | "refunded"
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  tracking_number?: string
  carrier?: string
  estimated_delivery?: string
  actual_delivery?: string
  customer_notes?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image?: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface CustomerRequest {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  subject: string
  message: string
  request_type: "general" | "product_inquiry" | "order_issue" | "return_request" | "complaint" | "other"
  order_id?: string
  status: "new" | "in_progress" | "resolved" | "closed"
  admin_response?: string
  responded_at?: string
  responded_by?: string
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
  updated_at: string
}

export interface ProductRating {
  id: string
  product_id: string
  reviewer_name: string
  reviewer_email: string
  rating: number
  title?: string
  review?: string
  verified_purchase: boolean
  order_id?: string
  moderation_status: "pending" | "approved" | "rejected"
  moderation_notes?: string
  moderated_at?: string
  helpful_count: number
  created_at: string
  updated_at: string
}
