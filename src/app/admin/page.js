'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'blazers', label: 'Blazers' },
  { value: 'calcas', label: 'Calças' },
  { value: 'Calcinhas', label: 'Calcinhas' },
  { value: 'Shorts', label: 'Shorts' },
  { value: 'Cropeeds', label: 'Croppeds' },
  { value: 'vestidos', label: 'Vestidos' },
  { value: 'camisas', label: 'Camisas' },
  { value: 'saias', label: 'Saias' },
  { value: 'tops', label: 'Tops' },
  { value: 'casacos', label: 'Casacos' },
  { value: 'conjuntos', label: 'Conjuntos' },
]

const SIZE_OPTIONS = ['PP', 'P', 'M', 'G', 'GG', 'GGG', '34', '36', '38', '40', '42', '44', '46']

// ─── Login Gate ───────────────────────────────────────────────────────────────

function LoginGate({ onAuth }) {
  const [fields, setFields] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    await new Promise((r) => setTimeout(r, 400))
    const validUser = process.env.NEXT_PUBLIC_Admin_user
    const validPass = process.env.NEXT_PUBLIC_Password
    if (fields.username === validUser && fields.password === validPass) {
      onAuth()
    } else {
      setError('Usuário ou senha inválidos.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 opacity-25" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-3xl shadow-lg shadow-indigo-500/10">🔐</div>
          <div className="text-center">
            <span className="mb-2 inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">Painel Admin</span>
            <h1 className="text-2xl font-black text-white">Acesso Restrito</h1>
            <p className="mt-1 text-sm text-zinc-500">Entre com suas credenciais</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Usuário</label>
            <input name="username" value={fields.username} onChange={(e) => { setFields((p) => ({ ...p, username: e.target.value })); setError(null) }} placeholder="admin" required autoComplete="username"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Senha</label>
            <div className="relative">
              <input name="password" type={showPass ? 'text' : 'password'} value={fields.password} onChange={(e) => { setFields((p) => ({ ...p, password: e.target.value })); setError(null) }} placeholder="••••••••" required autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
              <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition text-base" tabIndex={-1}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
              <span>✕</span>{error}
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-black text-white transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                Verificando...
              </span>
            ) : '→ Entrar'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-zinc-600">Sessão encerrada ao recarregar a página.</p>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-2xl transition-all ${
      toast.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
    }`}>
      <span>{toast.type === 'error' ? '✕' : '✓'}</span>{toast.msg}
    </div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ open, onConfirm, onCancel, productName }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111118] p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-2xl">🗑️</div>
        <h3 className="text-lg font-black text-white">Excluir produto?</h3>
        <p className="mt-1 text-sm text-zinc-500"><span className="font-semibold text-zinc-300">{productName}</span> será removido permanentemente.</p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-white/10 hover:text-white">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-black text-white transition hover:bg-red-500 active:scale-95">Excluir</button>
        </div>
      </div>
    </div>
  )
}

// ─── Size Picker ──────────────────────────────────────────────────────────────

function SizePicker({ value, onChange }) {
  const selected = Array.isArray(value) ? value : (value ? value.split(',').map(s => s.trim()).filter(Boolean) : [])

  const toggle = (size) => {
    const next = selected.includes(size)
      ? selected.filter(s => s !== size)
      : [...selected, size]
    onChange(next)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SIZE_OPTIONS.map(size => {
        const active = selected.includes(size)
        return (
          <button
            key={size}
            type="button"
            onClick={() => toggle(size)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              active
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
            }`}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}

// ─── Product Form ─────────────────────────────────────────────────────────────

