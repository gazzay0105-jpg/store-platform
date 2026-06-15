import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, User } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  ])

  const statusLabels: Record<string, string> = {
    pending: 'Хүлээгдэж байна',
    processing: 'Боловсруулж байна',
    shipped: 'Илгээгдсэн',
    delivered: 'Хүргэгдсэн',
    cancelled: 'Цуцлагдсан',
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Миний профайл</h1>

        {/* Profile info */}
        <div className="card mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-900">
                {profile?.full_name || 'Нэргүй'}
              </h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              {profile?.role === 'admin' && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                  Админ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Orders */}
        <h2 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" /> Миний захиалгууд
        </h2>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    <p className="font-bold text-primary-600 mt-1">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>
                {order.items && (
                  <div className="text-sm text-gray-600 space-y-1">
                    {order.items.map((item: { id: string; quantity: number; unit_price: number; product: { name: string } }) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.product?.name} × {item.quantity}</span>
                        <span>{formatPrice(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8 text-gray-500">
            Захиалга байхгүй байна
          </div>
        )}
      </div>
    </div>
  )
}
