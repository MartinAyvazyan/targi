import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type RootTabParamList = {
  Home: undefined;
  Add: undefined;
  Progress: undefined;
};

export type AddictionType = {
  id: string;
  label: string;
  iconName: IoniconName;
  encouragement: string;
  customSubtypePlaceholder: string;
  subtypes: string[];
};

export type RecoveryPeriod = {
  id: string;
  addictionTypeId: string;
  subtype: string;
  title: string;
  originalStartDate: string;
  startDate: string;
  createdAt: string;
  lastCheckInDate?: string;
  bestStreak: number;
  currentStreak: number;
  totalCleanDays: number;
  cleanDaysBeforeCurrentRun?: number;
  relapses: number;
  dailyCost: number;
  currentMilestoneDays: number;
  completedMilestones: number[];
};

export type UndoState = {
  message: string;
  actionLabel: string;
  onUndo: () => void;
};
