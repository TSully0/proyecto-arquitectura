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
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="register-terms">

      {/* TÉRMINOS Y CONDICIONES */}
      <section className="register-terms-section">
        <button
          type="button"
          className="register-secondary-btn"
          onClick={() => setShowTerms((previous) => !previous)}
          aria-expanded={showTerms}
        >
          {showTerms ? 'Ocultar términos y condiciones' : 'Leer términos y condiciones'}
          <span aria-hidden="true">{showTerms ? '−' : '+'}</span>
        </button>

        {showTerms && (
          <div className="register-terms-content">
            <h4>Términos y condiciones</h4>

            <p>
              Bienvenido a <strong>Huecas Manabas – MantaCampus</strong>,
              una plataforma orientada a compartir experiencias,
              descubrir lugares y conectar con la comunidad de Manta.
              Al registrarte y utilizar nuestros servicios, aceptas
              las siguientes condiciones:
            </p>

            <h5>1. Uso de la plataforma</h5>
            <p>
              La plataforma permite descubrir lugares, consultar
              publicaciones, compartir opiniones, realizar comentarios
              e interactuar con otros usuarios. Debes utilizar estas
              funciones de manera responsable y respetuosa.
            </p>

            <h5>2. Información de la cuenta</h5>
            <p>
              Al crear una cuenta, te comprometes a proporcionar
              información veraz y actualizada. Eres responsable de
              mantener la confidencialidad de tus credenciales y de
              las actividades realizadas desde tu cuenta.
            </p>

            <h5>3. Normas de convivencia</h5>
            <p>
              No está permitido publicar contenido que incluya
              amenazas, acoso, discriminación, insultos, spam,
              información engañosa o material que vulnere los
              derechos de otras personas.
            </p>

            <h5>4. Publicaciones y comentarios</h5>
            <p>
              Cada usuario es responsable del contenido que comparte,
              incluyendo fotografías, reseñas, comentarios y demás
              publicaciones. Debes contar con los derechos o permisos
              necesarios para publicar dicho material.
            </p>

            <h5>5. Moderación y sanciones</h5>
            <p>
              La plataforma podrá revisar y moderar el contenido
              reportado o que incumpla estas condiciones. Según la
              gravedad de la infracción, podrán aplicarse medidas
              como advertencias, eliminación de publicaciones,
              suspensión temporal o bloqueo de cuentas.
            </p>

            <h5>6. Uso adecuado de la información</h5>
            <p>
              No debes utilizar la plataforma para actividades
              fraudulentas, suplantación de identidad, distribución
              de contenido malicioso o cualquier actividad que
              perjudique a otros usuarios o al funcionamiento
              del servicio.
            </p>

            <h5>7. Cambios en las condiciones</h5>
            <p>
              Estos términos podrán actualizarse cuando sea necesario.
              Si se realizan cambios importantes, se deberá informar
              a los usuarios mediante los medios disponibles en
              la plataforma.
            </p>

            <h5>8. Aceptación</h5>
            <p>
              Al marcar la casilla de aceptación durante el registro,
              confirmas que has leído y aceptas estos términos
              y condiciones.
            </p>
          </div>
        )}
      </section>

      {/* POLÍTICA DE PRIVACIDAD */}
      <section className="register-terms-section">
        <button
          type="button"
          className="register-secondary-btn"
          onClick={() => setShowPrivacy((previous) => !previous)}
          aria-expanded={showPrivacy}
        >
          {showPrivacy ? 'Ocultar política de privacidad' : 'Leer política de privacidad'}
          <span aria-hidden="true">{showPrivacy ? '−' : '+'}</span>
        </button>

        {showPrivacy && (
          <div className="register-terms-content">
            <h4>Política de privacidad</h4>

            <p>
              En <strong>Huecas Manabas – MantaCampus</strong>
              nos importa la privacidad de nuestros usuarios.
              Esta política explica de manera general cómo se
              utiliza la información dentro de la plataforma.
            </p>

            <h5>1. Información recopilada</h5>
            <p>
              Durante el registro y el uso de la plataforma pueden
              utilizarse datos como nombre, correo electrónico,
              fotografía de perfil, publicaciones, comentarios,
              reseñas y actividad relacionada con las funciones
              disponibles.
            </p>

            <h5>2. Finalidad de los datos</h5>
            <p>
              La información se utiliza para gestionar las cuentas,
              permitir el inicio de sesión, mostrar perfiles,
              publicar contenido, ofrecer funciones sociales
              y mantener la seguridad y moderación del servicio.
            </p>

            <h5>3. Protección de la información</h5>
            <p>
              Se deben aplicar medidas técnicas y organizativas
              razonables para proteger la información frente
              a accesos no autorizados, pérdida, alteración
              o divulgación indebida.
            </p>

            <h5>4. Visibilidad del contenido</h5>
            <p>
              La información del perfil y el contenido que publiques
              podrán ser visibles para otros usuarios según las
              funcionalidades y configuraciones de la plataforma.
              Evita compartir datos personales que no deseas hacer
              públicos.
            </p>

            <h5>5. Acceso y actualización</h5>
            <p>
              Los usuarios podrán solicitar información sobre sus
              datos personales y ejercer los derechos que les
              correspondan conforme a la normativa aplicable.
              También podrán solicitar la corrección o actualización
              de información incorrecta.
            </p>

            <h5>6. Conservación de los datos</h5>
            <p>
              La información se conservará durante el tiempo
              necesario para cumplir las finalidades del servicio
              y las obligaciones legales que correspondan.
            </p>

            <h5>7. Cambios en la política</h5>
            <p>
              Esta política podrá actualizarse para reflejar cambios
              en las funciones de la plataforma o en las prácticas
              de tratamiento de información.
            </p>

            <h5>8. Aceptación</h5>
            <p>
              Al registrarte, declaras haber tenido acceso a esta
              política de privacidad y conocer cómo se utiliza
              la información dentro de la plataforma.
            </p>
          </div>
        )}
      </section>

      {/* ACEPTACIÓN */}
      <label className="register-terms-checkbox">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(event) => onAcceptedChange(event.target.checked)}
        />

        <span>
          He leído y acepto los <strong>términos y condiciones</strong>
          {' '}y la <strong>política de privacidad</strong> de
          Huecas Manabas – MantaCampus.
        </span>
      </label>
    </div>
  );
}