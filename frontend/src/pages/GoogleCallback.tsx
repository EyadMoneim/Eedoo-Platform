import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    
    const code = searchParams.get('code');
    
    if (!code) {
      setError('No authorization code provided');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    processedRef.current = true;

    const authenticate = async () => {
      try {
        await googleLogin(code);
        navigate('/app', { replace: true });
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Google authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    authenticate();
  }, [searchParams, googleLogin, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      {error ? (
        <div className="text-red-500 font-medium bg-red-50 p-4 rounded-lg">
          {error}
          <p className="text-sm mt-2">Redirecting to login...</p>
        </div>
      ) : (
        <>
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="text-zinc-600 font-medium">Authenticating with Google...</p>
        </>
      )}
    </div>
  );
}
