// Cantidad total de pasos del registro:
// 1. Cuenta  2. Seguridad  3. Verificar correo
export const REGISTER_TOTAL_STEPS = 3;

interface RegisterProgressProps {
  step: number;
}

export function RegisterProgress({ step }: RegisterProgressProps) {
  return (
    <>
      <p className="register-step-indicator">
        Paso {step} de {REGISTER_TOTAL_STEPS}
      </p>

      <div
        className="register-progress"
        role="progressbar"
        aria-label="Progreso del registro"
        aria-valuemin={1}
        aria-valuemax={REGISTER_TOTAL_STEPS}
        aria-valuenow={step}
      >
        <div
          className="register-progress-fill"
          style={{ width: `${(step / REGISTER_TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </>
  );
}