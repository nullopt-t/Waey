import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[var(--bg-secondary)]/80 backdrop-blur-md text-[var(--text-primary)] mt-8 md:mt-12 lg:mt-16 border-t border-[var(--border-color)]/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <div className="footer-section">
            <h3 className="text-[#c5a98e] mb-4">منصة وعي</h3>
            <p className="text-[var(--text-secondary)]">منصة متخصصة في تحسين الصحة النفسية وتقديم الدعم النفسي</p>
          </div>

          <div className="footer-section">
            <h4 className="text-[#c5a98e] mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-[var(--text-secondary)] hover:text-[#c5a98e] transition-colors">الرئيسية</Link></li>
              <li><Link to="/categories" className="text-[var(--text-secondary)] hover:text-[#c5a98e] transition-colors">الأقسام</Link></li>
              <li><Link to="/about" className="text-[var(--text-secondary)] hover:text-[#c5a98e] transition-colors">عن وعي</Link></li>
              <li><Link to="/contact" className="text-[var(--text-secondary)] hover:text-[#c5a98e] transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="text-[#c5a98e] mb-4">الدعم</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-[var(--text-secondary)] hover:text-[#c5a98e] transition-colors">الخصوصية</Link></li>
              <li><Link to="/terms" className="text-[var(--text-secondary)] hover:text-[#c5a98e] transition-colors">الشروط</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-6 mt-6 text-center text-[var(--text-secondary)]">
          <p>&copy; 2026 منصة وعي. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
