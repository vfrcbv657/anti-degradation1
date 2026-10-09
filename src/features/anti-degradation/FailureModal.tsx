import { useState } from 'react';
import { X } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { useApp } from '../../store/AppContext';

interface Props {
  onClose: () => void;
  onStartTimer: (m: number) => void;
}

const REASONS = [
  'TikTok / Reels / Shorts',
  'YouTube',
  'Игры',
  'Сон',
  'Социальные сети',
  'Проблемы с человеком',
  'Усталость',
  'Тревога',
  'Просто не хотелось',
  'Другое',
];

const RECOVERIES = [
  { label: '5 минут работы', action: () => 5 },
  { label: '10 минут прогулки', action: () => 10 },
  { label: 'Умыться', action: null },
  { label: 'Убрать комнату', action: () => 10 },
  { label: 'Вернуться к задаче', action: () => 15 },
  { label: 'Просто отдохнуть без телефона', action: null },
];

export function FailureModal({ onClose, onStartTimer }: Props) {
  const { dispatch } = useApp();
  const [reason, setReason] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selectReason = (r: string) => {
    setReason(r);
    dispatch({
      type: 'ADD_FAILURE',
      payload: {
        id: uuid(),
        date: format(new Date(), 'yyyy-MM-dd'),
        reason: r,
        timestamp: new Date().toISOString(),
      },
    });
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-2xl">Один шаг — уже возвращение.</p>
          <button className="btn-primary w-full" onClick={onClose}>
            К плану
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-lg mx-auto px-5 pt-12 pb-8 space-y-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 2rem)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted">
          <X size={24} />
        </button>

        <div>
          <h1 className="text-2xl font-semibold">Ничего страшного.</h1>
          <p className="text-muted mt-2">
            Срыв — это событие, а не новая личность.
          </p>
        </div>

        {!reason ? (
          <>
            <p className="font-medium">Что произошло?</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => selectReason(r)}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm hover:border-primary transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="font-medium">Что тебе сейчас проще всего сделать?</p>
            <div className="space-y-2">
              {RECOVERIES.map(r => (
                <button
                  key={r.label}
                  className="btn-ghost w-full text-left"
                  onClick={() => {
                    if (r.action) {
                      onStartTimer(r.action());
                      onClose();
                    } else {
                      setDone(true);
                    }
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
