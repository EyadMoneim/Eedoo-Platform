import { useMoneySummary } from '../../hooks/useMoneyQueries';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function SummaryCard({ title, amount, currency }: { title: string, amount: string | number, currency: string }) {
  return (
    <div 
      className="p-5 rounded-2xl"
      style={{ 
        backgroundColor: 'var(--surface-2)',
        border: '1px solid var(--border-soft)',
      }}
    >
      <h3 className="text-sm font-extralight" style={{ color: 'var(--text-muted)' }}>{title}</h3>
      <p className="text-3xl font-extrabold mt-2" style={{ color: 'var(--text-primary)' }}>
        {Number(amount).toFixed(2)} <span className="text-lg font-light" style={{ color: 'var(--text-muted)' }}>{currency}</span>
      </p>
    </div>
  );
}

export default function MoneyDashboard() {
  const { data: summary, isLoading, isError } = useMoneySummary();
  const { t } = useTranslation();

  if (isLoading) return <div className="font-light" style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  if (isError || !summary) return <div className="text-red-500">{t('money.loading_failed')}</div>;

  const currency = t('money.currency');

  return (
    <div className="space-y-8">
      {/* Top Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title={t('money.cash_balance')} amount={summary.cash_balance} currency={currency} />
        <SummaryCard title={t('money.net_position')} amount={summary.net_position} currency={currency} />
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title={t('money.income')} amount={summary.total_income} currency={currency} />
        <SummaryCard title={t('money.expenses')} amount={summary.total_personal_expenses} currency={currency} />
        <SummaryCard title={t('money.owed_to_you')} amount={summary.money_owed_to_user} currency={currency} />
        <SummaryCard title={t('money.you_owe')} amount={summary.money_user_owes} currency={currency} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link 
          to="/app/money/transactions" 
          className="px-5 py-2.5 rounded-xl text-sm font-light transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
        >
          {t('money.view_transactions')}
        </Link>
        <Link 
          to="/app/money/people" 
          className="px-5 py-2.5 rounded-xl text-sm font-light transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--surface-3)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          {t('money.manage_people')}
        </Link>
      </div>
    </div>
  );
}
