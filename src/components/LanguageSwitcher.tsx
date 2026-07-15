import { Languages } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="inline-flex items-center rounded-xl border border-ink-200 bg-white p-1 shadow-soft" data-no-translate>
      {!compact && <Languages size={15} className="mx-1.5 text-ink-500" />}
      <button onClick={() => setLanguage('en')} aria-label="Switch to English" className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${language === 'en' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'}`}>EN</button>
      <button onClick={() => setLanguage('bn')} aria-label="বাংলা ভাষায় পরিবর্তন করুন" className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${language === 'bn' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'}`}>বাংলা</button>
    </div>
  );
}
