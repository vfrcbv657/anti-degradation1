import { useState } from 'react';
import { useApp } from '../store/AppContext';

const AREAS = [
  'Учёба', 'Деньги', 'Работа', 'Тело', 'Сон',
  'Отношения', 'Социальная жизнь', 'Самодисциплина', 'Проекты',
];

const OBSTACLES = [
  'Телефон', 'TikTok/Reels/Shorts', 'Лень', 'Отсутствие целей',
  'Отношения', 'Усталость', 'Тревога', 'Хаос', 'Другое',
];

export function Onboarding() {
  const { dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Максимилиан');
  const [areas, setAreas] = useState<string[]>([]);
  const [mainGoal, setMainGoal] = useState('');
  const [obstacle, setObstacle] = useState('');

  const toggleArea = (a: string) => {
    setAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const finish = () => {
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: {
        name: name || 'Пользователь',
        focusAreas: areas,
        mainGoal,
        mainObstacle: obstacle,
      },
    });
  };

  return (
    <div className="min-h-full flex flex-col bg-background max-w-lg mx-auto px-5 pt-12 pb-8">
      <div className="flex-1 space-y-6">
        {step === 0 && (
          <>
            <h1 className="text-3xl font-bold">Антидеградация</h1>
            <p className="text-muted text-lg">
              Система, которая помогает не сливать жизнь в TikTok и прокрастинацию.
            </p>
            <p className="text-sm text-muted">
              Главный принцип: <span className="text-primary font-medium">НЕ НОЛЬ</span>.
              Даже в плохой день — минимум.
            </p>
            <div>
              <label className="text-sm text-muted">Как тебя зовут?</label>
              <input
                className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3 text-lg outline-none focus:border-primary"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Имя"
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-2xl font-semibold">Что хочешь изменить?</h2>
            <p className="text-muted text-sm">Можно выбрать несколько</p>
            <div className="flex flex-wrap gap-2">
              {AREAS.map(a => (
                <button
                  key={a}
                  onClick={() => toggleArea(a)}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    areas.includes(a)
                      ? 'bg-primary text-black border-primary'
                      : 'border-border text-muted'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-semibold">Главная цель сейчас</h2>
            <textarea
              className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3 text-base outline-none focus:border-primary min-h-[100px]"
              value={mainGoal}
              onChange={e => setMainGoal(e.target.value)}
              placeholder="Например: зарабатывать 50 000 ₽ в месяц"
            />
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-semibold">Что сильнее всего мешает?</h2>
            <div className="flex flex-wrap gap-2">
              {OBSTACLES.map(o => (
                <button
                  key={o}
                  onClick={() => setObstacle(o)}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    obstacle === o
                      ? 'bg-primary text-black border-primary'
                      : 'border-border text-muted'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="pt-6 space-y-3">
        {step < 3 ? (
          <button
            className="btn-primary w-full"
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 && areas.length === 0}
          >
            Дальше
          </button>
        ) : (
          <button className="btn-primary w-full" onClick={finish}>
            Начать
          </button>
        )}
        {step > 0 && (
          <button className="btn-ghost w-full" onClick={() => setStep(s => s - 1)}>
            Назад
          </button>
        )}
      </div>
    </div>
  );
}
