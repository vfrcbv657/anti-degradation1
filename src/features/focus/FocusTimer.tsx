import { useState, useEffect, useRef } from 'react';
import { X, Pause, Play } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { useApp } from '../../store/AppContext';

interface Props {
  minutes: number;
  taskId?: string;
  onClose: () => void;
}

export function FocusTimer({ minutes, taskId, onClose }: Props) {
  const { dispatch } = useApp();
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(new Date().toISOString());

  useEffect(() => {
    if (!running || finished) return;
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(id);
          setFinished(true);
          setRunning(false);
          // Save session
          dispatch({
            type: 'ADD_FOCUS',
            payload: {
              id: uuid(),
              taskId,
              durationMinutes: minutes,
              actualSeconds: totalSeconds,
              date: format(new Date(), 'yyyy-MM-dd'),
              startedAt: startedAt.current,
              endedAt: new Date().toISOString(),
              completed: true,
            },
          });
          if (taskId) {
            dispatch({ type: 'SET_TASK_STATUS', payload: { id: taskId, status: 'min_completed' } });
            dispatch({ type: 'UPDATE_STREAK' });
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, finished, minutes, taskId, totalSeconds, dispatch]);

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const ss = (secondsLeft % 60).toString().padStart(2, '0');

  if (finished) {
    return (
      <div className="timer-screen">
        <div className="text-center space-y-6 max-w-sm">
          <p className="text-5xl">✓</p>
          <h2 className="text-2xl font-semibold">Готово</h2>
          <p className="text-muted text-lg">
            Ты сделал больше, чем сделал бы, продолжая лежать.
          </p>
          <div className="space-y-3 pt-4">
            <button className="btn-primary w-full" onClick={() => {
              setSecondsLeft(totalSeconds);
              setFinished(false);
              setRunning(true);
              startedAt.current = new Date().toISOString();
            }}>
              Продолжить
            </button>
            <button className="btn-ghost w-full" onClick={onClose}>
              Вернуться к плану
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timer-screen">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        <X size={24} />
      </button>

      <div className="text-center space-y-10">
        <p className="text-muted text-sm uppercase tracking-widest">Фокус</p>
        <p className="text-7xl font-light tabular-nums tracking-tight">
          {mm}:{ss}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center"
            onClick={() => setRunning(r => !r)}
          >
            {running ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-sm"
            onClick={onClose}
          >
            Стоп
          </button>
        </div>
      </div>
    </div>
  );
}
