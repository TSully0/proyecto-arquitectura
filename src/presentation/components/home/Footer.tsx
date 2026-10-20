import uleamLogo from '../../../assets/uleam.png';
import '../../../styles/ui/footer.css';

const teamMembers = [
  {
    name: 'DELGADO MONCAYO ELLERY RICARDO',
    github: 'Sleppy1205',
    url: 'https://github.com/Sleppy1205',
  },
  {
    name: 'GUAMAN LUCIO ANTHONY GABRIEL',
    github: 'GabrielGL11',
    url: 'https://github.com/GabrielGL11',
  },
  {
    name: 'LAZ ORDOÑEZ JORDAN DAMIAN',
    github: 'jdlzo',
    url: 'https://github.com/jdlzo',
  },
  {
    name: 'SALAZAR GALLO SCARLETT ANDREINA',
    github: 'yumeScar01',
    url: 'https://github.com/yumeScar01',
  },
  {
    name: 'TOALA ZAMBRANO SULLY CRISTINA',
    github: 'TSully0',
    url: 'https://github.com/TSully0',
  },
];

const socialNetworks = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/uleam_ecuador_oficial/?hl=es',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className="social-dot" cx="17.5" cy="6.5" r="1" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/UleamEc/?locale=es_LA',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4C17 1.2 15.8 1 14.5 1 11 1 9 3.1 9 6.8V9H6v4h3v8h5Z" />
      </svg>
    ),
  },
  {
    name: 'X',
    url: 'https://x.com/uleamecuador',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.8 5.7 22H2.5l7.3-8.4L1.8 2h6.5l4.5 6.7L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/channel/UCOferC0PjpEUegrVq8Re-TQ',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="campus-footer">
      <div className="footer-container">

        {/* Identidad institucional y del proyecto */}
        <section className="footer-brand">
          <div className="footer-university">
            <img
              src={uleamLogo}
              alt="Logo de la Universidad Laica Eloy Alfaro de Manabí"
              className="footer-uleam-logo"
            />

            <div className="footer-university-text">
              <h2>ULEAM</h2>
              <p>Universidad Laica Eloy Alfaro de Manabí</p>
            </div>
          </div>

          {/* Redes sociales oficiales de ULEAM */}
          <nav
            className="footer-socials"
            aria-label="Redes sociales oficiales de ULEAM"
          >
            {socialNetworks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${social.name} oficial de ULEAM`}
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </nav>

          <div className="footer-project-brand">
            <h2 className="footer-brand-title">
              <span className="footer-brand-copper">Huecas</span>{' '}
              <span className="footer-brand-white">Manabas</span>
            </h2>

            <p className="footer-brand-subtitle">MantaCampus</p>

            <p className="footer-description">
              Una comunidad para descubrir, compartir y recomendar
              los mejores lugares y experiencias de Manta.
            </p>
          </div>
        </section>

        {/* Información académica y contacto */}
        <section className="footer-contact">
          <h2>Información académica</h2>

          <p className="footer-academic-subtitle">
            ARQUITECTURA DEL SOFTWARE 5B
          </p>

          <p>
            <strong>ULEAM - 2026</strong>
          </p>

          <p>
            <strong>FACIVITEC</strong>
          </p>

          <p>Software</p>

          <div className="footer-university-contact">
            <p>
              <strong>Dirección</strong>
              <br />
              Av. Circunvalación Vía a San Mateo
            </p>

            <p>
              <strong>Correo electrónico</strong>
              <br />
              <a href="mailto:incidencias.diit@uleam.edu.ec">
                incidencias.diit@uleam.edu.ec
              </a>
            </p>
          </div>
        </section>

        {/* Equipo de desarrollo */}
        <section className="footer-team">
          <h2>Equipo de desarrollo</h2>

          <ul className="footer-team-list">
            {teamMembers.map((member) => (
              <li key={member.github} className="footer-team-member">
                <span className="footer-member-name">
                  {member.name}
                </span>

                <a
                  href={member.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-github-link"
                  aria-label={`GitHub de ${member.name}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.59 1.21 3.22.93.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.62 5.23-5.11 5.51.4.35.75 1.03.75 2.08V22c0 .29.2.63.76.52A11.1 11.1 0 0 0 12 .9Z" />
                  </svg>

                  <span>{member.github}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </footer>
  );
}