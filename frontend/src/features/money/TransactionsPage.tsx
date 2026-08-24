import { useState } from 'react';
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

  if (isLoading) return <div className="text-zinc-500 dark:text-zinc-400">Loading transactions...</div>;

  const transactions = data?.items || [];

  const requiresPerson = ['LENT_TO_PERSON', 'RECEIVED_FROM_PERSON', 'BORROWED_FROM_PERSON', 'REPAID_TO_PERSON'].includes(formData.type);
  const isIncome = formData.type === 'INCOME';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Transactions</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          {isAdding ? 'Cancel' : 'Add Transaction'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 mb-6 space-y-4">
           <h3 className="font-medium text-zinc-900 dark:text-zinc-50">New Transaction</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Type</label>
               <select 
                 value={formData.type}
                 onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                 className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
               >
                 <option value="PERSONAL_EXPENSE">Personal Expense</option>
                 <option value="INCOME">Income</option>
                 <option value="LENT_TO_PERSON">Lent to Person</option>
                 <option value="RECEIVED_FROM_PERSON">Received from Person</option>
                 <option value="BORROWED_FROM_PERSON">Borrowed from Person</option>
                 <option value="REPAID_TO_PERSON">Repaid to Person</option>
               </select>
             </div>

             <div>
               <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Amount (EGP)</label>
               <input 
                 type="number"
                 step="0.01"
                 required
                 value={formData.amount}
                 onChange={e => setFormData({...formData, amount: e.target.value})}
                 className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
                 placeholder="0.00"
               />
             </div>
             
             {requiresPerson && (
               <div>
                 <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Person</label>
                 <select 
                   required
                   value={formData.person_id}
                   onChange={e => setFormData({...formData, person_id: e.target.value})}
                   className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
                 >
                   <option value="">Select someone...</option>
                   {people?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
               </div>
             )}

             {isPersonalExpense && (
               <div>
                 <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Category</label>
                 <select 
                   value={formData.category_id}
                   onChange={e => setFormData({...formData, category_id: e.target.value})}
                   className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
                 >
                   <option value="">Uncategorized</option>
                   {categories?.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                 </select>
               </div>
             )}

             <div>
               <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Date</label>
               <input 
                 type="date"
                 required
                 value={formData.transaction_date}
                 onChange={e => setFormData({...formData, transaction_date: e.target.value})}
                 className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
               />
             </div>

             <div className={requiresPerson || isPersonalExpense ? 'md:col-span-1' : 'md:col-span-2'}>
               <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Description (Optional)</label>
               <input 
                 type="text"
                 value={formData.description}
                 onChange={e => setFormData({...formData, description: e.target.value})}
                 className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
                 placeholder="What was this for?"
               />
             </div>
           </div>

           <div className="flex justify-end pt-2">
             <button 
               type="submit" 
               disabled={createMutation.isPending}
               className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
             >
               {createMutation.isPending ? 'Saving...' : 'Save Transaction'}
             </button>
           </div>
        </form>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-12 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-400">No transactions yet. Start tracking your money.</p>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{tx.transaction_date}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{tx.description || '-'}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-700">{tx.type}</span>
                  </td>
                  <td className={`px-4 py-3 font-semibold text-right ${
                    ['INCOME', 'RECEIVED_FROM_PERSON', 'BORROWED_FROM_PERSON'].includes(tx.type) 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-zinc-900 dark:text-zinc-100'
                  }`}>
                    {['PERSONAL_EXPENSE', 'LENT_TO_PERSON', 'REPAID_TO_PERSON'].includes(tx.type) ? '-' : '+'}{Number(tx.amount).toFixed(2)} {tx.currency}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this transaction?')) {
                          deleteMutation.mutate(tx.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                    >
                      Delete
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