function ProductForm({ initial, onSave, onCancel, loading }) {
  const [fields, setFields] = useState({
    name: initial?.name ?? '',
    price: initial?.price != null ? String(initial.price).replace('.', ',') : '',
    old_price: initial?.old_price != null ? String(initial.old_price).replace('.', ',') : '',
    category: initial?.category ?? '',
    status: initial?.status ?? false,
  })
  // tamanho como array internamente
  const [sizes, setSizes] = useState(() => {
    const t = initial?.tamanho
    if (!t) return []
    if (Array.isArray(t)) return t
    return t.split(',').map(s => s.trim()).filter(Boolean)
  })
  const [preview, setPreview] = useState(initial?.image_url ?? null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)
  const fileSelected = useRef(null)
  const isEdit = !!initial?.id

  const handleField = (e) => {
    const { name, value, type, checked } = e.target
    setFields((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFile = (file) => {
    if (!file) return
    fileSelected.current = file
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const price = parseFloat(fields.price.replace(',', '.'))
    const old_price = fields.old_price ? parseFloat(fields.old_price.replace(',', '.')) : null
    onSave({
      fields: {
        name: fields.name.trim(),
        price,
        old_price,
        category: fields.category || null,
        tamanho: sizes.join(','), // salva como "P,M,G,GG"
        status: fields.status,
      },
      file: fileSelected.current,
      currentImageUrl: initial?.image_url ?? null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
          dragOver ? 'border-indigo-500 bg-indigo-500/10' : preview ? 'border-white/10' : 'border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10'
        }`}
        style={{ minHeight: '160px' }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full object-contain rounded-2xl" style={{ maxHeight: '220px' }} />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition rounded-2xl">
              <p className="text-sm font-semibold text-white">Clique para trocar</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">🖼️</div>
            <p className="text-sm font-semibold text-zinc-300">Arraste ou clique para enviar</p>
            <p className="text-xs text-zinc-600">PNG, JPG, WEBP até 10MB</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {/* Nome */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Nome do produto *</label>
        <input name="name" value={fields.name} onChange={handleField} placeholder="Ex: Blazer Estruturado" required
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
      </div>

      {/* Preços */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Preço *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">R$</span>
            <input name="price" value={fields.price} onChange={handleField} placeholder="0,00" required
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Preço original</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">R$</span>
            <input name="old_price" value={fields.old_price} onChange={handleField} placeholder="0,00"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
          </div>
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Categoria</label>
        <select name="category" value={fields.category} onChange={handleField}
          className="w-full rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition appearance-none cursor-pointer">
          <option value="">Sem categoria</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Tamanhos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tamanhos disponíveis</label>
          {sizes.length > 0 && (
            <button type="button" onClick={() => setSizes([])} className="text-[10px] text-zinc-600 hover:text-red-400 transition">
              Limpar
            </button>
          )}
        </div>
        <SizePicker value={sizes} onChange={setSizes} />
        {sizes.length > 0 && (
          <p className="text-[11px] text-zinc-600">
            Selecionados: <span className="text-indigo-400 font-semibold">{sizes.join(', ')}</span>
          </p>
        )}
      </div>

      {/* Status toggle */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Status do produto</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {fields.status ? 'Visível na loja' : 'Oculto na loja'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFields(p => ({ ...p, status: !p.status }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
            fields.status ? 'bg-indigo-600' : 'bg-zinc-700'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
            fields.status ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-zinc-400 transition hover:bg-white/10 hover:text-white">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading}
          className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-black text-white transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              Salvando...
            </span>
          ) : isEdit ? '💾 Salvar alterações' : '🚀 Cadastrar produto'}
        </button>
      </div>
    </form>
  )
}

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({ product, onEdit, onDelete, onToggleStatus }) {
  const discount = product.old_price && product.old_price > product.price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : null

  const sizes = product.tamanho
    ? (Array.isArray(product.tamanho) ? product.tamanho : product.tamanho.split(',').map(s => s.trim()).filter(Boolean))
    : []

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 hover:bg-white/[0.06] transition group">
      
      {/* Thumb */}
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          : <div className="flex h-full w-full items-center justify-center text-lg">📦</div>
        }
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-white">{product.name}</p>
          {/* Status badge */}
          <span className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
            product.status
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-zinc-500/10 text-zinc-500'
          }`}>
            {product.status ? 'Ativo' : 'Oculto'}
          </span>
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-xs font-bold text-indigo-400">
            R$ {Number(product.price).toFixed(2).replace('.', ',')}
          </span>
          {product.old_price && (
            <span className="text-xs text-zinc-600 line-through">
              R$ {Number(product.old_price).toFixed(2).replace('.', ',')}
            </span>
          )}
          {discount && (
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
              -{discount}%
            </span>
          )}
          {product.category && (
            <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">
              {product.category}
            </span>
          )}
          {sizes.length > 0 && (
            <span className="text-[10px] text-zinc-600">{sizes.join(' · ')}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-100 group-hover:opacity-100 transition">
        {/* Toggle status rápido */}
        <button
          onClick={() => onToggleStatus(product)}
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition ${
            product.status
              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20'
          }`}
          title={product.status ? 'Desativar' : 'Ativar'}
        >
          {product.status ? '👁️' : '🚫'}
        </button>
        <button onClick={() => onEdit(product)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition hover:bg-indigo-500/20 text-xs"
          title="Editar">
          ✏️
        </button>
        <button onClick={() => onDelete(product)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition hover:bg-red-500/20 text-xs"
          title="Excluir">
          🗑️
        </button>
      </div>
    </div>
  )
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [fetching, setFetching] = useState(true)
  const [mode, setMode] = useState('add')
  const [editTarget, setEditTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch] = useState('')

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchProducts = useCallback(async () => {
    setFetching(true)
    const { data, error } = await supabase
      .from('store')
      .select('*')
      .order('id', { ascending: false })
    if (!error) setProducts(data ?? [])
    setFetching(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('store').upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (error) return null
    const { data } = supabase.storage.from('store').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleAdd = async ({ fields, file }) => {
    if (!file) { showToast('Selecione uma imagem', 'error'); return }
    if (isNaN(fields.price) || fields.price <= 0) { showToast('Preço inválido', 'error'); return }
    setLoading(true)
    const imageUrl = await uploadImage(file)
    if (!imageUrl) { showToast('Erro ao enviar imagem', 'error'); setLoading(false); return }

    const { error } = await supabase.from('store').insert([{
      name: fields.name,
      price: fields.price,
      old_price: fields.old_price,
      image_url: imageUrl,
      category: fields.category,
      tamanho: fields.tamanho,
      status: fields.status,
    }])

    if (error) { showToast('Erro ao cadastrar produto', 'error') }
    else { showToast('Produto cadastrado! 🚀'); await fetchProducts() }
    setLoading(false)
  }

  const handleEdit = async ({ fields, file, currentImageUrl }) => {
    if (isNaN(fields.price) || fields.price <= 0) { showToast('Preço inválido', 'error'); return }
    setLoading(true)

    let imageUrl = currentImageUrl
    if (file) {
      const uploaded = await uploadImage(file)
      if (!uploaded) { showToast('Erro ao enviar imagem', 'error'); setLoading(false); return }
      imageUrl = uploaded
    }

    const { error } = await supabase
      .from('store')
      .update({
        name: fields.name,
        price: fields.price,
        old_price: fields.old_price,
        image_url: imageUrl,
        category: fields.category,
        tamanho: fields.tamanho,
        status: fields.status,
      })
      .eq('id', editTarget.id)

    if (error) { showToast('Erro ao atualizar produto', 'error') }
    else {
      showToast('Produto atualizado! ✓')
      setMode('add'); setEditTarget(null)
      await fetchProducts()
    }
    setLoading(false)
  }

  // Toggle rápido de status direto na lista
  const handleToggleStatus = async (product) => {
    const { error } = await supabase
      .from('store')
      .update({ status: !product.status })
      .eq('id', product.id)
    if (error) { showToast('Erro ao alterar status', 'error'); return }
    showToast(product.status ? 'Produto ocultado' : 'Produto ativado! ✓')
    await fetchProducts()
  }

  const handleDeleteConfirm = async () => {
    if (!confirm) return
    setLoading(true)
    const { error } = await supabase.from('store').delete().eq('id', confirm.id)
    if (error) { showToast('Erro ao excluir produto', 'error') }
    else {
      showToast('Produto excluído.')
      if (editTarget?.id === confirm.id) { setMode('add'); setEditTarget(null) }
      await fetchProducts()
    }
    setConfirm(null); setLoading(false)
  }

  const startEdit = (product) => { setEditTarget(product); setMode('edit') }
  const cancelEdit = () => { setEditTarget(null); setMode('add') }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = products.filter(p => p.status).length

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <Toast toast={toast} />
      <ConfirmModal open={!!confirm} productName={confirm?.name} onConfirm={handleDeleteConfirm} onCancel={() => setConfirm(null)} />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-1">
        <span className="inline-block w-fit rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">Painel Admin</span>
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-zinc-500">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</p>
          <span className="text-zinc-700">·</span>
          <p className="text-sm text-emerald-500">{activeCount} ativo{activeCount !== 1 ? 's' : ''}</p>
          <span className="text-zinc-700">·</span>
          <p className="text-sm text-zinc-600">{products.length - activeCount} oculto{products.length - activeCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Lista */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Produtos</h2>
            <button onClick={() => { setMode('add'); setEditTarget(null) }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-500">
              + Novo produto
            </button>
          </div>

          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-600">🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-8 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-16 text-zinc-600">
              <svg className="h-5 w-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <span className="text-4xl">📦</span>
              <p className="text-sm font-semibold text-zinc-500">{search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filtered.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onEdit={startEdit}
                  onDelete={(prod) => setConfirm(prod)}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </div>

        {/* Formulário */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              {mode === 'edit' ? '✏️ Editar produto' : '➕ Cadastrar produto'}
            </h2>
            {mode === 'edit' && (
              <p className="mt-1 text-xs text-zinc-600">Editando: <span className="text-zinc-400 font-semibold">{editTarget?.name}</span></p>
            )}
          </div>
          <ProductForm
            key={mode === 'edit' ? editTarget?.id : 'new'}
            initial={mode === 'edit' ? editTarget : null}
            onSave={mode === 'edit' ? handleEdit : handleAdd}
            onCancel={mode === 'edit' ? cancelEdit : null}
            loading={loading}
          />
        </div>

      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />
  return <AdminDashboard />
}