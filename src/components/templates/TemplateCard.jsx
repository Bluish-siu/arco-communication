import React from 'react';
import {
  Sparkles,
  ExternalLink,
  MessageSquare,
  Copy,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  ArrowUpRight,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
} from 'lucide-react';

export default function TemplateCard({
  template,
  onUseTemplate,
  onViewDetails,
  onDuplicate,
  onDelete,
  onRestore,
  onTestSend,
  isDeleted = false,
  isActiveView = false,
}) {
  const buttons = Array.isArray(template.buttons)
    ? template.buttons
    : JSON.parse(template.buttons || '[]');

  // Helper to format body variables with highlighting
  const renderFormattedBody = (text) => {
    if (!text) return null;
    const parts = text.split(/(\{\{\d+\}\})/g);
    return parts.map((part, i) => {
      if (part.match(/\{\{\d+\}\}/)) {
        return (
          <span
            key={i}
            className="inline-block px-1 py-0.2 mx-0.5 rounded bg-emerald-100/90 text-emerald-900 font-mono font-bold text-[10px]"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      
      {/* CARD HEADER & BODY PREVIEW */}
      <div className="p-3.5 space-y-2.5">
        
        {/* Title & Status */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2">
            {template.display_name || template.name}
          </h4>
          {isActiveView && (
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shrink-0 ${getStatusBadge(
                template.status
              )}`}
            >
              {template.status || 'DRAFT'}
            </span>
          )}
        </div>

        {/* Message Bubble (Interakt-style Light Green Preview) */}
        <div className="bg-[#e7f7ec] border border-[#d2edd8] rounded-xl p-3 text-[11px] text-slate-800 space-y-2 shadow-2xs overflow-hidden">
          
          {/* Header if present */}
          {template.header_type === 'TEXT' && template.header_text && (
            <div className="font-extrabold text-slate-900 text-xs border-b border-emerald-200/60 pb-1">
              {template.header_text}
            </div>
          )}

          {template.header_type === 'IMAGE' && (
            template.header_media_url ? (
              <img
                src={template.header_media_url}
                alt="Header"
                className="w-full h-28 object-cover rounded-lg border border-emerald-200/60"
              />
            ) : (
              <div className="w-full h-20 bg-emerald-100/60 rounded-lg border border-dashed border-emerald-300 flex items-center justify-center gap-1.5 text-emerald-800 text-[10px] font-bold">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Image Header</span>
              </div>
            )
          )}

          {template.header_type === 'VIDEO' && (
            template.header_media_url ? (
              <div className="w-full h-28 rounded-lg overflow-hidden relative bg-black">
                <video
                  src={template.header_media_url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-white/90 text-slate-900 flex items-center justify-center font-bold text-xs shadow-md">
                    ▶
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-20 bg-emerald-100/60 rounded-lg border border-dashed border-emerald-300 flex items-center justify-center gap-1.5 text-emerald-800 text-[10px] font-bold">
                <VideoIcon className="w-4 h-4 text-emerald-600" />
                <span>Video Header</span>
              </div>
            )
          )}

          {template.header_type === 'DOCUMENT' && (
            <div className="w-full p-2 bg-emerald-100/70 rounded-lg border border-emerald-200 flex items-center gap-2 text-slate-800 text-[10px] font-bold">
              <FileText className="w-4 h-4 text-red-500 shrink-0" />
              <span className="truncate">Sample Document (PDF)</span>
            </div>
          )}

          {/* Body Content */}
          <div className="whitespace-pre-line leading-relaxed font-normal">
            {renderFormattedBody(template.body)}
          </div>

          {/* Footer if present */}
          {template.footer && (
            <div className="text-[10px] text-slate-500 font-medium italic pt-1 border-t border-emerald-200/40">
              {template.footer}
            </div>
          )}

          {/* Buttons Preview inside Bubble */}
          {buttons.length > 0 && (
            <div className="pt-1.5 space-y-1">
              {buttons.map((btn, idx) => (
                <div
                  key={idx}
                  className="w-full py-1 px-2 rounded-lg bg-white/90 border border-emerald-200 text-emerald-800 font-bold text-[10px] flex items-center justify-center gap-1 shadow-2xs"
                >
                  {btn.type === 'PHONE_NUMBER' ? (
                    <Phone className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>{btn.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CARD FOOTER & ACTIONS */}
      <div className="px-3.5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]" title={template.name}>
          {template.name}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {!isDeleted ? (
            <>
              {onUseTemplate && (
                <button
                  type="button"
                  onClick={() => onUseTemplate(template)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-extrabold transition-colors cursor-pointer border border-emerald-200"
                >
                  Use this template
                </button>
              )}

              {onTestSend && (
                <button
                  type="button"
                  onClick={() => onTestSend(template)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Send Test WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              )}

              {onDuplicate && (
                <button
                  type="button"
                  onClick={() => onDuplicate(template)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Duplicate Template"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(template)}
                  className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <>
              {onRestore && (
                <button
                  type="button"
                  onClick={() => onRestore(template)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(template, true)}
                  className="p-1 rounded-lg hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                  title="Delete Permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
