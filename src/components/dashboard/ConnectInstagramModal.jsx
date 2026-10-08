import { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  KeyRound,
  Layers,
  Sparkles,
} from 'lucide-react';
import { integrationService } from '../../services/integrationService';
import { launchInstagramConnect } from '../../utils/metaSdk';

const InstagramIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function ConnectInstagramModal({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState('oauth'); // 'oauth' | 'direct'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Direct credentials form
  const [pageId, setPageId] = useState('');
  const [pageName, setPageName] = useState('');
  const [pageAccessToken, setPageAccessToken] = useState('');
  const [igAccountId, setIgAccountId] = useState('');
  const [igUsername, setIgUsername] = useState('');

  if (!isOpen) return null;

  const handleOAuthConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const auth = await launchInstagramConnect();
      if (!auth?.accessToken) {
        throw new Error('No access token received from Facebook Login.');
      }
      const res = await integrationService.connectInstagramWithToken(auth.accessToken);
      if (res?.success) {
        showToast(`Connected Instagram account @${res.data?.instagramUsername || 'Business'}!`, 'success');
        if (onStatusChange) onStatusChange(res.data);
        onClose();
      } else {
        setError(res?.error || 'Failed to link Instagram account.');
      }
    } catch (err) {
      if (err.code === 'USER_CANCELLED') {
        setError('Facebook Login popup was cancelled.');
      } else {
        setError(err.message || 'Instagram connection failed. Ensure your account is a Professional Instagram account linked to a Facebook Page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectConnect = async (e) => {
    e.preventDefault();
    if (!pageId.trim() || !pageAccessToken.trim()) {
      setError('Facebook Page ID and Page Access Token are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await integrationService.connectInstagramDirect({
        pageId: pageId.trim(),
        pageName: pageName.trim() || 'Connected Facebook Page',
        pageAccessToken: pageAccessToken.trim(),
        igAccountId: igAccountId.trim() || undefined,
        igUsername: igUsername.trim() || undefined,
      });
      if (res?.success) {
        showToast(`Instagram account @${res.data?.instagramUsername || 'Business'} connected!`, 'success');
        if (onStatusChange) onStatusChange(res.data);
        onClose();
      } else {
        setError(res?.error || 'Failed to connect direct credentials.');
      }
    } catch (err) {
      setError(err.message || 'Direct connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this Instagram account?')) return;
    setLoading(true);
    try {
      const res = await integrationService.disconnectInstagram();
      if (res?.success) {
        showToast('Instagram account disconnected.', 'info');
        if (onStatusChange) onStatusChange({ connected: false });
        onClose();
      } else {
        setError(res?.error || 'Failed to disconnect Instagram.');
      }
    } catch (err) {
      setError(err.message || 'Error disconnecting.');
    } finally {
      setLoading(false);
    }
  };

  const isConnected = !!currentStatus?.connected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-rose-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-xs">
              <InstagramIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isConnected ? 'Instagram Direct Settings' : 'Connect Instagram Account'}
              </h3>
              <p className="text-xs text-slate-500">
                Receive & reply to customer DMs directly in ARCO
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {isConnected ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    {currentStatus?.instagramUsername ? `@${currentStatus.instagramUsername[0].toUpperCase()}` : 'IG'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>@{currentStatus?.instagramUsername || 'Business Account'}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                    </div>
                    <div className="text-xs text-emerald-700">
                      Linked to Page: <span className="font-semibold">{currentStatus?.pageName || 'Facebook Page'}</span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Active Features & Capabilities:
                </div>
                <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600">
                  <li>2-Way Live DM Sync in ARCO Team Inbox</li>
                  <li>Instant Auto-replies for PP (Price on Request) queries</li>
                  <li>Automated LeadGen and Giveaway flow triggers</li>
                  <li>Customer profile & conversation history persistence</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Disconnecting...' : 'Disconnect Account'}
                </button>
              </div>
            </div>
          ) : (
            /* Connection Options */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('oauth')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'oauth'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FacebookIcon className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>1-Click Facebook Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('direct')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'direct'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                  <span>Direct Token</span>
                </button>
              </div>

              {activeTab === 'oauth' ? (
                <div className="space-y-4 pt-1">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs text-slate-600">
                    <div className="font-bold text-slate-800">Requirements:</div>
                    <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-600">
                      <li>Instagram account must be Professional (Business or Creator)</li>
                      <li>Connected to your Facebook Page in Instagram account settings</li>
                      <li>Message access enabled under Settings &gt; Privacy &gt; Messages</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleOAuthConnect}
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] active:bg-[#1567d3] rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Connecting via Meta...</span>
                      </>
                    ) : (
                      <>
                        <FacebookIcon className="w-4 h-4" />
                        <span>Continue with Facebook</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    Official Meta Business Login. Your customer data remains 100% private and protected.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDirectConnect} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Facebook Page ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 102938475610293"
                      value={pageId}
                      onChange={(e) => setPageId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Page Access Token (Permanent or System User) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="EAAG..."
                      value={pageAccessToken}
                      onChange={(e) => setPageAccessToken(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Instagram Account ID
                      </label>
                      <input
                        type="text"
                        placeholder="178414..."
                        value={igAccountId}
                        onChange={(e) => setIgAccountId(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Username (@handle)
                      </label>
                      <input
                        type="text"
                        placeholder="mybrand"
                        value={igUsername}
                        onChange={(e) => setIgUsername(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Connecting...' : 'Connect Credentials'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
