import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePeople, useCreatePerson, useDeletePerson } from '../../hooks/useMoneyQueries';

export default function PeoplePage() {
  const { data: people, isLoading } = usePeople();
  const createMutation = useCreatePerson();
  const deleteMutation = useDeletePerson();
  const { t } = useTranslation();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  if (isLoading) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName });
    setNewName('');
    setIsAdding(false);
  };

  const inputStyle = {
    backgroundColor: 'var(--surface-2)',
    border: '1px solid var(--border-soft)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{t('people.title')}</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl text-sm font-light transition-all duration-300"
          style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
        >
          {isAdding ? t('people.cancel') : t('people.add_person')}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-end" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
          <div className="flex-1 w-full">
            <label className="block text-xs font-extralight mb-1" style={{ color: 'var(--text-muted)' }}>{t('people.name')}</label>
            <input 
              type="text" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              className="w-full px-3 py-2 rounded-lg text-sm font-light"
              style={inputStyle}
              autoFocus
              placeholder={t('people.name_placeholder')}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-light transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--money)', color: '#ffffff' }}
            >
              {createMutation.isPending ? '...' : t('people.save')}
            </button>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)} 
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-light transition-colors"
              style={{ backgroundColor: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              {t('people.cancel')}
            </button>
          </div>
        </form>
      )}

      {!people || people.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)', color: 'var(--text-muted)' }}>
          <p>{t('people.no_people')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map(person => (
            <div key={person.id} className="p-5 rounded-xl flex flex-col justify-between transition-colors" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{person.name}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('people.view_details_hint')}</p>
              </div>
              <div className="mt-4 flex gap-3 justify-end pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
                <button 
                  onClick={() => {
                    if (confirm(`Delete ${person.name}?`)) {
                      deleteMutation.mutate(person.id);
                    }
                  }}
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#F87171' }}
                >
                  {t('people.delete')}
                </button>
                <button className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {t('people.view_details')} &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
