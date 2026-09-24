import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { FlatList, Modal, NativeScrollEvent, NativeSyntheticEvent, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n';
import { styles } from '../theme/styles';
import type { IoniconName } from '../types';

export function OnboardingModal({ visible, onComplete }: { visible: boolean; onComplete: () => void }) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pageWidth = Math.max(width - 48, 0);
  const topPadding = Math.max(insets.top + 12, 64);
  const bottomPadding = Math.max(insets.bottom + 12, 24);
  const pageHeight = Math.min(340, Math.max(260, height - topPadding - bottomPadding - 220));
  const { language, setLanguage, t } = useLanguage();
  const listRef = useRef<FlatList>(null);
  const completingRef = useRef(false);
  const [step, setStep] = useState(0);
  const slides = [
    { icon: 'leaf-outline' as IoniconName, title: t('onboarding1Title'), body: t('onboarding1Body') },
    { icon: 'calendar-outline' as IoniconName, title: t('onboarding2Title'), body: t('onboarding2Body') },
    { icon: 'refresh-outline' as IoniconName, title: t('onboarding3Title'), body: t('onboarding3Body') },
  ];
  const isLast = step === slides.length - 1;

  const finishOnboarding = () => {
    if (completingRef.current) return;
    completingRef.current = true;
    onComplete();
  };

  const goTo = (nextStep: number) => {
    setStep(nextStep);
    listRef.current?.scrollToIndex({ animated: true, index: nextStep });
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextStep = Math.round(event.nativeEvent.contentOffset.x / pageWidth);

    if (nextStep >= slides.length) {
      finishOnboarding();
      return;
    }

    setStep(nextStep);
  };

  return (
    <Modal animationType="fade" presentationStyle="fullScreen" visible={visible}>
      <View style={[styles.onboardingScreen, { paddingBottom: bottomPadding, paddingTop: topPadding }]}>
        <View style={styles.languagePicker}>
          {(['hy', 'en'] as const).map((item) => (
            <Pressable key={item} onPress={() => setLanguage(item)} style={[styles.languageOption, language === item && styles.languageOptionActive]}>
              <Text style={[styles.languageOptionText, language === item && styles.languageOptionTextActive]}>{item === 'hy' ? t('armenian') : t('english')}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.onboardingCarousel}>
          <FlatList
            ref={listRef}
            data={slides}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={[styles.onboardingPager, { height: pageHeight }]}
            keyExtractor={(item) => item.title}
            ListFooterComponent={<View style={{ height: pageHeight, width: pageWidth }} />}
            getItemLayout={(_, index) => ({ index, length: pageWidth, offset: pageWidth * index })}
            onMomentumScrollEnd={handleScrollEnd}
            renderItem={({ item }) => (
              <View style={[styles.onboardingContent, { height: pageHeight, width: pageWidth }]}>
                <View style={styles.onboardingIcon}><Ionicons name={item.icon} size={34} color="#0f766e" /></View>
                <Text style={styles.onboardingTitle}>{item.title}</Text>
                <Text style={styles.onboardingText}>{item.body}</Text>
              </View>
            )}
          />
          <View style={styles.onboardingDots}>
            {slides.map((slide, index) => <View key={slide.title} style={[styles.onboardingDot, index === step && styles.onboardingDotActive]} />)}
          </View>
        </View>
        <View style={styles.onboardingActions}>
          {step > 0 && <Pressable onPress={() => goTo(step - 1)} style={styles.backButton}><Text style={styles.backButtonText}>{t('back')}</Text></Pressable>}
          <Pressable onPress={() => (isLast ? finishOnboarding() : goTo(step + 1))} style={step > 0 ? styles.nextButton : styles.nextButtonFull}>
            <Text style={styles.nextButtonText}>{isLast ? t('letsStart') : t('continue')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
