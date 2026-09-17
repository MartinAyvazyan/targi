import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '../theme/styles';
import type { IoniconName } from '../types';

export function OnboardingModal({
  visible,
  onComplete,
}: {
  visible: boolean;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const slides = [
    {
      icon: 'leaf-outline' as IoniconName,
      title: 'Targi-ն փոքր քայլերի համար է',
      body: 'Ընտրում ես ինչից ես ուզում ազատվել, սկսում ես ընթացք եւ տեսնում ես ամեն մաքուր օրը:',
    },
    {
      icon: 'checkmark-circle-outline' as IoniconName,
      title: 'Օրվա հաստատումը պահում է ռիթմը',
      body: 'Ամեն օր մեկ փոքր նշում՝ մաքուր օր էր, թե դժվար օր էր: Առանց դատելու, միայն հասկանալու համար:',
    },
    {
      icon: 'heart-outline' as IoniconName,
      title: 'Սայթաքելը պարտություն չէ',
      body: 'Եթե մի օր չստացվեց, ընթացքը չի ջնջվում: Սա աջակցող գործիք է, իսկ ուժեղ ախտանիշների դեպքում պետք է դիմել մասնագետի:',
    },
  ];
  const current = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <Modal animationType="fade" visible={visible}>
      <SafeAreaView style={styles.onboardingScreen}>
        <View style={styles.onboardingContent}>
          <View style={styles.onboardingIcon}>
            <Ionicons name={current.icon} size={34} color="#0f766e" />
          </View>
          <Text style={styles.onboardingTitle}>{current.title}</Text>
          <Text style={styles.onboardingText}>{current.body}</Text>
          <View style={styles.onboardingDots}>
            {slides.map((slide) => (
              <View
                key={slide.title}
                style={[styles.onboardingDot, slide.title === current.title && styles.onboardingDotActive]}
              />
            ))}
          </View>
        </View>
        <View style={styles.onboardingActions}>
          {step > 0 && (
            <Pressable onPress={() => setStep((currentStep) => currentStep - 1)} style={styles.backButton}>
              <Text style={styles.backButtonText}>Հետ</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (isLast) {
                onComplete();
                return;
              }
              setStep((currentStep) => currentStep + 1);
            }}
            style={step > 0 ? styles.nextButton : styles.nextButtonFull}
          >
            <Text style={styles.nextButtonText}>{isLast ? 'Սկսենք' : 'Շարունակել'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
