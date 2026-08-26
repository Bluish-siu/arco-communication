import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Upload,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Package,
  ShoppingBag,
  RefreshCw,
  LogOut,
  MoreVertical,
  Trash2,
  Eye,
  SlidersHorizontal,
  Tag,
  IndianRupee,
  Layers,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { commerceService } from '../services/commerceService';

export default function CommerceCatalog() {
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  // Navigation Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    catalogConnected: false,
    catalogId: '',
    catalogName: '',
  });

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  // CSV Upload State
  const fileInputRef = useRef(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  // Modals & Active Product Selection
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Close profile and row menus on outside click
  useEffect(() => {
    function handleOutsideClick() {
      setProfileDropdownOpen(false);
      setActiveMenuId(null);
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch Catalog & Products from PostgreSQL Backend
  const loadCatalogData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, productsData] = await Promise.all([
        commerceService.getSettings(),
        commerceService.getProducts(),
      ]);

      if (settingsData) {
        setSettings(settingsData);
      }
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
      setError('Unable to load catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  // CSV File Upload Handler
  const handleCsvFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Please upload a valid CSV file.', 'error');
      e.target.value = null;
      return;
    }

    setUploadingCsv(true);
    try {
      const text = await file.text();
      const res = await commerceService.uploadCsv(text);
      showToast(`Catalog uploaded successfully — ${res.data?.imported || 0} products imported.`);
      await loadCatalogData();
    } catch (err) {
      showToast(err.message || 'Failed to upload catalog. Please try again.', 'error');
    } finally {
      setUploadingCsv(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await commerceService.deleteProduct(productToDelete.id);
      showToast('Product deleted successfully');
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Unique Brands for Filter Dropdown
  const uniqueBrands = ['all', ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.external_product_id || '').toLowerCase().includes(q);

    const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      
      {/* Hidden Native File Input for CSV Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleCsvFileChange}
        className="hidden"
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top duration-200 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Layout Container with ARCO Dashboard Sidebar */}
      <div className="flex-1 flex flex-row min-w-0">
        
        {/* ARCO Sidebar */}
        <DashboardSidebar />

        {/* Workspace Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-slate-50/50 min-h-screen">
          
          {/* Top Header Navigation */}
          <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Link to="/dashboard" className="hover:text-slate-600 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-500">WhatsApp Commerce</span>
              <span>/</span>
              <span className="text-slate-900 font-bold">Catalog</span>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0d3b30] text-emerald-300 font-bold text-xs flex items-center justify-center shadow-2xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-[120px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 font-semibold text-slate-900 truncate">
                      {userName}
                    </div>
                    <Link
                      to="/commerce-settings"
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50"
                    >
                      Commerce Settings
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 text-left font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

          </header>

          {/* Page Content Container */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col max-w-6xl w-full mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Catalog
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage your WhatsApp product catalog
                </p>
              </div>

              {/* Action Buttons if Products Exist */}
              {products.length > 0 && (
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  {settings.catalogConnected && (
                    <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>FB Catalog: {settings.catalogId}</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={loadCatalogData}
                    disabled={loading}
                    className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Refresh products"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingCsv}
                    className="px-4 py-2 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingCsv ? 'Uploading...' : 'Upload CSV'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 1. LOADING STATE */}
            {loading && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs flex-1 min-h-[420px] flex flex-col items-center justify-center p-12 space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500">Loading catalog...</p>
              </div>
            )}

            {/* 2. ERROR STATE */}
            {!loading && error && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs flex-1 min-h-[420px] flex flex-col items-center justify-center p-12 space-y-4 text-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{error}</h3>
                  <p className="text-xs text-slate-500 mt-1">Check your connection and try again.</p>
                </div>
                <button
                  type="button"
                  onClick={loadCatalogData}
                  className="px-4 py-2 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* 3. EMPTY STATE (Exact Interakt Visual Reference) */}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs flex-1 min-h-[460px] flex flex-col items-center justify-center p-8 sm:p-16 text-center animate-in fade-in duration-200">
                
                {/* Store / Catalog Icon (~32px, muted gray) */}
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5">
                  <Store className="w-7 h-7 stroke-[1.75]" />
                </div>

                {/* "No catalog found" */}
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 mb-5">
                  No catalog found
                </h2>

                {/* Upload CSV Primary Action Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingCsv}
                  className="px-5 py-2.5 bg-[#0d3b30] hover:bg-[#154d3f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-w-[120px]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingCsv ? 'Uploading...' : 'Upload CSV'}</span>
                </button>

                {/* OR Separator */}
                <div className="my-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  OR
                </div>

                {/* Set up a FB catalog ↗ (Outlined Button) */}
                <a
                  href="https://business.facebook.com/commerce_manager/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white hover:bg-emerald-50/50 border border-[#0d3b30] text-[#0d3b30] font-bold text-xs rounded-xl shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Set up a FB catalog</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

              </div>
            )}

            {/* 4. POPULATED CATALOG GRID (When Products Exist in PostgreSQL) */}
            {!loading && !error && products.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                {/* Search & Filter Toolbar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Search Box */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products by title, SKU, or brand..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Brand Filter & Count */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Brand:</span>
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white cursor-pointer"
                      >
                        {uniqueBrands.map((b) => (
                          <option key={b} value={b}>
                            {b === 'all' ? 'All Brands' : b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="text-xs font-bold text-slate-500">
                      {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                    </span>
                  </div>

                </div>

                {/* Product Cards Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
                    <Package className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-xs">No products match your search criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all p-3.5 flex flex-col justify-between group relative"
                      >
                        <div>
                          {/* Product Image */}
                          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-3 relative flex items-center justify-center">
                            <img
                              src={prod.image_link || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
                              alt={prod.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                              }}
                            />
                            
                            {/* SKU Pill Top Left */}
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono font-bold">
                              {prod.external_product_id || 'SKU'}
                            </span>

                            {/* Row Action Menu Button */}
                            <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActiveMenuId(activeMenuId === prod.id ? null : prod.id)}
                                className="w-7 h-7 rounded-xl bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {/* Dropdown Menu */}
                              {activeMenuId === prod.id && (
                                <div className="absolute right-0 mt-1 w-32 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedProduct(prod);
                                      setDetailsModalOpen(true);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left font-semibold cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProductToDelete(prod);
                                      setDeleteModalOpen(true);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 text-left font-semibold cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Brand & Title */}
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {prod.brand || 'ARCO'}
                          </div>
                          <h3
                            onClick={() => {
                              setSelectedProduct(prod);
                              setDetailsModalOpen(true);
                            }}
                            className="font-bold text-slate-900 text-xs leading-snug truncate mt-0.5 cursor-pointer hover:text-emerald-800"
                            title={prod.title}
                          >
                            {prod.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal font-normal">
                            {prod.description}
                          </p>
                        </div>

                        {/* Price & Stock Status Footer */}
                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between font-bold">
                          <span className="text-emerald-700 text-xs font-extrabold">
                            ₹{parseFloat(prod.price || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {prod.availability || 'in stock'}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODALS & POPUPS                                                        */}
      {/* ========================================================================= */}

      {/* A. PRODUCT DETAILS MODAL */}
      {detailsModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0d3b30] text-emerald-300 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedProduct.title}</h3>
                  <p className="text-[11px] font-mono text-slate-400">ID: {selectedProduct.external_product_id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={selectedProduct.image_link || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="font-bold text-slate-900 text-xs">Description</div>
              <p className="text-slate-600 leading-relaxed">{selectedProduct.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Price</div>
                <div className="font-extrabold text-emerald-700 text-xs mt-0.5">
                  ₹{parseFloat(selectedProduct.price || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Brand</div>
                <div className="font-bold text-slate-800 text-xs mt-0.5">{selectedProduct.brand || 'ARCO'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                <div className="font-bold text-emerald-700 text-xs mt-0.5">{selectedProduct.availability || 'in stock'}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* B. DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs font-sans text-center">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Delete this product?</h3>
              <p className="text-slate-500 text-[11px]">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{productToDelete.title}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
