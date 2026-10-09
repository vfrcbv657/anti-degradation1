import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AlertTriangle, Play, Check, Minus, ChevronRight, Zap, Flame } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CATEGORY_ICONS } from '../types';
import type { DailyTask } from '../types';

interface Props {
  onStartTimer: (m: number, taskId?: string) => void;
  onAnti: () => void;
  onFailure: () => void;
  onReview: () => void;
}

export function TodayPage({ onStartTimer, onAnti, onFailure, onReview }: Props) {
  const {
    state,
    getTodayTasks,
    getDayState,
    getTodayProgress,
    getMainTask,
    completeTask,
    startTask,
    generateDayPlan,
  } = useApp();

  const tasks = getTodayTasks();
  const { done, total, percent } = getTodayProgress();
  const dayState = getDayState();
  const mainTask = getMainTask();
  const name = state.user?.name || 'друг';
  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  const stateConfig = {
    in_rhythm: { label: 'В ритме', color: 'text-primary', bg: 'bg-primary/10', emoji: '🟢' },
    slipping: { label: 'Начинаешь выпадать', color: 'text-warning', bg: 'bg-warning/10', emoji: '🟡' },
    degrading: { label: 'День уходит в слив', color: 'text-danger', bg: 'bg-danger/10', emoji: '🔴' },
  }[dayState];

  const nextAction = mainTask || tasks.find(t => t.status === 'not_started' || t.status === 'in_progress');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-muted text-sm capitalize">
          {format(new Date(), 'EEEE, d MMMM', { locale: ru })}
        </p>
        <h1 className="text-2xl font-semibold mt-0.5">
          {greeting}, {name}
        </h1>
      </div>

      {/* Progress + State */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Сегодня</span>
          <span className="text-sm font-medium">
            {done} / {total} задач
          </span>
        </div>
        <div className="h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${stateConfig.bg} ${stateConfig.color}`}>
          <span>{stateConfig.emoji}</span>
          <span>{stateConfig.label}</span>
        </div>
        {state.streak > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <Flame size={14} className="text-warning" />
            <span>Серия: {state.streak} {state.streak === 1 ? 'день' : 'дней'}</span>
          </div>
        )}
      </div>

      {/* Next action - the core UX principle */}
      {nextAction && (
        <div className="card border-primary/30 bg-primary/5 space-y-3">
          <p className="text-xs text-muted uppercase tracking-wide">Сейчас</p>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{CATEGORY_ICONS[nextAction.category]}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-lg leading-tight">{nextAction.title}</p>
              <p className="text-sm text-muted mt-1">
                {nextAction.status === 'in_progress' ? 'В процессе' : nextAction.minVersion}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={() => {
                startTask(nextAction.id);
                onStartTimer(nextAction.estimatedMinutes && nextAction.estimatedMinutes <= 25 ? nextAction.estimatedMinutes : 15, nextAction.id);
              }}
            >
              <Play size={18} />
              Начать
            </button>
            <button
              className="btn-ghost px-3"
              onClick={() => completeTask(nextAction.id, true)}
              title="Минимум"
            >
              <Minus size={18} />
            </button>
            <button
              className="btn-ghost px-3"
              onClick={() => completeTask(nextAction.id)}
              title="Готово"
            >
              <Check size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main task card if different */}
      {mainTask && mainTask.id !== nextAction?.id && (
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="font-medium">Главное</span>
          </div>
          <p className="text-lg">{mainTask.title}</p>
          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { startTask(mainTask.id); onStartTimer(25, mainTask.id); }}>
              Начать
            </button>
            <button className="btn-ghost" onClick={() => completeTask(mainTask.id, true)}>
              Минимум
            </button>
          </div>
        </div>
      )}

      {/* Tasks list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-muted text-sm">Задачи дня</h2>
          <button
            onClick={generateDayPlan}
            className="text-xs text-primary flex items-center gap-1"
          >
            <Zap size={12} />
            Сформировать день
          </button>
        </div>
        {tasks.length === 0 && (
          <div className="card text-center text-muted py-8">
            <p>Нет задач на сегодня</p>
            <button className="btn-primary mt-3" onClick={generateDayPlan}>
              Сформировать план
            </button>
          </div>
        )}
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={(min) => completeTask(task.id, min)}
            onStart={() => {
              startTask(task.id);
              onStartTimer(15, task.id);
            }}
          />
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-danger flex items-center justify-center gap-2" onClick={onAnti}>
          <AlertTriangle size={16} />
          Я деградирую
        </button>
        <button className="btn-warning flex items-center justify-center gap-2" onClick={onFailure}>
          Я сорвался
        </button>
      </div>

      <button className="btn-ghost w-full flex items-center justify-center gap-2" onClick={onReview}>
        Вечерний отчёт
        <ChevronRight size={16} />
      </button>

      {/* Days without zero */}
      <div className="card text-center space-y-1">
        <p className="text-4xl font-bold text-primary">{state.daysWithoutZero}</p>
        <p className="text-xs text-muted">DAYS WITHOUT ZERO</p>
        <p className="text-sm text-muted pt-1">
          Ты не обязан быть идеальным.<br />Главное — не исчезать из собственной жизни.
        </p>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onComplete,
  onStart,
}: {
  task: DailyTask;
  onComplete: (min?: boolean) => void;
  onStart: () => void;
}) {
  const isDone = task.status === 'completed' || task.status === 'min_completed';
  return (
    <div
      className={`card flex items-center gap-3 ${isDone ? 'opacity-60' : ''}`}
    >
      <span className="text-xl">{CATEGORY_ICONS[task.category]}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isDone ? 'line-through' : ''}`}>
          {task.title}
        </p>
        <p className="text-xs text-muted">
          {task.priority === 'main' && '🔥 Главное · '}
          {task.priority === 'important' && '⚡ Важно · '}
          {task.status === 'min_completed' && 'Минимум выполнен'}
          {task.status === 'completed' && 'Готово'}
          {task.status === 'in_progress' && 'В процессе'}
          {task.status === 'not_started' && task.minVersion}
        </p>
      </div>
      {!isDone && (
        <div className="flex gap-1">
          <button
            className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center"
            onClick={onStart}
          >
            <Play size={14} />
          </button>
          <button
            className="w-9 h-9 rounded-full bg-border flex items-center justify-center"
            onClick={() => onComplete(true)}
            title="Минимум"
          >
            <Minus size={14} />
          </button>
          <button
            className="w-9 h-9 rounded-full bg-primary text-black flex items-center justify-center"
            onClick={() => onComplete(false)}
          >
            <Check size={14} />
          </button>
        </div>
      )}
      {isDone && <Check size={18} className="text-primary" />}
    </div>
  );
}
