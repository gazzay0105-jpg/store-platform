import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ProductCard } from '@/components/products/ProductCard'

interface ProductsPageProps {
  searchParams: { category?: string; search?: string; page?: string }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (searchParams.category) {
    const cat = categories?.find(c => c.slug === searchParams.category)
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (searchParams.search) {
    query = query.ilike('name', `%${searchParams.search}%`)
  }

  const { data: products } = await query

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="w-full md:w-56 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Ангилал</h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="/products"
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      !searchParams.category
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Бүгд
                  </a>
                </li>
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`/products?category=${cat.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        searchParams.category === cat.slug
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {searchParams.category
                  ? categories?.find(c => c.slug === searchParams.category)?.name || 'Бараа'
                  : 'Бүх бараа'}
              </h1>
              <span className="text-sm text-gray-500">{products?.length || 0} бараа</span>
            </div>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg">Бараа олдсонгүй</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
