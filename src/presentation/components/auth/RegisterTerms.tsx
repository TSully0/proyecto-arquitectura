import { useState } from 'react';

interface RegisterTermsProps {
  acceptedTerms: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}

export function RegisterTerms({
  acceptedTerms,
  onAcceptedChange
}: RegisterTermsProps) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="register-terms">
      <label className="register-terms-checkbox">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => onAcceptedChange(e.target.checked)}
        />

        <span>Acepto los términos y condiciones.</span>
      </label>

      <button
        type="button"
        className="register-secondary-btn"
        onClick={() => setShowTerms((previous) => !previous)}
        aria-expanded={showTerms}
      >
        {showTerms
          ? 'Ocultar términos y condiciones'
          : 'Leer términos y condiciones'}
      </button>

      {showTerms && (
        <div className="register-terms-content">
          <h4>Términos y condiciones</h4>

          <p>
            Al crear una cuenta en Huecas Manabas – MantaCampus,
            aceptas proporcionar información veraz y mantener
            la seguridad de tus credenciales.
          </p>

          <p>
            Debes respetar a los demás usuarios y publicar contenido
            que cumpla las normas de la comunidad.
          </p>

          <p>
            Las publicaciones o cuentas que incumplan las normas
            pueden ser moderadas o sancionadas conforme a las reglas
            de la plataforma.
          </p>

          <p>
            La información de tu cuenta se utilizará para ofrecer
            las funciones de la plataforma de acuerdo con la política
            de privacidad que establezca el proyecto.
          </p>
        </div>
      )}
    </div>
  );
}