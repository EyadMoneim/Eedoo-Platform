import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t, i18n } = useTranslation();

  const services = [
    { key: 'money', label: t('sidebar.money'), color: 'var(--money)', icon: 'EGP', path: '/app/money', disabled: false },
    { key: 'tasks', label: t('sidebar.tasks'), color: 'var(--tasks)', icon: null, path: null, disabled: true },
    { key: 'reminders', label: t('sidebar.reminders'), color: 'var(--reminders)', icon: null, path: null, disabled: true },
    { key: 'notes', label: t('sidebar.notes'), color: 'var(--notes)', icon: null, path: null, disabled: true },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
      
      <div className="space-y-4">
        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-wide"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('home.title')}
        </h1>
        <p
          className="max-w-lg mx-auto font-extralight text-base"
          style={{ color: 'var(--text-muted)' }}
        >
          {t('home.subtitle')}
        </p>
      </div>

      {/* AI Chat Input */}
      <div className="w-full max-w-2xl">
        <div 
          className="relative flex items-center w-full rounded-2xl overflow-hidden px-5 py-4 transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border-soft)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-soft)';
          }}
        >
          <input
            type="text"
            placeholder={t('home.placeholder')}
            className="w-full bg-transparent outline-none font-light text-sm"
            style={{ color: 'var(--text-primary)' }}
            disabled
          />
          <div 
            className={cn("w-8 h-8 rounded-full flex items-center justify-center cursor-not-allowed shrink-0", i18n.language === 'ar' ? 'mr-3' : 'ml-3')}
            style={{ backgroundColor: 'var(--accent-soft)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L12 20M12 4L6 10M12 4L18 10" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl pt-8">
        {services.map((service) => {
          const CardContent = (
            <>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `color-mix(in srgb, ${service.color} 15%, transparent)` }}
              >
                {service.icon ? (
                  <span className="text-sm font-extrabold" style={{ color: service.color }}>
                    {service.icon}
                  </span>
                ) : (
                  <div 
                    className="w-6 h-6 rounded-full opacity-40"
                    style={{ backgroundColor: service.color }}
                  />
                )}
              </div>
              <span className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>
                {service.label}
              </span>
            </>
          );

          if (service.disabled || !service.path) {
            return (
              <div 
                key={service.key}
                className="p-6 rounded-xl flex flex-col items-center justify-center gap-1 opacity-50 cursor-not-allowed"
                style={{ 
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                {CardContent}
              </div>
            );
          }

          return (
            <Link 
              key={service.key}
              to={service.path!}
              className="p-6 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer group transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border-soft)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${service.color} 30%, var(--border))`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-soft)';
              }}
            >
              {CardContent}
            </Link>
          );
        })}
      </div>
      
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
