import { useState } from 'react';
import { X, Users, UserPlus, Trash2, Check, RefreshCw, Mail, Shield } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

export default function TeamMemberModal({ isOpen, onClose, currentCount, onCountChange, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('agent'); // 'admin' | 'agent' | 'manager'
  const [membersList, setMembersList] = useState([
    { name: 'Shraddha', email: 'owner@arco.com', role: 'admin' },
  ]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and valid email are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await dashboardService.inviteTeamMember({
        name: name.trim(),
        email: email.trim(),
        role,
      });

      if (res.success || res.data) {
        showToast(`Team member "${name.trim()}" invited successfully!`, 'success');
        const updated = [...membersList, { name: name.trim(), email: email.trim(), role }];
        setMembersList(updated);
        onCountChange(updated.length);
        setName('');
        setEmail('');
      } else {
        showToast(res.message || 'Failed to invite team member', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error inviting member', 'error');
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
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Team Members</h3>
              <p className="text-[11px] text-slate-500">Collaborate on WhatsApp Inbox, Live Chat & Campaigns</p>
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Invite Form */}
          <form onSubmit={handleInvite} className="p-4 bg-blue-50/40 rounded-xl border border-blue-200/60 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Invite New Member</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@company.com"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Workspace Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="agent">Support / Sales Agent (Inbox & Chat only)</option>
                <option value="manager">Manager (Campaigns, Inbox & Analytics)</option>
                <option value="admin">Administrator (Full Workspace Access)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Inviting Member...' : '+ Send Team Invitation'}</span>
            </button>
          </form>

          {/* Active Members */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 px-1">Active Team Members ({membersList.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {membersList.map((m, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-slate-500 text-[11px]">{m.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
