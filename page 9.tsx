import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingBag, Users, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const [
    { count: productCount },
    { count: orderCount },
    { count: userCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*, profile:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const { data: revenue } = await supabase
    .from('orders')
    .select('total_amount')
    .in('status', ['delivered', 'processing', 'shipped'])

  const totalRevenue = revenue?.reduce((sum, o) => sum + o.total_amount, 0) || 0

  const stats = [
    { label: 'Нийт бараа', value: productCount || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Нийт захиалга', value: orderCount || 0, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Хэрэглэгч', value: userCount || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Орлого', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ]

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Админ хяналтын самбар</h1>
          <div className="flex gap-3">
            <Link href="/admin/products" className="btn-primary">
              Бараа удирдах
            </Link>
            <Link href="/admin/orders" className="btn-secondary">
              Захиалга харах
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="card">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div className="card">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Сүүлийн захиалгууд</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Хэрэглэгч</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Дүн</th>
                  <th className="text-left py-2 font-medium text-gray-500">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders?.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono text-gray-600">
                      #{o.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {o.profile?.full_name || o.profile?.email || 'Нэргүй'}
                    </td>
                    <td className="py-3 pr-4 font-medium">{formatPrice(o.total_amount)}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
