import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in">
      <div className={`card w-full ${sizes[size]} max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-2xl`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white/95 px-5 py-4 backdrop-blur">
          <h3 className="font-display text-lg font-bold text-ink-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'gold' | 'red' | 'blue';
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-ink-100 text-ink-700',
    green: 'bg-emerald-50 text-emerald-700',
    gold: 'bg-gold-50 text-gold-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export function Avatar({ name, url, size = 40 }: { name: string; url?: string | null; size?: number }) {
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (url) {
    return <img src={url} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover" />;
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="flex items-center justify-center rounded-full bg-gradient-ink font-semibold text-white"
    >
      {initials || '?'}
    </div>
  );
}

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#d4a73b' : '#e9edf3'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-500">{icon}</div>
      <div>
        <p className="font-display font-semibold text-ink-900">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
    </svg>
  );
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-fade-up">
      <div className="flex items-center gap-3 rounded-xl bg-ink-900 px-4 py-3 text-sm text-white shadow-card">
        <span>{message}</span>
        <button onClick={onClose} className="text-white/70 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function formatBDT(amount: number): string {
  const bn = localStorage.getItem('amar_ain_language') === 'bn';
  return new Intl.NumberFormat(bn ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso: string): string {
  const bn = localStorage.getItem('amar_ain_language') === 'bn';
  return new Date(iso).toLocaleDateString(bn ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const bn = localStorage.getItem('amar_ain_language') === 'bn';
  return new Date(iso).toLocaleString(bn ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const bn = localStorage.getItem('amar_ain_language') === 'bn';
  if (mins < 1) return bn ? 'এইমাত্র' : 'just now';
  if (mins < 60) return bn ? `${new Intl.NumberFormat('bn-BD').format(mins)} মিনিট আগে` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return bn ? `${new Intl.NumberFormat('bn-BD').format(hrs)} ঘণ্টা আগে` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return bn ? `${new Intl.NumberFormat('bn-BD').format(days)} দিন আগে` : `${days}d ago`;
  return formatDate(iso);
}
