'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

// ─── CATEGORIAS ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'all', label: 'Tudo' },
  { value: 'Body', label: 'Body' },
  { value: 'camisas', label: 'Camisas' },
  { value: 'Calcinhas', label: 'Calcinhas' },
  { value: 'Cropeeds', label: 'Croppeds' },
  { value: 'Shorts', label: 'Shorts' },
  { value: 'conjuntos', label: 'Conjuntos' },
]

// ─── CART STORE + LOCALSTORAGE ─────────────────────────────────────────────
let cartListeners = []
let cartState = []

function loadCartFromStorage() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('carolineRaffineCart')
    return saved ? JSON.parse(saved) : []
  }
  return []
}
function saveCartToStorage(cart) {
  if (typeof window !== 'undefined') localStorage.setItem('carolineRaffineCart', JSON.stringify(cart))
}
function getCart() { return cartState }
function setCart(fn) {
  cartState = typeof fn === 'function' ? fn(cartState) : fn
  saveCartToStorage(cartState)
  cartListeners.forEach(l => l(cartState))
}
function useCart() {
  const [cart, setLocalCart] = useState(getCart())
  useEffect(() => {
    cartListeners.push(setLocalCart)
    return () => { cartListeners = cartListeners.filter(l => l !== setLocalCart) }
  }, [])
  return cart
}
function addToCart(product, size) {
  setCart(prev => {
    const key = `${product.id}-${size}`
    const existing = prev.find(i => i.key === key)
    if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
    return [...prev, { ...product, size, key, qty: 1 }]
  })
}
function removeFromCart(key) { setCart(prev => prev.filter(i => i.key !== key)) }
function updateQty(key, qty) {
  if (qty < 1) return removeFromCart(key)
  setCart(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
}
function cartTotal(cart) { return cart.reduce((s, i) => s + i.price * i.qty, 0) }
function cartCount(cart) { return cart.reduce((s, i) => s + i.qty, 0) }

// ─── WHATSAPP ──────────────────────────────────────────────────────────────
function finalizarCompraWhatsApp(cart) {
  if (cart.length === 0) return
  let mensagem = `Olá! Gostaria de finalizar a seguinte compra:\n\n`
  cart.forEach(item => {
    mensagem += `• ${item.name} - Tam: ${item.size} - Qtd: ${item.qty} - R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}\n`
  })
  const total = cartTotal(cart)
  mensagem += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\nObrigado!`
  window.open(`https://wa.me/5519994378031?text=${encodeURIComponent(mensagem)}`, '_blank')
}

// ─── ICONS ─────────────────────────────────────────────────────────────────
function CartIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
}
function InstagramIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const styles = {
  root: { minHeight: '100vh', backgroundColor: '#f5ede8', fontfamily: 'Montserrat sans-serif', color: '#2c1a12' },
  navbar: { position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(245,237,232,0.98)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #d9b8a8' },
  navInner: { maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navLogo: { fontSize: 21, fontWeight: 600, letterSpacing: '0.06em', color: '#2c1a12' },
  navLinks: { display: 'flex', gap: 28, fontSize: 14 },
  navLink: { textDecoration: 'none', color: '#7a4e38' },
  navActions: { display: 'flex', alignItems: 'center', gap: 14 },
  instagramBtn: { color: '#2c1a12', padding: 6 },
  cartBtn: { position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#2c1a12' },
  cartBadge: { position: 'absolute', top: -4, right: -6, background: '#b07a5e', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hero: { maxWidth: 1280, margin: '0 auto', padding: '80px 16px 60px', textAlign: 'center' },
  heroContent: { maxWidth: 700, margin: '0 auto' },
  heroTitle: { fontSize: 52, lineHeight: 1.1, marginBottom: 20, color: '#2c1a12' },
  heroTitleItalic: { fontStyle: 'italic', color: '#7a4e38' },
  heroSub: { fontSize: 17, color: '#7a4e38', lineHeight: 1.6 },
  heroBtn: { display: 'inline-block', marginTop: 30, padding: '16px 40px', background: '#2c1a12', color: '#f5ede8', textDecoration: 'none', borderRadius: 6, fontSize: 13, letterSpacing: '0.1em' },
  filterBar: { padding: '0 16px', marginBottom: 40 },
  filterCategories: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 },
  filterChip: { padding: '9px 18px', border: '1px solid #d9b8a8', background: 'none', cursor: 'pointer', fontSize: 13, borderRadius: 6, color: '#2c1a12' },
  filterChipActive: { background: '#2c1a12', color: '#f5ede8', borderColor: '#2c1a12' },
  searchWrap: { border: '1px solid #d9b8a8', padding: '12px 16px', background: '#fdf7f4', borderRadius: 8, maxWidth: 400 },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: 15, background: 'transparent', color: '#2c1a12' },
  main: { maxWidth: 1280, margin: '0 auto', padding: '0 16px 80px' },
  mainHeader: { marginBottom: 30, textAlign: 'center' },
  mainTitle: { fontSize: 32, fontWeight: 400, color: '#2c1a12' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
  card: { background: '#fdf7f4', border: '1px solid #e4c8b8', borderRadius: 12, overflow: 'hidden', transition: 'box-shadow 0.3s ease, transform 0.3s ease' },
  cardHover: { boxShadow: '0 15px 35px rgba(44,26,18,0.12)', transform: 'translateY(-6px)' },
  cardImgWrap: { position: 'relative', paddingTop: '125%', overflow: 'hidden', background: '#ecddd6' },
  cardImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  cardBody: { padding: '20px' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardName: { margin: 0, fontSize: 16.5, fontWeight: 500, color: '#2c1a12' },
  cardCategory: { fontSize: 11, color: '#b07a5e', textTransform: 'uppercase' },
  cardPrice: { fontSize: 20, margin: '10px 0 4px', fontWeight: 400, color: '#2c1a12' },
  cardOldPrice: { fontSize: 13, color: '#b07a5e', textDecoration: 'line-through', marginBottom: 12 },
  sizeRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  sizeBtn: { padding: '7px 12px', border: '1px solid #d9b8a8', background: 'none', fontSize: 12.5, cursor: 'pointer', borderRadius: 6, transition: 'all 0.15s', color: '#2c1a12' },
  sizeBtnActive: { background: '#2c1a12', color: '#f5ede8', borderColor: '#2c1a12' },
  addBtn: { width: '100%', padding: '15px', background: '#2c1a12', color: '#f5ede8', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13.5, letterSpacing: '0.08em' },
  addBtnDisabled: { background: '#d9c4ba', color: '#9e7a6a', cursor: 'not-allowed' },
  addBtnSuccess: { background: '#5a7a4a' },
  loadingWrap: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
  skeleton: { height: 420, background: 'linear-gradient(90deg, #ecddd6 25%, #e4cec4 50%, #ecddd6 75%)', backgroundSize: '200% 100%', borderRadius: 12 },
  emptyState: { textAlign: 'center', padding: '80px 20px', color: '#7a4e38' },
  errorState: { textAlign: 'center', padding: '80px 20px', color: '#a03020' },
  cartBackdrop: { position: 'fixed', inset: 0, background: 'rgba(44,26,18,0.5)', zIndex: 200 },
  cartDrawer: { position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 420, background: '#fdf7f4', zIndex: 201, transform: 'translateX(100%)', transition: 'transform 0.4s cubic-bezier(0.32,0.72,0,1)', boxShadow: '-10px 0 40px rgba(44,26,18,0.2)', display: 'flex', flexDirection: 'column' },
  cartDrawerOpen: { transform: 'translateX(0)' },
  cartHeader: { padding: '20px 24px', borderBottom: '1px solid #e4c8b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  cartTitle: { margin: 0, fontSize: 22, color: '#2c1a12' },
  cartClose: { background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#7a4e38' },
  cartItems: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  cartItem: { display: 'flex', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e4c8b8' },
  cartItemImg: { width: 80, height: 100, objectFit: 'cover', borderRadius: 6 },
  cartItemInfo: { flex: 1 },
  cartItemName: { margin: '0 0 6px', fontSize: 15, color: '#2c1a12' },
  cartItemMeta: { fontSize: 13, color: '#7a4e38' },
  cartItemPrice: { fontSize: 16, margin: '8px 0', color: '#2c1a12' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 },
  qtyBtn: { width: 32, height: 32, border: '1px solid #d9b8a8', background: 'none', borderRadius: 6, cursor: 'pointer', color: '#2c1a12' },
  removeBtn: { color: '#a03020', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' },
  cartFooter: { padding: '24px', borderTop: '1px solid #e4c8b8', flexShrink: 0 },
  cartTotalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 17, marginBottom: 20, color: '#2c1a12' },
  cartTotalVal: { fontWeight: 600 },
  checkoutBtn: { width: '100%', padding: '18px', background: '#2c1a12', color: '#f5ede8', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, letterSpacing: '0.1em' },
  footer: { background: '#ecddd6', borderTop: '1px solid #d9b8a8', padding: '50px 16px 30px' },
  footerInner: { maxWidth: 1280, margin: '0 auto', textAlign: 'center' },
  footerLogo: { fontSize: 20, letterSpacing: '0.1em', marginBottom: 8, color: '#2c1a12' },
  footerLinks: { display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', margin: '20px 0' },
  footerLink: { color: '#7a4e38', textDecoration: 'none', fontSize: 13.5 },
  footerCopy: { color: '#b07a5e', fontSize: 12.5, marginTop: 20 }
}

// ─── COMPONENTS ────────────────────────────────────────────────────────────
function Navbar({ onCartOpen }) {
  const cart = useCart()
  const count = cartCount(cart)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return (
    <nav style={styles.navbar}>
      <div style={styles.navInner}>
        <div style={styles.navLogo}>C Liveira Store</div>
        {!isMobile && (
          <div style={styles.navLinks}>
            <a href="#" style={styles.navLink}>Coleção</a>
            <a href="#" style={styles.navLink}>Sobre</a>
            <a href="#" style={styles.navLink}>Contato</a>
          </div>
        )}
        <div style={styles.navActions}>
          <a href="https://www.instagram.com/lliveira_store/" target="_blank" style={styles.instagramBtn}><InstagramIcon /></a>
          <button onClick={onCartOpen} style={styles.cartBtn}>
            <CartIcon />
            {count > 0 && <span style={styles.cartBadge}>{count}</span>}
          </button>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section style={styles.hero}>
      <div style={styles.heroContent}>
        <p style={styles.heroSub}>Peças cuidadosamente selecionadas para quem valoriza o essencial.</p>
        <a href="#produtos" style={styles.heroBtn}>Explorar Coleção</a>
      </div>
    </section>
  )
}

function FilterBar({ active, onChange, search, onSearch }) {
  return (
    <div style={styles.filterBar}>
      <div style={styles.filterCategories}>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => onChange(c.value)}
            style={{ ...styles.filterChip, ...(active === c.value ? styles.filterChipActive : {}) }}>
            {c.label}
          </button>
        ))}
      </div>
      <div style={styles.searchWrap}>
        <input type="text" placeholder="Buscar peça..." value={search}
          onChange={(e) => onSearch(e.target.value)} style={styles.searchInput} />
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [added, setAdded] = useState(false)

  // tamanho vem do banco como string ex: "P,M,G,GG" ou array
  const sizes = useMemo(() => {
    if (!product.tamanho) return []
    if (Array.isArray(product.tamanho)) return product.tamanho
    return product.tamanho.split(',').map(s => s.trim()).filter(Boolean)
  }, [product.tamanho])

  const handleAdd = () => {
    if (!selectedSize) return
    addToCart(product, selectedSize)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      style={{ ...styles.card, ...(hovered ? styles.cardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagem única, sem hover de segunda foto */}
      <div style={styles.cardImgWrap}>
        <img src={product.image_url} alt={product.name} style={styles.cardImg} />
      </div>

      <div style={styles.cardBody}>
        <div style={styles.cardMeta}>
          <h3 style={styles.cardName}>{product.name}</h3>
          {product.category && <span style={styles.cardCategory}>{product.category}</span>}
        </div>

        <p style={styles.cardPrice}>R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
        {product.old_price && (
          <p style={styles.cardOldPrice}>R$ {Number(product.old_price).toFixed(2).replace('.', ',')}</p>
        )}

        {/* Tamanhos do banco */}
        {sizes.length > 0 ? (
          <div style={styles.sizeRow}>
            {sizes.map(s => (
              <button key={s} onClick={() => setSelectedSize(s)}
                style={{ ...styles.sizeBtn, ...(selectedSize === s ? styles.sizeBtnActive : {}) }}>
                {s}
              </button>
            ))}
          </div>
        ) : (
          // Produto sem tamanho cadastrado — adiciona direto
          <div style={{ marginBottom: 16 }} />
        )}

        <button
          onClick={handleAdd}
          disabled={sizes.length > 0 && !selectedSize}
          style={{
            ...styles.addBtn,
            ...(sizes.length > 0 && !selectedSize ? styles.addBtnDisabled : {}),
            ...(added ? styles.addBtnSuccess : {})
          }}
        >
          {added
            ? '✓ Adicionado'
            : sizes.length > 0 && !selectedSize
              ? 'Selecione o tamanho'
              : 'Adicionar ao carrinho'}
        </button>
      </div>
    </div>
  )
}

function ProductGrid({ products, loading, error }) {
  if (loading) return (
    <div style={styles.loadingWrap}>
      {[...Array(8)].map((_, i) => <div key={i} style={styles.skeleton} />)}
    </div>
  )
  if (error) return (
    <div style={styles.errorState}>
      <p>Erro ao carregar produtos: {error}</p>
      <p style={{ fontSize: 13, marginTop: 8, color: '#888' }}>Verifique as variáveis de ambiente do Supabase.</p>
    </div>
  )
  if (!products.length) return <div style={styles.emptyState}><p>Nenhuma peça encontrada.</p></div>
  return <div style={styles.grid}>{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
}

function CartDrawer({ open, onClose }) {
  const cart = useCart()
  const total = cartTotal(cart)
  return (
    <>
      {open && <div onClick={onClose} style={styles.cartBackdrop} />}
      <aside style={{ ...styles.cartDrawer, ...(open ? styles.cartDrawerOpen : {}) }}>
        <div style={styles.cartHeader}>
          <h2 style={styles.cartTitle}>Carrinho</h2>
          <button onClick={onClose} style={styles.cartClose}>✕</button>
        </div>
        <div style={styles.cartItems}>
          {cart.length === 0 ? (
            <div style={styles.emptyState}><p>Seu carrinho está vazio.</p></div>
          ) : (
            cart.map(item => (
              <div key={item.key} style={styles.cartItem}>
                <img src={item.image_url} alt={item.name} style={styles.cartItemImg} />
                <div style={styles.cartItemInfo}>
                  <p style={styles.cartItemName}>{item.name}</p>
                  <p style={styles.cartItemMeta}>Tam. {item.size}</p>
                  <p style={styles.cartItemPrice}>R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</p>
                  <div style={styles.qtyRow}>
                    <button onClick={() => updateQty(item.key, item.qty - 1)} style={styles.qtyBtn}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.key, item.qty + 1)} style={styles.qtyBtn}>+</button>
                    <button onClick={() => removeFromCart(item.key)} style={styles.removeBtn}>Remover</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div style={styles.cartFooter}>
            <div style={styles.cartTotalRow}>
              <span>Total</span>
              <span style={styles.cartTotalVal}>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <button onClick={() => finalizarCompraWhatsApp(cart)} style={styles.checkoutBtn}>
              Finalizar Compra via WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerInner}>
        <div style={styles.footerLogo}>C Oliveira Store</div>
        <p style={{ color: '#666' }}>Moda com propósito.</p>
        <div style={styles.footerLinks}>
          <a href="https://www.instagram.com/lliveira_store/" target="_blank" style={styles.footerLink}>Instagram</a>
          <a href="#" style={styles.footerLink}>Política de Privacidade</a>
          <a href="#" style={styles.footerLink}>Trocas e Devoluções</a>
        </div>
        <p style={styles.footerCopy}>© 2025 C Oliveira Store. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function StorePage() {
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    cartState = loadCartFromStorage()
    cartListeners.forEach(l => l(cartState))
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('store')
          .select('id, name, price, old_price, image_url, status, category, tamanho')
          .eq('status', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setAllProducts(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    let list = allProducts
    if (category !== 'all') list = list.filter(p => p.category === category)
    if (search.trim()) {
      const term = search.toLowerCase()
      list = list.filter(p => p.name?.toLowerCase().includes(term))
    }
    return list
  }, [allProducts, category, search])

  return (
    <div style={styles.root}>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <Hero />
      <main id="produtos" style={styles.main}>
        <FilterBar active={category} onChange={setCategory} search={search} onSearch={setSearch} />
        <ProductGrid products={filteredProducts} loading={loading} error={error} />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}