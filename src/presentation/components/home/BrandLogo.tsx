interface BrandLogoProps {
  onClick?: () => void;
}

export function BrandLogo({ onClick }: BrandLogoProps) {
  return (
    <div className="brand-logo-container" onClick={onClick} role="button" tabIndex={0}>
      {/* Palm Tree Graphic Silhouette matching Image 3 */}
      <div className="brand-palm-icon">
        <svg
          viewBox="0 0 100 100"
          className="palm-tree-svg"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Palm Fronds */}
          <path d="M48 40 C44 26 28 18 10 24 C24 30 36 36 46 44 Z" />
          <path d="M50 38 C50 20 42 8 30 2 C36 14 44 26 48 38 Z" />
          <path d="M52 38 C60 22 72 10 88 6 C78 18 66 28 54 40 Z" />
          <path d="M53 42 C68 32 82 28 98 34 C82 42 70 48 55 46 Z" />
          <path d="M47 43 C32 38 18 42 4 52 C20 54 34 50 46 46 Z" />
          <path d="M54 45 C66 48 78 56 86 68 C76 60 64 54 52 48 Z" />
          <path d="M46 46 C36 52 26 62 20 74 C28 64 38 56 48 50 Z" />
          {/* Palm Trunk */}
          <path d="M48 44 Q50 68 54 98 L48 98 Q46 68 45 44 Z" />
        </svg>
      </div>

      {/* Brand Text: Huecas Manabas */}
      <span className="brand-logo-text">Huecas Manabas</span>
    </div>
  );
}
