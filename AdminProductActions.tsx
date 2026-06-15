'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'

interface Props {
  productId: string
  productSlug: string
}

export function AdminProductActions({ productId, productSlug }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Энэ барааг устгах уу?')) return
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      toast.error('Устгахад алдаа гарлаа')
    } else {
      toast.success('Бараа устгагдлаа')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/products/${productSlug}/edit`}
        className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
