import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useApp } from '../store/AppContext';
import { CATEGORY_LABELS, type Category, type Goal } from '../types';

export function GoalsPage() {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [category, setCategory] = useState<Category>('money');

  const bigGoals = state.goals.filter(g => g.level === 'big');

  const addGoal = () => {
    if (!title.trim()) return;
    const goal: Goal = {
      id: uuid(),
      title: title.trim(),
      description: '',
      category,
      why: why.trim() || 'Потому что это важно для меня.',
      importance: 4,
      progress: 0,
      level: 'big',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_GOAL', payload: goal });
    setTitle('');
    setWhy('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Цели</h1>
        <button className="btn-primary px-3 py-2" onClick={() => setShowAdd(true)}>
          <Plus size={18} />
        </button>
      </div>

      <p className="text-sm text-muted">
        Большие цели → месячные → недельные → задачи дня.
        Каждая цель должна отвечать на вопрос «Зачем?».
      </p>

      {showAdd && (
        <div className="card space-y-3">
          <input
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary"
            placeholder="Название цели"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary min-h-[80px]"
            placeholder="Зачем мне это?"
            value={why}
            onChange={e => setWhy(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as Category[]).slice(0, 6).map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  category === c ? 'bg-primary text-black border-primary' : 'border-border'
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={addGoal}>Создать</button>
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>Отмена</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {bigGoals.map(g => (
          <div key={g.id} className="card space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-muted">{CATEGORY_LABELS[g.category]}</p>
                <p className="font-medium text-lg">{g.title}</p>
              </div>
              <button
                className="text-muted p-1"
                onClick={() => dispatch({ type: 'DELETE_GOAL', payload: g.id })}
              >
                <Trash2 size={16} />
              </button>
            </div>
            {g.why && (
              <p className="text-sm text-muted italic">«{g.why}»</p>
            )}
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Прогресс</span>
                <span>{g.progress}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        {bigGoals.length === 0 && (
          <div className="card text-center text-muted py-8">
            Пока нет целей. Создай первую.
          </div>
        )}
      </div>
    </div>
  );
}
