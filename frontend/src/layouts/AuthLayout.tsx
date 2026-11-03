import { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EMLogo from '../assets/EM.svg';

export default function AuthLayout() {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  return (
    <div className="auth-shell" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <aside className="auth-story">
        <Link to="/" className="brand"><img src={EMLogo} alt="" className="brand-mark" />{i18n.language === 'ar' ? 'إيدو' : 'eedoo'}</Link>
        <div>
          <h2 className="display-face">{i18n.language === 'ar' ? 'حياتك أوضح في مكان واحد.' : 'A clearer view of everyday life.'}</h2>
          <p className="mt-6">{i18n.language === 'ar' ? 'فلوسك وخططك وتفاصيل يومك، كلها في مكان هادي.' : 'Your money, plans, and details, gathered in one calm place.'}</p>
        </div>
        <p style={{ fontSize: '.85rem' }}>{i18n.language === 'ar' ? 'مساحتك عشان تبقى متحكم في يومك.' : 'Your space to stay in control.'}</p>
      </aside>
      <main className="auth-form-side">
        <div className="auth-form-wrap">
          <Link to="/" className="brand mb-10 lg:hidden"><img src={EMLogo} alt="" className="brand-mark" />{i18n.language === 'ar' ? 'إيدو' : 'eedoo'}</Link>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
