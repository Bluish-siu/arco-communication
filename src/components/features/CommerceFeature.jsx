import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Check,
  ArrowRight,
  ShoppingCart,
  CreditCard,
  Package,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Container from '../common/Container';

export default function CommerceFeature() {
  const capabilities = [
    'Native in-chat WhatsApp Catalog browsing',
    'Dynamic multi-item cart creation & checkout links',
    'Automated abandoned cart recovery notifications',
    'Order confirmation, tracking updates & receipts',
    'Native Shopify, WooCommerce & custom API catalog sync',
    '1-click instant payment links with UPI, Cards & NetBanking',
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-100" id="commerce">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column on Desktop (2nd on Mobile): Commerce Mockup */}
          <div className="order-2 lg:order-1 lg:col-span-6 w-full">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-6 text-slate-800 text-xs">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">WhatsApp Commerce Experience</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Shopify Synced
                </span>
              </div>

              {/* Product Catalog Card Mockup */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 mb-3.5">
                <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs max-w-sm mx-auto">
                  {/* Product Visual & Details */}
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-50 to-slate-100 border border-slate-200 flex items-center justify-center text-red-600 shrink-0 font-bold">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider">New Arrival</span>
                      <h4 className="font-bold text-sm text-slate-900">ARCO Velocity Sneakers</h4>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">₹4,999 <span className="text-[10px] text-slate-400 line-through font-normal">₹6,499</span></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex gap-2">
                    <button type="button" className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                    <button type="button" className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs">
                      Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Cart Summary */}
              <div className="bg-gradient-to-r from-red-50/60 to-rose-50/40 p-3 rounded-xl border border-red-200/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Active Cart: 1 Item (₹4,999)</div>
                  <div className="text-[10px] text-slate-500">1-click WhatsApp checkout link generated</div>
                </div>
                <button type="button" className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded-lg shadow-2xs">
                  Pay Now
                </button>
              </div>

            </div>
          </div>

          {/* Right Column on Desktop (1st on Mobile): Content */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/80 mb-4 shadow-2xs">
              <ShoppingBag className="w-3.5 h-3.5 text-red-600" />
              <span>WHATSAPP COMMERCE</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Turn WhatsApp conversations into purchases
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Enable your customers to discover products, browse catalogs, add items to cart, and complete payments without ever leaving WhatsApp.
            </p>

            {/* Capabilities Check Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 sm:mt-8 w-full max-w-xl">
              {capabilities.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-800">
                  <div className="w-4 h-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-200/80">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 pt-2">
              <Link
                to="/contact"
                className="group inline-flex items-center text-sm sm:text-base font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                <span>Explore WhatsApp Commerce</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
