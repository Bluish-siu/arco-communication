import {
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Package,
  TrendingUp,
  CheckCircle2,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import ProductHero from '../../components/products/ProductHero';
import ProductStats from '../../components/products/ProductStats';
import ProductFeatureSection from '../../components/products/ProductFeatureSection';
import ProductWorkflow from '../../components/products/ProductWorkflow';
import ProductUseCases from '../../components/products/ProductUseCases';
import ProductBenefits from '../../components/products/ProductBenefits';
import ProductIntegrations from '../../components/products/ProductIntegrations';
import ProductFAQ from '../../components/products/ProductFAQ';
import RelatedProducts from '../../components/products/RelatedProducts';
import ProductCTA from '../../components/products/ProductCTA';
import CommerceMockup from '../../components/products/mockups/CommerceMockup';

export default function WhatsAppCommerce() {
  const stats = [
    { value: '38%', label: 'Abandoned Cart Recovery', description: 'With automated WhatsApp recovery sequences' },
    { value: '3.2x', label: 'Higher Repeat Purchase Rate', description: 'Through personalized conversational re-orders' },
    { value: '1-Click', label: 'Native UPI & Card Checkout', description: 'Frictionless payment inside WhatsApp' },
    { value: '₹4.8L+', label: 'Monthly GMV Boost', description: 'Average incremental revenue per D2C brand' },
  ];

  const workflowSteps = [
    {
      title: 'Discover Catalog',
      description: 'Shopper browses native multi-product catalogs directly in the WhatsApp chat.',
      icon: ShoppingBag,
    },
    {
      title: 'Build In-Chat Cart',
      description: 'Customer selects variants, sizes, and quantities into an active WhatsApp cart.',
      icon: ShoppingCart,
    },
    {
      title: 'Instant 1-Click Payment',
      description: 'Shopper completes payment via UPI, Cards, NetBanking, or COD inside chat.',
      icon: CreditCard,
    },
    {
      title: 'Automated Order Updates',
      description: 'Instant order confirmation, invoice PDF, and live courier tracking notifications.',
      icon: Package,
    },
  ];

  const useCases = [
    {
      title: 'D2C Fashion & Apparel Selling',
      description: 'Send catalog drops, collect size preferences, and process 1-click WhatsApp checkouts.',
      industry: 'Fashion & Apparel',
      metric: '42% Higher Conversions',
    },
    {
      title: 'Automated Abandoned Cart Recovery',
      description: 'Detect abandoned checkout sessions on Shopify and send gentle reminder discounts on WhatsApp.',
      industry: 'E-commerce & Retail',
      metric: '38% Cart Recovery',
    },
    {
      title: 'Food, Grocery & Repeat Subscriptions',
      description: 'Enable customers to re-order favorite groceries or meals with a single WhatsApp message.',
      industry: 'FMCG & Quick Commerce',
      metric: '65% Repeat Re-orders',
    },
  ];

  const benefits = [
    {
      title: 'Native WhatsApp Shopping Catalog',
      description: 'Showcase up to 10,000 products with photos, prices, descriptions, and SKU inventory.',
      icon: ShoppingBag,
      highlight: 'Native Catalog Sync',
    },
    {
      title: 'Automated Abandoned Cart Sequences',
      description: 'Recover lost sales by automatically messaging buyers 15 minutes after cart abandonment.',
      icon: TrendingUp,
      highlight: '38% Recovered GMV',
    },
    {
      title: 'Shopify & WooCommerce Real-Time Sync',
      description: 'Keep inventory, prices, orders, and fulfillment statuses perfectly in sync.',
      icon: Zap,
      highlight: 'Two-Way Sync',
    },
  ];

  const faqs = [
    {
      question: 'How does WhatsApp native checkout work?',
      answer: 'Customers can browse your product catalog, add items to their WhatsApp cart, and pay via integrated payment gateways (Razorpay, PayU, Stripe, UPI) without ever leaving WhatsApp.',
    },
    {
      question: 'Does ARCO integrate with Shopify and WooCommerce?',
      answer: 'Yes! ARCO provides 1-click integration with Shopify, WooCommerce, and Magento, syncing product catalogs, inventory, and order fulfillment automatically.',
    },
    {
      question: 'Can ARCO send automated shipping and delivery updates?',
      answer: 'Yes. ARCO automatically triggers order confirmation, dispatch updates, out-for-delivery alerts, and delivery confirmation messages via WhatsApp.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ProductHero
        badge="WHATSAPP COMMERCE"
        badgeIcon={ShoppingCart}
        headline="Turn conversations into purchases"
        description="Let customers discover products, build carts, pay, and track orders directly through conversational commerce on WhatsApp."
        mockup={<CommerceMockup />}
      />

      <ProductStats stats={stats} />

      <ProductFeatureSection
        badge="NATIVE CATALOG & CART"
        title="Bring your entire store directly into WhatsApp"
        description="Empower shoppers to browse multi-product collections, view high-res images, choose variants, and build carts without opening an external browser."
        benefits={[
          'Native Meta WhatsApp product catalogs with real-time stock sync',
          'Multi-item cart management with quantity adjustments',
          'Instant automated product recommendations based on customer interest',
          'Support for product collections and category browsing',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Native In-Chat Product Display</div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center text-xs">
                  👟
                </div>
                <div>
                  <strong className="text-slate-900 block text-xs">ARCO Velocity Sneakers</strong>
                  <span className="text-slate-500 text-[11px]">Size: 9 UK · ₹4,999</span>
                </div>
              </div>
              <div className="pt-1 flex gap-2">
                <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold">Add to Cart</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">View Details</span>
              </div>
            </div>
          </div>
        }
      />

      <ProductFeatureSection
        badge="CART RECOVERY"
        title="Recover 38% of abandoned checkouts automatically"
        description="Automatically trigger personalized WhatsApp messages with product photos and exclusive discount codes when shoppers abandon carts on your store."
        benefits={[
          'Automated trigger within 15–30 minutes of cart abandonment',
          'Dynamic insertion of abandoned items and 1-click checkout links',
          'Personalized incentive coupons for high-value orders',
          'Detailed conversion attribution and recovered revenue reports',
        ]}
        visual={
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Automated Cart Recovery Engine</div>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-emerald-700">Cart Abandoned (30m ago)</span>
                <span className="text-emerald-600 font-bold">Recovered ✓</span>
              </div>
              <p className="text-slate-700 text-xs">"Hey Aarav! We saved your Velocity Sneakers. Complete checkout now and get an extra 10% off!"</p>
              <div className="text-emerald-600 font-bold text-xs">Revenue Recovered: ₹4,999</div>
            </div>
          </div>
        }
        reversed={true}
        bgColor="bg-slate-50/50"
      />

      <ProductWorkflow
        badge="SHOPPING FLOW"
        title="How conversational commerce works"
        description="From product discovery to repeat purchase."
        steps={workflowSteps}
      />

      <ProductUseCases
        badge="COMMERCE EXAMPLES"
        title="How leading D2C brands sell on WhatsApp"
        description="Explore how modern brands drive sales with conversational commerce."
        useCases={useCases}
      />

      <ProductBenefits
        badge="COMMERCE ROI"
        title="Designed to maximize GMV and repurchase rates"
        description="Deliver a frictionless shopping experience where your buyers already are."
        benefits={benefits}
      />

      <ProductIntegrations />

      <ProductFAQ faqs={faqs} />

      <RelatedProducts currentProductId="whatsapp-commerce" />

      <ProductCTA
        badge="START SELLING TODAY"
        title="Turn WhatsApp into your most profitable sales channel"
        description="Launch your WhatsApp store and start recovering lost carts with ARCO."
      />
    </div>
  );
}
