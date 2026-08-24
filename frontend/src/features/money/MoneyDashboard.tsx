import { useMoneySummary } from '../../hooks/useMoneyQueries';
import { Link } from 'react-router-dom';

function SummaryCard({ title, amount, className = "" }: { title: string, amount: string | number, className?: string }) {
  return (
    <div className={`p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm ${className}`}>
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
      <p className="text-3xl font-semibold mt-2 text-zinc-900 dark:text-zinc-50">{Number(amount).toFixed(2)} <span className="text-lg text-zinc-400">EGP</span></p>
    </div>
  );
}

export default function MoneyDashboard() {
  const { data: summary, isLoading, isError } = useMoneySummary();

  if (isLoading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-zinc-200 rounded w-3/4"></div></div></div>;
  if (isError || !summary) return <div className="text-red-500">Failed to load summary.</div>;

  return (
    <div className="space-y-8">
      {/* Top Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Cash Balance" amount={summary.cash_balance} />
        <SummaryCard title="Net Position" amount={summary.net_position} className="bg-zinc-50 dark:bg-zinc-800/50" />
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Income" amount={summary.total_income} />
        <SummaryCard title="Expenses" amount={summary.total_personal_expenses} />
        <SummaryCard title="Owed to You" amount={summary.money_owed_to_user} className="border-emerald-200 dark:border-emerald-900/50" />
        <SummaryCard title="You Owe" amount={summary.money_user_owes} className="border-red-200 dark:border-red-900/50" />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link 
          to="/app/money/transactions" 
          className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          View Transactions
        </Link>
        <Link 
          to="/app/money/people" 
          className="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Manage People
        </Link>
      </div>
    </div>
  );
}
