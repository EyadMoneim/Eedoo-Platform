import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function MoneyLayout() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { name: t('money.nav_dashboard'), path: '/app/money' },
    { name: t('money.nav_transactions'), path: '/app/money/transactions' },
    { name: t('money.nav_people'), path: '/app/money/people' }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {t('money.title')}
          </h1>
          <p className="font-extralight mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('money.subtitle')}
          </p>
        </div>
      </div>

      {/* Internal Nav */}
      <nav className="flex gap-4" style={{ borderBottom: '1px solid var(--border-soft)' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/app/money' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className="px-4 py-3 text-sm font-light border-b-2 transition-colors"
              style={isActive ? {
                borderColor: 'var(--accent)',
                color: 'var(--text-primary)',
              } : {
                borderColor: 'transparent',
                color: 'var(--text-muted)',
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Main Feature Content */}
      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}
