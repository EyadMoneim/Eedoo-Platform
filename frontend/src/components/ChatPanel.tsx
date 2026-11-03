import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { chatService, type ChatLine, type ChatResult } from '../services/chatService';

type VisibleLine = ChatLine & { result?: ChatResult };

export default function ChatPanel() {
  const { i18n } = useTranslation();
  const ar = i18n.language === 'ar';
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [lines, setLines] = useState<VisibleLine[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const { data: reminders = [] } = useQuery({ queryKey: ['reminders'], queryFn: chatService.reminders });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = message.trim();
    if (!text || sending) return;
    setSending(true);
    setError('');
    setMessage('');
    const history = lines.slice(-4).map(({ role, content }) => ({ role, content }));
    setLines(current => [...current, { role: 'user', content: text }]);
    try {
      const result = await chatService.send(text, history);
      setLines(current => [...current, { role: 'assistant', content: result.reply, result }]);
      if (result.action === 'reminder') queryClient.invalidateQueries({ queryKey: ['reminders'] });
      if (['expense', 'income', 'lent', 'received', 'borrowed', 'repaid'].includes(result.action)) {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['moneySummary'] });
        queryClient.invalidateQueries({ queryKey: ['people'] });
        queryClient.invalidateQueries({ queryKey: ['personSummary'] });
      }
    } catch (requestError) {
      setMessage(text);
      setLines(current => current.slice(0, -1));
      const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined;
      setError(status === 429
        ? (ar ? 'وصلت للحد المجاني من Gemini. جرّب بعد شوية.' : 'Gemini free-tier limit reached. Try again later.')
        : status === 504
          ? (ar ? 'Gemini اتأخر في الرد. جرّب تاني.' : 'Gemini took too long. Please try again.')
          : status === 503
            ? (ar ? 'إعدادات Gemini أو الإيميل ناقصة. راجع إعدادات السيرفر.' : 'Gemini or email settings are missing. Check the server configuration.')
            : (ar ? 'حصلت مشكلة. اتأكد من الحركات أو التذكيرات قبل ما تعيد الإرسال.' : 'Something went wrong. Check transactions or reminders before retrying.'));
    } finally {
      setSending(false);
    }
  }

  async function removeReminder(id: string) {
    setDeleting(id);
    setError('');
    try {
      await chatService.deleteReminder(id);
      await queryClient.invalidateQueries({ queryKey: ['reminders'] });
    } catch {
      setError(ar ? 'معرفتش ألغي التذكير. جرب تاني.' : 'Could not cancel the reminder. Please try again.');
    } finally {
      setDeleting(null);
    }
  }

  const formatDate = (value: string) => new Intl.DateTimeFormat(ar ? 'ar-EG' : 'en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo',
  }).format(new Date(value));

  return (
    <section className="panel p-5 md:p-7" aria-labelledby="eedoo-chat-title">
      <div className="mb-5">
        <h2 id="eedoo-chat-title" className="text-xl font-semibold">{ar ? 'قول لـ Eedoo' : 'Tell Eedoo'}</h2>
        <p className="text-sm text-[var(--text-muted)]">{ar ? 'اكتب بطريقتك: «دفعت ٥٠٠ جنيه في أمازون» أو «سلفت بيا ٢٠٠ جنيه».' : 'Try “I spent 500 EGP at Amazon” or “I lent Bia 200 EGP”.'}</p>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto" role="log" aria-live="polite" aria-label={ar ? 'المحادثة' : 'Conversation'}>
        {lines.map((line, index) => (
          <div key={index} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${line.role === 'user' ? 'ms-auto bg-[var(--accent-soft)]' : 'me-auto bg-[var(--surface-3)]'}`}>
            {line.content}
            {line.result?.record_id && ['expense', 'income', 'lent', 'received', 'borrowed', 'repaid'].includes(line.result.action) && (
              <Link className="mt-2 block text-[var(--accent)] underline" to="/app/money/transactions">{ar ? 'شوف الحركات' : 'View transactions'}</Link>
            )}
          </div>
        ))}
        {sending && <p className="text-sm text-[var(--text-muted)]" role="status">{ar ? 'بفهم رسالتك...' : 'Reading your message...'}</p>}
      </div>

      {error && <p className="inline-error" role="alert">{error}</p>}
      <form className="mt-5 flex gap-2" onSubmit={submit}>
        <label className="sr-only" htmlFor="eedoo-message">{ar ? 'اكتب رسالتك' : 'Your message'}</label>
        <input id="eedoo-message" className="field min-w-0 flex-1" value={message} onChange={event => setMessage(event.target.value)} maxLength={500} placeholder={ar ? 'قول اللي عايز تسجله في فلوسك...' : 'What would you like to record in Money?'} />
        <button className="button-primary" type="submit" disabled={sending || !message.trim()} aria-label={ar ? 'إرسال' : 'Send'}><Send size={18} aria-hidden="true" /><span className="hidden sm:inline">{ar ? 'ابعت' : 'Send'}</span></button>
      </form>

      {reminders.length > 0 && (
        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <h3 className="mb-3 font-semibold">{ar ? 'التذكيرات الجاية' : 'Upcoming reminders'}</h3>
          <ul className="space-y-2">
            {reminders.map(reminder => (
              <li key={reminder.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm">
                <span className="min-w-0"><span className="block truncate">{reminder.title}</span><span className="text-[var(--text-muted)]">{ar ? 'إيميل: ' : 'Email: '}{formatDate(reminder.remind_at)}</span></span>
                <button type="button" className="icon-button shrink-0" disabled={deleting === reminder.id} onClick={() => removeReminder(reminder.id)} aria-label={ar ? `إلغاء تذكير ${reminder.title}` : `Cancel reminder ${reminder.title}`}><Trash2 size={17} aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
