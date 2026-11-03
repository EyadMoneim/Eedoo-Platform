import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { i18n } = useTranslation();
  const ar = i18n.language === 'ar';
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = ar ? 'اكتب بريدك الإلكتروني' : 'Please enter your email';
    if (!password) newErrors.password = ar ? 'اكتب كلمة المرور' : 'Please enter your password';
    
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }
    
    setFieldErrors({});
    setIsLoading(true);
    
    try {
      await login({ email, password });
      navigate('/app', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || (ar ? 'تعذر تسجيل الدخول. حاول مرة أخرى.' : 'Could not sign in. Please try again.'));
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
        <h1>{ar ? 'أهلًا برجوعك' : 'Welcome back'}</h1>
        <p className="page-subtitle mt-2">{ar ? 'سجل دخولك لمساحتك.' : 'Sign in to your space.'}</p>
      </div>

      {error && (
        <div className="error-panel" role="alert">
          {error}
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1">
          <label htmlFor="login-email" className="field-label">{ar ? 'البريد الإلكتروني' : 'Email'}</label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="field-label">{ar ? 'كلمة المرور' : 'Password'}</label>
          <input
            id="login-password"
            autoComplete="current-password"
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

        <button
          type="submit"
          disabled={isLoading}
          className="button-primary w-full mt-2"
        >
          {isLoading ? (ar ? 'جاري تسجيل الدخول...' : 'Signing in...') : (ar ? 'تسجيل الدخول' : 'Sign in')}
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
        {ar ? 'معندكش حساب؟' : "Don't have an account?"}{' '}
        <Link to="/register" className="font-semibold text-[var(--accent)] hover:underline">
          {ar ? 'أنشئ حساب' : 'Create one'}
        </Link>
      </p>
    </div>
  );
}
