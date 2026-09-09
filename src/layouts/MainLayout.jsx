import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import { isShopifyEmbedded } from '../utils/shopifyAppBridge';

export default function MainLayout() {
  const embedded = isShopifyEmbedded();

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Sticky Top Navigation (suppressed in Shopify embedded frame) */}
      {!embedded && <Navbar />}

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer (suppressed in Shopify embedded frame) */}
      {!embedded && <Footer />}
    </div>
  );
}
