interface RegisterAccountFieldsProps {
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onContinue: () => void;
}

export function RegisterAccountFields({
  name,
  email,
  onNameChange,
  onEmailChange,
  onContinue
}: RegisterAccountFieldsProps) {
  return (
    <>
      <h3>Información de la cuenta</h3>

      <div className="register-field">
        <label htmlFor="register-name">
          Nombre de usuario
        </label>

        <input
          id="register-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ejemplo: usuario_01"
          autoComplete="username"
          minLength={3}
          maxLength={30}
          required
        />

        <small className="register-help">
          De 3 a 30 caracteres. Puedes usar un espacio entre palabras. No uses /, &amp; ni ;
        </small>
      </div>

      <div className="register-field">
        <label htmlFor="register-email">
          Correo electrónico
        </label>

        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="usuario@gmail.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
        />

        <small className="register-help">
          Solo minúsculas, números, _ y punto. Se admite Gmail, Hotmail, Outlook y Email.com.
        </small>
      </div>

      <button
        className="register-primary-btn"
        type="button"
        onClick={onContinue}
      >
        Continuar
      </button>
    </>
  );
}