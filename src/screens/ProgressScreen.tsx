import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ProgressDetailPage } from '../components/ProgressDetailPage';
import { useLanguage } from '../i18n';
import { styles } from '../theme/styles';
import type { RecoveryPeriod } from '../types';
import { formatMoney } from '../utils/money';
import { getCurrentRunDays, getSavedMoney, getType, supportsSpendingTracking } from '../utils/period';

export function ProgressScreen({
  onDelete,
  onEdit,
  periods,
  onReset,
  onSetMilestone,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Pick<RecoveryPeriod, 'dailyCost' | 'title'>>) => void;
  periods: RecoveryPeriod[];
  onReset: (id: string) => void;
  onSetMilestone: (id: string, days: number) => void;
}) {
  const { language, t } = useLanguage();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>();
  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId);

  const confirmDelete = (period: RecoveryPeriod) => {
    Alert.alert(
      t('deleteJourney'),
      `«${period.title}» ${t('deleteBody')}`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            setSelectedPeriodId(undefined);
            onDelete(period.id);
          },
        },
      ],
    );
  };

  if (selectedPeriod) {
    return (
      <ProgressDetailPage
        period={selectedPeriod}
        onBack={() => setSelectedPeriodId(undefined)}
        onDelete={confirmDelete}
        onEdit={onEdit}
        onReset={onReset}
        onSetMilestone={onSetMilestone}
      />
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <FlatList
        data={periods}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.eyebrow}>{t('progressEyebrow')}</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.62} style={styles.title}>
              {t('yourJourneys')}
            </Text>
            <Text style={styles.body}>{t('progressIntro')}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.panelTitle}>{t('noJourney')}</Text>
            <Text style={styles.panelText}>{t('noJourneyBody')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const type = getType(item.addictionTypeId, language);
          const currentDays = getCurrentRunDays(item);
          const milestoneProgress = Math.min(100, Math.round((currentDays / item.currentMilestoneDays) * 100));
          const milestoneDaysCompleted = Math.min(currentDays, item.currentMilestoneDays);
          const remainingDays = Math.max(item.currentMilestoneDays - currentDays, 0);
          const savedMoney = getSavedMoney(item);
          const tracksSpending = supportsSpendingTracking(item.addictionTypeId);

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${currentDays} ${t('days')}`}
              onPress={() => setSelectedPeriodId(item.id)}
              style={styles.progressCard}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBlock}>
                  <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.cardSubtitle}>{type.label} / {item.subtype ?? t('general')}</Text>
                </View>
                <Pressable
                  accessibilityLabel={t('delete')}
                  hitSlop={8}
                  onPress={(event) => {
                    event.stopPropagation();
                    confirmDelete(item);
                  }}
                  style={styles.progressDeleteButton}
                >
                  <Ionicons name="trash-outline" size={17} color="#be123c" />
                </Pressable>
              </View>

              <View style={styles.cardStreakRow}>
                <Text style={styles.cardStreakNumber}>{currentDays}</Text>
                <View style={styles.cardStreakTextBlock}>
                  <Text style={styles.cardStreakLabel}>{t('currentRun')}</Text>
                  <Text style={styles.cardMilestoneLine}>
                    {milestoneDaysCompleted}/{item.currentMilestoneDays} {t('days')} · {remainingDays === 0 ? t('completed') : `${t('remaining')} ${remainingDays}`}
                  </Text>
                </View>
                {tracksSpending && savedMoney > 0 && (
                  <Text style={styles.moneyChip}>{formatMoney(savedMoney)}</Text>
                )}
              </View>
              <View style={styles.cardProgressTrack}>
                <View style={[styles.cardProgressFill, { width: `${milestoneProgress}%` }]} />
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
