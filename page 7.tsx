'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import type { CartItem } from '@/types'

const schema = z.object({
  full_name: z.string().min(2, 'Нэр оруулна уу'),
  phone: z.string().min(8, 'Утасны дугаар оруулна уу'),
  address: z.string().min(5, 'Хаяг оруулна уу'),
  city: z.string().min(2, 'Хот оруулна уу'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cart.length === 0) router.push('/cart')
    setItems(cart)
  }, [])

  const total = items.reduce((sum, i) => {
    const price = i.product.sale_price ?? i.product.price
    return sum + price * i.quantity
  }, 0)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: total,
        shipping_address: data,
        status: 'pending',
      })
      .select()
      .single()

    if (error || !order) {
      toast.error('Захиалга хийхэд алдаа гарлаа')
      setLoading(false)
      return
    }

    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.product.sale_price ?? i.product.price,
    }))

    await supabase.from('order_items').insert(orderItems)

    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cart-updated'))
    toast.success('Захиалга амжилттай хийгдлээ!')
    router.push('/profile')
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Захиалга хийх</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <h2 className="font-semibold text-lg text-gray-900">Хүргэлтийн мэдээлэл</h2>
            
            {[
              { name: 'full_name', label: 'Нэр', placeholder: 'Таны бүтэн нэр' },
              { name: 'phone', label: 'Утас', placeholder: '9911-2233' },
              { name: 'city', label: 'Хот/Аймаг', placeholder: 'Улаанбаатар' },
              { name: 'address', label: 'Хаяг', placeholder: 'Дүүрэг, хороо, байр, тоот' },
              { name: 'notes', label: 'Нэмэлт тэмдэглэл', placeholder: 'Хүргэлтийн нэмэлт мэдээлэл' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  {...register(f.name as keyof FormData)}
                  className="input-field"
                  placeholder={f.placeholder}
                />
                {errors[f.name as keyof FormData] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[f.name as keyof FormData]?.message}
                  </p>
                )}
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Захиалж байна...' : 'Захиалга баталгаажуулах'}
            </button>
          </form>

          {/* Order Summary */}
          <div>
            <h2 className="font-semibold text-lg text-gray-900 mb-4">Захиалгын дэлгэрэнгүй</h2>
            <div className="card space-y-3">
              {items.map(i => {
                const price = i.product.sale_price ?? i.product.price
                return (
                  <div key={i.product_id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{i.product.name} × {i.quantity}</span>
                    <span className="font-medium">{formatPrice(price * i.quantity)}</span>
                  </div>
                )
              })}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Нийт</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
