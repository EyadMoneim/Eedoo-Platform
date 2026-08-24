import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
      
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          What can I help you with?
        </h1>
        <p className="text-zinc-500 max-w-lg mx-auto">
          Welcome to Edoo. I am your intelligent control layer.
        </p>
      </div>

      {/* Placeholder Chat Input */}
      <div className="w-full max-w-2xl">
        <div className="relative flex items-center w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden px-4 py-3">
          <input
            type="text"
            placeholder="Ask Edoo anything..."
            className="w-full bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            disabled
          />
          <div className="ml-2 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-not-allowed opacity-50">
            ↑
          </div>
        </div>
      </div>

      {/* App Grid Placholders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl pt-8">
        {/* Active e-Money Card */}
        <Link 
          to="/app/money"
          className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">EGP</span>
          </div>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">e-Money</span>
        </Link>
        
        {/* Disabled Cards */}
        {['e-Tasks', 'e-Reminders', 'e-Notes'].map((app) => (
          <div 
            key={app}
            className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col items-center justify-center gap-2 opacity-60 grayscale cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-2"></div>
            <span className="text-sm font-medium">{app}</span>
          </div>
        ))}
      </div>
      
    </div>
  );
}
