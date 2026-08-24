import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RootLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-8">
        <div>
          <Link to="/app" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            EeDOO
          </Link>
          <p className="text-sm text-zinc-500 mt-1">Platform</p>
        </div>
        
        <ul className="flex flex-col gap-2 flex-1">
          <li>
            <Link to="/app" className="block py-2 px-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm font-medium transition-colors">
              Dashboard
            </Link>
          </li>
          <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-800" />
          {/* Placeholders for future features */}
          <li>
            <Link to="/app/money" className="block py-2 px-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm font-medium transition-colors text-zinc-900 dark:text-zinc-100">
              e-Money
            </Link>
          </li>
          <li className="text-sm text-zinc-400 py-2 px-3 font-medium cursor-not-allowed">e-Tasks</li>
          <li className="text-sm text-zinc-400 py-2 px-3 font-medium cursor-not-allowed">e-Reminders</li>
          <li className="text-sm text-zinc-400 py-2 px-3 font-medium cursor-not-allowed">e-Notes</li>
        </ul>

        {/* User Profile & Logout */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {user?.name}
              </span>
              <span className="text-xs text-zinc-500 truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full mt-2 text-left py-2 px-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm font-medium text-red-600 dark:text-red-400 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
