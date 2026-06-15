export type UserRole = 'admin' | 'customer'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  sale_price: number | null
  stock_quantity: number
  image_url: string | null
  images: string[]
  category_id: string | null
  category?: Category
  is_active: boolean
  created_at: string
}

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: Product
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  shipping_address: ShippingAddress
  items?: OrderItem[]
  created_at: string
  profile?: Profile
}

export interface ShippingAddress {
  full_name: string
  phone: string
  address: string
  city: string
  notes?: string
}
