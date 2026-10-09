import { v4 as uuid } from 'uuid';
import type { Goal, DailyTask, User } from '../types';
import { format } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');

export function createSeedUser(name: string = 'Максимилиан'): User {
  return {
    name,
    onboardingDone: false,
    focusAreas: [],
    createdAt: new Date().toISOString(),
  };
}

export function createSeedGoals(): Goal[] {
  return [
    {
      id: uuid(),
      title: 'Зарабатывать 50 000 ₽ в месяц',
      description: 'Стабильный доход от фриланса или проектов',
      category: 'money',
      why: 'Хочу стать финансово независимым и иметь возможность помогать родителям и путешествовать.',
      importance: 5,
      progress: 10,
      level: 'big',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      title: 'Закрывать учебные задачи без постоянных пропусков',
      description: 'Дисциплина в учёбе',
      category: 'study',
      why: 'Хочу закончить учёбу без долгов и чувствовать контроль.',
      importance: 4,
      progress: 20,
      level: 'big',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      title: 'Стать физически сильнее',
      description: 'Регулярные тренировки и движение',
      category: 'body',
      why: 'Хочу чувствовать себя лучше, иметь больше энергии и уверенности.',
      importance: 4,
      progress: 5,
      level: 'big',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      title: 'Развивать свои IT-проекты',
      description: 'Еженедельный прогресс по проектам',
      category: 'projects',
      why: 'Хочу создать что-то своё и получать от этого доход и удовольствие.',
      importance: 5,
      progress: 15,
      level: 'big',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function createSeedTasks(): DailyTask[] {
  return [
    {
      id: uuid(),
      title: 'Закрыть лабораторную работу',
      category: 'study',
      priority: 'main',
      fullVersion: 'Полностью закрыть лабораторную',
      minVersion: 'Сделать 20 минут по лабораторной',
      estimatedMinutes: 90,
      status: 'not_started',
      date: today,
    },
    {
      id: uuid(),
      title: 'Написать 1 потенциальному клиенту',
      category: 'money',
      priority: 'important',
      fullVersion: 'Написать 3 клиентам',
      minVersion: 'Написать 1 клиенту',
      estimatedMinutes: 30,
      status: 'not_started',
      date: today,
    },
    {
      id: uuid(),
      title: 'Тренировка',
      category: 'body',
      priority: 'important',
      fullVersion: 'Тренировка 60 минут',
      minVersion: '10 минут движения',
      estimatedMinutes: 60,
      status: 'not_started',
      date: today,
    },
    {
      id: uuid(),
      title: 'Программирование проекта',
      category: 'projects',
      priority: 'min',
      fullVersion: '2 часа программирования',
      minVersion: '15 минут программирования',
      estimatedMinutes: 120,
      status: 'not_started',
      date: today,
    },
    {
      id: uuid(),
      title: 'Уборка комнаты',
      category: 'home',
      priority: 'min',
      fullVersion: 'Полная уборка',
      minVersion: 'Убрать стол и пол',
      estimatedMinutes: 20,
      status: 'not_started',
      date: today,
    },
  ];
}
