'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Store } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Имэйл буруу байна'),
  password: z.string().min(6, 'Нууц үг 6-аас дээш тэмдэгт байх ёстой'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      toast.error('Нэвтрэх нэр эсвэл нууц үг буруу байна')
    } else {
      toast.success('Амжилттай нэвтэрлээ')
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl">
            <Store className="w-8 h-8" />
            StorePlatform
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Нэвтрэх</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл</label>
              <input
                {...register('email')}
                type="email"
                className="input-field"
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг</label>
              <input
                {...register('password')}
                type="password"
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Бүртгэл байхгүй юу?{' '}
            <Link href="/auth/register" className="text-primary-600 hover:underline font-medium">
              Бүртгүүлэх
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
