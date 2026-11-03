import { useTranslation } from 'react-i18next';
import MoneyDashboard from '../features/money/MoneyDashboard';

export default function DashboardPage() {
  const { i18n } = useTranslation();
  const ar = i18n.language === 'ar';
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">{ar ? 'نظرة عامة' : 'Your overview'}</h1>
        <p className="page-subtitle mt-2">{ar ? 'فلوسك في صورة واحدة واضحة.' : 'A clear look at the money that matters right now.'}</p>
      </div>
      <MoneyDashboard />
    </div>
  );
}
