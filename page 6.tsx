'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { formatPrice } from '@/lib/utils'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import type { CartItem } from '@/types'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setItems(cart)
  }, [])

  const updateQty = (productId: string, qty: number) => {
    const updated = items.map(i =>
      i.product_id === productId ? { ...i, quantity: Math.max(1, qty) } : i
    )
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const remove = (productId: string) => {
    const updated = items.filter(i => i.product_id !== productId)
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const total = items.reduce((sum, i) => {
    const price = i.product.sale_price ?? i.product.price
    return sum + price * i.quantity
  }, 0)

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Миний сагс</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Сагс хоосон байна</p>
            <Link href="/products" className="btn-primary inline-block">
              Бараа үзэх
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Items */}
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => {
                const price = item.product.sale_price ?? item.product.price
                return (
                  <div key={item.product_id} className="card flex gap-4">
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.product.image_url ? (
                        <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-primary-600 font-semibold mt-1">{formatPrice(price)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="p-1 hover:bg-gray-50">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="p-1 hover:bg-gray-50">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button onClick={() => remove(item.product_id)} className="p-1 text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(price * item.quantity)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="md:col-span-1">
              <div className="card sticky top-24">
                <h2 className="font-bold text-lg mb-4">Нийт дүн</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Бараа ({items.reduce((s, i) => s + i.quantity, 0)}ш)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Хүргэлт</span>
                    <span className="text-green-600">Үнэгүй</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Нийт</span>
                    <span className="text-primary-600">{formatPrice(total)}</span>
                  </div>
                </div>
                <Link href="/checkout" className="btn-primary w-full block text-center">
                  Захиалга хийх
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
