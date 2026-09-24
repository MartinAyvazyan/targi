import { DEFAULT_MILESTONE_DAYS, milestoneOptions } from '../constants';
import { getAddictionTypes } from '../data/addictionTypes';
import { healthImprovementTexts, healthImprovementTextsEn } from '../data/healthImprovements';
import type { Language } from '../i18n';
import type { IoniconName, RecoveryPeriod } from '../types';
import { daysBetween, today } from './date';

export function getCurrentRunDays(period: RecoveryPeriod) {
  return Math.max(0, daysBetween(period.startDate, today()));
}

export function getSavedMoney(period: RecoveryPeriod) {
  return getCurrentRunDays(period) * (period.dailyCost || 0);
}

export function supportsSpendingTracking(typeId: string) {
  return typeId !== 'social';
}

export function getTotalCleanDays(period: RecoveryPeriod) {
  return (period.cleanDaysBeforeCurrentRun ?? 0) + getCurrentRunDays(period);
}

export function getHealthImprovements(period: RecoveryPeriod, language: Language = 'hy') {
  const source = language === 'en' ? healthImprovementTextsEn : healthImprovementTexts;
  return source[period.addictionTypeId] ?? source.custom;
}

export function getCurrentHealthInsight(period: RecoveryPeriod, language: Language = 'hy') {
  const currentDays = getCurrentRunDays(period);
  const improvements = getHealthImprovements(period, language);
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

export function getMilestonePreview(typeId: string, days: number, language: Language = 'hy') {
  const source = language === 'en' ? healthImprovementTextsEn : healthImprovementTexts;
  const improvements = source[typeId] ?? source.custom;
  return [...improvements].reverse().find((item) => item.day <= days) ?? improvements[0];
}

export function getNextMilestoneOptions(currentMilestoneDays: number) {
  const largerOptions = milestoneOptions.filter((days) => days > currentMilestoneDays);
  return largerOptions.length > 0 ? largerOptions.slice(0, 4) : [currentMilestoneDays + 30, currentMilestoneDays + 60];
}

export function getType(typeId: string, language: Language = 'hy') {
  const types = getAddictionTypes(language);
  return types.find((type) => type.id === typeId) ?? types[0];
}

export function normalizePeriod(period: RecoveryPeriod): RecoveryPeriod {
  const type = getType(period.addictionTypeId);
  const currentDays = daysBetween(period.startDate, today());
  const currentMilestoneDays = period.currentMilestoneDays ?? DEFAULT_MILESTONE_DAYS;

  return {
    ...period,
    subtype: period.subtype ?? type.subtypes[0],
    originalStartDate: period.originalStartDate ?? period.startDate,
    currentStreak: currentDays,
    bestStreak: Math.max(period.bestStreak ?? 0, currentDays),
    cleanDaysBeforeCurrentRun: period.cleanDaysBeforeCurrentRun ?? Math.max(0, (period.totalCleanDays ?? currentDays) - (period.currentStreak ?? currentDays)),
    totalCleanDays: period.totalCleanDays ?? currentDays,
    dailyCost: period.dailyCost ?? 0,
    currentMilestoneDays,
    completedMilestones: period.completedMilestones ?? [],
  };
}
