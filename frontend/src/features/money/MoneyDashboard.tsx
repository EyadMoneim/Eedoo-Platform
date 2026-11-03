import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ReceiptText, Users } from 'lucide-react';
import { useMoneySummary } from '../../hooks/useMoneyQueries';

export default function MoneyDashboard() {
  const { data: summary, isLoading, isError } = useMoneySummary();
  const { t, i18n } = useTranslation();
  const format = (value: string | number) => new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-EG', { maximumFractionDigits: 2 }).format(Number(value));

  if (isLoading) return <div className="money-hero" aria-label="Loading money summary"><div className="balance-feature animate-pulse h-52" /><div className="panel animate-pulse h-52" /></div>;
  if (isError || !summary) return <div className="error-panel" role="alert">{t('money.loading_failed')}</div>;

  const metrics = [
    [t('money.income'), summary.total_income],
    [t('money.expenses'), summary.total_personal_expenses],
    [t('money.owed_to_you'), summary.money_owed_to_user],
    [t('money.you_owe'), summary.money_user_owes],
  ] as const;

  return (
    <div className="space-y-7">
      <div className="money-hero">
        <section className="balance-feature">
          <p className="text-sm text-[#d7c4ed]">{t('money.cash_balance')}</p>
          <p className="balance-value mt-4">{format(summary.cash_balance)} <span className="text-lg font-medium text-[#d7c4ed]">{t('money.currency')}</span></p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/app/money/transactions" className="button-primary"><ReceiptText size={17} aria-hidden="true" />{t('money.view_transactions')}</Link>
            <Link to="/app/money/people" className="button-secondary"><Users size={17} aria-hidden="true" />{t('money.manage_people')}</Link>
          </div>
        </section>
        <section className="panel p-6 flex flex-col justify-between">
          <p className="text-sm text-[var(--text-muted)]">{t('money.net_position')}</p>
          <div>
            <p className="text-3xl font-semibold tracking-tight tabular-nums break-all">{format(summary.net_position)} <span className="text-base font-normal text-[var(--text-muted)]">{t('money.currency')}</span></p>
            <Link to="/app/money/people" className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-[var(--accent)] hover:underline">{t('money.manage_people')} <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>
      </div>
      <div className="metric-list">
        {metrics.map(([label, value]) => <div className="metric" key={label}><p className="metric-label">{label}</p><p className="metric-value">{format(value)} <span className="text-sm font-normal text-[var(--text-muted)]">{t('money.currency')}</span></p></div>)}
      </div>
    </div>
  );
}
