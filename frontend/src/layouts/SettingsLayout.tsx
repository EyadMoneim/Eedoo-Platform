import { useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

export default function SettingsLayout() {
  const { t, i18n } = useTranslation();
  const ar = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [ar, i18n.language]);

  const pages = [
    ['/app/settings/profile', t('sidebar.profile')],
    ['/app/settings/general', t('sidebar.settings')],
    ['/app/settings/appearance', t('sidebar.appearance')],
  ];

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main max-w-[1000px]">
        <Link to="/app" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6">
          {ar ? <ArrowRight size={17} aria-hidden="true" /> : <ArrowLeft size={17} aria-hidden="true" />}
          {ar ? 'رجوع للتطبيق' : 'Back to app'}
        </Link>
        <h1 className="page-title mb-6">{ar ? 'الإعدادات' : 'Settings'}</h1>
        <nav className="section-tabs mb-8" aria-label="Settings sections">
          {pages.map(([path, label]) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>)}
        </nav>
        <Outlet />
      </main>
    </div>
  );
}
