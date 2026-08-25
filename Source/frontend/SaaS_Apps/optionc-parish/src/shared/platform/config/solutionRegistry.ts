import type { CatalogApp } from '@shared/app/types/app';
import { environment } from './environment';

export type SolutionId =
  | 'platform'
  | 'optionc-school'
  | 'matt-money'
  | 'arc-alerts'
  | 'optionc-parish'
  | 'catholic-content'
  | 'unified-directory'
  | 'support-center'
  | 'ai-lesson-plan';

export interface SolutionConfig {
  id: SolutionId;
  name: string;
  category: string;
  route: string;
  origin: string;
  favicon: string;
  themeColor: string;
  title: string;
}

export const SOLUTION_REGISTRY: Record<SolutionId, SolutionConfig> = {
  platform: {
    id: 'platform', name: 'Catholic Solutions', category: 'Connected Workspace', route: '/apps',
    origin: environment.origins.platform, favicon: '/favicon.svg', themeColor: '#12264c', title: 'Catholic Solutions',
  },
  'optionc-school': {
    id: 'optionc-school', name: 'OptionC School', category: 'Student Information System', route: '/',
    origin: environment.origins.optioncSchool, favicon: '/favicon.svg', themeColor: '#1e3a8a', title: 'OptionC School | Catholic Solutions',
  },
  'matt-money': {
    id: 'matt-money', name: 'Matt Money', category: 'Billing & Finance', route: '/',
    origin: environment.origins.mattMoney, favicon: '/favicon.svg', themeColor: '#0f766e', title: 'Matt Money | Catholic Solutions',
  },
  'arc-alerts': {
    id: 'arc-alerts', name: 'ArcAlerts', category: 'Emergency Communication', route: '/',
    origin: environment.origins.arcAlerts, favicon: '/favicon.svg', themeColor: '#b91c1c', title: 'ArcAlerts | Catholic Solutions',
  },
  'optionc-parish': {
    id: 'optionc-parish', name: 'Parish Hub', category: 'Parish Administration', route: '/',
    origin: environment.origins.optioncParish, favicon: '/favicon.svg', themeColor: '#166534', title: 'Parish Hub | Catholic Solutions',
  },
  'catholic-content': {
    id: 'catholic-content', name: 'Catholic Content', category: 'Faith Resources', route: '/',
    origin: environment.origins.catholicContent, favicon: '/favicon.svg', themeColor: '#5b21b6', title: 'Catholic Content | Catholic Solutions',
  },
  'unified-directory': {
    id: 'unified-directory', name: 'Unified Directory', category: 'Identity & Access', route: '/',
    origin: environment.origins.unifiedDirectory, favicon: '/favicon.svg', themeColor: '#0369a1', title: 'Unified Directory | Catholic Solutions',
  },
  'support-center': {
    id: 'support-center', name: 'Support Center', category: 'Member Services', route: '/',
    origin: environment.origins.supportCenter, favicon: '/favicon.svg', themeColor: '#0f4c81', title: 'Support Center | Catholic Solutions',
  },
  'ai-lesson-plan': {
    id: 'ai-lesson-plan', name: 'AI Lesson Plan Generator', category: 'AI · Teaching', route: '/',
    origin: environment.origins.aiLessonPlan, favicon: '/favicon.svg', themeColor: '#d97706', title: 'AI Lesson Plan Generator | Catholic Solutions',
  },
};

export const solutionForApp = (app: CatalogApp) => SOLUTION_REGISTRY[app.id as SolutionId];
