import { useState, type FormEvent } from 'react';
import { registerUserInSupabase, checkUserExistsInSupabase } from '../../../data/repositories/users';
import { validateName, validateEmail, getPasswordStrength, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../../../business/services/registerValidation';
import { RegisterProgress } from '../../components/auth/RegisterProgress';
import { RegisterAccountFields } from '../../components/auth/RegisterAccountFields';
import { RegisterSecurityFields } from '../../components/auth/RegisterSecurityFields';
import { RegisterTerms } from '../../components/auth/RegisterTerms';
import { RegisterVerifyStep } from '../../components/auth/RegisterVerifyStep';
import { useResendTimer } from '../../hooks/useResendTimer';
import { buildNewUser, getStrengthLabel, getUsers, saveUsersLocally, validatePasswordStep } from '../../../business/services/registerAccount';
import { AuthLayout } from '../../layouts/AuthLayout';
import '../../../styles/auth/auth-register.css';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
  // Paso 1: nombre y correo.
  // Paso 2: contraseña y aceptación de términos.
  // Paso 3: verificación del correo con código OTP (aquí se crea la cuenta).
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
  const [info, setInfo] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Verificación OTP.
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [otpKey, setOtpKey] = useState(0);

  const { isActive, startTimer, clearTimer, formattedTime } = useResendTimer();

  const strength = getPasswordStrength(password);
  const strengthLabel = getStrengthLabel(strength);

  // ================= CÓDIGO OTP =================

  const generateNewCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    setGeneratedCode(newCode);
    setCode('');
    setOtpKey((previous) => previous + 1); // limpia las casillas
    startTimer();

    // Solo para pruebas locales.
    console.log(`Código generado para ${email}: ${newCode}`);
  };

  // Invalida el código actual (al retroceder o cambiar datos).
  const discardCode = () => {
    setGeneratedCode('');
    setCode('');
    setInfo('');
    clearTimer();
  };

  // ================= PASO 1: CUENTA =================

  // Comprueba nombre, correo y duplicados (solo en Supabase).
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

  const handleNext = async () => {
    if (await validateStepOne()) {
      setStep(2);
      setError('');
    }
  };

  // ================= PASO 2: SEGURIDAD =================

  // Comprueba contraseña, confirmación y términos.
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

  // Valida la contraseña y pasa a la verificación. Todavía NO se crea la cuenta.
  const handleGoToVerification = () => {
    if (!validateStepTwo()) return;

    generateNewCode();
    setStep(3);
    setError('');
    setInfo('Código generado correctamente. Revisa la consola.');
  };

  // ================= PASO 3: VERIFICAR Y CREAR =================

  const handleResend = () => {
    if (isActive || submitting) return;

    generateNewCode();
    setError('');
    setInfo('Se generó un nuevo código. Revisa la consola.');
  };

  // Crea la cuenta en Supabase y guarda la copia local.
  const createAccount = async () => {
    const users = getUsers();
    const newUser = buildNewUser(name, email, password);

    // Supabase es la fuente principal: primero se crea allí.
    const remote = await registerUserInSupabase({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password
    });

    if (!remote.ok) {
      if (remote.reason === 'duplicate') {
        setError('El correo o nombre de usuario ya está registrado. Revisa los datos.');
        discardCode();
        setStep(1);
      } else {
        setError('No se pudo crear la cuenta. Revisa tu conexión e inténtalo de nuevo.');
      }
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

  const handleVerifyAndRegister = async () => {
    if (success || submitting) return;

    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos.');
      return;
    }

    if (!generatedCode || code !== generatedCode) {
      setError('Código incorrecto. Inténtalo nuevamente.');
      return;
    }

    // Volver a validar nombre y correo antes de guardar.
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      discardCode();
      setStep(1);
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      discardCode();
      setStep(1);
      return;
    }

    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      await createAccount();
      clearTimer();
    } finally {
      setSubmitting(false);
    }
  };

  // ================= NAVEGACIÓN =================

  const handleBack = () => {
    if (step === 3) discardCode(); // el código anterior deja de ser válido
    setStep((previous) => Math.max(1, previous - 1));
    setError('');
  };

  // El formulario se envía con Enter o con el botón principal de cada paso.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === 1) await handleNext();
    else if (step === 2) handleGoToVerification();
    else await handleVerifyAndRegister();
  };

  return (
    <AuthLayout fixed={false}>
      <h2>Crear Cuenta</h2>

      {/* Indicador del paso actual. */}
      <RegisterProgress step={step} />

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {info && !error && !success && (
        <p className="success" role="status">
          {info}
        </p>
      )}

      {success && (
        <p className="success" role="status">
          Usuario creado correctamente. Volviendo al inicio de sesión...
        </p>
      )}

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        {step === 1 && (
          <RegisterAccountFields
            name={name}
            email={email}
            onNameChange={setName}
            onEmailChange={setEmail}
            onContinue={handleNext}
          />
        )}

        {step === 2 && (
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

            {/* Aquí ya no se crea la cuenta: solo se pasa a verificar el correo. */}
            <button type="submit" style={{ marginTop: 15 }}>
              Continuar
            </button>

            <button
              type="button"
              className="register-back-btn"
              onClick={handleBack}
            >
              Atrás
            </button>
          </>
        )}

        {step === 3 && (
          <RegisterVerifyStep
            email={email.trim().toLowerCase()}
            code={code}
            otpKey={otpKey}
            isActive={isActive}
            formattedTime={formattedTime}
            submitting={submitting}
            success={success}
            onCodeChange={setCode}
            onResend={handleResend}
            onBack={handleBack}
          />
        )}
      </form>

      <p className="register-login-link">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onNavigateToLogin}>
          Inicia sesión
        </button>
      </p>
    </AuthLayout>
  );
}