import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { format, isToday, parseISO, subDays, differenceInDays } from 'date-fns';
import type {
  AppState, User, Goal, DailyTask, FocusSession, DayReview,
  MoodEntry, FailureEvent, TaskStatus, DayState, Priority, Category
} from '../types';
import { loadState, saveState, exportData, importData, clearAll } from './storage';
import { createSeedUser, createSeedGoals, createSeedTasks } from '../data/seed';

type Action =
  | { type: 'INIT'; payload: AppState }
  | { type: 'SET_USER'; payload: User }
  | { type: 'COMPLETE_ONBOARDING'; payload: Partial<User> }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_TASK'; payload: DailyTask }
  | { type: 'UPDATE_TASK'; payload: DailyTask }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TASK_STATUS'; payload: { id: string; status: TaskStatus } }
  | { type: 'ADD_FOCUS'; payload: FocusSession }
  | { type: 'ADD_REVIEW'; payload: DayReview }
  | { type: 'SET_ENERGY'; payload: number }
  | { type: 'ADD_FAILURE'; payload: FailureEvent }
  | { type: 'ADD_MOOD'; payload: MoodEntry }
  | { type: 'UPDATE_STREAK' }
  | { type: 'RESET' }
  | { type: 'IMPORT'; payload: AppState };

