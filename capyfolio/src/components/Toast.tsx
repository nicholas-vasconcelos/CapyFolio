import { CheckCircle2, X } from 'lucide-react';

export function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white text-ink px-4 py-3.5 rounded-xl border border-line shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2 cursor-pointer" type="button">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
