import { useState, type FormEvent } from 'react';
import { syncUserToSupabase } from '../../../data/repositories/users';
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
  findDuplicates,
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

  // Paso 1: comprueba nombre, correo y duplicados.
  const validateStepOne = (): boolean => {
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

    const duplicates = findDuplicates(getUsers(), name, email);

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

  const handleNext = () => {
    if (validateStepOne()) {
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

    // Comprobar duplicados nuevamente con los usuarios actuales.
    const users = getUsers();
    const duplicates = findDuplicates(users, name, email);

    if (duplicates.email || duplicates.name) {
      setError(
        'El correo o nombre de usuario ya está registrado. Revisa los datos.'
      );
      setStep(1);
      return;
    }

    const newUser = buildNewUser(name, email, password);

    if (!saveUsersLocally([...users, newUser])) {
      setError('No se pudo guardar la cuenta en este dispositivo.');
      return;
    }

    setSuccess(true);

    // Si falla la sincronización, la cuenta local se conserva.
    try {
      const synced = await syncUserToSupabase(newUser);

      if (!synced) {
        console.warn(
          'El usuario se guardó localmente, pero no se confirmó la sincronización con Supabase.'
        );
      }
    } catch (err) {
      console.warn('Error al sincronizar el usuario con Supabase:', err);
    }

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