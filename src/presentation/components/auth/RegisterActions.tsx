interface RegisterActionsProps {
  success: boolean;
  onBack: () => void;
}

export function RegisterActions({
  success,
  onBack
}: RegisterActionsProps) {
  return (
    <div className="register-actions">
      <button
        type="button"
        className="register-secondary-btn"
        onClick={onBack}
      >
        Volver
      </button>

      <button
        type="submit"
        className="register-primary-btn"
        disabled={success}
      >
        {success ? 'Registrando...' : 'Registrarse'}
      </button>
    </div>
  );
}