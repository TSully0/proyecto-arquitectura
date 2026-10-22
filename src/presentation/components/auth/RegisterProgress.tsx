interface RegisterProgressProps {
  step: number;
}

export function RegisterProgress({ step }: RegisterProgressProps) {
  return (
    <>
      <p className="register-step-indicator">
        Paso {step} de 2
      </p>

      <div
        className="register-progress"
        role="progressbar"
        aria-label="Progreso del registro"
        aria-valuemin={1}
        aria-valuemax={2}
        aria-valuenow={step}
      >
        <div
          className="register-progress-fill"
          style={{ width: `${step * 50}%` }}
        />
      </div>
    </>
  );
}
