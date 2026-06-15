'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, User, Menu, X, Search, Store } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Profile } from '@/types'

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (!session) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Cart count from localStorage
  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0))
    }
    updateCount()
    window.addEventListener('cart-updated', updateCount)
    return () => window.removeEventListener('cart-updated', updateCount)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Store className="w-7 h-7" />
            <span>StorePlatform</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-gray-600 hover:text-primary-600 transition-colors">
              Бараа
            </Link>
            {profile?.role === 'admin' && (
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                Админ
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{profile?.full_name || user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Гарах
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary text-sm">
                  Нэвтрэх
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm">
                  Бүртгүүлэх
                </Link>
              </div>
            )}

            {/* Mobile menu btn */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/products" className="block text-gray-700 py-2">Бараа</Link>
          {profile?.role === 'admin' && (
            <Link href="/admin/dashboard" className="block text-gray-700 py-2">Админ</Link>
          )}
          {user ? (
            <>
              <Link href="/profile" className="block text-gray-700 py-2">Профайл</Link>
              <button onClick={handleSignOut} className="block text-red-500 py-2">Гарах</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block btn-secondary text-center">Нэвтрэх</Link>
              <Link href="/auth/register" className="block btn-primary text-center">Бүртгүүлэх</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
