import { DEFAULT_MILESTONE_DAYS, DEFAULT_REMINDER_TIME, milestoneOptions } from '../constants';
import { addictionTypes } from '../data/addictionTypes';
import { healthImprovementTexts } from '../data/healthImprovements';
import type { IoniconName, RecoveryPeriod } from '../types';
import { daysBetween, today } from './date';
import { hasReminderTimePassed } from './reminders';

export function getCurrentRunDays(period: RecoveryPeriod) {
  return period.currentStreak ?? daysBetween(period.startDate, today());
}

export function getSavedMoney(period: RecoveryPeriod) {
  return getCurrentRunDays(period) * (period.dailyCost || 0);
}

export function getTotalCleanDays(period: RecoveryPeriod) {
  return period.totalCleanDays ?? Math.max(getCurrentRunDays(period), period.bestStreak ?? 0);
}

export function getHealthImprovements(period: RecoveryPeriod) {
  return healthImprovementTexts[period.addictionTypeId] ?? healthImprovementTexts.custom;
}

export function getCurrentHealthInsight(period: RecoveryPeriod) {
  const currentDays = getCurrentRunDays(period);
  const improvements = getHealthImprovements(period);
  return [...improvements].reverse().find((item) => item.day <= currentDays) ?? improvements[0];
}

export function getHealthIcon(typeId: string): IoniconName {
  if (typeId === 'smoking') {
    return 'fitness-outline';
  }
  if (typeId === 'alcohol') {
    return 'water-outline';
  }
  if (typeId === 'drugs') {
    return 'medical-outline';
  }
  if (typeId === 'gambling') {
    return 'wallet-outline';
  }
  if (typeId === 'social') {
    return 'phone-portrait-outline';
  }
  return 'sparkles-outline';
}

export function getMilestonePreview(typeId: string, days: number) {
  const improvements = healthImprovementTexts[typeId] ?? healthImprovementTexts.custom;
  return [...improvements].reverse().find((item) => item.day <= days) ?? improvements[0];
}

export function getNextMilestoneOptions(currentMilestoneDays: number) {
  const largerOptions = milestoneOptions.filter((days) => days > currentMilestoneDays);
  return largerOptions.length > 0 ? largerOptions.slice(0, 4) : [currentMilestoneDays + 30, currentMilestoneDays + 60];
}

export function isDueForCheckIn(period: RecoveryPeriod) {
  return period.lastCheckInDate !== today() && hasReminderTimePassed(period.reminderTime);
}

export function getType(typeId: string) {
  return addictionTypes.find((type) => type.id === typeId) ?? addictionTypes[0];
}

export function normalizePeriod(period: RecoveryPeriod): RecoveryPeriod {
  const type = getType(period.addictionTypeId);
  const currentDays = daysBetween(period.startDate, today());
  const currentMilestoneDays = period.currentMilestoneDays ?? DEFAULT_MILESTONE_DAYS;

  return {
    ...period,
    subtype: period.subtype ?? type.subtypes[0],
    originalStartDate: period.originalStartDate ?? period.startDate,
    reminderTime: period.reminderTime ?? DEFAULT_REMINDER_TIME,
    currentStreak: period.currentStreak ?? currentDays,
    bestStreak: period.bestStreak ?? currentDays,
    totalCleanDays: period.totalCleanDays ?? Math.max(period.currentStreak ?? currentDays, period.bestStreak ?? currentDays),
    dailyCost: period.dailyCost ?? 0,
    currentMilestoneDays,
    completedMilestones: period.completedMilestones ?? [],
  };
}
