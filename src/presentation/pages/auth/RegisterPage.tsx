import { useState, type FormEvent } from 'react';
import {
  registerUserInSupabase,
  checkUserExistsInSupabase
} from '../../../data/repositories/users';
import {
  validateName,
  validateEmail,
  getPasswordStrength,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH
} from '../../../business/services/registerValidation';
import { RegisterProgress } from '../../components/auth/RegisterProgress';
import { RegisterAccountFields } from '../../components/auth/RegisterAccountFields';
import { RegisterSecurityFields } from '../../components/auth/RegisterSecurityFields';
import { RegisterTerms } from '../../components/auth/RegisterTerms';
import { RegisterActions } from '../../components/auth/RegisterActions';
import {
  buildNewUser,
  getStrengthLabel,
  getUsers,
  saveUsersLocally,
  validatePasswordStep
} from '../../../business/services/registerAccount';
import '../../../styles/auth/auth-register.css';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
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

  const strength = getPasswordStrength(password);
  const strengthLabel = getStrengthLabel(strength);

  // Paso 1: comprueba nombre, correo y duplicados (solo en Supabase).
  const validateStepOne = async (): Promise<boolean> => {
    const nameError = validateName(name);

    if (nameError) {
      setError(nameError);
      return false;
    }

    const emailError = validateEmail(email);

    if (emailError) {
      setError(emailError);
      return false;
    }

    const duplicates = await checkUserExistsInSupabase(name, email);

    if (duplicates === null) {
      setError('No se pudo verificar el correo. Revisa tu conexión e inténtalo de nuevo.');
      return false;
    }

    if (duplicates.email) {
      setError('Este correo ya está registrado.');
      return false;
    }

    if (duplicates.name) {
      setError('Este nombre de usuario ya está registrado.');
      return false;
    }

    setError('');
    return true;
  };

  // Paso 2: comprueba contraseña, confirmación y términos.
  const validateStepTwo = (): boolean => {
    const message = validatePasswordStep({
      password,
      confirmPassword,
      acceptedTerms,
      strength
    });

    setError(message);
    return message === '';
  };

  const handleNext = async () => {
    if (await validateStepOne()) {
      setStep(2);
      setError('');
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  // Guarda localmente e intenta sincronizar con Supabase.
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Evitar registros repetidos después del éxito.
    if (success) return;

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

    const users = getUsers();

    const newUser = buildNewUser(name, email, password);

    // Supabase es la fuente principal: primero se crea allí.
    const remote = await registerUserInSupabase({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password
    });

    if (!remote.ok) {
      setError(
        remote.reason === 'duplicate'
          ? 'El correo o nombre de usuario ya está registrado. Revisa los datos.'
          : 'No se pudo crear la cuenta. Revisa tu conexión e inténtalo de nuevo.'
      );
      if (remote.reason === 'duplicate') setStep(1);
      return;
    }

    // Copia local con el id real de la base de datos.
    const savedUser = { ...newUser, id: remote.id };

    if (!saveUsersLocally([
        ...users.filter(
          (u) => (u.email || '').trim().toLowerCase() !== savedUser.email
        ),
        savedUser
      ])) {
      setError('No se pudo guardar la cuenta en este dispositivo.');
      return;
    }

    setSuccess(true);

    // Volver al inicio de sesión después de mostrar el éxito.
    window.setTimeout(() => {
      onNavigateToLogin();
    }, 1500);
  };

  return (
    <div className="auth-container">
      <h2>Crear Cuenta</h2>

      {/* Indicador del paso actual. */}
      <RegisterProgress step={step} />

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="success" role="status">
          Usuario creado correctamente. Volviendo al inicio de sesión...
        </p>
      )}

      <form className="register-form" onSubmit={handleRegister} noValidate>
        {step === 1 ? (
          <RegisterAccountFields
            name={name}
            email={email}
            onNameChange={setName}
            onEmailChange={setEmail}
            onContinue={handleNext}
          />
        ) : (
          <>
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
              onTogglePassword={() => setShowPassword((previous) => !previous)}
              onToggleConfirmPassword={() =>
                setShowConfirmPassword((previous) => !previous)
              }
            />

            <RegisterTerms
              acceptedTerms={acceptedTerms}
              onAcceptedChange={setAcceptedTerms}
            />

            <RegisterActions success={success} onBack={handleBack} />
          </>
        )}
      </form>

      <p className="register-login-link">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onNavigateToLogin}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
}