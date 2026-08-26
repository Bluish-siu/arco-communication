import {
  MessageSquare,
  Users,
  Send,
  Sparkles,
  BarChart3,
  Search,
  CheckCheck,
  Paperclip,
  Smile,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  MoreVertical,
} from 'lucide-react';

export default function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      {/* Subtle ambient red background blur behind dashboard */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-rose-500/15 to-amber-500/10 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

      {/* Main SaaS Dashboard Container */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden font-sans text-slate-800">
        
        {/* Top Browser / Window Header */}
        <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="ml-2 text-[11px] font-mono text-slate-400 hidden sm:inline-block">
              app.arcocommunication.io/live-chat
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>WhatsApp Business API Active</span>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="grid grid-cols-12 min-h-[380px] sm:min-h-[420px]">
          
          {/* Left Sidebar Navigation */}
          <div className="col-span-3 sm:col-span-3 bg-slate-50/60 border-r border-slate-200/70 p-2.5 sm:p-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 px-2 py-1 hidden sm:block">
                Workspace
              </div>

              {/* Nav item: Inbox (Active) */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-red-50 text-red-700 font-semibold text-xs transition-colors">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="hidden sm:inline">Inbox</span>
                </div>
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
              </div>

              {/* Nav item: Contacts */}
              <div className="flex items-center gap-2 p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 text-xs font-medium transition-colors cursor-pointer">
                <Users className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Contacts</span>
              </div>

              {/* Nav item: Campaigns */}
              <div className="flex items-center gap-2 p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 text-xs font-medium transition-colors cursor-pointer">
                <Send className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Campaigns</span>
              </div>

              {/* Nav item: Automation */}
              <div className="flex items-center gap-2 p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 text-xs font-medium transition-colors cursor-pointer">
                <Sparkles className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Automation</span>
              </div>

              {/* Nav item: Analytics */}
              <div className="flex items-center gap-2 p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 text-xs font-medium transition-colors cursor-pointer">
                <BarChart3 className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Analytics</span>
              </div>
            </div>

            {/* User Profile Mini Badge */}
            <div className="pt-2 border-t border-slate-200/60 hidden sm:flex items-center gap-2 px-1">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-[10px] flex items-center justify-center">
                SR
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-semibold text-slate-800 truncate">Support Agent</div>
                <div className="text-[9px] text-emerald-600 font-medium">Online</div>
              </div>
            </div>
          </div>

          {/* Main Conversation Area */}
          <div className="col-span-9 sm:col-span-9 flex flex-col justify-between bg-white">
            
            {/* Conversation Header */}
            <div className="px-3 sm:px-4 py-2.5 border-b border-slate-200/70 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                    PS
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">Priya Sharma</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                    <span className="bg-red-50 text-red-700 font-medium px-1.5 rounded text-[9px]">VIP Buyer</span>
                    <span className="hidden xs:inline">• Order #8492</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <Search className="w-4 h-4 hover:text-slate-600 cursor-pointer hidden sm:block" />
                <MoreVertical className="w-4 h-4 hover:text-slate-600 cursor-pointer" />
              </div>
            </div>

            {/* Chat Bubble Thread */}
            <div className="p-3 sm:p-4 space-y-3 overflow-y-auto bg-slate-50/40 text-xs flex-1 flex flex-col justify-end">
              
              {/* Customer Incoming Message */}
              <div className="flex flex-col items-start max-w-[85%] sm:max-w-[78%]">
                <div className="bg-white p-2.5 sm:p-3 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-2xs text-slate-800">
                  <p className="leading-relaxed">
                    Hi! Is the wireless ANC headphone set available in Matte Black?
                  </p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 ml-1">10:42 AM</span>
              </div>

              {/* Bot / Automated Flow Message with Product Card */}
              <div className="flex flex-col items-end max-w-[88%] sm:max-w-[80%] self-end">
                <div className="bg-red-600 text-white p-2.5 sm:p-3 rounded-2xl rounded-tr-xs shadow-xs space-y-2">
                  <p className="leading-relaxed">
                    Hello Priya! 👋 Yes, only 4 units left! Here is your exclusive 10% instant checkout link:
                  </p>
                  
                  {/* Dynamic Product Snippet */}
                  <div className="bg-white/10 rounded-xl p-2 border border-white/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                        <ShoppingBag className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-white">Pro ANC Headphones</div>
                        <div className="text-[9px] text-red-100">₹4,499 · Coupon SAVE10</div>
                      </div>
                    </div>
                    <span className="bg-white text-red-600 font-bold px-2 py-0.5 rounded-md text-[10px] shrink-0">
                      Buy Now
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 mr-1">
                  <span>10:42 AM • Automated Flow</span>
                  <CheckCheck className="w-3 h-3 text-red-600" />
                </div>
              </div>

              {/* Customer Completed Action */}
              <div className="flex flex-col items-start max-w-[85%] sm:max-w-[78%]">
                <div className="bg-white p-2.5 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-2xs text-slate-800">
                  <p className="leading-relaxed">
                    Awesome! Just paid via UPI. When will it ship?
                  </p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 ml-1">10:44 AM</span>
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-2 sm:p-2.5 bg-white border-t border-slate-200/80 flex items-center gap-2">
              <div className="flex items-center gap-1 text-slate-400 pl-1">
                <Smile className="w-4 h-4 hover:text-slate-600 cursor-pointer hidden sm:block" />
                <Paperclip className="w-4 h-4 hover:text-slate-600 cursor-pointer" />
              </div>
              <input
                type="text"
                readOnly
                value="Type reply or press '/' for AI templates..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-slate-500 focus:outline-none cursor-default"
              />
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 hover:bg-red-700 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating SaaS Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3">
        
        {/* Card 1: Leads */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-md shadow-slate-900/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500">New Leads</span>
            <span className="flex items-center text-[10px] font-bold text-emerald-600">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18%
            </span>
          </div>
          <div className="mt-1 text-base sm:text-xl font-extrabold text-slate-900">
            128
          </div>
          <span className="text-[9px] text-slate-400 truncate">Via WhatsApp bots</span>
        </div>

        {/* Card 2: Conversion */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-red-200/80 shadow-md shadow-red-500/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-8 h-8 bg-red-50 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Conversion</span>
            <span className="text-[10px] font-bold text-red-600">High</span>
          </div>
          <div className="mt-1 text-base sm:text-xl font-extrabold text-red-600">
            24.8%
          </div>
          <span className="text-[9px] text-slate-400 truncate">vs 2.1% Email</span>
        </div>

        {/* Card 3: Revenue */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-md shadow-slate-900/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Revenue</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 text-base sm:text-xl font-extrabold text-slate-900">
            ₹2.48L
          </div>
          <span className="text-[9px] text-slate-400 truncate">Automated flows</span>
        </div>

      </div>
    </div>
  );
}
