'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const statuses = [
  { value: 'pending', label: 'Хүлээгдэж байна' },
  { value: 'processing', label: 'Боловсруулж байна' },
  { value: 'shipped', label: 'Илгээгдсэн' },
  { value: 'delivered', label: 'Хүргэгдсэн' },
  { value: 'cancelled', label: 'Цуцлагдсан' },
]

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

interface Props {
  orderId: string
  currentStatus: string
}

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const update = async (newStatus: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    
    if (error) {
      toast.error('Шинэчлэхэд алдаа гарлаа')
    } else {
      setStatus(newStatus)
      toast.success('Захиалгын төлөв шинэчлэгдлээ')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <select
      value={status}
      onChange={(e) => update(e.target.value)}
      disabled={loading}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border cursor-pointer ${statusColors[status]} disabled:opacity-50`}
    >
      {statuses.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
