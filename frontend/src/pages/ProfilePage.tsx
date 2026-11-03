import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Mail, User, Save, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { i18n } = useTranslation();
  
  const [firstName, setFirstName] = useState(() => {
    if (!user?.name) return '';
    return user.name.split(' ')[0] || '';
  });
  
  const [lastName, setLastName] = useState(() => {
    if (!user?.name) return '';
    const parts = user.name.split(' ');
    return parts.slice(1).join(' ') || '';
  });
  
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [imgError, setImgError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);
    setSaveError(false);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateProfile({ 
        name: fullName || undefined, 
        avatar_url: avatarUrl || undefined 
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      setSaveError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isArabic = i18n.language === 'ar';

  return (
    <div className="max-w-3xl mx-auto w-full p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {isArabic ? 'ملفك الشخصي' : 'Your Profile'}
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          {isArabic ? 'تقدر تعدل بياناتك وتشوف تفاصيل حسابك من هنا.' : 'Manage your personal information and account details here.'}
        </p>
      </div>

      <div 
        className="rounded-[24px] p-6 lg:p-10 shadow-sm"
        style={{ 
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--border-soft)'
        }}
      >
        {saveError && <div className="error-panel mb-6" role="alert">{isArabic ? 'تعذر حفظ التغييرات. حاول مرة أخرى.' : 'Could not save changes. Please try again.'}</div>}
        {/* Profile Picture Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 pb-10" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="relative group">
            <div 
              className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 shadow-sm"
              style={{ 
                backgroundColor: 'var(--surface-3)',
                border: '4px solid var(--surface-1)',
                boxShadow: '0 0 0 1px var(--border)'
              }}
            >
              {avatarUrl && !imgError ? (
                <img 
                  src={avatarUrl} 
                  alt={user?.name || "Profile"} 
                  className="w-full h-full object-cover" 
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-4xl font-extrabold" style={{ color: 'var(--accent)' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {isArabic ? 'رابط الصورة (Avatar URL)' : 'Profile Picture URL'}
              </label>
              <input 
                type="text" 
                value={avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  setImgError(false);
                }}
                placeholder={isArabic ? 'حط رابط الصورة هنا' : 'Enter image URL...'}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all duration-200"
                style={{ 
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                {isArabic ? 'عشان تظهر صورتك بوضوح، الأفضل تحط رابط لصورة مربعة.' : 'For best results, use a square image URL.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {isArabic ? 'الاسم الأول' : 'First Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                  <User className="w-[18px] h-[18px]" strokeWidth={2} />
                </div>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    '--tw-ring-color': 'var(--accent)'
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {isArabic ? 'الاسم الأخير' : 'Last Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                  <User className="w-[18px] h-[18px]" strokeWidth={2} />
                </div>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    '--tw-ring-color': 'var(--accent)'
                  } as React.CSSProperties}
                />
              </div>
            </div>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {isArabic ? 'الإيميل (متقدرش تعدله)' : 'Email (Read Only)'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                <Mail className="w-[18px] h-[18px]" strokeWidth={2} />
              </div>
              <input 
                type="email" 
                value={user?.email || ''}
                readOnly
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium cursor-not-allowed opacity-80"
                style={{ 
                  backgroundColor: 'var(--surface-3)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className={cn(
                "button-primary",
                isSubmitting ? "opacity-70 cursor-wait" : "hover:-translate-y-0.5"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saveSuccess ? (
                <Save className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saveSuccess 
                ? (isArabic ? 'تم الحفظ!' : 'Saved!') 
                : (isArabic ? 'حفظ التعديلات' : 'Save Changes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
