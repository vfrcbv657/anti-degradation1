import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { useApp } from '../store/AppContext';

export function StatsPage() {
  const { state, exportJson, importJson } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');

  const last7 = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const weekTasks = state.tasks.filter(t => {
    const d = new Date(t.date);
    return d >= subDays(new Date(), 6);
  });
  const weekDone = weekTasks.filter(t => ['completed', 'min_completed'].includes(t.status)).length;
  const weekMin = weekTasks.filter(t => t.status === 'min_completed').length;
  const focusMin = state.focusSessions
    .filter(s => s.date >= format(subDays(new Date(), 6), 'yyyy-MM-dd'))
    .reduce((a, s) => a + Math.round(s.actualSeconds / 60), 0);

  const avgMood =
    state.moodEntries.length > 0
      ? (state.moodEntries.reduce((a, m) => a + m.mood, 0) / state.moodEntries.length).toFixed(1)
      : '—';

  const handleExport = () => {
    const json = exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anti-degradation-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      if (importJson(text)) {
        alert('Данные импортированы');
      } else {
        alert('Ошибка импорта');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Статистика</h1>

      {/* Hero metric */}
      <div className="card text-center space-y-2 py-6">
        <p className="text-5xl font-bold text-primary">{state.daysWithoutZero}</p>
        <p className="text-xs text-muted uppercase tracking-wide">Days Without Zero</p>
        <p className="text-sm text-muted">
          Ты не обязан быть идеальным.<br />Главное — не исчезать.
        </p>
      </div>

      {/* Week stats */}
      <div className="card space-y-4">
        <p className="font-medium">Эта неделя</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-semibold">{weekDone}</p>
            <p className="text-xs text-muted">Задач выполнено</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{weekMin}</p>
            <p className="text-xs text-muted">Минимумов</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{focusMin}</p>
            <p className="text-xs text-muted">Минут фокуса</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{avgMood}</p>
            <p className="text-xs text-muted">Ср. настроение</p>
          </div>
        </div>
      </div>

      {/* Daily bars */}
      <div className="card space-y-3">
        <p className="text-sm text-muted">Продуктивность по дням</p>
        <div className="flex items-end gap-1.5 h-24">
          {last7.map(d => {
            const ds = format(d, 'yyyy-MM-dd');
            const dayTasks = state.tasks.filter(t => t.date === ds);
            const done = dayTasks.filter(t => ['completed', 'min_completed'].includes(t.status)).length;
            const pct = dayTasks.length ? (done / dayTasks.length) * 100 : 0;
            return (
              <div key={ds} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/80 rounded-t"
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
                <span className="text-[9px] text-muted">{format(d, 'EE')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Текущая серия</p>
          <p className="text-2xl font-semibold">🔥 {state.streak} дней</p>
        </div>
        <p className="text-xs text-muted max-w-[140px] text-right">
          Серия не обнуляется из-за одного плохого дня
        </p>
      </div>

      {/* Data */}
      <div className="card space-y-3">
        <p className="font-medium">Данные</p>
        <div className="flex gap-2">
          <button className="btn-ghost flex-1 text-sm" onClick={handleExport}>
            Экспорт JSON
          </button>
          <button className="btn-ghost flex-1 text-sm" onClick={handleImport}>
            Импорт
          </button>
        </div>
      </div>
    </div>
  );
}
