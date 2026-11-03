import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserRound, Palette } from 'lucide-react';

export default function GeneralSettingsPage() {
  const { i18n } = useTranslation();
  const ar = i18n.language === 'ar';
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-semibold tracking-tight">{ar ? 'الإعدادات العامة' : 'General settings'}</h2><p className="page-subtitle mt-2">{ar ? 'إدارة حسابك وتفضيلاتك من هنا.' : 'Manage your account and preferences in one place.'}</p></div>
      <div className="panel divide-y divide-[var(--border)]">
        <Link to="/app/settings/profile" className="flex items-center gap-4 p-5 hover:bg-[var(--surface-2)] transition-colors rounded-t-[18px]"><UserRound size={20} className="text-[var(--accent)]" aria-hidden="true" /><span><strong className="block font-semibold">{ar ? 'الملف الشخصي' : 'Profile'}</strong><span className="text-sm text-[var(--text-muted)]">{ar ? 'اسمك وصورتك وبيانات حسابك' : 'Your name, photo, and account details'}</span></span></Link>
        <Link to="/app/settings/appearance" className="flex items-center gap-4 p-5 hover:bg-[var(--surface-2)] transition-colors rounded-b-[18px]"><Palette size={20} className="text-[var(--accent)]" aria-hidden="true" /><span><strong className="block font-semibold">{ar ? 'المظهر' : 'Appearance'}</strong><span className="text-sm text-[var(--text-muted)]">{ar ? 'شوف الشكل الحالي للتطبيق' : 'See the current look of your space'}</span></span></Link>
      </div>
    </div>
  );
}
