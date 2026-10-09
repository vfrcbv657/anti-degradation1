import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onStartTimer: (minutes: number) => void;
}

const ACTIONS = [
  { id: 'study', label: 'Учёба 10 мин' },
  { id: 'work', label: 'Работа 10 мин' },
  { id: 'clean', label: 'Уборка 10 мин' },
  { id: 'walk', label: 'Прогулка 10 мин' },
];

export function AntiDegradationMode({ onClose, onStartTimer }: Props) {
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);

  return (
    <div className="timer-screen">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold">Стоп.</h1>
          <p className="text-muted mt-3 text-lg leading-relaxed">
            Не нужно исправлять всю жизнь.<br />
            Нужно исправить следующие 10 минут.
          </p>
        </div>

        <div className="space-y-4 text-left">
          <div className={`card flex items-center justify-between ${step1 ? 'opacity-50' : ''}`}>
            <div>
              <p className="font-medium">1. Встань</p>
              <p className="text-sm text-muted">Отложи телефон и встань с кровати.</p>
            </div>
            <button
              className={`btn-primary px-4 py-2 text-sm ${step1 ? 'bg-primary/50' : ''}`}
              onClick={() => setStep1(true)}
              disabled={step1}
            >
              {step1 ? '✓' : 'Сделал'}
            </button>
          </div>

          <div className={`card flex items-center justify-between ${step2 ? 'opacity-50' : ''}`}>
            <div>
              <p className="font-medium">2. Вода</p>
              <p className="text-sm text-muted">Выпей стакан воды.</p>
            </div>
            <button
              className={`btn-primary px-4 py-2 text-sm ${step2 ? 'bg-primary/50' : ''}`}
              onClick={() => setStep2(true)}
              disabled={step2}
            >
              {step2 ? '✓' : 'Сделал'}
            </button>
          </div>

          <div className="card space-y-3">
            <p className="font-medium">3. 10 минут</p>
            <p className="text-sm text-muted">Выбери одно действие:</p>
            <div className="grid grid-cols-2 gap-2">
              {ACTIONS.map(a => (
                <button
                  key={a.id}
                  className="btn-ghost text-sm py-3"
                  onClick={() => onStartTimer(10)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
