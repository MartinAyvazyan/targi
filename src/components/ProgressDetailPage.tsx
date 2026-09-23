import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '../theme/styles';
import { useLanguage } from '../i18n';
import type { RecoveryPeriod } from '../types';
import { formatDate } from '../utils/date';
import { formatMoney, getMoneyComparison } from '../utils/money';
import {
  getCurrentRunDays,
  getHealthIcon,
  getHealthImprovements,
  getNextMilestoneOptions,
  getSavedMoney,
  getTotalCleanDays,
  getType,
} from '../utils/period';

export function ProgressDetailPage({
  period,
  onBack,
  onDelete,
  onEdit,
  onReset,
  onSetMilestone,
}: {
  period: RecoveryPeriod;
  onBack: () => void;
  onDelete: (period: RecoveryPeriod) => void;
  onEdit: (id: string, updates: Partial<Pick<RecoveryPeriod, 'dailyCost' | 'title'>>) => void;
  onReset: (id: string) => void;
  onSetMilestone: (id: string, days: number) => void;
}) {
  const { language, t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(period.title);
  const [draftDailyCost, setDraftDailyCost] = useState(`${period.dailyCost || ''}`);
  const type = getType(period.addictionTypeId, language);
  const currentDays = getCurrentRunDays(period);
  const totalCleanDays = getTotalCleanDays(period);
  const milestoneProgress = Math.min(100, Math.round((currentDays / period.currentMilestoneDays) * 100));
  const isMilestoneComplete = currentDays >= period.currentMilestoneDays;
  const savedMoney = getSavedMoney(period);
  const improvements = getHealthImprovements(period, language);
  const nextImprovement = improvements.find((item) => item.day > currentDays);

  useEffect(() => {
    setDraftTitle(period.title);
    setDraftDailyCost(`${period.dailyCost || ''}`);
    setIsEditing(false);
  }, [period.id, period.title, period.dailyCost]);

  const saveEdits = () => {
    onEdit(period.id, {
      dailyCost: Number(draftDailyCost.replace(',', '.')) || 0,
      title: draftTitle.trim() || period.title,
    });
    setIsEditing(false);
  };

  return (
    <View style={styles.detailPage}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          style={styles.keyboardAvoiding}
        >
        <View style={styles.detailPageHeader}>
          <Pressable onPress={onBack} style={styles.backIconButton}>
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.detailKicker}>{type.label} / {period.subtype}</Text>
            <Text numberOfLines={1} style={styles.detailTitle}>{period.title}</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.detailContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.detailHero}>
            <Text style={styles.detailHeroDays}>🌱 {currentDays} {t('days')}</Text>
            <Text style={styles.detailHeroText}>{t('currentRun')}</Text>
          </View>

          <View style={styles.detailMetricGrid}>
            <View style={styles.detailMetric}>
              <Text style={styles.metricValue}>{totalCleanDays}</Text>
              <Text style={styles.metricLabel}>{t('totalDays')}</Text>
            </View>
            <View style={styles.detailMetric}>
              <Text style={styles.metricValue}>{period.bestStreak}</Text>
              <Text style={styles.metricLabel}>{t('bestRun')}</Text>
            </View>
            <View style={styles.detailMetric}>
              <Text style={styles.metricValue}>{formatMoney(savedMoney)}</Text>
              <Text style={styles.metricLabel}>{t('savedMoney')}</Text>
            </View>
          </View>
          <View style={styles.moneyInsightBox}>
            <Ionicons name="wallet-outline" size={19} color="#e08a3c" />
            <Text style={styles.moneyInsightText}>{getMoneyComparison(savedMoney, language)}</Text>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Text style={styles.detailSectionTitle}>{t('milestone')}</Text>
              <Text style={styles.detailSectionMeta}>{milestoneProgress}%</Text>
            </View>
            <View style={styles.milestoneTrack}>
              <View style={[styles.milestoneFill, { width: `${milestoneProgress}%` }]} />
            </View>
            <Text style={styles.detailText}>
              {t('target')}՝ {period.currentMilestoneDays} {t('days')}. {t('remaining')} {Math.max(period.currentMilestoneDays - currentDays, 0)} {t('days')}.
            </Text>
            {period.completedMilestones.length > 0 && (
              <Text style={styles.detailText}>{t('completed')}՝ {period.completedMilestones.join(', ')} {t('days')}</Text>
            )}
            {isMilestoneComplete && (
              <View style={styles.nextMilestoneBox}>
                <Text style={styles.nextMilestoneTitle}>{t('pickNext')}</Text>
                <View style={styles.nextMilestoneGrid}>
                  {getNextMilestoneOptions(period.currentMilestoneDays).map((days) => (
                    <Pressable key={days} onPress={() => onSetMilestone(period.id, days)} style={styles.nextMilestoneButton}>
                      <Text style={styles.nextMilestoneButtonText}>{days} {t('days')}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Text style={styles.detailSectionTitle}>{t('changes')}</Text>
              <Ionicons name={getHealthIcon(period.addictionTypeId)} size={20} color="#0f766e" />
            </View>
            {nextImprovement && (
              <View style={styles.nextHealthBox}>
                <Text style={styles.nextHealthKicker}>{t('next')}՝ {nextImprovement.day} {t('days')}</Text>
                <Text style={styles.nextHealthTitle}>{nextImprovement.title}</Text>
              </View>
            )}
            {improvements.map((item) => {
              const isUnlocked = currentDays >= item.day;
              return (
                <View key={`${item.day}-${item.title}`} style={[styles.healthItem, isUnlocked && styles.healthItemUnlocked]}>
                  <View style={[styles.healthDayBadge, isUnlocked && styles.healthDayBadgeUnlocked]}>
                    <Text style={[styles.healthDayText, isUnlocked && styles.healthDayTextUnlocked]}>{item.day}</Text>
                  </View>
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.healthTitle}>{item.title}</Text>
                    <Text style={styles.healthBody}>{item.body}</Text>
                  </View>
                </View>
              );
            })}
            <Text style={styles.healthDisclaimer}>
              {t('disclaimer')}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Text style={styles.detailSectionTitle}>{t('settings')}</Text>
              <Pressable
                onPress={() => {
                  if (isEditing) {
                    saveEdits();
                    return;
                  }
                  setIsEditing(true);
                }}
                style={styles.editButton}
              >
                <Ionicons name={isEditing ? 'checkmark' : 'create-outline'} size={16} color="#0f766e" />
                <Text style={styles.editButtonText}>{isEditing ? t('save') : t('edit')}</Text>
              </Pressable>
            </View>
            {isEditing && (
              <>
                <Text style={styles.detailInputLabel}>{t('name')}</Text>
                <TextInput
                  value={draftTitle}
                  onChangeText={setDraftTitle}
                  placeholder={t('journeyName')}
                  placeholderTextColor="#8a8f98"
                  style={styles.input}
                />
                <Text style={styles.detailInputLabel}>{t('dailyCost')}</Text>
                <TextInput
                  value={draftDailyCost}
                  onChangeText={setDraftDailyCost}
                  keyboardType="numeric"
                  returnKeyType="done"
                  blurOnSubmit
                  placeholder={t('exampleCost')}
                  placeholderTextColor="#8a8f98"
                  style={styles.input}
                />
              </>
            )}
            <Text style={styles.detailText}>{t('began')}՝ {formatDate(period.startDate, language)}</Text>
            <Text style={styles.detailText}>{t('dailyCost')}՝ {formatMoney(period.dailyCost || 0)}</Text>
            <View style={styles.cardActions}>
              <Pressable onPress={() => onReset(period.id)} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>{t('restart')}</Text>
              </Pressable>
              <Pressable onPress={() => onDelete(period)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={16} color="#be123c" />
                <Text style={styles.deleteButtonText}>{t('delete')}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
