'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name:'', email:'', phone:'', password:'',
    store_name:'', store_slug:'', plan:'starter'
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const {name, value} = e.target
    setForm(prev => {
      const updated = {...prev, [name]: value}
      if (name === 'store_name') updated.store_slug = value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step < 3) { setStep(s => s+1); return }
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password })
      if (authError || !authData.user) { setError(authError?.message || 'Алдаа'); setLoading(false); return }
      const expires = new Date(); expires.setMonth(expires.getMonth()+1)
      const { data: store } = await supabase.from('stores').insert({ name: form.store_name, slug: form.store_slug, owner_id: authData.user.id, plan: form.plan, plan_status:'active', plan_expires_at: expires.toISOString() }).select().single()
      if (store) {
        await supabase.from('user_profiles').insert({ id: authData.user.id, store_id: store.id, full_name: form.full_name, phone: form.phone, role:'owner' })
        await supabase.from('warehouses').insert({ store_id: store.id, name:'Үндсэн агуулах' })
        await supabase.from('subscriptions').insert({ store_id: store.id, plan: form.plan, status:'active', amount: form.plan==='starter'?39000:form.plan==='business'?59000:29000, expires_at: expires.toISOString() })
      }
      router.push('/admin')
    } catch { setError('Алдаа гарлаа'); setLoading(false) }
  }

  const plans = [
    {id:'starter',name:'Starter',price:'39,000₮',desc:'50 бараа, 1 ажилтан'},
    {id:'business',name:'Business',price:'59,000₮',desc:'Хязгааргүй бараа, 5 ажилтан'},
    {id:'tagtaa_partner',name:'Tagtaa Partner',price:'29,000₮',desc:'Business + Tagtaa хүргэлт'},
  ]

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb',padding:'20px'}}>
      <div style={{background:'#fff',padding:'40px',borderRadius:'16px',border:'1px solid #e5e7eb',width:'100%',maxWidth:'460px'}}>
        <div style={{textAlign:'center',marginBottom:'24px'}}>
          <div style={{width:'48px',height:'48px',background:'#2563eb',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
            <span style={{color:'#fff',fontSize:'20px'}}>🏪</span>
          </div>
          <h1 style={{fontSize:'22px',fontWeight:'700'}}>Дэлгүүр нээх</h1>
          <p style={{color:'#6b7280',fontSize:'13px'}}>Алхам {step}/3</p>
        </div>
        <div style={{display:'flex',gap:'6px',marginBottom:'24px'}}>
          {[1,2,3].map(s=><div key={s} style={{flex:1,height:'4px',borderRadius:'2px',background:s<=step?'#2563eb':'#e5e7eb'}}/>)}
        </div>
        {error && <div style={{background:'#fee2e2',color:'#dc2626',padding:'12px',borderRadius:'8px',fontSize:'14px',marginBottom:'16px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {step===1 && <>
            <div style={{marginBottom:'14px'}}><label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'5px'}}>Бүтэн нэр</label><input name="full_name" value={form.full_name} onChange={handleChange} required style={{width:'100%',padding:'9px 12px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}/></div>
            <div style={{marginBottom:'14px'}}><label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'5px'}}>Имэйл</label><input name="email" type="email" value={form.email} onChange={handleChange} required style={{width:'100%',padding:'9px 12px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}/></div>
            <div style={{marginBottom:'14px'}}><label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'5px'}}>Утас</label><input name="phone" value={form.phone} onChange={handleChange} style={{width:'100%',padding:'9px 12px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}/></div>
            <div style={{marginBottom:'20px'}}><label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'5px'}}>Нууц үг</label><input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} style={{width:'100%',padding:'9px 12px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}/></div>
          </>}
          {step===2 && <>
            <div style={{marginBottom:'14px'}}><label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'5px'}}>Дэлгүүрийн нэр</label><input name="store_name" value={form.store_name} onChange={handleChange} required style={{width:'100%',padding:'9px 12px',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}/></div>
            <div style={{marginBottom:'20px'}}><label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'5px'}}>Хаяг (slug)</label><div style={{display:'flex',border:'1px solid #d1d5db',borderRadius:'8px',overflow:'hidden'}}><span style={{background:'#f9fafb',padding:'9px 12px',fontSize:'13px',color:'#6b7280',borderRight:'1px solid #d1d5db'}}>store.mn/</span><input name="store_slug" value={form.store_slug} onChange={handleChange} required style={{flex:1,padding:'9px 12px',border:'none',fontSize:'14px',outline:'none'}}/></div></div>
          </>}
          {step===3 && <>
            <p style={{fontSize:'14px',fontWeight:'600',marginBottom:'12px'}}>Багц сонгох</p>
            {plans.map(p=><label key={p.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',border:`2px solid ${form.plan===p.id?'#2563eb':'#e5e7eb'}`,borderRadius:'10px',marginBottom:'8px',cursor:'pointer',background:form.plan===p.id?'#eff6ff':'#fff'}}>
              <input type="radio" name="plan" value={p.id} checked={form.plan===p.id} onChange={handleChange}/>
              <div><div style={{fontWeight:'600',fontSize:'14px'}}>{p.name} — <span style={{color:'#2563eb'}}>{p.price}/сар</span></div><div style={{fontSize:'12px',color:'#6b7280'}}>{p.desc}</div></div>
            </label>)}
          </>}
          <button type="submit" disabled={loading} style={{width:'100%',padding:'12px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer',marginTop:'8px'}}>
            {step<3?'Дараах →':loading?'Бүртгэж байна...':'Дэлгүүр нээх'}
          </button>
          {step>1 && <button type="button" onClick={()=>setStep(s=>s-1)} style={{width:'100%',padding:'10px',background:'none',border:'none',color:'#6b7280',fontSize:'14px',cursor:'pointer',marginTop:'8px'}}>← Буцах</button>}
        </form>
        <p style={{textAlign:'center',marginTop:'16px',fontSize:'14px',color:'#6b7280'}}>
          Бүртгэлтэй юу? <a href="/auth/login" style={{color:'#2563eb',fontWeight:'500'}}>Нэвтрэх</a>
        </p>
      </div>
    </div>
  )
}
