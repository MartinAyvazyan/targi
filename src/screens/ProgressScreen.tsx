import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressDetailPage } from '../components/ProgressDetailPage';
import { styles } from '../theme/styles';
import type { RecoveryPeriod } from '../types';
import { formatMoney } from '../utils/money';
import { getCurrentRunDays, getSavedMoney, getType } from '../utils/period';

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
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>();
  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId);

  const confirmDelete = (period: RecoveryPeriod) => {
    Alert.alert('Ջնջե՞լ ընթացքը', `«${period.title}» ընթացքը ամբողջությամբ կջնջվի:`, [
      {
        text: 'Չեղարկել',
        style: 'cancel',
      },
      {
        text: 'Ջնջել',
        style: 'destructive',
        onPress: () => {
          setSelectedPeriodId(undefined);
          onDelete(period.id);
        },
      },
    ]);
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
            <Text style={styles.eyebrow}>Առաջընթաց</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.62}
              style={styles.title}
            >
              Քո ընթացքները
            </Text>
            <Text style={styles.body}>
              Սեղմիր քարտին՝ նշաձողերը, առողջական փոփոխությունները եւ խնայված գումարը տեսնելու
              համար:
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.panelTitle}>Դեռ ընթացք չկա</Text>
            <Text style={styles.panelText}>
              Սկսիր փոքրից. այսօր ընտրիր միայն մեկ բան, որից ուզում ես ազատվել:
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const type = getType(item.addictionTypeId);
          const currentDays = getCurrentRunDays(item);
          const milestoneProgress = Math.min(
            100,
            Math.round((currentDays / item.currentMilestoneDays) * 100),
          );
          const remainingDays = Math.max(item.currentMilestoneDays - currentDays, 0);
          const savedMoney = getSavedMoney(item);

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${currentDays} ընթացիկ մաքուր օր`}
              onPress={() => setSelectedPeriodId(item.id)}
              style={styles.progressCard}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBlock}>
                  <Text numberOfLines={1} style={styles.cardTitle}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.cardSubtitle}>
                    {type.label} / {item.subtype ?? 'Ընդհանուր'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardStreakRow}>
                <Text style={styles.cardStreakNumber}>{currentDays}</Text>
                <View style={styles.cardStreakTextBlock}>
                  <Text style={styles.cardStreakLabel}>ընթացիկ շարք</Text>
                  <Text style={styles.cardMilestoneLine}>
                    {currentDays}/{item.currentMilestoneDays} օր · մնաց {remainingDays}
                  </Text>
                </View>
                {savedMoney > 0 && <Text style={styles.moneyChip}>{formatMoney(savedMoney)}</Text>}
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
