import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { House, Wallet, LayoutDashboard, Languages, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import EMLogo from '../../assets/EM.svg';

export function Navbar() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  const links = [
    { to: '/app', label: t('sidebar.home'), icon: House, end: true },
    { to: '/app/dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard, end: false },
    { to: '/app/money', label: t('sidebar.money'), icon: Wallet, end: false },
  ];

  const toggleLanguage = () => {
    const lang = i18n.language === 'ar' ? 'en' : 'ar';
    localStorage.setItem('eedoo_lang', lang);
    i18n.changeLanguage(lang);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = links.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
      <Icon aria-hidden="true" />{label}
    </NavLink>
  ));

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/app" className="brand" aria-label="Eedoo home">
            <img src={EMLogo} alt="" className="brand-mark" />
            <span>{i18n.language === 'ar' ? 'إيدو' : 'eedoo'}</span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">{navLinks}</nav>
          <div className="header-actions">
            <button className="icon-button" type="button" onClick={toggleLanguage} aria-label={i18n.language === 'ar' ? 'Switch to English' : 'Switch to Arabic'} title={i18n.language === 'ar' ? 'English' : 'العربية'}>
              <Languages size={19} aria-hidden="true" />
            </button>
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button className="icon-button" type="button" onClick={() => setOpen(!open)} aria-label={t('sidebar.profile')} aria-expanded={open} aria-haspopup="menu" style={{ width: 'auto', gap: '.4rem', paddingInline: '.3rem' }}>
                <span className="avatar">
                  {user?.avatar_url && !imgError ? <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" onError={() => setImgError(true)} /> : (user?.name?.charAt(0).toUpperCase() || 'U')}
                </span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>
              {open && (
                <div className="profile-menu" role="menu">
                  <div className="menu-name">{user?.name || t('sidebar.user_fallback_name')}</div>
                  <Link to="/app/settings/profile" role="menuitem" onClick={() => setOpen(false)}><User size={17} aria-hidden="true" />{t('sidebar.profile')}</Link>
                  <Link to="/app/settings/general" role="menuitem" onClick={() => setOpen(false)}><Settings size={17} aria-hidden="true" />{t('sidebar.settings')}</Link>
                  <button type="button" role="menuitem" className="destructive" onClick={handleLogout}><LogOut size={17} aria-hidden="true" />{t('sidebar.logout')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Mobile navigation">{navLinks}</nav>
    </>
  );
}
