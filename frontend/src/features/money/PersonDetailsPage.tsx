import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePersonSummary, useTransactions } from '../../hooks/useMoneyQueries';

export default function PersonDetailsPage() {
  const { personId } = useParams();
  const { data: summary, isLoading: isSummaryLoading } = usePersonSummary(personId!);
  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactions({ person_id: personId });
  const { t, i18n } = useTranslation();

  if (isSummaryLoading || isTransactionsLoading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  }

  if (!summary) {
    return <div style={{ color: 'var(--text-muted)' }}>{t('people.person_not_found')}</div>;
  }

  const { person, current_balance, total_lent, total_borrowed } = summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/app/money/people" 
          className="px-3 py-2 rounded-lg transition-colors hover:bg-[var(--surface-2)] text-sm"
          style={{ color: 'var(--text-muted)', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}
        >
          {i18n.language === 'ar' ? '→ ' : '← '}{t('people.back_to_people')}
        </Link>
        <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{person.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl flex flex-col justify-center" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
          <span className="text-sm font-light mb-1" style={{ color: 'var(--text-muted)' }}>{t('people.current_balance')}</span>
          <span className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {parseFloat(current_balance).toLocaleString()} <span className="text-sm font-normal text-[var(--text-muted)]">{t('money.currency')}</span>
          </span>
        </div>
        
        <div className="p-6 rounded-xl flex flex-col justify-center" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
          <span className="text-sm font-light mb-1" style={{ color: 'var(--text-muted)' }}>{t('people.total_lent')}</span>
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#4ADE80' }}>
            {parseFloat(total_lent).toLocaleString()} <span className="text-sm font-normal text-[var(--text-muted)]">{t('money.currency')}</span>
          </span>
        </div>
        
        <div className="p-6 rounded-xl flex flex-col justify-center" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
          <span className="text-sm font-light mb-1" style={{ color: 'var(--text-muted)' }}>{t('people.total_borrowed')}</span>
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#F87171' }}>
            {parseFloat(total_borrowed).toLocaleString()} <span className="text-sm font-normal text-[var(--text-muted)]">{t('money.currency')}</span>
          </span>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('transactions.title')}</h3>
        </div>
        {!transactionsData?.items || transactionsData.items.length === 0 ? (
          <div className="text-center py-12 rounded-xl" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)', color: 'var(--text-muted)' }}>
            <p>{t('transactions.no_transactions', 'No transactions found.')}</p>
          </div>
        ) : (
          <div className="data-table-scroll rounded-xl" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
            <table className="w-full border-collapse text-start">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <th className="py-3 px-4 text-xs font-medium text-start" style={{ color: 'var(--text-muted)' }}>{t('transactions.date')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-start" style={{ color: 'var(--text-muted)' }}>{t('transactions.type')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-start" style={{ color: 'var(--text-muted)' }}>{t('transactions.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {transactionsData.items.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td className="py-3 px-4 text-sm font-light text-start" style={{ color: 'var(--text-primary)' }}>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm font-light text-start" style={{ color: 'var(--text-primary)' }}>
                      {t(`transactions.type_${tx.type.toLowerCase().replace('personal_expense', 'expense').replace('received_from_person', 'received').replace('lent_to_person', 'lent').replace('borrowed_from_person', 'borrowed').replace('repaid_to_person', 'repaid')}`)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-start" style={{ color: 'var(--text-primary)' }}>
                      {parseFloat(tx.amount).toLocaleString()} {t('money.currency')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
