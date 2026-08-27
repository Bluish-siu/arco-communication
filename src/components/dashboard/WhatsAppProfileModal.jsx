import { useState } from 'react';
import { X, User, Check, RefreshCw, Globe, Mail, MapPin, Building } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

export default function WhatsAppProfileModal({ isOpen, onClose, currentProfile, onProfileChange, showToast }) {
  const [businessName, setBusinessName] = useState(currentProfile?.businessName || 'ARCO Communication');
  const [about, setAbout] = useState(currentProfile?.about || 'Leading WhatsApp & Omni-channel Marketing Automation platform.');
  const [category, setCategory] = useState(currentProfile?.category || 'Software & Technology');
  const [address, setAddress] = useState(currentProfile?.address || 'Bangalore, India');
  const [website, setWebsite] = useState(currentProfile?.website || 'https://arcocommunication.com');
  const [email, setEmail] = useState(currentProfile?.email || 'support@arcocommunication.com');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!businessName.trim()) {
      showToast('Business Name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        businessName: businessName.trim(),
        about: about.trim(),
        category,
        address: address.trim(),
        website: website.trim(),
        email: email.trim(),
        updated: true,
      };

      const res = await dashboardService.updateWhatsAppProfile(payload);
      if (res.success || res.data) {
        showToast('WhatsApp Business Profile updated successfully!', 'success');
        onProfileChange(payload);
        onClose();
      } else {
        showToast(res.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/80">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Update WhatsApp Business Profile</h3>
              <p className="text-[11px] text-slate-500">Make a great first impression when customers open your chat</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. ARCO Retail Store"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">About / Bio (Max 256 chars)</label>
            <textarea
              rows={3}
              maxLength={256}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Brief description of your company & services..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600 resize-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
              >
                <option value="Software & Technology">Software & Technology</option>
                <option value="e-Commerce & Retail">e-Commerce & Retail</option>
                <option value="Education & EdTech">Education & EdTech</option>
                <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                <option value="Financial Services">Financial Services</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Support Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="support@company.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, Country"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Updating...' : 'Update WhatsApp Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
