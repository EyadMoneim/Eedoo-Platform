import { useState } from 'react';
import { usePeople, useCreatePerson, useDeletePerson } from '../../hooks/useMoneyQueries';

export default function PeoplePage() {
  const { data: people, isLoading } = usePeople();
  const createMutation = useCreatePerson();
  const deleteMutation = useDeletePerson();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  if (isLoading) return <div className="text-zinc-500 dark:text-zinc-400">Loading people...</div>;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName });
    setNewName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">People</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          {isAdding ? 'Cancel' : 'Add Person'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Name</label>
            <input 
              type="text" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
              autoFocus
              placeholder="e.g. Mohamed"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)} 
              className="flex-1 sm:flex-none px-4 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!people || people.length === 0 ? (
        <div className="text-center py-12 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-400">Add someone you regularly share expenses with.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map(person => (
            <div key={person.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{person.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">View details to see balance.</p>
              </div>
              <div className="mt-4 flex gap-3 justify-end border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <button 
                  onClick={() => {
                    if (confirm(`Delete ${person.name}?`)) {
                      deleteMutation.mutate(person.id);
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                >
                  Delete
                </button>
                {/* Future: Link to person detail page */}
                <button className="text-xs text-zinc-900 dark:text-zinc-100 font-medium hover:underline">
                  View Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
