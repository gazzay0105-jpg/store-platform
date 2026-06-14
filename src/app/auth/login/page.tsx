'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/admin')
    } catch { setError('Алдаа гарлаа'); setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb',padding:'20px'}}>
      <div style={{background:'#fff',padding:'40px',borderRadius:'16px',border:'1px solid #e5e7eb',width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'48px',height:'48px',background:'#2563eb',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <span style={{color:'#fff',fontSize:'20px'}}>🏪</span>
          </div>
          <h1 style={{fontSize:'24px',fontWeight:'700',color:'#111827'}}>Нэвтрэх</h1>
          <p style={{color:'#6b7280',fontSize:'14px',marginTop:'4px'}}>Дэлгүүрийн удирдлагад нэвтрэх</p>
        </div>
        {error && <div style={{background:'#fee2e2',color:'#dc2626',padding:'12px',borderRadius:'8px',fontSize:'14px',marginBottom:'16px'}}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'14px',fontWeight:'500',color:'#374151',marginBottom:'6px'}}>Имэйл</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.mn" required style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box',outline:'none'}}/>
          </div>
          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block',fontSize:'14px',fontWeight:'500',color:'#374151',marginBottom:'6px'}}>Нууц үг</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box',outline:'none'}}/>
          </div>
          <button type="submit" disabled={loading} style={{width:'100%',padding:'12px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'16px',fontSize:'14px',color:'#6b7280'}}>
          Бүртгэл байхгүй юу? <a href="/auth/register" style={{color:'#2563eb',fontWeight:'500'}}>Бүртгүүлэх</a>
        </p>
      </div>
    </div>
  )
}
