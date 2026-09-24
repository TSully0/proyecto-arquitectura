export function Footer() {
  return (
    <footer className="campus-footer">
      <div className="footer-container">
        <div className="footer-links">
          <a href="#about" className="footer-link">Sobre Nosotros</a>
          <a href="#report" className="footer-link">Reportar Problema</a>
        </div>

        <div className="footer-socials">
          {/* Facebook */}
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.57 11.79 5 14.44 5c1.27 0 2.6.23 2.6.23v2.86h-1.46c-1.45 0-1.9.9-1.9 1.83V12h3.22l-.51 3H13.68v6.8c4.56-.93 8-4.96 8-9.8z"/>
            </svg>
          </a>

          {/* X / Twitter */}
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="X (Twitter)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
