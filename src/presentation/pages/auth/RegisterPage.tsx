import { useState, type FormEvent } from 'react';
import { initialUsers, syncUserToSupabase } from '../../../data/repositories/users';
import { validateName, validateEmail, getPasswordStrength, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../../../business/services/registerValidation';
import { RegisterProgress } from '../../components/auth/RegisterProgress';
import { RegisterAccountFields } from '../../components/auth/RegisterAccountFields';
import { RegisterSecurityFields } from '../../components/auth/RegisterSecurityFields';
import { RegisterTerms } from '../../components/auth/RegisterTerms';
import { RegisterActions } from '../../components/auth/RegisterActions';
import '../../../styles/auth/auth-register.css';

// =====================================================
// PROPIEDADES DEL COMPONENTE
// =====================================================

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

// =====================================================
// TIPO DE USUARIO
// Representa los datos necesarios para comprobar
// si un correo o nombre ya está registrado.
// =====================================================

type ExistingUser = {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  banned?: boolean;
};

// =====================================================
// OBTENER USUARIOS REGISTRADOS
// Primero consulta localStorage.
// Si no hay datos válidos, utiliza los usuarios iniciales.
// =====================================================

const getUsers = (): ExistingUser[] => {
  try {
    const stored = localStorage.getItem('app_users');
    const parsed: unknown = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) && parsed.length > 0
      ? (parsed as ExistingUser[])
      : initialUsers;
  } catch {
    return initialUsers;
  }
};

// =====================================================
// COMPONENTE PRINCIPAL DEL REGISTRO
// =====================================================

