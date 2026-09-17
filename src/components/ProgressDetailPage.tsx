import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '../theme/styles';
import type { RecoveryPeriod } from '../types';
import { formatDateHy } from '../utils/date';
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
import { formatReminderTime } from '../utils/reminders';

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
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(period.title);
  const [draftDailyCost, setDraftDailyCost] = useState(`${period.dailyCost || ''}`);
  const type = getType(period.addictionTypeId);
  const currentDays = getCurrentRunDays(period);
  const totalCleanDays = getTotalCleanDays(period);
  const milestoneProgress = Math.min(100, Math.round((currentDays / period.currentMilestoneDays) * 100));
  const isMilestoneComplete = currentDays >= period.currentMilestoneDays;
  const savedMoney = getSavedMoney(period);
  const improvements = getHealthImprovements(period);
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
            <Text style={styles.detailHeroDays}>🌱 {currentDays} օր</Text>
            <Text style={styles.detailHeroText}>Ընթացիկ շարք</Text>
          </View>

          <View style={styles.detailMetricGrid}>
            <View style={styles.detailMetric}>
              <Text style={styles.metricValue}>{totalCleanDays}</Text>
              <Text style={styles.metricLabel}>ընդհանուր մաքուր օրեր</Text>
            </View>
            <View style={styles.detailMetric}>
              <Text style={styles.metricValue}>{period.bestStreak}</Text>
              <Text style={styles.metricLabel}>ամենաերկար շարք</Text>
            </View>
            <View style={styles.detailMetric}>
              <Text style={styles.metricValue}>{formatMoney(savedMoney)}</Text>
              <Text style={styles.metricLabel}>խնայած գումար</Text>
            </View>
          </View>
          <View style={styles.moneyInsightBox}>
            <Ionicons name="wallet-outline" size={19} color="#e08a3c" />
            <Text style={styles.moneyInsightText}>{getMoneyComparison(savedMoney)}</Text>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Text style={styles.detailSectionTitle}>Նշաձող</Text>
              <Text style={styles.detailSectionMeta}>{milestoneProgress}%</Text>
            </View>
            <View style={styles.milestoneTrack}>
              <View style={[styles.milestoneFill, { width: `${milestoneProgress}%` }]} />
            </View>
            <Text style={styles.detailText}>
              Նպատակ՝ {period.currentMilestoneDays} օր: Մնացել է {Math.max(period.currentMilestoneDays - currentDays, 0)} օր:
            </Text>
            {period.completedMilestones.length > 0 && (
              <Text style={styles.detailText}>Ավարտված՝ {period.completedMilestones.join(', ')} օր</Text>
            )}
            {isMilestoneComplete && (
              <View style={styles.nextMilestoneBox}>
                <Text style={styles.nextMilestoneTitle}>Նշաձողը պահված է: Ընտրիր հաջորդը</Text>
                <View style={styles.nextMilestoneGrid}>
                  {getNextMilestoneOptions(period.currentMilestoneDays).map((days) => (
                    <Pressable key={days} onPress={() => onSetMilestone(period.id, days)} style={styles.nextMilestoneButton}>
                      <Text style={styles.nextMilestoneButtonText}>{days} օր</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Text style={styles.detailSectionTitle}>Ինչ է փոխվում մարմնում</Text>
              <Ionicons name={getHealthIcon(period.addictionTypeId)} size={20} color="#0f766e" />
            </View>
            {nextImprovement && (
              <View style={styles.nextHealthBox}>
                <Text style={styles.nextHealthKicker}>Հաջորդը՝ {nextImprovement.day} օր</Text>
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
              Սա բժշկական խորհրդատվություն չէ. փոփոխությունները կարող են տարբեր լինել մարդկանց մոտ: Աղբյուրների հիմք՝ հանրային առողջապահական ուղեցույցներ:
            </Text>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Text style={styles.detailSectionTitle}>Կարգավորումներ</Text>
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
                <Text style={styles.editButtonText}>{isEditing ? 'Պահել' : 'Խմբագրել'}</Text>
              </Pressable>
            </View>
            {isEditing && (
              <>
                <Text style={styles.detailInputLabel}>Անուն</Text>
                <TextInput
                  value={draftTitle}
                  onChangeText={setDraftTitle}
                  placeholder="Ընթացքի անուն"
                  placeholderTextColor="#8a8f98"
                  style={styles.input}
                />
                <Text style={styles.detailInputLabel}>Օրական ծախս</Text>
                <TextInput
                  value={draftDailyCost}
                  onChangeText={setDraftDailyCost}
                  keyboardType="numeric"
                  returnKeyType="done"
                  blurOnSubmit
                  placeholder="Օրինակ՝ 1500 ֏"
                  placeholderTextColor="#8a8f98"
                  style={styles.input}
                />
              </>
            )}
            <Text style={styles.detailText}>Սկիզբ՝ {formatDateHy(period.startDate)}</Text>
            <Text style={styles.detailText}>Հիշեցում՝ ամեն օր {formatReminderTime(period.reminderTime)}</Text>
            <Text style={styles.detailText}>Օրական ծախս՝ {formatMoney(period.dailyCost || 0)}</Text>
            <View style={styles.cardActions}>
              <Pressable onPress={() => onReset(period.id)} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Սկսել նորից</Text>
              </Pressable>
              <Pressable onPress={() => onDelete(period)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={16} color="#be123c" />
                <Text style={styles.deleteButtonText}>Ջնջել</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
