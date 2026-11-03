import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function MoneyLayout() {
  const { t } = useTranslation();

  const navItems = [
    { name: t('money.nav_dashboard'), path: '/app/money' },
    { name: t('money.nav_transactions'), path: '/app/money/transactions' },
    { name: t('money.nav_people'), path: '/app/money/people' }
  ];

  return (
    <div className="flex flex-col gap-7">
      <div>
        <div>
          <h1 className="page-title">
            {t('money.title')}
          </h1>
          <p className="page-subtitle mt-2">
            {t('money.subtitle')}
          </p>
        </div>
      </div>

      {/* Internal Nav */}
      <nav className="section-tabs" aria-label="Money sections">
        {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app/money'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {item.name}
            </NavLink>
        ))}
      </nav>

      {/* Main Feature Content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
