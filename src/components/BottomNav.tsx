import { Home, Calendar, Target, BarChart3, Brain } from 'lucide-react';

type Tab = 'today' | 'plan' | 'goals' | 'stats' | 'assistant';

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Сегодня', icon: Home },
  { id: 'plan', label: 'План', icon: Calendar },
  { id: 'goals', label: 'Цели', icon: Target },
  { id: 'stats', label: 'Стат', icon: BarChart3 },
  { id: 'assistant', label: 'Помощник', icon: Brain },
];

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
}

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card/95 backdrop-blur border-t border-border z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
