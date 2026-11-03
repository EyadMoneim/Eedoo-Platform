import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Wallet, ListTodo, Bell, ReceiptText, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChatPanel from '../components/ChatPanel';

export default function HomePage() {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const ar = i18n.language === 'ar';
  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="space-y-10">
      <section className="home-hero relative overflow-hidden rounded-[24px] border border-[#554369] bg-[#241d30] px-6 py-10 md:px-12 md:py-14">
        <div className="absolute -end-16 -bottom-28 h-72 w-72 rounded-full border border-[#af83ff33] shadow-[0_0_0_55px_#af83ff0a,0_0_0_110px_#af83ff08]" aria-hidden="true" />
        <div className="relative max-w-[680px]">
          <h1 className="display-face text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1]">
            {ar ? `كل حاجة في مكانها${firstName ? ` يا ${firstName}` : ''}.` : `Everything in its place${firstName ? `, ${firstName}` : ''}.`}
          </h1>
          <p className="mt-5 max-w-xl text-[var(--text-secondary)] text-base md:text-lg">
            {ar ? 'تابع فلوسك وابدأ يومك من مكان واحد واضح وسهل.' : 'Keep track of your money and move through your day with a little more clarity.'}
          </p>
          <Link to="/app/money" className="button-primary mt-8">
            {ar ? 'افتح فلوسك' : 'Open your money'} <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <ChatPanel />

      <section aria-labelledby="home-spaces">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 id="home-spaces" className="text-xl md:text-2xl font-semibold tracking-tight">{ar ? 'مساحاتك' : 'Your spaces'}</h2>
            <p className="page-subtitle mt-1 text-sm">{ar ? 'ابدأ بالحاجة اللي محتاجها دلوقتي.' : 'Pick up where you need to.'}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/app/money" className="panel group p-6 min-h-52 flex flex-col justify-between hover:border-[#755d90] transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] grid place-items-center"><Wallet size={21} aria-hidden="true" /></div>
            <div>
              <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{t('sidebar.money')}</h3><ArrowUpRight size={18} className="text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" /></div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{ar ? 'مصروفاتك، دخلك، والفلوس بينك وبين الناس.' : 'Income, spending, and what you owe or are owed.'}</p>
            </div>
          </Link>
          <div className="panel p-6 min-h-52 flex flex-col justify-between opacity-75">
            <div className="w-11 h-11 rounded-xl bg-[var(--surface-3)] text-[var(--tasks)] grid place-items-center"><ListTodo size={21} aria-hidden="true" /></div>
            <div><h3 className="text-lg font-semibold">{t('sidebar.tasks')}</h3><p className="mt-1 text-sm text-[var(--text-muted)]">{ar ? 'قريبًا: مهامك اليومية في مكان واحد.' : 'Coming soon: a simple home for your daily tasks.'}</p></div>
          </div>
          <div className="panel p-6 min-h-52 flex flex-col justify-between opacity-75">
            <div className="w-11 h-11 rounded-xl bg-[var(--surface-3)] text-[var(--reminders)] grid place-items-center"><Bell size={21} aria-hidden="true" /></div>
            <div><h3 className="text-lg font-semibold">{t('sidebar.reminders')}</h3><p className="mt-1 text-sm text-[var(--text-muted)]">{ar ? 'قريبًا: مواعيدك المهمة من غير زحمة.' : 'Coming soon: the important things, right on time.'}</p></div>
          </div>
        </div>
      </section>

      <section className="panel p-6 md:p-8" aria-labelledby="quick-start">
        <h2 id="quick-start" className="text-xl font-semibold">{ar ? 'ابدأ بسرعة' : 'Quick start'}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/app/money/transactions" className="button-secondary"><ReceiptText size={17} aria-hidden="true" />{ar ? 'الحركات' : 'Transactions'}</Link>
          <Link to="/app/money/people" className="button-secondary"><Users size={17} aria-hidden="true" />{ar ? 'الناس' : 'People'}</Link>
        </div>
      </section>
    </div>
  );
}
