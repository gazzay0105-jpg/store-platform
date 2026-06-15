import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatPrice } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { AdminProductActions } from '@/components/admin/AdminProductActions'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Барааны удирдлага</h1>
          <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Бараа нэмэх
          </Link>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Бараа</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Ангилал</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Үнэ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Нөөц</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Төлөв</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products?.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {p.image_url ? (
                            <Image src={p.image_url} alt={p.name} width={40} height={40} className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{p.category?.name || '—'}</td>
                    <td className="px-4 py-4 font-medium">{formatPrice(p.price)}</td>
                    <td className="px-4 py-4">
                      <span className={p.stock_quantity > 10 ? 'text-green-600' : p.stock_quantity > 0 ? 'text-yellow-600' : 'text-red-500'}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <AdminProductActions productId={p.id} productSlug={p.slug} />
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
