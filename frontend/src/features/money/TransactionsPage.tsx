import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  useTransactions, 
  useDeleteTransaction,
  useCreateTransaction,
  usePeople,
  useCategories
} from '../../hooks/useMoneyQueries';
import { 
  ChevronDown, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Receipt, 
  GraduationCap, 
  Film, 
  Activity, 
  Package,
  User
} from 'lucide-react';
import type { TransactionType } from '../../types';

// Category Icon Map
const CategoryIconMap: Record<string, React.ElementType> = {
  'Food': Utensils,
  'Transport': Car,
  'Shopping': ShoppingBag,
  'Bills': Receipt,
  'Education': GraduationCap,
  'Entertainment': Film,
  'Health': Activity,
  'Other': Package,
};

// Custom Select Component
function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder,
  className,
  style 
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; icon?: React.ElementType }[];
  placeholder: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button type="button"
        className={`flex items-center justify-between cursor-pointer ${className}`}
        style={style}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`${placeholder}: ${selectedOption?.label || placeholder}`}
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon && <selectedOption.icon className="w-4 h-4 text-[var(--text-muted)]" />}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-2 rounded-xl shadow-lg overflow-hidden border"
          style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
        >
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((opt) => (
              <button type="button"
                key={opt.value}
                className="w-full min-h-11 flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm text-start"
                style={{ 
                  color: value === opt.value ? 'var(--accent)' : 'var(--text-primary)',
                  backgroundColor: value === opt.value ? 'var(--accent-soft)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (value !== opt.value) e.currentTarget.style.backgroundColor = 'var(--surface-3)';
                }}
                onMouseLeave={(e) => {
                  if (value !== opt.value) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.icon && <opt.icon className="w-4 h-4 text-[var(--text-muted)]" />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  const [page] = useState(1);
  const { data, isLoading, isError } = useTransactions({ page, size: 50 });
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');

  if (isLoading) return <div className="panel h-40 animate-pulse" aria-label="Loading transactions" />;
  if (isError) return <div className="error-panel" role="alert">{t('transactions.loading_failed', 'Could not load transactions. Please refresh the page.')}</div>;

  const transactions = data?.items || [];

  const requiresPerson = ['LENT_TO_PERSON', 'RECEIVED_FROM_PERSON', 'BORROWED_FROM_PERSON', 'REPAID_TO_PERSON'].includes(formData.type);
  const isPersonalExpense = formData.type === 'PERSONAL_EXPENSE';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom Validation
    const newErrors: Record<string, string> = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('transactions.error_amount', 'Please enter a valid amount');
    }
    if (requiresPerson && !formData.person_id) {
      newErrors.person_id = t('transactions.error_person', 'Please select a person');
    }
    if (!formData.transaction_date) {
      newErrors.transaction_date = t('transactions.error_date', 'Please select a date');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    setSaveError('');
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
      },
      onError: () => setSaveError(t('transactions.save_failed', 'Could not save the transaction. Please try again.')),
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
          className="button-primary"
          style={{ 
            backgroundColor: 'var(--accent)',
            color: '#17121f',
          }}
        >
          {isAdding ? t('transactions.cancel') : t('transactions.add_transaction')}
        </button>
      </div>

      {isAdding && (
        <form noValidate onSubmit={handleSubmit} className="p-5 rounded-xl mb-6 space-y-4" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
           <h3 className="font-light" style={{ color: 'var(--text-primary)' }}>{t('transactions.new_transaction')}</h3>
           {saveError && <div className="error-panel" role="alert">{saveError}</div>}
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('transactions.type')}</label>
               <CustomSelect 
                 value={formData.type}
                 onChange={val => setFormData({...formData, type: val as TransactionType})}
                 placeholder={t('transactions.type')}
                 className="w-full px-3 py-2.5 rounded-lg text-sm font-light"
                 style={inputStyle}
                 options={[
                   { value: 'PERSONAL_EXPENSE', label: t('transactions.type_expense') },
                   { value: 'INCOME', label: t('transactions.type_income') },
                   { value: 'LENT_TO_PERSON', label: t('transactions.type_lent') },
                   { value: 'RECEIVED_FROM_PERSON', label: t('transactions.type_received') },
                   { value: 'BORROWED_FROM_PERSON', label: t('transactions.type_borrowed') },
                   { value: 'REPAID_TO_PERSON', label: t('transactions.type_repaid') }
                 ]}
               />
             </div>

             <div>
               <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('transactions.amount')} ({t('money.currency')})</label>
               <input 
                 type="number"
                 step="0.01"
                 value={formData.amount}
                 onChange={e => {
                   setFormData({...formData, amount: e.target.value});
                   if (errors.amount) setErrors({...errors, amount: ''});
                 }}
                 className="w-full px-3 py-2.5 rounded-lg text-sm font-light transition-colors"
                 style={{
                   ...inputStyle,
                   borderColor: errors.amount ? '#EF4444' : 'var(--border-soft)'
                 }}
                 placeholder="0.00"
               />
               {errors.amount && <p className="text-[10px] text-red-500 mt-1">{errors.amount}</p>}
             </div>
             
             {requiresPerson && (
               <div>
                 <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>Person</label>
                 <CustomSelect
                   value={formData.person_id}
                   onChange={val => {
                     setFormData({...formData, person_id: val});
                     if (errors.person_id) setErrors({...errors, person_id: ''});
                   }}
                   placeholder="Select someone..."
                   className="w-full px-3 py-2.5 rounded-lg text-sm font-light transition-colors"
                   style={{
                     ...inputStyle,
                     borderColor: errors.person_id ? '#EF4444' : 'var(--border-soft)'
                   }}
                   options={people?.map(p => ({ value: p.id, label: p.name, icon: User })) || []}
                 />
                 {errors.person_id && <p className="text-[10px] text-red-500 mt-1">{errors.person_id}</p>}
               </div>
             )}

             {isPersonalExpense && (
               <div>
                 <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('transactions.category')}</label>
                 <CustomSelect
                   value={formData.category_id}
                   onChange={val => setFormData({...formData, category_id: val})}
                   placeholder={t('transactions.cat_uncategorized')}
                   className="w-full px-3 py-2.5 rounded-lg text-sm font-light"
                   style={inputStyle}
                   options={[
                     { value: "", label: t('transactions.cat_uncategorized') },
                     ...(categories?.map(c => ({ 
                       value: c.id, 
                       label: c.name, 
                       icon: CategoryIconMap[c.name] || Package 
                     })) || [])
                   ]}
                 />
               </div>
             )}

             <div>
               <label htmlFor="transaction-date" className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('transactions.date')}</label>
               <input
                 id="transaction-date"
                 type="date"
                 value={formData.transaction_date}
                 onChange={event => {
                   setFormData({...formData, transaction_date: event.target.value});
                   if (errors.transaction_date) setErrors({...errors, transaction_date: ''});
                 }}
                 className="w-full px-3 py-2.5 rounded-lg text-sm font-light transition-colors"
                 style={{
                   ...inputStyle,
                   borderColor: errors.transaction_date ? '#EF4444' : 'var(--border-soft)'
                 }}
                 aria-invalid={!!errors.transaction_date}
               />
               {errors.transaction_date && <p className="text-[10px] text-red-500 mt-1">{errors.transaction_date}</p>}
             </div>

             <div className={requiresPerson || isPersonalExpense ? 'md:col-span-1' : 'md:col-span-2'}>
               <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('transactions.description')}</label>
               <input 
                 type="text"
                 value={formData.description}
                 onChange={e => setFormData({...formData, description: e.target.value})}
                 className="w-full px-3 py-2.5 rounded-lg text-sm font-light transition-colors"
                 style={inputStyle}
                 placeholder={t('transactions.desc_placeholder')}
               />
             </div>
           </div>

           <div className="flex justify-end pt-2">
             <button 
               type="submit" 
               disabled={createMutation.isPending}
               className="button-primary disabled:opacity-50"
             >
               {createMutation.isPending ? '...' : t('transactions.save_transaction')}
             </button>
           </div>
        </form>
      )}

      {transactions.length === 0 ? (
        <div 
          className="empty-state rounded-xl"
          style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)', color: 'var(--text-muted)' }}
        >
          {t('transactions.empty', 'No transactions yet. Add one to see it here.')}
        </div>
      ) : (
        <div className="rounded-xl data-table-scroll" style={{ border: '1px solid var(--border-soft)', backgroundColor: 'var(--surface-2)' }}>
          <table className="w-full text-sm text-start">
            <thead style={{ backgroundColor: 'var(--surface-3)', borderBottom: '1px solid var(--border-soft)' }}>
              <tr style={{ color: 'var(--text-muted)' }}>
                <th className="px-4 py-3 font-light text-start">{t('transactions.date')}</th>
                <th className="px-4 py-3 font-light text-start">{t('transactions.description')}</th>
                <th className="px-4 py-3 font-light text-start">{t('transactions.type')}</th>
                <th className="px-4 py-3 font-light text-end">{t('transactions.amount')}</th>
                <th className="px-4 py-3 font-light text-end">{t('transactions.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-soft)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-4 py-3 text-start" style={{ color: 'var(--text-primary)' }}>{tx.transaction_date}</td>
                  <td className="px-4 py-3 font-medium text-start" style={{ color: 'var(--text-primary)' }}>{tx.description || '-'}</td>
                  <td className="px-4 py-3 text-xs text-start">
                    <span className="px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      {t(`transactions.type_${tx.type.toLowerCase().replace('personal_expense', 'expense').replace('received_from_person', 'received').replace('lent_to_person', 'lent').replace('borrowed_from_person', 'borrowed').replace('repaid_to_person', 'repaid')}`)}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-semibold text-end`} style={{
                    color: ['INCOME', 'RECEIVED_FROM_PERSON', 'BORROWED_FROM_PERSON'].includes(tx.type) ? 'var(--money)' : 'var(--text-primary)'
                  }}>
                    {['PERSONAL_EXPENSE', 'LENT_TO_PERSON', 'REPAID_TO_PERSON'].includes(tx.type) ? '-' : '+'}{Number(tx.amount).toFixed(2)} {tx.currency}
                  </td>
                  <td className="px-4 py-3 text-end">
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
