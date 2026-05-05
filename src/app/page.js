'use client'

import { useState, useEffect, useMemo } from 'react'

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: 1, name: 'Blazer Estruturado', price: 389.90, category: 'blazers', image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4d47?w=600&q=80', hover_image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', description: 'Blazer com caimento perfeito', sizes: ['P', 'M', 'G', 'GG'] },
  { id: 2, name: 'Calça Wide Leg', price: 259.90, category: 'calcas', image_url: 'https://images.unsplash.com/photo-1594938374385-9ca7c7b02b6a?w=600&q=80', hover_image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80', description: 'Calça fluida de cintura alta', sizes: ['34', '36', '38', '40', '42'] },
  { id: 3, name: 'Vestido Midi Slip', price: 319.90, category: 'vestidos', image_url: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=600&q=80', hover_image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', description: 'Vestido midi em cetim leve', sizes: ['P', 'M', 'G'] },
  { id: 4, name: 'Camisa Oversized', price: 189.90, category: 'camisas', image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80', hover_image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80', description: 'Camisa oversized em algodão premium', sizes: ['P', 'M', 'G', 'GG'] },
  { id: 5, name: 'Saia Plissada', price: 229.90, category: 'saias', image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80', hover_image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', description: 'Saia midi plissada elegante', sizes: ['P', 'M', 'G'] },
  { id: 6, name: 'Top Estruturado', price: 149.90, category: 'tops', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', hover_image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4d47?w=600&q=80', description: 'Top com bojo e alças finas', sizes: ['P', 'M', 'G'] },
  { id: 7, name: 'Casaco Trench', price: 549.90, category: 'casacos', image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80', hover_image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80', description: 'Trench coat clássico atemporal', sizes: ['P', 'M', 'G', 'GG'] },
  { id: 8, name: 'Conjunto Linho', price: 429.90, category: 'conjuntos', image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', hover_image_url: 'https://images.unsplash.com/photo-1594938374385-9ca7c7b02b6a?w=600&q=80', description: 'Conjunto calça e blusa em linho', sizes: ['P', 'M', 'G'] },
]

const CATEGORIES = [
  { value: 'all', label: 'Tudo' },
  { value: 'blazers', label: 'Blazers' },
  { value: 'calcas', label: 'Calças' },
  { value: 'vestidos', label: 'Vestidos' },
  { value: 'camisas', label: 'Camisas' },
  { value: 'saias', label: 'Saias' },
  { value: 'tops', label: 'Tops' },
  { value: 'casacos', label: 'Casacos' },
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
  if (typeof window !== 'undefined') {
    localStorage.setItem('carolineRaffineCart', JSON.stringify(cart))
  }
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

// ─── WHATSAPP ─────────────────────────────────────────────────────────────
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

// ─── ICONS ────────────────────────────────────────────────────────────────
function CartIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
}

function InstagramIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
}

