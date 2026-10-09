import { useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, Sparkles } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useApp } from '../store/AppContext';
import { CATEGORY_LABELS, type Category, type Priority } from '../types';

interface Props {
  onStartTimer: (m: number, taskId?: string) => void;
}

export function PlanPage({ onStartTimer }: Props) {
  const { state, getTodayTasks, generateDayPlan, dispatch, completeTask, startTask } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [priority, setPriority] = useState<Priority>('min');
  const [minVersion, setMinVersion] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const tasks = getTodayTasks();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const addTask = () => {
    if (!title.trim()) return;
    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: uuid(),
        title: title.trim(),
        category,
        priority,
        fullVersion: title.trim(),
        minVersion: minVersion.trim() || `Минимум: ${title.trim()}`,
        status: 'not_started',
        date: today,
      },
    });
    setTitle('');
    setMinVersion('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">План</h1>

      {/* Week overview */}
      <div className="card space-y-3">
        <p className="text-sm text-muted">Эта неделя</p>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(d => {
            const ds = format(d, 'yyyy-MM-dd');
            const dayTasks = state.tasks.filter(t => t.date === ds);
            const done = dayTasks.filter(t => ['completed', 'min_completed'].includes(t.status)).length;
            const isToday = ds === today;
            return (
              <div
                key={ds}
                className={`text-center py-2 rounded-lg ${isToday ? 'bg-primary/20' : ''}`}
              >
                <p className="text-[10px] text-muted uppercase">
                  {format(d, 'EEEEEE', { locale: ru })}
                </p>
                <p className="text-sm font-medium">{format(d, 'd')}</p>
                <p className="text-[10px] text-primary">
                  {dayTasks.length ? `${done}/${dayTasks.length}` : '—'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rule of 3 */}
      <div className="card space-y-2">
        <p className="text-sm font-medium">Правило 3 главных дел</p>
        <div className="text-sm text-muted space-y-1">
          <p>🔥 Главное — 1 задача</p>
          <p>⚡ Важно — 2 задачи</p>
          <p>🧩 Минимум — 2–3 маленькие</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={() => setShowAdd(true)}>
          <Plus size={18} />
          Добавить
        </button>
        <button className="btn-ghost flex items-center justify-center gap-2" onClick={generateDayPlan}>
          <Sparkles size={18} />
          Сформировать
        </button>
      </div>

      {showAdd && (
        <div className="card space-y-3">
          <input
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary"
            placeholder="Название задачи"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary text-sm"
            placeholder="Минимальная версия (опционально)"
            value={minVersion}
            onChange={e => setMinVersion(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${
                  category === c ? 'bg-primary text-black border-primary' : 'border-border'
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['main', 'important', 'min'] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-xl text-sm border ${
                  priority === p ? 'bg-primary text-black border-primary' : 'border-border'
                }`}
              >
                {p === 'main' ? '🔥 Главное' : p === 'important' ? '⚡ Важно' : '🧩 Минимум'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={addTask}>Добавить</button>
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>Отмена</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map(t => (
          <div key={t.id} className="card flex items-center gap-3">
            <div className="flex-1">
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-muted">{CATEGORY_LABELS[t.category]} · {t.minVersion}</p>
            </div>
            {t.status === 'not_started' || t.status === 'in_progress' ? (
              <button
                className="btn-primary px-3 py-2 text-sm"
                onClick={() => {
                  startTask(t.id);
                  onStartTimer(15, t.id);
                }}
              >
                Начать
              </button>
            ) : (
              <span className="text-primary text-sm">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
