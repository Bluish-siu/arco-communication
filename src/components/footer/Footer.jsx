import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import Container from '../common/Container';

export default function Footer() {
  const currentYear = 2026;

  const platformLinks = [
    { name: 'WhatsApp Marketing', path: '/features' },
    { name: 'Sales Automation', path: '/features' },
    { name: 'Customer Support', path: '/features' },
    { name: 'AI Automation', path: '/features' },
    { name: 'Analytics', path: '/features' },
  ];

  const solutionLinks = [
    { name: 'Ecommerce', path: '/solutions' },
    { name: 'Real Estate', path: '/solutions' },
    { name: 'Education', path: '/solutions' },
    { name: 'Healthcare', path: '/solutions' },
  ];

  const resourceLinks = [
    { name: 'Blog', path: '/resources' },
    { name: 'Guides', path: '/resources' },
    { name: 'Help Center', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];

  const companyLinks = [
    { name: 'About', path: '/contact' },
    { name: 'Careers', path: '/contact' },
    { name: 'Partners', path: '/contact' },
    { name: 'Pricing', path: '/pricing' },
  ];

  const socialLinks = [
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.91 0-1.64.73-1.64 1.64s.73 1.64 1.64 1.64 1.64-.73 1.64-1.64-.73-1.64-1.64-1.64Z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      name: 'Twitter/X',
      href: '#',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80">
      <Container className="pt-16 pb-12">
        {/* Main Grid: Brand + 5 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-block mb-3">
              <span className="font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-none">
                ARCO <span className="font-semibold text-slate-300">Communication</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              WhatsApp-first customer engagement for modern businesses.
            </p>

            {/* Quick Contact Badge */}
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <a href="mailto:hello@arcocommunication.com" className="hover:text-white transition-colors">
                  hello@arcocommunication.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <a href="tel:+919000000000" className="hover:text-white transition-colors">
                  +91 90000 00000
                </a>
              </div>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {platformLinks.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path} className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {solutionLinks.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path} className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {resourceLinks.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path} className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {companyLinks.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path} className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} ARCO Communication. All rights reserved.</p>

          <div className="flex items-center gap-5 text-xs">
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/terms-of-service" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <span>·</span>
            <Link to="/data-deletion" className="hover:text-slate-300 transition-colors">
              Data Deletion
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map((s, idx) => (
              <a
                key={idx}
                href={s.href}
                aria-label={s.name}
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/50 flex items-center justify-center transition-all duration-200"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
