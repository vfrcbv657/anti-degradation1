import { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../../store/AppContext';

interface Props {
  onClose: () => void;
}

export function EveningReview({ onClose }: Props) {
  const { getTodayProgress, state, dispatch } = useApp();
  const { done, total } = getTodayProgress();
  const focusMin = state.focusSessions
    .filter(s => s.date === format(new Date(), 'yyyy-MM-dd'))
    .reduce((a, s) => a + Math.round(s.actualSeconds / 60), 0);
  const minDone = state.tasks
    .filter(t => t.date === format(new Date(), 'yyyy-MM-dd'))
    .some(t => t.status === 'min_completed' || t.status === 'completed');

  const [wentWell, setWentWell] = useState('');
  const [blocked, setBlocked] = useState('');
  const [mood, setMood] = useState(3);
  const [rating, setRating] = useState(3);
  const [tomorrow, setTomorrow] = useState('');

  const save = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    dispatch({
      type: 'ADD_REVIEW',
      payload: {
        date: today,
        whatWentWell: wentWell,
        whatBlocked: blocked,
        mood,
        dayRating: rating,
        energy: state.currentEnergy ?? 3,
        tomorrowMain: tomorrow,
        tasksCompleted: done,
        tasksTotal: total,
        focusMinutes: focusMin,
        minCompleted: minDone,
      },
    });
    dispatch({
      type: 'ADD_MOOD',
      payload: { date: today, mood, energy: state.currentEnergy ?? 3 },
    });
    dispatch({ type: 'UPDATE_STREAK' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div
        className="max-w-lg mx-auto px-5 pb-8 space-y-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 2rem)' }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Как прошёл день?</h1>
          <button onClick={onClose} className="p-2 text-muted">
            <X size={24} />
          </button>
        </div>

        <div className="card grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-semibold">{done}/{total}</p>
            <p className="text-xs text-muted">Задачи</p>
          </div>
          <div>
            <p className="text-xl font-semibold">{focusMin}м</p>
            <p className="text-xs text-muted">Фокус</p>
          </div>
          <div>
            <p className="text-xl font-semibold">{minDone ? '✅' : '—'}</p>
            <p className="text-xs text-muted">Минимум</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-muted">Что сегодня получилось?</label>
          <textarea
            className="w-full mt-1 bg-card border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary min-h-[70px]"
            value={wentWell}
            onChange={e => setWentWell(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-muted">Что помешало?</label>
          <textarea
            className="w-full mt-1 bg-card border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary min-h-[70px]"
            value={blocked}
            onChange={e => setBlocked(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-muted">Настроение</label>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setMood(n)}
                className={`flex-1 py-3 rounded-xl border text-lg ${
                  mood === n ? 'bg-primary text-black border-primary' : 'border-border'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-muted">Оценка дня</label>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={`flex-1 py-3 rounded-xl border ${
                  rating === n ? 'bg-primary text-black border-primary' : 'border-border'
                }`}
              >
                {'⭐'.repeat(n)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-muted">Что главное сделать завтра?</label>
          <input
            className="w-full mt-1 bg-card border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary"
            value={tomorrow}
            onChange={e => setTomorrow(e.target.value)}
          />
        </div>

        <button className="btn-primary w-full" onClick={save}>
          Сохранить
        </button>
      </div>
    </div>
  );
}
