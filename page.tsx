import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ProductCard } from '@/components/products/ProductCard'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Truck, Shield, Headphones } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .limit(6)

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Монголын Онлайн Дэлгүүр
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Чанартай бараа бүтээгдэхүүнийг хурдан, найдвартай хүргэлттэй
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors text-lg"
          >
            Бараа үзэх
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Хурдан хүргэлт', desc: 'Улаанбаатар хотод 24 цагт' },
              { icon: Shield, title: 'Найдвартай', desc: '100% баталгаатай бараа' },
              { icon: ShoppingBag, title: 'Олон төрөл', desc: 'Мянга гаруй бүтээгдэхүүн' },
              { icon: Headphones, title: '24/7 Дэмжлэг', desc: 'Үргэлж бэлэн' },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-primary-50 rounded-full">
                    <f.icon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Ангилал</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
                  <ShoppingBag className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Products */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Шинэ бараа</h2>
          <Link href="/products" className="text-primary-600 hover:underline font-medium">
            Бүгдийг үзэх →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {(!products || products.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            Бараа олдсонгүй
          </div>
        )}
      </section>
    </div>
  )
}
