import { useTranslation } from 'react-i18next';

export default function AppearanceSettingsPage() {
  const { i18n } = useTranslation();
  const ar = i18n.language === 'ar';
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-semibold tracking-tight">{ar ? 'المظهر' : 'Appearance'}</h2><p className="page-subtitle mt-2">{ar ? 'تصميم هادي ومريح للتركيز.' : 'A calm, focused look for everyday use.'}</p></div>
      <div className="panel p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-[#241d31] border border-[#544268] grid place-items-center"><div className="h-5 w-5 rounded-full bg-[var(--accent)]" /></div>
          <div><h3 className="font-semibold">{ar ? 'الليلي البنفسجي' : 'Midnight violet'}</h3><p className="text-sm text-[var(--text-muted)]">{ar ? 'المظهر الحالي' : 'Current appearance'}</p></div>
        </div>
        <p className="mt-6 pt-5 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">{ar ? 'المزيد من خيارات المظهر قريبًا.' : 'More appearance options are coming later.'}</p>
      </div>
    </div>
  );
}
