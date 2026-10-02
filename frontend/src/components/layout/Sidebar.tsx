import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Wallet, 
  ListTodo, 
  Bell, 
  StickyNote,
  LogOut,
  BrainCircuit,
  Languages
} from 'lucide-react';
import { cn } from '../../lib/utils';
import EMLogo from '../../assets/EM.svg';
import EedooWordmark from '../../assets/Eedao-Minimalist-Charcoal-Wordmark.svg';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [imgError, setImgError] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    localStorage.setItem('eedoo_lang', newLang);
    i18n.changeLanguage(newLang);
  };

  const menuItems = [
    { path: '/app', icon: LayoutDashboard, label: t('sidebar.dashboard'), disabled: false, end: true },
    { path: '/app/money', icon: Wallet, label: t('sidebar.money'), disabled: false, end: false },
    { path: '/app/tasks', icon: ListTodo, label: t('sidebar.tasks'), disabled: true, end: false },
    { path: '/app/reminders', icon: Bell, label: t('sidebar.reminders'), disabled: true, end: false },
    { path: '/app/notes', icon: StickyNote, label: t('sidebar.notes'), disabled: true, end: false },
  ];

  return (
    <aside className={cn(
      "w-full md:w-64 h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 shadow-sm relative z-20 overflow-hidden shrink-0",
      i18n.language === 'ar' ? 'border-l border-zinc-200 dark:border-zinc-800' : 'border-r border-zinc-200 dark:border-zinc-800'
    )}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={EMLogo} alt="Eedoo Logo" className="w-8 h-8 object-contain shrink-0" />
          <div className="flex flex-col justify-center">
            {i18n.language === 'ar' ? (
              <span className="text-[1.15rem] font-extrabold tracking-wider text-zinc-900 dark:text-zinc-50 leading-none">
                إيدو
              </span>
            ) : (
              <img 
                src={EedooWordmark} 
                alt="Eedoo" 
                className="h-[15px] w-auto shrink-0 select-none dark:invert" 
              />
            )}
            <span className="text-[9px] text-zinc-500 font-medium tracking-wider uppercase mt-1">{t('sidebar.platform')}</span>
          </div>
        </div>
        <button 
          onClick={toggleLanguage}
          className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title={i18n.language === 'ar' ? 'Switch to English' : 'اقلب للمصري'}
        >
          <Languages className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        {menuItems.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              >
                <item.icon className="w-5 h-5 opacity-50" />
                {item.label}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-white" : "text-zinc-400 dark:text-zinc-500"
                  )} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="mt-auto p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
            {user?.avatar_url && !imgError ? (
              <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {user?.name?.charAt(0).toUpperCase() || t('sidebar.user_initial')}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {user?.name || t('sidebar.user_fallback_name')}
            </span>
            <span className="text-xs text-zinc-500 truncate">
              {user?.email || t('sidebar.user_fallback_email')}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className={cn("w-4 h-4", i18n.language === 'ar' && "rotate-180")} />
          {t('sidebar.logout')}
        </button>
      </div>
    </aside>
  );
};
