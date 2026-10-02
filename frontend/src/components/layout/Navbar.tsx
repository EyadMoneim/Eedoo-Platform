import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bell, 
  Mail, 
  LogOut,
  Languages
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getLocalizedName } from '../../lib/arabicNames';
import EMLogo from '../../assets/EM.svg';
import EedooWordmark from '../../assets/Eedao-Minimalist-Charcoal-Wordmark.svg';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    localStorage.setItem('eedoo_lang', newLang);
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const menuItems = [
    { path: '/app', label: t('sidebar.dashboard', 'Dashboard'), disabled: false, end: true },
    { path: '/app/money', label: t('sidebar.money', 'e-Money'), disabled: false, end: false },
    { path: '/app/tasks', label: t('sidebar.tasks', 'e-Tasks'), disabled: true, end: false },
    { path: '/app/reminders', label: t('sidebar.reminders', 'e-Reminders'), disabled: true, end: false },
    { path: '/app/notes', label: t('sidebar.notes', 'e-Notes'), disabled: true, end: false },
  ];

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'navbar.greeting_morning' : (hour < 18 ? 'navbar.greeting_afternoon' : 'navbar.greeting_night');
  const greeting = t(greetingKey, 'Good morning');
  
  const rawFirstName = user?.name?.split(' ')[0] || 'User';
  const firstName = getLocalizedName(rawFirstName, i18n.language);

  const currentDate = new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <div className="px-5 pt-5 w-full">
      <header 
        className="w-full rounded-[20px] overflow-hidden"
        style={{ 
          backgroundColor: '#070b14',
          border: '1px solid var(--border-soft)',
        }}
      >
        {/* ─── Top Row: Logo · Nav · Actions ─── */}
        <div className="flex items-center justify-between px-8 py-5 lg:px-10">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3 lg:flex-1 min-w-0">
            <img src={EMLogo} alt="Eedoo Logo" className="w-12 h-12 object-contain shrink-0" />
            {i18n.language === 'ar' ? (
              <span className="text-[1.15rem] font-extrabold tracking-wider" style={{ color: '#ffffff' }}>
                إيدو
              </span>
            ) : (
              <img 
                src={EedooWordmark} 
                alt="Eedoo" 
                className="h-[22px] w-auto shrink-0 select-none invert" 
              />
            )}
          </div>

          {/* Center: Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {menuItems.map((item) => {
              if (item.disabled) {
                return (
                  <span
                    key={item.label}
                    className="px-5 py-2 text-[13px] font-medium cursor-not-allowed select-none"
                    style={{ color: '#555D6D' }}
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => cn(
                    "px-5 py-2 rounded-xl text-[13px] transition-all duration-300 whitespace-nowrap",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                  style={({ isActive }) => isActive ? {
                    backgroundColor: '#1A1D27',
                    border: '1px solid transparent',
                    color: '#ffffff',
                  } : {
                    color: '#8B93A3',
                    border: '1px solid transparent',
                  }}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Action Icons */}
          <div className="flex items-center justify-end gap-3 lg:flex-1">
            <button 
              onClick={toggleLanguage}
              title={i18n.language === 'ar' ? 'Switch to English' : 'اقلب للمصري'}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
              style={{ 
                border: '1px solid #1A1D27',
                color: '#8B93A3',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#252A35';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.backgroundColor = '#11141A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1A1D27';
                e.currentTarget.style.color = '#8B93A3';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Languages className="w-[15px] h-[15px]" />
            </button>
            {[Mail, Bell].map((Icon, i) => (
              <button 
                key={i}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
                style={{ 
                  border: '1px solid #1A1D27',
                  color: '#8B93A3',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#252A35';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.backgroundColor = '#11141A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1A1D27';
                  e.currentTarget.style.color = '#8B93A3';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon className="w-[15px] h-[15px]" />
              </button>
            ))}
            
            {/* User Avatar */}
            <div className="relative ml-1" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 focus:outline-none"
                style={{ 
                  backgroundColor: '#1A1D27',
                  border: '1px solid #252A35',
                }}
              >
                {user?.avatar_url && !imgError ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="text-xs font-extrabold" style={{ color: 'var(--accent)' }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div 
                  className={cn(
                    "absolute mt-2 w-52 rounded-xl overflow-hidden z-50",
                    i18n.language === 'ar' ? 'left-0' : 'right-0'
                  )}
                  style={{ 
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                  }}
                >
                  <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <p className="text-sm font-light truncate" style={{ color: 'var(--text-primary)' }}>
                      {user?.name}
                    </p>
                    <p className="text-xs font-extralight truncate mt-1" style={{ color: 'var(--text-muted)' }}>
                      {user?.email}
                    </p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-light transition-all duration-200"
                    style={{ color: '#F87171' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut className={cn("w-4 h-4", i18n.language === 'ar' && "rotate-180")} />
                    {t('sidebar.logout', 'Log out')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Divider ─── */}
        <div className="mx-8 lg:mx-10 h-px" style={{ background: 'linear-gradient(to right, transparent, #1A1D27, transparent)' }} />

        {/* ─── Bottom Row: Greeting · Date ─── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-8 pt-6 pb-7 lg:px-10 lg:pt-7 lg:pb-9">
          <h1 className="text-[1.75rem] sm:text-[2rem] lg:text-[2.35rem] font-extrabold tracking-tight leading-none" style={{ color: '#ffffff' }}>
            {greeting}{i18n.language === 'ar' ? '، ' : ', '}
            <bdi>{firstName}</bdi>!
          </h1>
          <div className="flex items-center gap-2.5 mb-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: '#ffffff' }}>
              <path d="M22 14V12C22 11.161 22 10.4153 21.9871 9.75H2.0129C2 10.4153 2 11.161 2 12V14C2 17.7712 2 19.6569 3.17157 20.8284C4.34315 22 6.22876 22 10 22H14C17.7712 22 19.6569 22 20.8284 20.8284C22 19.6569 22 17.7712 22 14Z" fill="currentColor"/>
              <path d="M7.75 2.5C7.75 2.08579 7.41421 1.75 7 1.75C6.58579 1.75 6.25 2.08579 6.25 2.5V4.07926C4.81067 4.19451 3.86577 4.47737 3.17157 5.17157C2.47737 5.86577 2.19451 6.81067 2.07926 8.25H21.9207C21.8055 6.81067 21.5226 5.86577 20.8284 5.17157C20.1342 4.47737 19.1893 4.19451 17.75 4.07926V2.5C17.75 2.08579 17.4142 1.75 17 1.75C16.5858 1.75 16.25 2.08579 16.25 2.5V4.0129C15.5847 4 14.839 4 14 4H10C9.16097 4 8.41527 4 7.75 4.0129V2.5Z" fill="currentColor"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
              {currentDate}
            </span>
          </div>
        </div>
      </header>

      {/* ─── Mobile Nav (shown below lg) ─── */}
      <nav 
        className="flex lg:hidden items-center justify-center gap-1 py-3 mt-3 rounded-xl overflow-x-auto"
        style={{ backgroundColor: '#070b14', border: '1px solid var(--border-soft)' }}
      >
        {menuItems.map((item) => {
          if (item.disabled) {
            return (
              <span
                key={item.label}
                className="px-3 py-1.5 text-xs font-medium cursor-not-allowed whitespace-nowrap"
                style={{ color: '#555D6D' }}
              >
                {item.label}
              </span>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => cn(
                "px-3 py-1.5 rounded-lg text-xs transition-all duration-300 whitespace-nowrap",
                isActive ? "font-semibold" : "font-medium"
              )}
              style={({ isActive }) => isActive ? {
                backgroundColor: '#1A1D27',
                border: '1px solid transparent',
                color: '#ffffff',
              } : {
                color: '#8B93A3',
                border: '1px solid transparent',
              }}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
