import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            EeDOO
          </Link>
          <p className="text-sm text-zinc-500 mt-2">Intelligent Control Layer</p>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
