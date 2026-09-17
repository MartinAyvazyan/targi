import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { reminderTexts } from '../data/motivation';
import { styles } from '../theme/styles';
import type { RecoveryPeriod, RootTabParamList } from '../types';
import { dayOfYear } from '../utils/date';
import { getCurrentHealthInsight, getCurrentRunDays, isDueForCheckIn } from '../utils/period';
import { formatReminderTime, parseReminderTime } from '../utils/reminders';

export function HomeScreen({
  navigation,
  onKeep,
  onSlip,
  periods,
}: {
  navigation: BottomTabNavigationProp<RootTabParamList, 'Home'>;
  onKeep: (id: string) => void;
  onSlip: (id: string) => void;
  periods: RecoveryPeriod[];
}) {
  const { height } = useWindowDimensions();
  const isCompactHome = height < 820;
  const isTinyHome = height < 720;
  const hasPeriods = periods.length > 0;
  const longestRun = periods.reduce(
    (max, period) => Math.max(max, getCurrentRunDays(period)),
    0,
  );
  const insightPeriod = periods
    .slice()
    .sort((a, b) => getCurrentRunDays(b) - getCurrentRunDays(a))[0];
  const healthInsight = insightPeriod ? getCurrentHealthInsight(insightPeriod) : undefined;
  const todayDate = new Date();
  const dayIndex = dayOfYear(todayDate);
  const dailyReminder = reminderTexts[dayIndex % reminderTexts.length];
  const duePeriods = periods.filter(isDueForCheckIn);
  const dueChecks = duePeriods.length;
  const nowMinutes = todayDate.getHours() * 60 + todayDate.getMinutes();
  const nextReminder = periods
    .map((period) => {
      const { hour, minute } = parseReminderTime(period.reminderTime);
      const reminderMinutes = hour * 60 + minute;
      return {
        period,
        minutesUntil: (reminderMinutes - nowMinutes + 1440) % 1440,
      };
    })
    .sort((a, b) => a.minutesUntil - b.minutesUntil)[0];
  const hasDueCheckIn = duePeriods.length > 0;
  const showStartButton = !hasPeriods || !hasDueCheckIn || !isCompactHome;
  const showSummary = hasPeriods && (!hasDueCheckIn || !isCompactHome);
  const showHealthInsight = hasPeriods && healthInsight && !hasDueCheckIn && !isTinyHome;
  const showReminder = !hasDueCheckIn && !isTinyHome;
  const showHelp = !hasDueCheckIn && !isCompactHome;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          styles.homeContent,
          isCompactHome && styles.homeContentCompact,
        ]}
      >
        <Text style={[styles.eyebrow, isCompactHome && styles.homeEyebrowCompact]}>Targi</Text>
        <Text
          numberOfLines={isCompactHome ? 2 : 1}
          adjustsFontSizeToFit
          minimumFontScale={0.62}
          style={[styles.title, isCompactHome && styles.homeTitleCompact]}
        >
          Այսօր մի հատ էլ մաքուր օր
        </Text>

        {hasDueCheckIn && (
          <View style={[styles.homeCheckPanel, isCompactHome && styles.homeCheckPanelCompact]}>
            <Text style={styles.homeCheckTitle}>Ինչպե՞ս անցավ այսօրը</Text>
            {!isTinyHome && (
              <Text style={styles.homeCheckText}>Նշիր առանց դատելու. սա պարզապես օգնում է պահել ընթացքը:</Text>
            )}
            {duePeriods.map((period) => (
              <View key={period.id} style={styles.homeCheckItem}>
                <View style={styles.cardTitleBlock}>
                  <Text numberOfLines={1} style={styles.homeCheckName}>{period.title}</Text>
                  <Text style={styles.homeCheckMeta}>{getCurrentRunDays(period)} օր ընթացիկ շարք</Text>
                </View>
                <View style={styles.homeCheckActions}>
                  <Pressable onPress={() => onKeep(period.id)} style={styles.homeKeepButton}>
                    <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                    <Text numberOfLines={1} adjustsFontSizeToFit style={styles.homeKeepButtonText}>Մաքուր օր էր</Text>
                  </Pressable>
                  <Pressable onPress={() => onSlip(period.id)} style={styles.homeSlipButton}>
                    <Text numberOfLines={1} adjustsFontSizeToFit style={styles.homeSlipButtonText}>Դժվար օր էր</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {showStartButton && (
        <View style={[styles.homeStartButtonWrap, isCompactHome && styles.homeStartButtonWrapCompact]}>
          <Pressable onPress={() => navigation.navigate('Add')} style={styles.homeStartButton}>
            <View style={styles.homeStartIcon}>
              <Ionicons name="add" size={23} color="#ffffff" />
            </View>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.homeStartTitle}>Սկսել</Text>
              <Text style={styles.homeStartText}>Նոր ընթացք, նշաձող եւ հիշեցում</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0f766e" />
          </Pressable>
        </View>
        )}

        {showSummary && (
        <View style={[styles.summaryPanel, isCompactHome && styles.summaryPanelCompact]}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryKicker}>Քո այսօրն է</Text>
              <Text style={styles.summaryTitle}>
                {periods.length > 0 ? `${periods.length} ակտիվ ընթացք` : 'Սկսելու պահն է'}
              </Text>
            </View>
            <View style={styles.summaryIcon}>
              <Ionicons name="leaf-outline" size={24} color="#ffffff" />
            </View>
          </View>
          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.58} style={styles.summaryLabel}>
                Ստուգում հիմա
              </Text>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={styles.summaryValue}>
                {dueChecks > 0 ? `${dueChecks} սպասում է` : 'մաքուր է'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.58} style={styles.summaryLabel}>
                Հաջորդ հիշեցում
              </Text>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={styles.summaryValue}>
                {nextReminder
                  ? `${formatReminderTime(nextReminder.period.reminderTime)} · ${nextReminder.period.title}`
                  : 'դեռ չկա'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.58} style={styles.summaryLabel}>
                Ամենաերկար շարք
              </Text>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={styles.summaryValue}>
                {longestRun} օր
              </Text>
            </View>
          </View>
        </View>
        )}

        {showHealthInsight && (
          <View style={styles.healthInsightCard}>
            <View style={styles.healthInsightIcon}>
              <Ionicons name="pulse-outline" size={21} color="#0f766e" />
            </View>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.healthInsightKicker}>Մարմնի փոփոխություն</Text>
              <Text style={styles.healthInsightTitle}>{healthInsight.title}</Text>
              <Text style={styles.healthInsightText}>{healthInsight.body}</Text>
            </View>
          </View>
        )}

        {showReminder && (
        <View style={styles.notePanel}>
          <Text style={styles.panelTitle}>Փոքր հիշեցում</Text>
          <Text style={styles.panelText}>{dailyReminder}</Text>
        </View>
        )}

        {showHelp && (
        <View style={styles.helpPanel}>
          <View style={styles.healthInsightIcon}>
            <Ionicons name="heart-circle-outline" size={22} color="#0f766e" />
          </View>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.panelTitle}>Օգնություն</Text>
            <Text style={styles.panelText}>
              Եթե վտանգավոր վիճակ է կամ ուժեղ ֆիզիկական ախտանիշներ կան, զանգիր 911/103 կամ դիմիր բժշկի:
            </Text>
          </View>
        </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}
