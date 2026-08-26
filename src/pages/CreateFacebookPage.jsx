import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Image,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  LogOut,
  RefreshCw,
  Save,
  Globe,
  MapPin,
  FileText,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useOnboarding } from '../context/OnboardingContext';
import { ctwaService } from '../services/ctwaService';

export default function CreateFacebookPage() {
  const navigate = useNavigate();
  const { user, businessSetup, logout } = useOnboarding();
  const userName = businessSetup?.companyName || user?.name || 'Business Owner';

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [pageName, setPageName] = useState('');
  const [about, setAbout] = useState('');
  const [category, setCategory] = useState('');
  const [displayPictureUrl, setDisplayPictureUrl] = useState('');
  const [coverPictureUrl, setCoverPictureUrl] = useState('');
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('');

  // Form Validation Errors
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Existing Draft on Mount
  useEffect(() => {
    async function loadDraft() {
      setLoadingDraft(true);
      try {
        const data = await ctwaService.getCtwaStatus();
        if (data?.facebookPage) {
          const p = data.facebookPage;
          if (p.name) setPageName(p.name);
          if (p.about) setAbout(p.about);
          if (p.category) setCategory(p.category);
          if (p.country) setCountry(p.country);
          if (p.address) setAddress(p.address);
          if (p.displayPictureUrl) setDisplayPictureUrl(p.displayPictureUrl);
          if (p.coverPictureUrl) setCoverPictureUrl(p.coverPictureUrl);
        }
      } catch (err) {
        console.warn('Failed to load draft:', err);
      } finally {
        setLoadingDraft(false);
      }
    }
    loadDraft();
  }, []);

  // Handle Image Uploads with Base64 Preview
  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Validate Form
  const validateForm = () => {
    const errs = {};
    if (!pageName.trim()) errs.pageName = 'Page Name is required';
    if (!category) errs.category = 'Please select a Page Category';
    if (!country) errs.country = 'Location / Country is required';
    if (!address.trim()) errs.address = 'Street address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Save as Draft
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await ctwaService.savePageDraft({
        pageName: pageName.trim(),
        about: about.trim(),
        category,
        displayPictureUrl,
        coverPictureUrl,
        country,
        address: address.trim(),
      });
      showToast('Facebook Page draft saved successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to save draft', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Handle Create Facebook Page
  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await ctwaService.createFacebookPage({
        pageName: pageName.trim(),
        about: about.trim(),
        category,
        displayPictureUrl,
        coverPictureUrl,
        country,
        address: address.trim(),
      });

      showToast('Facebook Page created and connected successfully!');
      setTimeout(() => {
        navigate('/analytics/ad-performance');
      }, 700);
    } catch (err) {
      showToast(err.message || 'Failed to create Facebook Page', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriesList = [
    'E-Commerce & Online Retail',
    'Retail & Consumer Goods',
    'Software & Internet Marketing',
    'Financial Services & Fintech',
    'Health & Beauty',
    'Food & Beverage',
    'Real Estate & Construction',
    'Education & Training',
    'Travel & Hospitality',
    'Professional Services',
  ];

  const countriesList = [
    'India',
    'United States',
    'United Kingdom',
    'United Arab Emirates',
    'Singapore',
    'Canada',
    'Australia',
    'Germany',
    'Saudi Arabia',
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-800">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-3.5 py-2.5 rounded-lg shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-gray-900 text-white border-gray-800'
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

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-row min-w-0">
        <DashboardSidebar />

        {/* Content Shell */}
        <main className="flex-1 ml-14 min-w-0 flex flex-col bg-[#f8fafc] min-h-screen">
          
          {/* Top Navigation Header */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-2xs">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <Link to="/analytics/ad-performance" className="hover:text-gray-800 transition-colors">
                Meta Ads
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Create Facebook Page</span>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative profile-container">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0d3b30] text-emerald-300 font-bold text-xs flex items-center justify-center shadow-2xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 hidden sm:block max-w-[120px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-gray-100 font-semibold text-gray-900 truncate">
                      {userName}
                    </div>
                    <button
                      type="button"
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

          {/* Page Body */}
          <div className="p-6 max-w-[800px] w-full mx-auto space-y-5">
            
            {/* Form Card Container */}
            <form onSubmit={handleCreatePage} className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-6">
              
              {/* Form Header with Action Buttons */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="space-y-0.5">
                  <h1 className="text-base font-bold text-gray-900 tracking-tight">
                    Create a new Facebook Page
                  </h1>
                  <p className="text-xs text-gray-500">
                    Provide the business information to register and connect your Page with Meta.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/ctwa/facebook')}
                    className="h-8 px-3 rounded border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer shadow-2xs"
                  >
                    Go Back
                  </button>

                  <button
                    type="button"
                    disabled={isSavingDraft}
                    onClick={handleSaveDraft}
                    className="h-8 px-3 rounded border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    {isSavingDraft ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    <span>Save as Draft</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-8 px-4 bg-[#0d3b30] hover:bg-[#154d3f] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Creating Page...</span>
                      </>
                    ) : (
                      <span>Create Facebook Page</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 text-xs">
                
                {/* 1. Enter Page Name */}
                <div className="space-y-1">
                  <label className="block font-bold text-gray-800">
                    Enter Page Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pageName}
                    onChange={(e) => {
                      setPageName(e.target.value);
                      if (errors.pageName) setErrors({ ...errors, pageName: null });
                    }}
                    placeholder="Enter Page Name here"
                    className={`w-full h-8 px-3 rounded border text-xs bg-white focus:outline-none ${
                      errors.pageName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-400'
                    }`}
                  />
                  {errors.pageName && <p className="text-[11px] font-semibold text-red-500">{errors.pageName}</p>}
                </div>

                {/* 2. About Page */}
                <div className="space-y-1">
                  <label className="block font-bold text-gray-800">About Page</label>
                  <textarea
                    rows={3}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Enter business description here"
                    className="w-full p-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none focus:border-gray-400 leading-relaxed"
                  />
                </div>

                {/* 3. Page Category */}
                <div className="space-y-1">
                  <label className="block font-bold text-gray-800">
                    Page Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (errors.category) setErrors({ ...errors, category: null });
                    }}
                    className={`w-full h-8 px-2.5 rounded border text-xs bg-white focus:outline-none ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-[11px] font-semibold text-red-500">{errors.category}</p>}
                </div>

                {/* 4 & 5. Upload Display Picture & Cover Picture */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  
                  {/* Upload Page Display Pic */}
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-800">Upload Page Display Pic</label>
                    <div className="border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative min-h-[110px]">
                      {displayPictureUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={displayPictureUrl}
                            alt="Display Pic Preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setDisplayPictureUrl('')}
                            className="absolute top-0 right-0 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer space-y-1">
                          <Upload className="w-5 h-5 mx-auto text-gray-400" />
                          <span className="text-[11px] font-semibold text-[#0d3b30]">Click to upload profile pic</span>
                          <p className="text-[9px] text-gray-400">JPEG, JPG, PNG, MP4 up to 5MB</p>
                          <input
                            type="file"
                            accept="image/*,video/mp4"
                            onChange={(e) => handleImageUpload(e, setDisplayPictureUrl)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Upload Page Cover Pic */}
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-800">Upload Page Cover Pic</label>
                    <div className="border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative min-h-[110px]">
                      {coverPictureUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={coverPictureUrl}
                            alt="Cover Pic Preview"
                            className="w-full h-20 rounded-md object-cover border border-emerald-500 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setCoverPictureUrl('')}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer space-y-1">
                          <Image className="w-5 h-5 mx-auto text-gray-400" />
                          <span className="text-[11px] font-semibold text-[#0d3b30]">Click to upload cover pic</span>
                          <p className="text-[9px] text-gray-400">JPEG, JPG, PNG, MP4 up to 5MB</p>
                          <input
                            type="file"
                            accept="image/*,video/mp4"
                            onChange={(e) => handleImageUpload(e, setCoverPictureUrl)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                </div>

                {/* 6. Location / Country */}
                <div className="space-y-1 pt-1">
                  <label className="block font-bold text-gray-800">
                    Location / Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (errors.country) setErrors({ ...errors, country: null });
                    }}
                    className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none"
                  >
                    {countriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* 7. Address */}
                <div className="space-y-1">
                  <label className="block font-bold text-gray-800">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors({ ...errors, address: null });
                    }}
                    placeholder="Enter street/business address"
                    className={`w-full h-8 px-3 rounded border text-xs bg-white focus:outline-none ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-[11px] font-semibold text-red-500">{errors.address}</p>}
                </div>

              </div>

            </form>

          </div>
        </main>
      </div>

    </div>
  );
}
