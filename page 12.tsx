import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatPrice, formatDate } from '@/lib/utils'
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, profile:profiles(full_name, email, phone), items:order_items(quantity, unit_price, product:products(name))')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Захиалгын удирдлага</h1>

        <div className="space-y-4">
          {orders?.map((order) => (
            <div key={order.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-gray-500">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {order.profile?.full_name || order.profile?.email || 'Нэргүй'}
                  </p>
                  {order.profile?.phone && (
                    <p className="text-sm text-gray-500">{order.profile.phone}</p>
                  )}
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold text-lg text-primary-600">{formatPrice(order.total_amount)}</p>
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
              </div>

              {/* Address */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="font-medium">Хүргэлтийн хаяг:</p>
                <p>{order.shipping_address?.city}, {order.shipping_address?.address}</p>
                {order.shipping_address?.notes && (
                  <p className="text-gray-500 italic">{order.shipping_address.notes}</p>
                )}
              </div>

              {/* Items */}
              {order.items && (
                <div className="mt-3 space-y-1">
                  {order.items.map((item: { product: { name: string }; quantity: number; unit_price: number }, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-600">
                      <span>{item.product?.name} × {item.quantity}</span>
                      <span>{formatPrice(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {(!orders || orders.length === 0) && (
            <div className="card text-center py-8 text-gray-500">Захиалга байхгүй байна</div>
          )}
        </div>
      </div>
    </div>
  )
}
