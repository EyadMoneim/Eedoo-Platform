import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  useTransactions, 
  useDeleteTransaction,
  useCreateTransaction,
  usePeople,
  useCategories
} from '../../hooks/useMoneyQueries';
import type { TransactionType } from '../../types';

export default function TransactionsPage() {
  const [page] = useState(1);
  const { data, isLoading } = useTransactions({ page, size: 50 });
  const deleteMutation = useDeleteTransaction();
  const createMutation = useCreateTransaction();
  const { t } = useTranslation();
  
  const { data: people } = usePeople();
  const { data: categories } = useCategories();

  const [isAdding, setIsAdding] = useState(false);
  
  const initialFormState = {
    type: 'PERSONAL_EXPENSE' as TransactionType,
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    person_id: '',
    category_id: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  if (isLoading) return <div className="font-light" style={{ color: 'var(--text-muted)' }}>{t('transactions.title')}...</div>;

  const transactions = data?.items || [];

  const requiresPerson = ['LENT_TO_PERSON', 'RECEIVED_FROM_PERSON', 'BORROWED_FROM_PERSON', 'REPAID_TO_PERSON'].includes(formData.type);
  const isPersonalExpense = formData.type === 'PERSONAL_EXPENSE';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    
    createMutation.mutate({
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      transaction_date: formData.transaction_date,
      person_id: requiresPerson && formData.person_id ? formData.person_id : null,
      category_id: isPersonalExpense && formData.category_id ? formData.category_id : null,
      currency: "EGP"
    }, {
      onSuccess: () => {
        setIsAdding(false);
        setFormData(initialFormState);
      }
    });
  };

  const inputStyle = {
    backgroundColor: 'var(--surface-2)',
    border: '1px solid var(--border-soft)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{t('transactions.title')}</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl text-sm font-light transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
          }}
        >
          {isAdding ? t('transactions.cancel') : t('transactions.add_transaction')}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl mb-6 space-y-4" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
           <h3 className="font-light" style={{ color: 'var(--text-primary)' }}>{t('transactions.new_transaction')}</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('transactions.type')}</label>
               <select 
                 value={formData.type}
                 onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                 className="w-full px-3 py-2 rounded-lg text-sm font-light"
                 style={inputStyle}
               >
                 <option value="PERSONAL_EXPENSE">{t('transactions.type_expense')}</option>
                 <option value="INCOME">{t('transactions.type_income')}</option>
                 <option value="LENT_TO_PERSON">{t('transactions.type_lent')}</option>
                 <option value="RECEIVED_FROM_PERSON">{t('transactions.type_received')}</option>
                 <option value="BORROWED_FROM_PERSON">{t('transactions.type_borrowed')}</option>
                 <option value="REPAID_TO_PERSON">{t('transactions.type_repaid')}</option>
               </select>
             </div>

             <div>
               <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('transactions.amount')} ({t('money.currency')})</label>
               <input 
                 type="number"
                 step="0.01"
                 required
                 value={formData.amount}
                 onChange={e => setFormData({...formData, amount: e.target.value})}
                 className="w-full px-3 py-2 rounded-lg text-sm font-light"
                 style={inputStyle}
                 placeholder="0.00"
               />
             </div>
             
             {requiresPerson && (
               <div>
                 <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>Person</label>
                 <select 
                   required
                   value={formData.person_id}
                   onChange={e => setFormData({...formData, person_id: e.target.value})}
                   className="w-full px-3 py-2 rounded-lg text-sm font-light"
                   style={inputStyle}
                 >
                   <option value="">Select someone...</option>
                   {people?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
               </div>
             )}

             {isPersonalExpense && (
               <div>
                 <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('transactions.category')}</label>
                 <select 
                   value={formData.category_id}
                   onChange={e => setFormData({...formData, category_id: e.target.value})}
                   className="w-full px-3 py-2 rounded-lg text-sm font-light"
                   style={inputStyle}
                 >
                   <option value="">{t('transactions.cat_uncategorized')}</option>
                   {categories?.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                 </select>
               </div>
             )}

             <div>
               <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('transactions.date')}</label>
               <input 
                 type="date"
                 required
                 value={formData.transaction_date}
                 onChange={e => setFormData({...formData, transaction_date: e.target.value})}
                 className="w-full px-3 py-2 rounded-lg text-sm font-light"
                 style={inputStyle}
               />
             </div>

             <div className={requiresPerson || isPersonalExpense ? 'md:col-span-1' : 'md:col-span-2'}>
               <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('transactions.description')}</label>
               <input 
                 type="text"
                 value={formData.description}
                 onChange={e => setFormData({...formData, description: e.target.value})}
                 className="w-full px-3 py-2 rounded-lg text-sm font-light"
                 style={inputStyle}
                 placeholder={t('transactions.desc_placeholder')}
               />
             </div>
           </div>

           <div className="flex justify-end pt-2">
             <button 
               type="submit" 
               disabled={createMutation.isPending}
               className="px-5 py-2 rounded-xl text-sm font-light transition-all duration-300 disabled:opacity-50"
               style={{ backgroundColor: 'var(--money)', color: '#ffffff' }}
             >
               {createMutation.isPending ? '...' : t('transactions.save_transaction')}
             </button>
           </div>
        </form>
      )}

      {transactions.length === 0 ? (
        <div 
          className="text-center py-12 rounded-xl font-extralight"
          style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)', color: 'var(--text-muted)' }}
        >
          No transactions yet.
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-soft)', backgroundColor: 'var(--surface-2)' }}>
          <table className="w-full text-sm text-left">
            <thead style={{ backgroundColor: 'var(--surface-3)', borderBottom: '1px solid var(--border-soft)' }}>
              <tr style={{ color: 'var(--text-muted)' }}>
                <th className="px-4 py-3 font-light">{t('transactions.date')}</th>
                <th className="px-4 py-3 font-light">{t('transactions.description')}</th>
                <th className="px-4 py-3 font-light">{t('transactions.type')}</th>
                <th className="px-4 py-3 font-light text-right">{t('transactions.amount')}</th>
                <th className="px-4 py-3 font-light text-right">{t('transactions.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-soft)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{tx.transaction_date}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{tx.description || '-'}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{tx.type}</span>
                  </td>
                  <td className={`px-4 py-3 font-semibold text-right`} style={{
                    color: ['INCOME', 'RECEIVED_FROM_PERSON', 'BORROWED_FROM_PERSON'].includes(tx.type) ? 'var(--money)' : 'var(--text-primary)'
                  }}>
                    {['PERSONAL_EXPENSE', 'LENT_TO_PERSON', 'REPAID_TO_PERSON'].includes(tx.type) ? '-' : '+'}{Number(tx.amount).toFixed(2)} {tx.currency}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure?')) {
                          deleteMutation.mutate(tx.id);
                        }
                      }}
                      className="font-medium transition-colors"
                      style={{ color: '#F87171' }}
                    >
                      {t('transactions.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
