import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_MILESTONE_DAYS, milestoneOptions } from '../constants';
import { getAddictionTypes } from '../data/addictionTypes';
import { useLanguage } from '../i18n';
import { styles } from '../theme/styles';
import type { AddictionType, RecoveryPeriod, RootTabParamList } from '../types';
import { daysBetween, formatDate, parseDateKey, toDateKey, today } from '../utils/date';
import { getMilestonePreview, getType } from '../utils/period';

export function AddScreen({
  navigation,
  onAdd,
}: {
  navigation: BottomTabNavigationProp<RootTabParamList, 'Add'>;
  onAdd: (period: RecoveryPeriod) => void;
}) {
  const { language, t } = useLanguage();
  const addictionTypes = getAddictionTypes(language);
  const { height } = useWindowDimensions();
  const isCompact = height < 760;
  const stageScrollRef = useRef<ScrollView>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [stage, setStage] = useState(1);
  const [selectedTypeId, setSelectedTypeId] = useState(addictionTypes[0].id);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [customSubtypeInput, setCustomSubtypeInput] = useState('');
  const [customSubtypes, setCustomSubtypes] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [milestoneDays, setMilestoneDays] = useState(DEFAULT_MILESTONE_DAYS);
  const [isMilestonePickerOpen, setIsMilestonePickerOpen] = useState(false);
  const [expandedMilestoneDays, setExpandedMilestoneDays] = useState(DEFAULT_MILESTONE_DAYS);
  const [dailyCost, setDailyCost] = useState('');

  const selectedType = getType(selectedTypeId, language);
  const otherLabel = language === 'en' ? 'Other' : 'Այլ';
  const getEffectiveSubtypes = (subtypes = selectedSubtypes, customValues = customSubtypes) => [
    ...subtypes.filter((subtype) => subtype !== otherLabel),
    ...customValues,
  ];
  const formatSubtypeTitle = (subtypes: string[]) => language === 'en' ? `No ${subtypes.join(', ')}` : `Առանց ${subtypes.join(', ')}-ի`;
  const effectiveSubtypes = getEffectiveSubtypes();
  const isOtherSelected = selectedSubtypes.includes(otherLabel);
  const selectedMilestonePreview = getMilestonePreview(selectedTypeId, milestoneDays, language);
  const milestonePickerOptions = milestoneOptions.slice(0, 5);
  const defaultTitle = effectiveSubtypes.length > 0 ? formatSubtypeTitle(effectiveSubtypes) : (language === 'en' ? `No ${selectedType.label}` : `Առանց ${selectedType.label}-ի`);
  const scrollFocusedInputIntoView = () => {
    // Native keyboard insets handle this better than forcing a jump to the end.
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setIsKeyboardOpen(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setIsKeyboardOpen(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const updateTitleForSubtypes = (subtypes: string[], customValues = customSubtypes) => {
    const nextEffectiveSubtypes = getEffectiveSubtypes(subtypes, customValues);
    setTitle(nextEffectiveSubtypes.length > 0 ? formatSubtypeTitle(nextEffectiveSubtypes) : (language === 'en' ? `No ${selectedType.label}` : `Առանց ${selectedType.label}-ի`));
  };

  const selectType = (type: AddictionType) => {
    setSelectedTypeId(type.id);
    setSelectedSubtypes([]);
    setCustomSubtypeInput('');
    setCustomSubtypes([]);
    setTitle(language === 'en' ? `No ${type.label}` : `Առանց ${type.label}-ի`);
  };

  const toggleSubtype = (subtype: string) => {
    const isSelected = selectedSubtypes.includes(subtype);
    const nextSubtypes = isSelected
      ? selectedSubtypes.filter((selectedSubtype) => selectedSubtype !== subtype)
      : [...selectedSubtypes, subtype];

    const nextCustomSubtypes = nextSubtypes.includes(otherLabel) ? customSubtypes : [];
    setSelectedSubtypes(nextSubtypes);
    if (!nextSubtypes.includes(otherLabel)) {
      setCustomSubtypeInput('');
      setCustomSubtypes([]);
    }
    updateTitleForSubtypes(nextSubtypes, nextCustomSubtypes);
  };

  const addCustomSubtype = () => {
    const nextCustomSubtype = customSubtypeInput.trim();
    if (!nextCustomSubtype || customSubtypes.includes(nextCustomSubtype)) {
      return;
    }

    const nextCustomSubtypes = [...customSubtypes, nextCustomSubtype];
    setCustomSubtypes(nextCustomSubtypes);
    setCustomSubtypeInput('');
    updateTitleForSubtypes(selectedSubtypes, nextCustomSubtypes);
  };

  const removeCustomSubtype = (subtype: string) => {
    const nextCustomSubtypes = customSubtypes.filter((customSubtype) => customSubtype !== subtype);
    setCustomSubtypes(nextCustomSubtypes);
    updateTitleForSubtypes(selectedSubtypes, nextCustomSubtypes);
  };

  const saveTypedCustomSubtype = () => {
    const typedCustomSubtype = customSubtypeInput.trim();
    const nextCustomSubtypes =
      isOtherSelected && typedCustomSubtype && !customSubtypes.includes(typedCustomSubtype)
        ? [...customSubtypes, typedCustomSubtype]
        : customSubtypes;
    setCustomSubtypes(nextCustomSubtypes);
    setCustomSubtypeInput('');
    updateTitleForSubtypes(selectedSubtypes, nextCustomSubtypes);
    return nextCustomSubtypes;
  };

  const continueFromSubtypes = () => {
    saveTypedCustomSubtype();
    setStage(3);
  };

  const updateStartDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setIsDatePickerOpen(false);
    }

    if (event.type === 'set' && selectedDate) {
      setStartDate(toDateKey(selectedDate));
    }
  };

  const createPeriod = () => {
    const finalCustomSubtypes = saveTypedCustomSubtype();
    const finalEffectiveSubtypes = getEffectiveSubtypes(selectedSubtypes, finalCustomSubtypes);
    const finalSubtype = finalEffectiveSubtypes.join(', ') || t('general');
    const finalTitle =
      title.trim() ||
      (finalEffectiveSubtypes.length > 0 ? formatSubtypeTitle(finalEffectiveSubtypes) : defaultTitle);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      Alert.alert(t('invalidDate'), t('invalidDateBody'));
      return;
    }

    const initialStreak = daysBetween(startDate, today());
    const periodId = `${Date.now()}`;

    const newPeriodBase: RecoveryPeriod = {
      id: periodId,
      addictionTypeId: selectedTypeId,
      subtype: finalSubtype,
      title: finalTitle,
      originalStartDate: startDate,
      startDate,
      createdAt: new Date().toISOString(),
      bestStreak: initialStreak,
      currentStreak: initialStreak,
      totalCleanDays: initialStreak,
      cleanDaysBeforeCurrentRun: 0,
      relapses: 0,
      dailyCost: Number(dailyCost.replace(',', '.')) || 0,
      currentMilestoneDays: milestoneDays,
      completedMilestones: [],
    };
    onAdd(newPeriodBase);
    setTitle('');
    setStartDate(today());
    setMilestoneDays(DEFAULT_MILESTONE_DAYS);
    setIsMilestonePickerOpen(false);
    setExpandedMilestoneDays(DEFAULT_MILESTONE_DAYS);
    setDailyCost('');
    setSelectedTypeId(addictionTypes[0].id);
    setSelectedSubtypes([]);
    setCustomSubtypeInput('');
    setCustomSubtypes([]);
    setStage(1);
    navigation.navigate('Progress');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={[styles.addContent, isCompact && styles.addContentCompact]}>
        <Text style={styles.eyebrow}>{t('newStart')}</Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.62}
          style={[styles.stepTitle, isCompact && styles.stepTitleCompact]}
        >
          {t('cleanJourney')}
        </Text>
        <Text style={styles.stepBody}>{t('step')} {stage} / 2</Text>

        <View style={[styles.stageBar, isCompact && styles.stageBarCompact]}>
          {[1, 2].map((step) => (
            <View key={step} style={[styles.stageDot, step <= stage && styles.stageDotActive]} />
          ))}
        </View>

        <ScrollView
          ref={stageScrollRef}
          style={styles.stageScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.stageScrollContent,
            isKeyboardOpen && styles.stageScrollContentKeyboardOpen,
          ]}
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
        >
          {stage === 1 && (
            <View style={styles.stagePanelFill}>
            <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>{t('chooseType')}</Text>
            <View style={styles.optionList}>
              {addictionTypes.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => selectType(type)}
                  style={[
                    styles.optionRow,
                    isCompact && styles.optionRowCompact,
                    selectedTypeId === type.id && styles.optionRowSelected,
                  ]}
                >
                  <View style={[styles.optionIcon, selectedTypeId === type.id && styles.optionIconSelected]}>
                    <Ionicons
                      name={type.iconName}
                      size={22}
                      color={selectedTypeId === type.id ? '#ffffff' : '#0f766e'}
                    />
                  </View>
                  <View style={styles.optionTextBlock}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[styles.optionTitle, selectedTypeId === type.id && styles.optionTitleSelected]}
                    >
                      {type.label}
                    </Text>
                    <Text numberOfLines={1} style={styles.optionMeta}>{type.subtypes.slice(0, 2).join(', ')}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
            </View>
          )}

          {stage === 2 && (
            <View style={styles.stagePanelFill}>
              <View style={[styles.notePanelCompact, isCompact && styles.notePanelCompactTight]}>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  style={styles.panelTitle}
                >
                  {selectedType.label}
                </Text>
                <Text numberOfLines={2} style={styles.panelText}>
                  {t('ready')}
                </Text>
              </View>

              <View style={styles.quickStartCard}>
                <Text style={styles.quickStartKicker}>{t('readyToStart')}</Text>
                <Text style={styles.quickStartTitle}>{defaultTitle}</Text>
                <Text style={styles.quickStartMeta}>
                  {t('todayWord')} · {milestoneDays} {t('days')} {t('goal')}
                </Text>
              </View>

            <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>{t('startDate')}</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.webDateShell}>
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  style={styles.webDateInput}
                  {...({ type: 'date' } as object)}
                />
                <Ionicons name="calendar-outline" size={24} color="#0f766e" />
              </View>
            ) : (
              <>
                <Pressable onPress={() => setIsDatePickerOpen(true)} style={styles.dateBox}>
                  <View>
                    <Text style={styles.dateBoxLabel}>{t('began')}</Text>
                    <Text style={styles.dateBoxValue}>{formatDate(startDate, language)}</Text>
                  </View>
                  <Ionicons name="calendar-outline" size={24} color="#0f766e" />
                </Pressable>
                {isDatePickerOpen && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={parseDateKey(startDate)}
                    mode="date"
                    display="default"
                    accentColor="#0f766e"
                    themeVariant="light"
                    onChange={updateStartDate}
                  />
                )}
              </>
            )}
            {Platform.OS === 'web' && (
              <Text style={styles.webDateHint}>{formatDate(startDate, language)}</Text>
            )}

            <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>{t('firstGoal')}</Text>
            <Pressable
              onPress={() => {
                setExpandedMilestoneDays(milestoneDays);
                setIsMilestonePickerOpen(true);
              }}
              style={styles.dateBox}
            >
              <View style={styles.dateBoxTextBlock}>
                <Text style={styles.dateBoxLabel}>{t('target')}</Text>
                <Text style={styles.dateBoxValue}>{milestoneDays} {t('days')}</Text>
                <Text numberOfLines={1} style={styles.dateBoxHint}>{selectedMilestonePreview.title}</Text>
              </View>
              <Ionicons name="flag-outline" size={24} color="#0f766e" />
            </Pressable>

            <View style={styles.optionalPanel}>
              <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>{t('name')}</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={defaultTitle}
                placeholderTextColor="#8a8f98"
                style={styles.input}
                onFocus={scrollFocusedInputIntoView}
              />

              <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>{t('dailyCostOptional')}</Text>
              <TextInput
                value={dailyCost}
                onChangeText={setDailyCost}
                keyboardType="numeric"
                returnKeyType="done"
                blurOnSubmit
                placeholder={t('exampleCost')}
                placeholderTextColor="#8a8f98"
                style={styles.input}
                onFocus={scrollFocusedInputIntoView}
              />
            </View>

              <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>{t('subtypesOptional')}</Text>
              <Text style={styles.helperText}>{t('subtypeHelp')}</Text>
              <View style={styles.optionGrid}>
                {selectedType.subtypes.map((subtype) => (
                  <Pressable
                    key={subtype}
                    onPress={() => toggleSubtype(subtype)}
                    style={[
                      styles.subtypeTile,
                      isCompact && styles.subtypeTileCompact,
                      selectedSubtypes.includes(subtype) && styles.optionRowSelected,
                    ]}
                  >
                    <Text
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      style={[styles.optionTitle, selectedSubtypes.includes(subtype) && styles.optionTitleSelected]}
                    >
                      {subtype}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {isOtherSelected && (
                <View style={styles.customSubtypeBox}>
                  <Text style={styles.customSubtypeLabel}>{t('addOptions')}</Text>
                  <View style={styles.customSubtypeActions}>
                    <TextInput
                      value={customSubtypeInput}
                      onChangeText={setCustomSubtypeInput}
                      placeholder={selectedType.customSubtypePlaceholder}
                      placeholderTextColor="#8a8f98"
                      style={styles.customSubtypeInput}
                      onFocus={scrollFocusedInputIntoView}
                      onSubmitEditing={addCustomSubtype}
                      returnKeyType="done"
                    />
                    <Pressable onPress={addCustomSubtype} style={styles.customSubtypeAddButton}>
                      <Ionicons name="add" size={18} color="#ffffff" />
                    </Pressable>
                  </View>
                  {customSubtypes.length > 0 && (
                    <View style={styles.customSubtypeChipGrid}>
                      {customSubtypes.map((customSubtype) => (
                        <Pressable
                          key={customSubtype}
                          onPress={() => removeCustomSubtype(customSubtype)}
                          style={styles.customSubtypeChip}
                        >
                          <Text numberOfLines={1} style={styles.customSubtypeChipText}>{customSubtype}</Text>
                          <Ionicons name="close" size={14} color="#0f766e" />
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {(selectedTypeId === 'alcohol' || selectedTypeId === 'drugs') && (
                <View style={styles.safetyNote}>
                  <Ionicons name="alert-circle-outline" size={20} color="#c2410c" />
                  <Text style={styles.safetyNoteText}>
                    {t('medicalWarning')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.fixedStepActions,
            isCompact && styles.fixedStepActionsCompact,
          ]}
        >
          {stage === 1 ? (
            <Pressable onPress={() => setStage(2)} style={styles.nextButtonFull}>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.nextButtonText}>
                {t('chooseContinue')}
              </Text>
            </Pressable>
          ) : (
            <>
              <Pressable onPress={() => setStage(1)} style={styles.backButton}>
                <Text style={styles.backButtonText}>{t('back')}</Text>
              </Pressable>
              <Pressable
                onPress={createPeriod}
                style={styles.primaryButtonInline}
              >
                <Text style={styles.primaryButtonText}>{t('startNow')}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
      {Platform.OS === 'ios' && (
        <Modal animationType="fade" transparent visible={isDatePickerOpen}>
          <View style={styles.dateModalBackdrop}>
            <View style={styles.datePopover}>
              <View style={styles.datePopoverHeader}>
                <Text style={styles.datePopoverTitle}>{t('chooseDate')}</Text>
                <Pressable onPress={() => setIsDatePickerOpen(false)} style={styles.dateCloseButton}>
                  <Ionicons name="close" size={20} color="#111827" />
                </Pressable>
              </View>
              <DateTimePicker
                value={parseDateKey(startDate)}
                mode="date"
                display="inline"
                accentColor="#0f766e"
                themeVariant="light"
                onChange={updateStartDate}
              />
              <Pressable onPress={() => setIsDatePickerOpen(false)} style={styles.nextButtonFull}>
                <Text style={styles.nextButtonText}>{t('choose')}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
      <Modal animationType="fade" transparent visible={isMilestonePickerOpen}>
        <View style={styles.dateModalBackdrop}>
          <View style={styles.datePopover}>
            <View style={styles.datePopoverHeader}>
              <Text style={styles.datePopoverTitle}>{t('chooseGoal')}</Text>
              <Pressable onPress={() => setIsMilestonePickerOpen(false)} style={styles.dateCloseButton}>
                <Ionicons name="close" size={20} color="#111827" />
              </Pressable>
            </View>
            <View style={styles.milestoneOptionList}>
              {milestonePickerOptions.map((days) => {
                const preview = getMilestonePreview(selectedTypeId, days, language);
                const isSelected = milestoneDays === days;
                const isExpanded = expandedMilestoneDays === days;

                return (
                  <View key={days} style={[styles.milestoneOption, isSelected && styles.milestoneOptionSelected]}>
                    <Pressable
                      onPress={() => {
                        setMilestoneDays(days);
                        setExpandedMilestoneDays(days);
                      }}
                      style={styles.milestoneOptionMain}
                    >
                      <View style={styles.cardTitleBlock}>
                        <Text style={[styles.milestoneOptionTitle, isSelected && styles.milestoneOptionTitleSelected]}>
                          {days} {t('days')}
                        </Text>
                        <Text numberOfLines={1} style={styles.milestoneOptionSubtitle}>
                          {preview.title}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={isSelected ? '#0f766e' : '#9ca3af'}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => setExpandedMilestoneDays(isExpanded ? 0 : days)}
                      style={styles.milestoneInfoButton}
                    >
                      <Ionicons name={isExpanded ? 'chevron-up' : 'information-circle-outline'} size={17} color="#0f766e" />
                      <Text style={styles.milestoneInfoButtonText}>
                        {isExpanded ? t('close') : t('whatChanges')}
                      </Text>
                    </Pressable>
                    {isExpanded && (
                      <Text style={styles.milestoneOptionBody}>{preview.body}</Text>
                    )}
                  </View>
                );
              })}
            </View>
            <Pressable onPress={() => setIsMilestonePickerOpen(false)} style={styles.nextButtonFull}>
              <Text style={styles.nextButtonText}>{t('choose')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
