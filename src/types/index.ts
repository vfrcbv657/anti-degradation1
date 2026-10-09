export type Category = 
  | 'study' | 'work' | 'money' | 'body' | 'growth' 
  | 'relationships' | 'social' | 'home' | 'rest' | 'projects';

export type TaskStatus = 
  | 'not_started' | 'in_progress' | 'completed' 
  | 'min_completed' | 'skipped';

export type Priority = 'main' | 'important' | 'min';

export type DayState = 'in_rhythm' | 'slipping' | 'degrading';

export interface User {
  name: string;
  onboardingDone: boolean;
  focusAreas: string[];
  mainGoal?: string;
  mainObstacle?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: Category;
  deadline?: string;
  why: string;
  importance: number;
  progress: number;
  parentId?: string;
  level: 'big' | 'quarter' | 'month' | 'week';
  createdAt: string;
}

export interface DailyTask {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  fullVersion: string;
  minVersion: string;
  estimatedMinutes?: number;
  status: TaskStatus;
  date: string;
  goalId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  durationMinutes: number;
  actualSeconds: number;
  date: string;
  startedAt: string;
  endedAt?: string;
  completed: boolean;
}

export interface DayReview {
  date: string;
  whatWentWell: string;
  whatBlocked: string;
  mood: number;
  dayRating: number;
  energy: number;
  tomorrowMain?: string;
  tasksCompleted: number;
  tasksTotal: number;
  focusMinutes: number;
  minCompleted: boolean;
}

export interface MoodEntry {
  date: string;
  mood: number;
  energy: number;
  note?: string;
}

export interface FailureEvent {
  id: string;
  date: string;
  reason: string;
  recoveryAction?: string;
  timestamp: string;
}

export interface AppState {
  user: User | null;
  goals: Goal[];
  tasks: DailyTask[];
  focusSessions: FocusSession[];
  dayReviews: DayReview[];
  moodEntries: MoodEntry[];
  failureEvents: FailureEvent[];
  currentEnergy: number | null;
  lastActiveDate: string;
  streak: number;
  daysWithoutZero: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  study: '📚 Учёба',
  work: '💻 Работа',
  money: '💰 Деньги',
  body: '🏋️ Тело',
  growth: '🧠 Развитие',
  relationships: '❤️ Отношения',
  social: '👥 Социальное',
  home: '🏠 Быт',
  rest: '🎮 Отдых',
  projects: '💻 Проекты',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  study: '📚',
  work: '💻',
  money: '💰',
  body: '🏋️',
  growth: '🧠',
  relationships: '❤️',
  social: '👥',
  home: '🏠',
  rest: '🎮',
  projects: '💻',
};