export function RegisterPage({
  onNavigateToLogin
}: RegisterPageProps) {
  // Paso 1: nombre y correo.
  // Paso 2: contraseña y aceptación de términos.
  const [step, setStep] = useState(1);

  // Datos de la cuenta.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Control de visibilidad de las contraseñas.
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de aceptación, error y éxito.
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Calcular la seguridad utilizando el servicio externo.
  const strength = getPasswordStrength(password);

  const strengthLabel =
    strength === 0 ? 'Sin contraseña' :
    strength === 1 ? 'Débil' :
    strength === 2 ? 'Media' :
    'Fuerte';

  // ===================================================
  // VALIDAR PRIMER PASO
  // Comprueba nombre, correo y duplicados.
  // ===================================================

  const validateStepOne = (): boolean => {
    // Validar el nombre mediante registerValidation.ts.
    const nameError = validateName(name);

    if (nameError) {
      setError(nameError);
      return false;
    }

    // Validar el correo electrónico.
    const emailError = validateEmail(email);

    if (emailError) {
      setError(emailError);
      return false;
    }

    // Obtener los usuarios existentes.
    const users = getUsers();

    // Normalizar el correo para evitar duplicados
    // causados por diferencias entre mayúsculas y minúsculas.
    const cleanEmail = email.trim().toLowerCase();

    const emailExists = users.some(
      (user) =>
        (user.email || '').trim().toLowerCase() === cleanEmail
    );

    if (emailExists) {
      setError('Este correo ya está registrado.');
      return false;
    }

    // Comparar nombres sin distinguir mayúsculas,
    // minúsculas ni espacios sobrantes en datos antiguos.
    const nameExists = users.some(
      (user) =>
        (user.name || '').trim().toLowerCase() ===
        name.toLowerCase()
    );

    if (nameExists) {
      setError('Este nombre de usuario ya está registrado.');
      return false;
    }

    setError('');
    return true;
  };

  // ===================================================
  // VALIDAR SEGUNDO PASO
  // Comprueba contraseña, confirmación y términos.
  // ===================================================

  const validateStepTwo = (): boolean => {
    // btoa() solo admite caracteres Latin-1. Un emoji u otro carácter
    // fuera de ese rango haría fallar el registro sin mostrar mensaje.
    if (/[^\u0000-ÿ]/.test(password)) {
      setError('La contraseña contiene caracteres no admitidos.');
      return false;
    }

    // Comprobar longitud mínima.
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
      );
      return false;
    }

    // Comprobar longitud máxima.
    if (password.length > MAX_PASSWORD_LENGTH) {
      setError(
        `La contraseña no puede superar los ${MAX_PASSWORD_LENGTH} caracteres.`
      );
      return false;
    }

    // Exigir una seguridad mínima.
    if (strength < 2) {
      setError(
        'La contraseña es demasiado débil. Combina mayúsculas, minúsculas y números o símbolos.'
      );
      return false;
    }

    // Comprobar coincidencia de contraseñas.
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }

    // Comprobar aceptación de los términos.
    if (!acceptedTerms) {
      setError(
        'Debes aceptar los términos y condiciones para registrarte.'
      );
      return false;
    }
    setError('');
    return true;
  };

  // ===================================================
  // AVANZAR AL SEGUNDO PASO
  // ===================================================
  const handleNext = () => {
    if (validateStepOne()) {
      setStep(2);
      setError('');
    }
  };

  // ===================================================
  // REGRESAR AL PRIMER PASO
  // ===================================================
  const handleBack = () => {
    setStep(1);
    setError('');
  };

  // ===================================================
  // REGISTRAR USUARIO
  // Guarda localmente e intenta sincronizar con Supabase.
  // ===================================================

  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError('');

    // Evitar registros repetidos después del éxito.
    if (success) return;
    // Validar contraseña, confirmación y términos.
    if (!validateStepTwo()) return;

    // Volver a validar nombre y correo antes de guardar.
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      setStep(1);
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setStep(1);
      return;
    }

    // Consultar nuevamente los usuarios actuales.
    const users = getUsers();
    // Normalizar el correo que se guardará.
    const cleanEmail = email.trim().toLowerCase();
    // Conservar el nombre original, ya validado.
    const cleanName = name;

    // Comprobar duplicados nuevamente antes de guardar.
    const duplicate = users.some(
      (user) =>
        (user.email || '').trim().toLowerCase() === cleanEmail ||
        (user.name || '').trim().toLowerCase() ===
          cleanName.toLowerCase()
    );

    if (duplicate) {
      setError(
        'El correo o nombre de usuario ya está registrado. Revisa los datos.'
      );
      setStep(1);
      return;
    }

    // Construir el nuevo usuario.
    const newUser = {
      id: Date.now().toString(),
      name: cleanName,
      email: cleanEmail,
      password: btoa(password),
      role: 'user',
      banned: false
    };

    // Preparar la lista actualizada.
    const updated = [...users, newUser];

    // Guardar en localStorage.
    try {
      localStorage.setItem('app_users', JSON.stringify(updated));
    } catch {
      setError('No se pudo guardar la cuenta en este dispositivo.');
      return;
    }

    // Mostrar confirmación de registro.
    setSuccess(true);

    // Intentar sincronizar con Supabase.
    // Si falla, la cuenta local se conserva.
    try {
      const synced = await syncUserToSupabase(newUser);

      if (!synced) {
        console.warn(
          'El usuario se guardó localmente, pero no se confirmó la sincronización con Supabase.'
        );
      }
    } catch (err) {
      console.warn(
        'Error al sincronizar el usuario con Supabase:',
        err
      );
    }

    // Volver al inicio de sesión después de mostrar el éxito.
    window.setTimeout(() => {
      onNavigateToLogin();
    }, 1500);
  };

  // ===================================================
  // INTERFAZ DEL REGISTRO
  // Se conservan los componentes existentes.
  // ===================================================

  return (
    <div className="auth-container">
      <h2>Crear Cuenta</h2>

      {/* Indicador del paso actual. */}
      <RegisterProgress step={step} />

      {/* Mostrar errores de validación. */}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {/* Mostrar confirmación cuando el registro finaliza. */}
      {success && (
        <p className="success" role="status">
          Usuario creado correctamente. Volviendo al inicio de sesión...
        </p>
      )}

      <form
        className="register-form"
        onSubmit={handleRegister}
        noValidate
      >
        {step === 1 ? (
          // Primer paso: nombre y correo.
          <RegisterAccountFields
            name={name}
            email={email}
            onNameChange={setName}
            onEmailChange={setEmail}
            onContinue={handleNext}
          />
        ) : (
          <>
            {/* Segundo paso: contraseñas. */}
            <RegisterSecurityFields
              password={password}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              strength={strength}
              strengthLabel={strengthLabel}
              minPasswordLength={MIN_PASSWORD_LENGTH}
              maxPasswordLength={MAX_PASSWORD_LENGTH}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onTogglePassword={() =>
                setShowPassword((previous) => !previous)
              }
              onToggleConfirmPassword={() =>
                setShowConfirmPassword((previous) => !previous)
              }
            />

            {/* Términos y condiciones. */}
            <RegisterTerms
              acceptedTerms={acceptedTerms}
              onAcceptedChange={setAcceptedTerms}
            />

            {/* Botones para volver o registrar. */}
            <RegisterActions
              success={success}
              onBack={handleBack}
            />
          </>
        )}
      </form>

      {/* Enlace para usuarios que ya tienen una cuenta. */}
      <p className="register-login-link">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={onNavigateToLogin}
        >
          Inicia sesión
        </button>
      </p>
    </div>
  );
}