import { useState, useEffect } from 'react';
import { useApp } from './store/AppContext';
import { TodayPage } from './pages/TodayPage';
import { PlanPage } from './pages/PlanPage';
import { GoalsPage } from './pages/GoalsPage';
import { StatsPage } from './pages/StatsPage';
import { AssistantPage } from './pages/AssistantPage';
import { Onboarding } from './pages/Onboarding';
import { AntiDegradationMode } from './features/anti-degradation/AntiDegradationMode';
import { FocusTimer } from './features/focus/FocusTimer';
import { FailureModal } from './features/anti-degradation/FailureModal';
import { BottomNav } from './components/BottomNav';
import { EveningReview } from './features/planner/EveningReview';

type Tab = 'today' | 'plan' | 'goals' | 'stats' | 'assistant';
type Overlay = 'none' | 'anti' | 'timer' | 'failure' | 'review';

export default function App() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>('today');
  const [overlay, setOverlay] = useState<Overlay>('none');
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerTaskId, setTimerTaskId] = useState<string | undefined>();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  if (!state.user) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <div className="text-muted">Загрузка...</div>
      </div>
    );
  }

  if (!state.user.onboardingDone) {
    return <Onboarding />;
  }

  const openTimer = (minutes: number, taskId?: string) => {
    setTimerMinutes(minutes);
    setTimerTaskId(taskId);
    setOverlay('timer');
  };

  const openAnti = () => setOverlay('anti');
  const openFailure = () => setOverlay('failure');
  const openReview = () => setOverlay('review');

  return (
    <div className="min-h-full flex flex-col bg-background max-w-lg mx-auto relative">
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        {tab === 'today' && (
          <TodayPage
            onStartTimer={openTimer}
            onAnti={openAnti}
            onFailure={openFailure}
            onReview={openReview}
          />
        )}
        {tab === 'plan' && <PlanPage onStartTimer={openTimer} />}
        {tab === 'goals' && <GoalsPage />}
        {tab === 'stats' && <StatsPage />}
        {tab === 'assistant' && (
          <AssistantPage onAnti={openAnti} onStartTimer={openTimer} />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      {overlay === 'anti' && (
        <AntiDegradationMode
          onClose={() => setOverlay('none')}
          onStartTimer={(m) => {
            setOverlay('none');
            openTimer(m);
          }}
        />
      )}
      {overlay === 'timer' && (
        <FocusTimer
          minutes={timerMinutes}
          taskId={timerTaskId}
          onClose={() => setOverlay('none')}
        />
      )}
      {overlay === 'failure' && (
        <FailureModal onClose={() => setOverlay('none')} onStartTimer={openTimer} />
      )}
      {overlay === 'review' && (
        <EveningReview onClose={() => setOverlay('none')} />
      )}
    </div>
  );
}
