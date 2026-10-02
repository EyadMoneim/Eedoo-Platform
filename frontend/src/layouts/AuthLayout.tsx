import { Outlet, Link } from 'react-router-dom';
import EedooWordmark from '../assets/Eedao-Minimalist-Charcoal-Wordmark.svg';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="inline-block">
            <img src={EedooWordmark} alt="Eedoo" className="h-8 w-auto select-none" />
          </Link>
          <p className="text-sm text-zinc-500 mt-4">Intelligent Control Layer</p>
        </div>
        
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
