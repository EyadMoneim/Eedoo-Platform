import { Outlet, Link, useLocation } from 'react-router-dom';

export default function MoneyLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/app/money' },
    { name: 'Transactions', path: '/app/money/transactions' },
    { name: 'People', path: '/app/money/people' }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Edoo Money</h1>
          <p className="text-zinc-500 mt-1">Track your expenses, income, and debts.</p>
        </div>
      </div>

      {/* Internal Nav */}
      <nav className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/app/money' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive 
                  ? 'border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
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
