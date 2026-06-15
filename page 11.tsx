'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import type { Category } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Нэр оруулна уу'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Үнэ 0-ээс их байх ёстой'),
  sale_price: z.coerce.number().optional().nullable(),
  stock_quantity: z.coerce.number().int().min(0),
  category_id: z.string().optional(),
  image_url: z.string().url('Зургийн URL оруулна уу').optional().or(z.literal('')),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, stock_quantity: 0 },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const slug = slugify(data.name) + '-' + Date.now().toString(36)
    
    const { error } = await supabase.from('products').insert({
      ...data,
      slug,
      sale_price: data.sale_price || null,
      image_url: data.image_url || null,
      category_id: data.category_id || null,
    })

    if (error) {
      toast.error('Бараа нэмэхэд алдаа гарлаа: ' + error.message)
    } else {
      toast.success('Бараа амжилттай нэмэгдлээ')
      router.push('/admin/products')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/products" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Бараа нэмэх</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Барааны нэр *</label>
            <input {...register('name')} className="input-field" placeholder="Барааны нэр" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
            <textarea {...register('description')} className="input-field min-h-24 resize-y" placeholder="Барааны тайлбар" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Үнэ (₮) *</label>
              <input {...register('price')} type="number" className="input-field" placeholder="0" />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Хямдралт үнэ (₮)</label>
              <input {...register('sale_price')} type="number" className="input-field" placeholder="Заавал биш" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нөөц тоо *</label>
              <input {...register('stock_quantity')} type="number" className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ангилал</label>
              <select {...register('category_id')} className="input-field">
                <option value="">Ангилал сонгох</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Зургийн URL</label>
            <input {...register('image_url')} className="input-field" placeholder="https://..." />
            {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>}
          </div>

          <div className="flex items-center gap-3">
            <input {...register('is_active')} type="checkbox" id="is_active" className="w-4 h-4 text-primary-600 rounded" />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Идэвхтэй байдалд харуулах</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
              {loading ? 'Нэмж байна...' : 'Бараа нэмэх'}
            </button>
            <Link href="/admin/products" className="btn-secondary py-3 px-6">
              Буцах
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
