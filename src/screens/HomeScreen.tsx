import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMotivationTexts } from '../data/motivation';
import { useLanguage } from '../i18n';
import { styles } from '../theme/styles';
import type { RecoveryPeriod, RootTabParamList } from '../types';
import { dayOfYear } from '../utils/date';
import { getCurrentHealthInsight, getCurrentRunDays } from '../utils/period';

export function HomeScreen({ navigation, onSlip, periods }: {
  navigation: BottomTabNavigationProp<RootTabParamList, 'Home'>;
  onSlip: (id: string) => void;
  periods: RecoveryPeriod[];
}) {
  const { height } = useWindowDimensions();
  const { language, setLanguage, t } = useLanguage();
  const isCompact = height < 820;
  const hasPeriods = periods.length > 0;
  const longestRun = periods.reduce((max, period) => Math.max(max, getCurrentRunDays(period)), 0);
  const leadPeriod = periods.slice().sort((a, b) => getCurrentRunDays(b) - getCurrentRunDays(a))[0];
  const healthInsight = leadPeriod ? getCurrentHealthInsight(leadPeriod, language) : undefined;
  const dailyMessage = getMotivationTexts(language)[dayOfYear(new Date()) % getMotivationTexts(language).length];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, styles.homeContent, isCompact && styles.homeContentCompact]}>
        <View style={styles.homeTopRow}>
          <Text style={[styles.eyebrow, isCompact && styles.homeEyebrowCompact]}>Targi</Text>
          <View style={styles.languagePickerCompact}>
            {(['hy', 'en'] as const).map((item) => (
              <Pressable key={item} onPress={() => setLanguage(item)} style={[styles.languageOptionCompact, language === item && styles.languageOptionActive]}>
                <Text style={[styles.languageOptionCompactText, language === item && styles.languageOptionTextActive]}>{item === 'hy' ? 'ՀԱՅ' : 'EN'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.62} style={[styles.title, isCompact && styles.homeTitleCompact]}>{t('homeTitle')}</Text>

        <View style={[styles.homeStartButtonWrap, isCompact && styles.homeStartButtonWrapCompact]}>
          <Pressable onPress={() => navigation.navigate('Add')} style={styles.homeStartButton}>
            <View style={styles.homeStartIcon}><Ionicons name="add" size={23} color="#ffffff" /></View>
            <View style={styles.cardTitleBlock}><Text style={styles.homeStartTitle}>{t('start')}</Text><Text style={styles.homeStartText}>{t('startNew')}</Text></View>
            <Ionicons name="chevron-forward" size={20} color="#0f766e" />
          </Pressable>
        </View>

        {hasPeriods && (
          <View style={[styles.summaryPanel, isCompact && styles.summaryPanelCompact]}>
            <View style={styles.summaryHeader}>
              <View><Text style={styles.summaryKicker}>{t('today')}</Text><Text style={styles.summaryTitle}>{periods.length} {t(periods.length === 1 ? 'activeJourney' : 'activeJourneys')}</Text></View>
              <View style={styles.summaryIcon}><Ionicons name="leaf-outline" size={24} color="#ffffff" /></View>
            </View>
            <View style={styles.summaryRows}>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{t('longestRun')}</Text><Text style={styles.summaryValue}>{longestRun} {t('days')}</Text></View>
            </View>
          </View>
        )}

        {periods.map((period) => (
          <View key={period.id} style={styles.homeCheckPanel}>
            <View style={styles.summaryHeader}>
              <View style={styles.cardTitleBlock}><Text style={styles.homeCheckName}>{period.title}</Text><Text style={styles.homeCheckMeta}>{getCurrentRunDays(period)} {t('days')} · {t('currentRun')}</Text></View>
              <Pressable hitSlop={8} onPress={() => onSlip(period.id)} style={styles.homeSlipButton}><Text numberOfLines={1} style={styles.homeSlipButtonText}>{t('recordLapse')}</Text></Pressable>
            </View>
          </View>
        ))}

        {healthInsight && <View style={styles.healthInsightCard}><View style={styles.healthInsightIcon}><Ionicons name="pulse-outline" size={21} color="#0f766e" /></View><View style={styles.cardTitleBlock}><Text style={styles.healthInsightKicker}>{t('bodyChange')}</Text><Text style={styles.healthInsightTitle}>{healthInsight.title}</Text><Text style={styles.healthInsightText}>{healthInsight.body}</Text></View></View>}
        <View style={styles.notePanel}><Text style={styles.panelTitle}>{t('usefulThought')}</Text><Text style={styles.panelText}>{dailyMessage}</Text></View>
        <View style={styles.helpPanel}><View style={styles.healthInsightIcon}><Ionicons name="heart-circle-outline" size={22} color="#0f766e" /></View><View style={styles.cardTitleBlock}><Text style={styles.panelTitle}>{t('help')}</Text><Text style={styles.panelText}>{t('helpText')}</Text></View></View>
      </ScrollView>
    </SafeAreaView>
  );
}
