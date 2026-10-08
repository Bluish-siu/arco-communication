import { useState } from 'react';
import {
  X,
  Gift,
  Sparkles,
  Check,
  CheckCircle2,
  Trophy,
  Users,
  Tag,
  ArrowRight,
} from 'lucide-react';

export default function InstagramGiveawayModal({
  isOpen,
  onClose,
  showToast,
}) {
  const [giveawayName, setGiveawayName] = useState('Festive VIP Giveaway 2026');
  const [keyword, setKeyword] = useState('WIN');
  const [rewardCode, setRewardCode] = useState('GIFT200');
  const [requireFollow, setRequireFollow] = useState(true);
  const [requireTag, setRequireTag] = useState(true);
  const [dmMessage, setDmMessage] = useState(
    `Woohoo! 🎉 You are officially entered into our exclusive Giveaway!\n\n🎁 Your Lucky Ticket Code is: #{CODE}\n💰 Plus, here is an instant ₹200 OFF coupon for your next purchase: use code {REWARD_CODE} at checkout!\n\nWinner will be announced this Sunday on our Instagram Story. Best of luck! 🍀`
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!giveawayName.trim() || !keyword.trim()) {
      showToast('Giveaway name and keyword are required', 'error');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Instagram Giveaway flow activated successfully!', 'success');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Setup Giveaway Flow
              </h3>
              <p className="text-xs text-slate-500">
                Attract, engage, and reward your Instagram followers automatically
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giveaway Campaign Name
              </label>
              <input
                type="text"
                value={giveawayName}
                onChange={(e) => setGiveawayName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trigger Comment / DM Keyword
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 uppercase bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold">
                  e.g. WIN
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              Entry Conditions & Qualification
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireFollow}
                  onChange={(e) => setRequireFollow(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Must be an active follower of your Instagram account</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireTag}
                  onChange={(e) => setRequireTag(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Encourage tagging 2 friends in comments to boost organic virality</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Automated Prize / Coupon Code
            </label>
            <input
              type="text"
              value={rewardCode}
              onChange={(e) => setRewardCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 uppercase bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Automated DM Confirmation Message
            </label>
            <textarea
              rows={4}
              value={dmMessage}
              onChange={(e) => setDmMessage(e.target.value)}
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Supports dynamic placeholders: &#123;CODE&#125;, &#123;REWARD_CODE&#125;, &#123;USER_NAME&#125;
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#0f4a3c] hover:bg-[#0c3c31] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <span>Activating...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Launch Giveaway Flow</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
