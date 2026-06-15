import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { AddToCartButton } from '@/components/products/AddToCartButton'
import { formatPrice } from '@/lib/utils'

interface ProductPageProps {
  params: { slug: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const displayPrice = product.sale_price ?? product.price

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📦</div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            {product.category && (
              <span className="text-sm text-primary-600 font-medium mb-2">{product.category.name}</span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-primary-600">{formatPrice(displayPrice)}</span>
              {product.sale_price && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
            )}

            <div className="mb-6">
              <span className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock_quantity > 0 ? `✓ Нөөцөд байна (${product.stock_quantity})` : '✗ Нөөц дууссан'}
              </span>
            </div>

            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
