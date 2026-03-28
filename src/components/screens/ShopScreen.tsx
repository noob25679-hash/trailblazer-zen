import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PRODUCTS } from '@/lib/xp';

export default function ShopScreen() {
  const { cart, addToCart, removeFromCart, changeQty, setScreen, showToast } = useApp();
  const [filter, setFilter] = useState('all');
  const [showCart, setShowCart] = useState(false);

  const cats = [
    { key: 'all', label: 'All' },
    { key: 'boots', label: '👟 Boots' },
    { key: 'bags', label: '🎒 Bags' },
    { key: 'clothing', label: '🧥 Clothing' },
    { key: 'safety', label: '⛑️ Safety' },
    { key: 'hydration', label: '💧 Hydration' },
  ];

  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
  const cartTotal = cart.reduce((s: number, c: any) => s + c.price * (c.qty || 1), 0);
  const cartCount = cart.reduce((s: number, c: any) => s + (c.qty || 1), 0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-[52px] pb-4 flex justify-between items-end" style={{ background: 'linear-gradient(180deg, hsl(var(--secondary)) 0%, transparent 100%)' }}>
        <div>
          <div className="font-mono text-[9px] tracking-[3px] text-primary uppercase">Gear</div>
          <div className="font-display text-[36px] tracking-[1px] text-foreground leading-none mt-0.5">Trek Shop</div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button onClick={() => setShowCart(true)} className="font-mono text-[9px] px-3 py-2 rounded-full border border-primary bg-transparent text-primary cursor-pointer">🛒 Cart</button>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">{cartCount}</span>
            )}
          </div>
          <button onClick={() => setScreen('feed')} className="font-mono text-[9px] px-3 py-2 rounded-full border border-primary bg-transparent text-primary cursor-pointer">← Back</button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto scroll-hide">
        {cats.map(c => (
          <button key={c.key} onClick={() => setFilter(c.key)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full font-mono text-[11px] tracking-[0.5px] uppercase font-semibold cursor-pointer transition-all border ${
              filter === c.key ? 'border-primary bg-green-dim text-primary' : 'border-border bg-card text-muted-foreground'
            }`}>{c.label}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto scroll-hide">
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          {filtered.map(p => {
            const inCart = cart.find((c: any) => c.id === p.id);
            return (
              <div key={p.id} className="bg-card border border-border rounded-[20px] overflow-hidden active:scale-[0.97] transition-transform">
                <div className="w-full h-[120px] bg-secondary flex items-center justify-center text-[40px]">{p.icon}</div>
                <div className="p-2.5 pb-3">
                  <div className="font-mono text-[10px] text-muted-foreground tracking-[0.5px]">{p.brand}</div>
                  <div className="font-bold text-[13px] text-foreground leading-tight mb-1">{p.name}</div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-display text-[20px] text-primary">₹{p.price.toLocaleString()}</span>
                    <span className="text-[11px] text-text-dim line-through ml-1">₹{p.orig.toLocaleString()}</span>
                  </div>
                  <div className="text-[9px] text-warning mt-0.5">{'★'.repeat(Math.floor(p.rating))} {p.rating}</div>
                  <button onClick={() => { addToCart(p); showToast(`🛒 ${p.name} added!`); }}
                    className={`w-full mt-2 font-mono text-[9px] tracking-[1.5px] uppercase py-2 rounded-full cursor-pointer ${
                      inCart ? 'border border-primary bg-transparent text-primary' : 'border-none bg-gradient-to-br from-primary to-green-dark text-white'
                    }`}>{inCart ? '✓ In Cart' : '+ Add to Cart'}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-end" onClick={e => e.target === e.currentTarget && setShowCart(false)}>
          <div className="bg-card rounded-t-3xl w-full p-6 border-t border-border-bright animate-sheet-up max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 rounded-full bg-text-dim mx-auto mb-5" />
            <div className="font-display text-[24px] mb-5">Your Cart</div>
            {!cart.length ? (
              <div className="text-center py-8 text-muted-foreground text-[13px]">Your cart is empty</div>
            ) : (
              <>
                {cart.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 py-3 border-b border-border">
                    <div className="text-[28px] w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">{c.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-[13px] text-foreground">{c.name}</div>
                      <div className="text-[12px] text-primary mt-0.5">₹{(c.price * (c.qty || 1)).toLocaleString()}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={() => changeQty(c.id, -1)} className="w-[26px] h-[26px] rounded-full border border-border bg-secondary text-foreground flex items-center justify-center cursor-pointer">−</button>
                        <span className="font-mono text-[13px] text-foreground min-w-5 text-center">{c.qty || 1}</span>
                        <button onClick={() => changeQty(c.id, 1)} className="w-[26px] h-[26px] rounded-full border border-border bg-secondary text-foreground flex items-center justify-center cursor-pointer">+</button>
                        <button onClick={() => removeFromCart(c.id)} className="ml-2 font-mono text-[9px] px-2.5 py-1 rounded-full border border-destructive bg-transparent text-destructive cursor-pointer">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-4 mb-4">
                  <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[1px]">Total</span>
                  <span className="font-display text-[28px] text-primary">₹{cartTotal.toLocaleString()}</span>
                </div>
                <button onClick={() => { setShowCart(false); showToast('🚀 Checkout coming soon!'); }}
                  className="w-full font-mono text-[10px] tracking-[1.5px] uppercase py-3 rounded-full border-none bg-gradient-to-br from-primary to-green-dark text-white cursor-pointer text-center">
                  Checkout →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
