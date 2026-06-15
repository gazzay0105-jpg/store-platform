'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((i: { product_id: string }) => i.product_id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ product_id: product.id, quantity: 1, product })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    toast.success(`${product.name} сагсанд нэмэгдлээ`)
  }

  const displayPrice = product.sale_price ?? product.price

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}
          {product.sale_price && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              ХЯМДРАЛ
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 line-clamp-2 text-sm mb-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-primary-600">{formatPrice(displayPrice)}</span>
            {product.sale_price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={addToCart}
            disabled={product.stock_quantity === 0}
            className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock_quantity === 0 ? 'Дууссан' : 'Сагсанд нэмэх'}
          </button>
        </div>
      </div>
    </Link>
  )
}