// ─── STYLES RESPONSIVOS ───────────────────────────────────────────────────
const styles = {
  root: { minHeight: '100vh', backgroundColor: '#f8f8f6', fontFamily: "'Georgia', 'Times New Roman', serif", color: '#1a1a1a' },

  navbar: {position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(248,248,246,0.98)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e8e8e4' },
  navInner: { maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navLogo: { fontSize: 21, fontWeight: 600, letterSpacing: '0.06em' },
  navLinks: { display: 'flex', gap: 28, fontSize: 14 },
  navLink: { textDecoration: 'none', color: '#555' ,
    '@media (max-width: 768px)': {
    display: 'none'
    }
  },
  navActions: { display: 'flex', alignItems: 'center', gap: 14 },

  instagramBtn: { color: '#1a1a1a', padding: 6 },
  cartBtn: { position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6 },
  cartBadge: { position: 'absolute', top: -4, right: -6, background: '#1a1a1a', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  hero: { maxWidth: 1280, margin: '0 auto', padding: '80px 16px 60px', textAlign: 'center' },
  heroContent: { maxWidth: 700, margin: '0 auto' },
  heroTitle: { fontSize: 52, lineHeight: 1.1, marginBottom: 20 },
  heroTitleItalic: { fontStyle: 'italic', color: '#444' },
  heroSub: { fontSize: 17, color: '#666', lineHeight: 1.6 },
  heroBtn: { display: 'inline-block', marginTop: 30, padding: '16px 40px', background: '#1a1a1a', color: '#fff', textDecoration: 'none', borderRadius: 6, fontSize: 13, letterSpacing: '0.1em' },

  filterBar: { padding: '0 16px', marginBottom: 40 },
  filterCategories: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 },
  filterChip: { padding: '9px 18px', border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontSize: 13, borderRadius: 6 },
  filterChipActive: { background: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' },
  searchWrap: { border: '1px solid #ddd', padding: '12px 16px', background: '#fff', borderRadius: 8, maxWidth: 400 },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: 15 },

  main: { maxWidth: 1280, margin: '0 auto', padding: '0 16px 80px' },
  mainHeader: { marginBottom: 30, textAlign: 'center' },
  mainTitle: { fontSize: 32, fontWeight: 400 },

  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: 24 
  },

  card: { background: '#fff', border: '1px solid #ececec', borderRadius: 12, overflow: 'hidden', transition: 'all 0.3s ease' },
  cardHover: { boxShadow: '0 15px 35px rgba(0,0,0,0.1)', transform: 'translateY(-6px)' },
  cardImgWrap: { position: 'relative', paddingTop: '125%', overflow: 'hidden' },
  cardImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(248,248,246,0.95)', padding: '16px', transform: 'translateY(100%)', transition: 'transform 0.4s' },
  cardOverlayVisible: { transform: 'translateY(0)' },
  cardDesc: { margin: 0, fontSize: 13.5, color: '#555' },
  cardBody: { padding: '20px' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardName: { margin: 0, fontSize: 16.5, fontWeight: 500 },
  cardCategory: { fontSize: 11, color: '#999', textTransform: 'uppercase' },
  cardPrice: { fontSize: 20, margin: '10px 0 16px', fontWeight: 400 },
  sizeRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  sizeBtn: { padding: '7px 12px', border: '1px solid #ddd', background: 'none', fontSize: 12.5, cursor: 'pointer', borderRadius: 6 },
  sizeBtnActive: { background: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' },
  addBtn: { width: '100%', padding: '15px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13.5, letterSpacing: '0.08em' },
  addBtnDisabled: { background: '#ddd', color: '#888', cursor: 'not-allowed' },
  addBtnSuccess: { background: '#2e7d32' },

  loadingWrap: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
  skeleton: { height: 420, background: 'linear-gradient(90deg, #f0f0ee 25%, #e0e0dc 50%, #f0f0ee 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 12 },

  emptyState: { textAlign: 'center', padding: '80px 20px', color: '#777' },

  // Cart Drawer
  cartBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 },
  cartDrawer: { 
    position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 420, 
    background: '#fff', zIndex: 201, transform: 'translateX(100%)', 
    transition: 'transform 0.4s cubic-bezier(0.32,0.72,0,1)', boxShadow: '-10px 0 40px rgba(0,0,0,0.2)' 
  },
  cartDrawerOpen: { transform: 'translateX(0)' },

  cartHeader: { padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cartTitle: { margin: 0, fontSize: 22 },
  cartClose: { background: 'none', border: 'none', fontSize: 26, cursor: 'pointer' },

  cartItems: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  cartItem: { display: 'flex', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' },
  cartItemImg: { width: 80, height: 100, objectFit: 'cover', borderRadius: 6 },
  cartItemInfo: { flex: 1 },
  cartItemName: { margin: '0 0 6px', fontSize: 15 },
  cartItemMeta: { fontSize: 13, color: '#666' },
  cartItemPrice: { fontSize: 16, margin: '8px 0' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 },
  qtyBtn: { width: 32, height: 32, border: '1px solid #ddd', background: 'none', borderRadius: 6, cursor: 'pointer' },
  removeBtn: { color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' },

  cartFooter: { padding: '24px', borderTop: '1px solid #eee' },
  cartTotalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 17, marginBottom: 20 },
  cartTotalVal: { fontWeight: 600 },
  checkoutBtn: { width: '100%', padding: '18px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, letterSpacing: '0.1em' },

  footer: { background: '#f3f3f0', borderTop: '1px solid #e8e8e4', padding: '50px 16px 30px' },
  footerInner: { maxWidth: 1280, margin: '0 auto', textAlign: 'center' },
  footerLogo: { fontSize: 20, letterSpacing: '0.1em', marginBottom: 8 },
  footerLinks: { display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', margin: '20px 0' },
  footerLink: { color: '#555', textDecoration: 'none', fontSize: 13.5 },
  footerCopy: { color: '#888', fontSize: 12.5, marginTop: 20 }
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────
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
        <div style={styles.navLogo}>CAROLINE RAFFINÉ</div>
        
        {!isMobile && (
          <div style={styles.navLinks}>
            <a href="#" style={styles.navLink}>Coleção</a>
            <a href="#" style={styles.navLink}>Sobre</a>
            <a href="#" style={styles.navLink}>Contato</a>
          </div>
        )}

        <div style={styles.navActions}>
          <a href="https://www.instagram.com/rafa_mr_019/" target="_blank" style={styles.instagramBtn}>
            <InstagramIcon />
          </a>
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
        <h1 style={styles.heroTitle}>Elegância<br /><em style={styles.heroTitleItalic}>redefinida.</em></h1>
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
          <button
            key={c.value}
            onClick={() => onChange(c.value)}
            style={{ ...styles.filterChip, ...(active === c.value ? styles.filterChipActive : {}) }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div style={styles.searchWrap}>
        <input
          type="text"
          placeholder="Buscar peça..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (!selectedSize) return
    addToCart(product, selectedSize)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div style={{ ...styles.card, ...(hovered ? styles.cardHover : {}) }}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}>
      <div style={styles.cardImgWrap}>
        <img src={product.image_url} alt={product.name} style={{...styles.cardImg, opacity: hovered ? 0 : 1}} />
        <img src={product.hover_image_url} alt={product.name} style={{...styles.cardImg, opacity: hovered ? 1 : 0}} />
        <div style={{...styles.cardOverlay, ...(hovered ? styles.cardOverlayVisible : {})}}>
          <p style={styles.cardDesc}>{product.description}</p>
        </div>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.cardMeta}>
          <h3 style={styles.cardName}>{product.name}</h3>
          <span style={styles.cardCategory}>{product.category}</span>
        </div>
        <p style={styles.cardPrice}>R$ {product.price.toFixed(2).replace('.', ',')}</p>

        <div style={styles.sizeRow}>
          {product.sizes?.map(s => (
            <button key={s} onClick={() => setSelectedSize(s)}
              style={{...styles.sizeBtn, ...(selectedSize === s ? styles.sizeBtnActive : {})}}>
              {s}
            </button>
          ))}
        </div>

        <button onClick={handleAdd} disabled={!selectedSize}
          style={{...styles.addBtn, ...(!selectedSize ? styles.addBtnDisabled : {}), ...(added ? styles.addBtnSuccess : {}) }}>
          {added ? '✓ Adicionado' : !selectedSize ? 'Selecione o tamanho' : 'Adicionar ao carrinho'}
        </button>
      </div>
    </div>
  )
}

function ProductGrid({ products, loading }) {
  if (loading) return <div style={styles.loadingWrap}>{[...Array(8)].map((_, i) => <div key={i} style={styles.skeleton} />)}</div>
  if (!products.length) return <div style={styles.emptyState}><p>Nenhuma peça encontrada.</p></div>
  return <div style={styles.grid}>{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
}

function CartDrawer({ open, onClose }) {
  const cart = useCart()
  const total = cartTotal(cart)

  return (
    <>
      {open && <div onClick={onClose} style={styles.cartBackdrop} />}
      <aside style={{...styles.cartDrawer, ...(open ? styles.cartDrawerOpen : {}) }}>
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
                    <button onClick={() => updateQty(item.key, item.qty-1)} style={styles.qtyBtn}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.key, item.qty+1)} style={styles.qtyBtn}>+</button>
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
        <div style={styles.footerLogo}>CAROLINE RAFFINÉ</div>
        <p style={{color: '#666'}}>Moda com propósito.</p>
        <div style={styles.footerLinks}>
          <a href="https://www.instagram.com/rafa_mr_019/" target="_blank" style={styles.footerLink}>Instagram</a>
          <a href="#" style={styles.footerLink}>Política de Privacidade</a>
          <a href="#" style={styles.footerLink}>Trocas e Devoluções</a>
        </div>
        <p style={styles.footerCopy}>© 2025 Caroline Raffiné. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function StorePage() {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Carregar carrinho
  useEffect(() => {
    cartState = loadCartFromStorage()
    cartListeners.forEach(l => l(cartState))
  }, [])

  const filteredProducts = useMemo(() => {
    let list = MOCK_PRODUCTS
    if (category !== 'all') list = list.filter(p => p.category === category)
    if (search.trim()) {
      const term = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
    }
    return list
  }, [category, search])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [category, search])

  return (
    <div style={styles.root}>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <Hero />

      <main id="produtos" style={styles.main}>
        <div style={styles.mainHeader}>
          <h2 style={styles.mainTitle}>Coleção</h2>
          <p style={{ color: '#666' }}>{filteredProducts.length} peças disponíveis</p>
        </div>

        <FilterBar 
          active={category} 
          onChange={setCategory} 
          search={search} 
          onSearch={setSearch} 
        />

        <ProductGrid products={filteredProducts} loading={loading} />
      </main>

      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}