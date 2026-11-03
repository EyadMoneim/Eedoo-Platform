import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const { i18n } = useTranslation();
  const ar = i18n.language === 'ar';
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = ar ? 'اكتب اسمك' : 'Please enter your name';
    if (!email.trim()) newErrors.email = ar ? 'اكتب بريدك الإلكتروني' : 'Please enter your email';
    if (!password) newErrors.password = ar ? 'اكتب كلمة المرور' : 'Please enter a password';
    if (!confirmPassword) newErrors.confirmPassword = ar ? 'أكد كلمة المرور' : 'Please confirm your password';
    
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }
    
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match' });
      return;
    }
    
    if (password.length < 8) {
      setFieldErrors({ password: ar ? 'كلمة المرور لازم تكون ٨ حروف على الأقل' : 'Password must be at least 8 characters' });
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    
    try {
      await register({ name, email, password });
      navigate('/app', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || (ar ? 'تعذر إنشاء الحساب. حاول مرة أخرى.' : 'Could not create account. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = 'http://localhost:5173/auth/google/callback';
    const scope = 'openid email profile';
    const responseType = 'code';
    
    if (!clientId || clientId === 'placeholder_google_client_id') {
      alert('VITE_GOOGLE_CLIENT_ID is not configured in frontend/.env');
      return;
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
    window.location.href = authUrl;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1>{ar ? 'أنشئ مساحتك' : 'Create your space'}</h1>
        <p className="page-subtitle mt-2">{ar ? 'شوية بيانات وتكون جاهز تبدأ.' : 'A few details and you’re ready to begin.'}</p>
      </div>

      {error && (
        <div className="error-panel" role="alert">
          {error}
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1">
          <label htmlFor="register-name" className="field-label">{ar ? 'الاسم' : 'Name'}</label>
          <input
            id="register-name"
            autoComplete="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors({...fieldErrors, name: ''});
            }}
            className="field"
            aria-invalid={!!fieldErrors.name}
            style={{ borderColor: fieldErrors.name ? 'var(--danger)' : 'var(--border)' }}
            placeholder="Eyad"
          />
          {fieldErrors.name && <p className="inline-error">{fieldErrors.name}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="register-email" className="field-label">{ar ? 'البريد الإلكتروني' : 'Email'}</label>
          <input
            id="register-email"
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors({...fieldErrors, email: ''});
            }}
            className="field"
            aria-invalid={!!fieldErrors.email}
            style={{ borderColor: fieldErrors.email ? 'var(--danger)' : 'var(--border)' }}
            placeholder="you@example.com"
          />
          {fieldErrors.email && <p className="inline-error">{fieldErrors.email}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="register-password" className="field-label">{ar ? 'كلمة المرور' : 'Password'}</label>
          <input
            id="register-password"
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors({...fieldErrors, password: ''});
            }}
            className="field"
            aria-invalid={!!fieldErrors.password}
            style={{ borderColor: fieldErrors.password ? 'var(--danger)' : 'var(--border)' }}
            placeholder="••••••••"
          />
          {fieldErrors.password && <p className="inline-error">{fieldErrors.password}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="register-confirm" className="field-label">{ar ? 'تأكيد كلمة المرور' : 'Confirm password'}</label>
          <input
            id="register-confirm"
            autoComplete="new-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) setFieldErrors({...fieldErrors, confirmPassword: ''});
            }}
            className="field"
            aria-invalid={!!fieldErrors.confirmPassword}
            style={{ borderColor: fieldErrors.confirmPassword ? 'var(--danger)' : 'var(--border)' }}
            placeholder="••••••••"
          />
          {fieldErrors.confirmPassword && <p className="inline-error">{fieldErrors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="button-primary w-full mt-2"
        >
          {isLoading ? (ar ? 'جاري إنشاء الحساب...' : 'Creating account...') : (ar ? 'إنشاء حساب' : 'Create account')}
        </button>
      </form>

      <div className="auth-divider">{ar ? 'أو' : 'or'}</div>

      <button
        onClick={handleGoogleLogin}
        type="button"
        className="button-secondary w-full"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {ar ? 'المتابعة باستخدام جوجل' : 'Continue with Google'}
      </button>

      <p className="text-center text-sm text-[var(--text-muted)]">
        {ar ? 'عندك حساب؟' : 'Already have an account?'}{' '}
        <Link to="/login" className="font-semibold text-[var(--accent)] hover:underline">
          {ar ? 'تسجيل الدخول' : 'Sign in'}
        </Link>
      </p>
    </div>
  );
}
