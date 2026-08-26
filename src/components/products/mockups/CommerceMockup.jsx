import { ShoppingCart, CheckCircle2, ShoppingBag, ArrowRight, CreditCard, Sparkles } from 'lucide-react';

export default function CommerceMockup() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-6 text-slate-800 text-xs overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">WhatsApp Conversational Commerce</h4>
            <p className="text-[10px] text-slate-400">Native Product Catalogs, Cart & 1-Click Checkout</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">GMV Recovered</span>
          <span className="text-sm font-extrabold text-emerald-600">₹4.8L / mo</span>
        </div>
      </div>

      {/* 2-Column WhatsApp Commerce Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
        {/* Left: Product Card in Chat */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 space-y-2.5">
          <div className="font-bold text-slate-700 pb-1 border-b border-slate-200/60">In-Chat Product Catalog</div>
          
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center text-xs">
                👟
              </div>
              <div>
                <strong className="text-slate-900 block text-[11px]">ARCO Velocity Sneakers</strong>
                <span className="text-slate-500 text-[10px]">Size: 9 UK · Black/Red Edition</span>
                <div className="font-extrabold text-red-600 text-xs mt-0.5">₹4,999</div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-1.5 rounded-lg bg-red-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-2xs"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Add to WhatsApp Cart</span>
            </button>
          </div>
        </div>

        {/* Right: Instant Checkout & Payment Confirmed */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex justify-between font-bold text-slate-700 pb-1 border-b border-slate-200/60">
              <span>Cart Summary (2 items)</span>
              <span className="text-slate-900 font-extrabold">₹9,998</span>
            </div>

            <div className="mt-2 p-2 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment Successful ✓</span>
              </div>
              <p className="text-[9px] text-emerald-700">Order <strong>#AR48291</strong> confirmed via UPI.</p>
              <div className="text-[8px] text-emerald-600 font-mono">Auto-synced with Shopify</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-400">
            <span>Automated delivery notifications enabled</span>
            <span className="text-emerald-600 font-bold">100% Native</span>
          </div>
        </div>
      </div>
    </div>
  );
}
