'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/types'

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((i: { product_id: string }) => i.product_id === product.id)
    if (existing) {
      existing.quantity += qty
    } else {
      cart.push({ product_id: product.id, quantity: qty, product })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    toast.success(`${product.name} (${qty}ш) сагсанд нэмэгдлээ`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Тоо хэмжээ:</span>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="p-2 hover:bg-gray-50 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 font-medium">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
            className="p-2 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <button
        onClick={addToCart}
        disabled={product.stock_quantity === 0}
        className="btn-primary flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50"
      >
        <ShoppingCart className="w-5 h-5" />
        Сагсанд нэмэх
      </button>
    </div>
  )
}