const initialState: AppState = {
  user: null,
  goals: [],
  tasks: [],
  focusSessions: [],
  dayReviews: [],
  moodEntries: [],
  failureEvents: [],
  currentEnergy: null,
  lastActiveDate: format(new Date(), 'yyyy-MM-dd'),
  streak: 0,
  daysWithoutZero: 0,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT':
      return action.payload;
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        user: state.user
          ? { ...state.user, ...action.payload, onboardingDone: true }
          : { name: 'Пользователь', onboardingDone: true, focusAreas: [], createdAt: new Date().toISOString(), ...action.payload },
        goals: state.goals.length ? state.goals : createSeedGoals(),
        tasks: state.tasks.length ? state.tasks : createSeedTasks(),
      };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'SET_TASK_STATUS': {
      const tasks = state.tasks.map(t =>
        t.id === action.payload.id
          ? {
              ...t,
              status: action.payload.status,
              completedAt: ['completed', 'min_completed'].includes(action.payload.status)
                ? new Date().toISOString()
                : t.completedAt,
              startedAt: action.payload.status === 'in_progress' && !t.startedAt
                ? new Date().toISOString()
                : t.startedAt,
            }
          : t
      );
      return { ...state, tasks };
    }
    case 'ADD_FOCUS':
      return { ...state, focusSessions: [...state.focusSessions, action.payload] };
    case 'ADD_REVIEW':
      return {
        ...state,
        dayReviews: [...state.dayReviews.filter(r => r.date !== action.payload.date), action.payload],
      };
    case 'SET_ENERGY':
      return { ...state, currentEnergy: action.payload };
    case 'ADD_FAILURE':
      return { ...state, failureEvents: [...state.failureEvents, action.payload] };
    case 'ADD_MOOD':
      return {
        ...state,
        moodEntries: [...state.moodEntries.filter(m => m.date !== action.payload.date), action.payload],
      };
    case 'UPDATE_STREAK': {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayTasks = state.tasks.filter(t => t.date === today);
      const doneCount = todayTasks.filter(t => ['completed', 'min_completed'].includes(t.status)).length;
      const hasMin = doneCount > 0 || todayTasks.some(t => t.status === 'min_completed');
      let daysWithoutZero = state.daysWithoutZero;
      let streak = state.streak;
      if (hasMin && state.lastActiveDate !== today) {
        daysWithoutZero += 1;
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        if (state.lastActiveDate === yesterday || state.lastActiveDate === today) {
          streak += 1;
        } else {
          streak = 1;
        }
      }
      return {
        ...state,
        lastActiveDate: today,
        daysWithoutZero,
        streak,
      };
    }
    case 'RESET':
      clearAll();
      return { ...initialState, user: createSeedUser() };
    case 'IMPORT':
      return action.payload;
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helpers
  getTodayTasks: () => DailyTask[];
  getDayState: () => DayState;
  getTodayProgress: () => { done: number; total: number; percent: number };
  getMainTask: () => DailyTask | undefined;
  completeTask: (id: string, min?: boolean) => void;
  startTask: (id: string) => void;
  addQuickTask: (title: string, category: Category, priority?: Priority) => void;
  generateDayPlan: () => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
  daysWithoutZero: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: 'INIT', payload: saved });
    } else {
      dispatch({ type: 'SET_USER', payload: createSeedUser() });
    }
  }, []);

  useEffect(() => {
    if (state.user) {
      saveState(state);
    }
  }, [state]);

  const getTodayTasks = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.tasks.filter(t => t.date === today);
  }, [state.tasks]);

  const getTodayProgress = useCallback(() => {
    const tasks = getTodayTasks();
    const done = tasks.filter(t => ['completed', 'min_completed'].includes(t.status)).length;
    const total = tasks.length || 1;
    return { done, total, percent: Math.round((done / total) * 100) };
  }, [getTodayTasks]);

  const getDayState = useCallback((): DayState => {
    const { done, total, percent } = getTodayProgress();
    const hour = new Date().getHours();
    if (percent >= 60 || done >= 3) return 'in_rhythm';
    if (hour >= 18 && percent < 30) return 'degrading';
    if (percent < 40 && hour >= 14) return 'slipping';
    return 'in_rhythm';
  }, [getTodayProgress]);

  const getMainTask = useCallback(() => {
    return getTodayTasks().find(t => t.priority === 'main' && t.status !== 'completed' && t.status !== 'min_completed');
  }, [getTodayTasks]);

  const completeTask = useCallback((id: string, min = false) => {
    dispatch({ type: 'SET_TASK_STATUS', payload: { id, status: min ? 'min_completed' : 'completed' } });
    dispatch({ type: 'UPDATE_STREAK' });
  }, []);

  const startTask = useCallback((id: string) => {
    dispatch({ type: 'SET_TASK_STATUS', payload: { id, status: 'in_progress' } });
  }, []);

  const addQuickTask = useCallback((title: string, category: Category, priority: Priority = 'min') => {
    const task: DailyTask = {
      id: uuid(),
      title,
      category,
      priority,
      fullVersion: title,
      minVersion: `Сделать минимум: ${title}`,
      status: 'not_started',
      date: format(new Date(), 'yyyy-MM-dd'),
    };
    dispatch({ type: 'ADD_TASK', payload: task });
  }, []);

  const generateDayPlan = useCallback(() => {
    // Simple mock planner based on goals and energy
    const today = format(new Date(), 'yyyy-MM-dd');
    const existing = state.tasks.filter(t => t.date === today);
    if (existing.length >= 4) return;

    const energy = state.currentEnergy ?? 3;
    const goals = state.goals.filter(g => g.level === 'big');
    const suggestions: Omit<DailyTask, 'id'>[] = [];

    if (goals.find(g => g.category === 'study')) {
      suggestions.push({
        title: energy <= 2 ? '20 минут учёбы' : 'Закрыть одну учебную задачу',
        category: 'study',
        priority: 'main',
        fullVersion: 'Полностью закрыть учебную задачу',
        minVersion: '20 минут учёбы',
        status: 'not_started',
        date: today,
        estimatedMinutes: energy <= 2 ? 20 : 60,
      });
    }
    if (goals.find(g => g.category === 'money' || g.category === 'projects')) {
      suggestions.push({
        title: energy <= 2 ? '15 минут по проекту' : 'Прогресс по проекту / клиенту',
        category: 'projects',
        priority: 'important',
        fullVersion: '1–2 часа работы над проектом',
        minVersion: '15 минут по проекту',
        status: 'not_started',
        date: today,
        estimatedMinutes: energy <= 2 ? 15 : 90,
      });
    }
    if (goals.find(g => g.category === 'body')) {
      suggestions.push({
        title: energy <= 2 ? '10 минут движения' : 'Тренировка',
        category: 'body',
        priority: 'important',
        fullVersion: 'Тренировка 45–60 минут',
        minVersion: '10 минут движения',
        status: 'not_started',
        date: today,
        estimatedMinutes: energy <= 2 ? 10 : 50,
      });
    }
    suggestions.push({
      title: 'Маленькая бытовая задача',
      category: 'home',
      priority: 'min',
      fullVersion: 'Сделать полезное по дому',
      minVersion: '5 минут уборки',
      status: 'not_started',
      date: today,
      estimatedMinutes: 10,
    });

    suggestions.slice(0, energy <= 2 ? 3 : 5).forEach(s => {
      if (!existing.some(e => e.title === s.title)) {
        dispatch({ type: 'ADD_TASK', payload: { ...s, id: uuid() } });
      }
    });
  }, [state.tasks, state.goals, state.currentEnergy]);

  const exportJson = useCallback(() => exportData(state), [state]);
  const importJson = useCallback((json: string) => {
    const data = importData(json);
    if (data) {
      dispatch({ type: 'IMPORT', payload: data });
      return true;
    }
    return false;
  }, []);

  const value: AppContextValue = {
    state,
    dispatch,
    getTodayTasks,
    getDayState,
    getTodayProgress,
    getMainTask,
    completeTask,
    startTask,
    addQuickTask,
    generateDayPlan,
    exportJson,
    importJson,
    daysWithoutZero: state.daysWithoutZero,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
