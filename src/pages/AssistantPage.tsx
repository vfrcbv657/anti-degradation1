import { useState } from 'react';
import { useApp } from '../store/AppContext';

interface Props {
  onAnti: () => void;
  onStartTimer: (m: number) => void;
}

type Action = {
  label: string;
  timer?: number | null;
  anti?: boolean;
  plan?: boolean;
};

type Scenario = {
  id: string;
  title: string;
  response: string;
  actions: Action[];
};

const SCENARIOS: Scenario[] = [
  {
    id: 'lazy',
    title: 'Мне лень',
    response: 'Не нужно хотеть. Просто начни с 5 минут. Выбери самое лёгкое действие.',
    actions: [
      { label: '5 минут фокуса', timer: 5 },
      { label: 'Встать и попить воды', timer: null },
    ],
  },
  {
    id: 'procrastinate',
    title: 'Я прокрастинирую',
    response: 'Стоп. Не исправляй всю жизнь — исправь следующие 10 минут.',
    actions: [
      { label: 'Запустить антидеградацию', anti: true },
      { label: '10 минут работы', timer: 10 },
    ],
  },
  {
    id: 'overwhelmed',
    title: 'Я перегружен',
    response: 'Давай снизим план до минимума. Сегодня достаточно 1–2 маленьких действий.',
    actions: [
      { label: 'Сформировать облегчённый день', plan: true },
      { label: 'Только минимум', timer: 10 },
    ],
  },
  {
    id: 'failed',
    title: 'Я всё провалил',
    response: 'Один плохой день ничего не решает. Вернись к минимуму.',
    actions: [
      { label: 'Антидеградация', anti: true },
      { label: 'Одна маленькая задача', timer: 10 },
    ],
  },
  {
    id: 'confused',
    title: 'Я не понимаю, что делать',
    response: 'Следующее действие — самое близкое к твоей главной цели. Начни с 15 минут.',
    actions: [
      { label: '15 минут по главной цели', timer: 15 },
      { label: 'Посмотреть цели', timer: null },
    ],
  },
  {
    id: 'sad',
    title: 'Мне грустно',
    response: 'Это нормально. Не нужно «собираться». Можно: выйти на улицу, написать человеку, сделать одно крошечное действие или просто отдохнуть без телефона.',
    actions: [
      { label: '10 минут прогулки', timer: 10 },
      { label: 'Отдохнуть без телефона', timer: null },
    ],
  },
];

export function AssistantPage({ onAnti, onStartTimer }: Props) {
  const { generateDayPlan } = useApp();
  const [active, setActive] = useState<string | null>(null);
  const scenario = SCENARIOS.find(s => s.id === active);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">🧠 Помощник</h1>
      <p className="text-sm text-muted">
        Не токсичная мотивация. Спокойные следующие шаги.
      </p>

      {!scenario ? (
        <div className="space-y-2">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              className="card w-full text-left hover:bg-card-hover transition-colors"
              onClick={() => setActive(s.id)}
            >
              <p className="font-medium">{s.title}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button className="text-sm text-muted" onClick={() => setActive(null)}>
            ← Назад
          </button>
          <div className="card space-y-4">
            <p className="text-lg leading-relaxed">{scenario.response}</p>
            <div className="space-y-2">
              {scenario.actions.map((a, i) => (
                <button
                  key={i}
                  className="btn-primary w-full"
                  onClick={() => {
                    if (a.anti) onAnti();
                    else if (a.plan) generateDayPlan();
                    else if (typeof a.timer === 'number') onStartTimer(a.timer);
                    setActive(null);
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted text-center">
            Следующее действие — 15 минут. Не нужно хотеть. Просто начни.
          </p>
        </div>
      )}
    </div>
  );
}
