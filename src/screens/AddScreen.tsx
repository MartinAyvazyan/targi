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

import { DEFAULT_MILESTONE_DAYS, DEFAULT_REMINDER_TIME, milestoneOptions } from '../constants';
import { addictionTypes } from '../data/addictionTypes';
import { styles } from '../theme/styles';
import type { AddictionType, RecoveryPeriod, RootTabParamList } from '../types';
import { addDays, daysBetween, formatDateHy, parseDateKey, toDateKey, today } from '../utils/date';
import { scheduleDailyCheckNotification } from '../utils/notifications';
import { getMilestonePreview, getType } from '../utils/period';
import { formatReminderTime, reminderTimeToDate } from '../utils/reminders';

export function AddScreen({
  navigation,
  onAdd,
}: {
  navigation: BottomTabNavigationProp<RootTabParamList, 'Add'>;
  onAdd: (period: RecoveryPeriod) => void;
}) {
  const { height } = useWindowDimensions();
  const isCompact = height < 760;
  const stageScrollRef = useRef<ScrollView>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [stage, setStage] = useState(1);
  const [selectedTypeId, setSelectedTypeId] = useState(addictionTypes[0].id);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [customSubtypeInput, setCustomSubtypeInput] = useState('');
  const [customSubtypes, setCustomSubtypes] = useState<string[]>([]);
  const [title, setTitle] = useState(`Առանց ${addictionTypes[0].label}-ի`);
  const [startDate, setStartDate] = useState(today());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [milestoneDays, setMilestoneDays] = useState(DEFAULT_MILESTONE_DAYS);
  const [isMilestonePickerOpen, setIsMilestonePickerOpen] = useState(false);
  const [expandedMilestoneDays, setExpandedMilestoneDays] = useState(DEFAULT_MILESTONE_DAYS);
  const [dailyCost, setDailyCost] = useState('');

  const selectedType = getType(selectedTypeId);
  const getEffectiveSubtypes = (subtypes = selectedSubtypes, customValues = customSubtypes) => [
    ...subtypes.filter((subtype) => subtype !== 'Այլ'),
    ...customValues,
  ];
  const formatSubtypeTitle = (subtypes: string[]) => `Առանց ${subtypes.join(', ')}-ի`;
  const effectiveSubtypes = getEffectiveSubtypes();
  const isOtherSelected = selectedSubtypes.includes('Այլ');
  const selectedMilestonePreview = getMilestonePreview(selectedTypeId, milestoneDays);
  const milestonePickerOptions = milestoneOptions.slice(0, 5);
  const defaultTitle = effectiveSubtypes.length > 0 ? formatSubtypeTitle(effectiveSubtypes) : `Առանց ${selectedType.label}-ի`;
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
    setTitle(nextEffectiveSubtypes.length > 0 ? formatSubtypeTitle(nextEffectiveSubtypes) : `Առանց ${selectedType.label}-ի`);
  };

  const selectType = (type: AddictionType) => {
    setSelectedTypeId(type.id);
    setSelectedSubtypes([]);
    setCustomSubtypeInput('');
    setCustomSubtypes([]);
    setTitle(`Առանց ${type.label}-ի`);
  };

  const toggleSubtype = (subtype: string) => {
    const isSelected = selectedSubtypes.includes(subtype);
    const nextSubtypes = isSelected
      ? selectedSubtypes.filter((selectedSubtype) => selectedSubtype !== subtype)
      : [...selectedSubtypes, subtype];

    const nextCustomSubtypes = nextSubtypes.includes('Այլ') ? customSubtypes : [];
    setSelectedSubtypes(nextSubtypes);
    if (!nextSubtypes.includes('Այլ')) {
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

  const updateReminderTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setIsTimePickerOpen(false);
    }

    if (event.type === 'set' && selectedDate) {
      setReminderTime(
        `${`${selectedDate.getHours()}`.padStart(2, '0')}:${`${selectedDate.getMinutes()}`.padStart(2, '0')}`,
      );
    }
  };

  const createPeriod = async () => {
    const finalCustomSubtypes = saveTypedCustomSubtype();
    const finalEffectiveSubtypes = getEffectiveSubtypes(selectedSubtypes, finalCustomSubtypes);
    const finalSubtype = finalEffectiveSubtypes.join(', ') || 'Ընդհանուր';
    const finalTitle =
      title.trim() ||
      (finalEffectiveSubtypes.length > 0 ? formatSubtypeTitle(finalEffectiveSubtypes) : `Առանց ${selectedType.label}-ի`);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      Alert.alert('Ստուգիր ամսաթիվը', 'Օգտագործիր ձեւաչափը YYYY-MM-DD, օրինակ՝ 2026-05-03:');
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
      lastCheckInDate: initialStreak > 0 ? addDays(today(), -1) : addDays(startDate, -1),
      bestStreak: initialStreak,
      currentStreak: initialStreak,
      totalCleanDays: initialStreak,
      reminderTime,
      relapses: 0,
      dailyCost: Number(dailyCost.replace(',', '.')) || 0,
      currentMilestoneDays: milestoneDays,
      completedMilestones: [],
    };
    let notificationId: string | undefined;
    try {
      notificationId = await scheduleDailyCheckNotification(newPeriodBase);
    } catch {
      notificationId = undefined;
    }
    const newPeriod = {
      ...newPeriodBase,
      notificationId,
    };

    onAdd(newPeriod);
    if (Platform.OS !== 'web' && !notificationId) {
      Alert.alert(
        'Հիշեցումը միացված չէ',
        'Ընթացքը ստեղծվեց, բայց ծանուցումը չմիացավ: Կարող ես թույլատրել ծանուցումները հեռախոսի Settings-ում:',
      );
    }
    setTitle(`Առանց ${addictionTypes[0].label}-ի`);
    setStartDate(today());
    setReminderTime(DEFAULT_REMINDER_TIME);
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
        <Text style={styles.eyebrow}>Նոր սկիզբ</Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.62}
          style={[styles.stepTitle, isCompact && styles.stepTitleCompact]}
        >
          Սկսենք մաքուր ընթացք
        </Text>
        <Text style={styles.stepBody}>Քայլ {stage} / 2</Text>

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
            <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>Ընտրիր հիմնական տեսակը</Text>
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
                  Ամեն ինչ արդեն պատրաստ է. կարող ես սկսել հիմա կամ մանրամասները փոխել:
                </Text>
              </View>

              <View style={styles.quickStartCard}>
                <Text style={styles.quickStartKicker}>Պատրաստ է սկսելու</Text>
                <Text style={styles.quickStartTitle}>{defaultTitle}</Text>
                <Text style={styles.quickStartMeta}>
                  Այսօր · {milestoneDays} օր նպատակ · {formatReminderTime(reminderTime)} հիշեցում
                </Text>
              </View>

            <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>Մեկնարկի ամսաթիվ</Text>
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
                    <Text style={styles.dateBoxLabel}>Սկիզբ</Text>
                    <Text style={styles.dateBoxValue}>{formatDateHy(startDate)}</Text>
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
              <Text style={styles.webDateHint}>{formatDateHy(startDate)}</Text>
            )}

            <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>Առաջին նշաձող</Text>
            <Pressable
              onPress={() => {
                setExpandedMilestoneDays(milestoneDays);
                setIsMilestonePickerOpen(true);
              }}
              style={styles.dateBox}
            >
              <View style={styles.dateBoxTextBlock}>
                <Text style={styles.dateBoxLabel}>Նպատակ</Text>
                <Text style={styles.dateBoxValue}>{milestoneDays} օր</Text>
                <Text numberOfLines={1} style={styles.dateBoxHint}>{selectedMilestonePreview.title}</Text>
              </View>
              <Ionicons name="flag-outline" size={24} color="#0f766e" />
            </Pressable>

            <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>Հիշեցման ժամ</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.webDateShell}>
                <TextInput
                  value={reminderTime}
                  onChangeText={setReminderTime}
                  style={styles.webDateInput}
                  {...({ type: 'time' } as object)}
                />
                <Ionicons name="notifications-outline" size={24} color="#0f766e" />
              </View>
            ) : (
              <>
                <Pressable onPress={() => setIsTimePickerOpen(true)} style={styles.dateBox}>
                  <View>
                    <Text style={styles.dateBoxLabel}>Ամեն օր</Text>
                    <Text style={styles.dateBoxValue}>{formatReminderTime(reminderTime)}</Text>
                  </View>
                  <Ionicons name="notifications-outline" size={24} color="#0f766e" />
                </Pressable>
                {isTimePickerOpen && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={reminderTimeToDate(reminderTime)}
                    mode="time"
                    display="default"
                    accentColor="#0f766e"
                    themeVariant="light"
                    onChange={updateReminderTime}
                  />
                )}
              </>
            )}

            <View style={styles.optionalPanel}>
              <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>Անուն</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={defaultTitle}
                placeholderTextColor="#8a8f98"
                style={styles.input}
                onFocus={scrollFocusedInputIntoView}
              />

              <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>Օրական ծախս (ոչ պարտադիր)</Text>
              <TextInput
                value={dailyCost}
                onChangeText={setDailyCost}
                keyboardType="numeric"
                returnKeyType="done"
                blurOnSubmit
                placeholder="Օրինակ՝ 1500 ֏"
                placeholderTextColor="#8a8f98"
                style={styles.input}
                onFocus={scrollFocusedInputIntoView}
              />
            </View>

              <Text style={[styles.stepLabel, isCompact && styles.stepLabelCompact]}>Ենթատեսակներ (ոչ պարտադիր)</Text>
              <Text style={styles.helperText}>Ընտրիր, եթե ուզում ես անունը եւ հիշեցումները ավելի անձնական լինեն:</Text>
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
                  <Text style={styles.customSubtypeLabel}>Ավելացրու քո տարբերակները</Text>
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
                    Եթե կան ուժեղ ֆիզիկական ախտանիշներ կամ վտանգավոր վիճակ, դիմիր բժշկի կամ զանգիր 911/103:
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
                Ընտրել եւ շարունակել
              </Text>
            </Pressable>
          ) : (
            <>
              <Pressable onPress={() => setStage(1)} style={styles.backButton}>
                <Text style={styles.backButtonText}>Հետ</Text>
              </Pressable>
              <Pressable
                onPress={createPeriod}
                style={styles.primaryButtonInline}
              >
                <Text style={styles.primaryButtonText}>Սկսել հիմա</Text>
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
                <Text style={styles.datePopoverTitle}>Ընտրիր ամսաթիվը</Text>
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
                <Text style={styles.nextButtonText}>Ընտրել</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
      {Platform.OS === 'ios' && (
        <Modal animationType="fade" transparent visible={isTimePickerOpen}>
          <View style={styles.dateModalBackdrop}>
            <View style={styles.datePopover}>
              <View style={styles.datePopoverHeader}>
                <Text style={styles.datePopoverTitle}>Ընտրիր ժամը</Text>
                <Pressable onPress={() => setIsTimePickerOpen(false)} style={styles.dateCloseButton}>
                  <Ionicons name="close" size={20} color="#111827" />
                </Pressable>
              </View>
              <DateTimePicker
                value={reminderTimeToDate(reminderTime)}
                mode="time"
                display="spinner"
                accentColor="#0f766e"
                themeVariant="light"
                onChange={updateReminderTime}
              />
              <Pressable onPress={() => setIsTimePickerOpen(false)} style={styles.nextButtonFull}>
                <Text style={styles.nextButtonText}>Ընտրել</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
      <Modal animationType="fade" transparent visible={isMilestonePickerOpen}>
        <View style={styles.dateModalBackdrop}>
          <View style={styles.datePopover}>
            <View style={styles.datePopoverHeader}>
              <Text style={styles.datePopoverTitle}>Ընտրիր նշաձողը</Text>
              <Pressable onPress={() => setIsMilestonePickerOpen(false)} style={styles.dateCloseButton}>
                <Ionicons name="close" size={20} color="#111827" />
              </Pressable>
            </View>
            <View style={styles.milestoneOptionList}>
              {milestonePickerOptions.map((days) => {
                const preview = getMilestonePreview(selectedTypeId, days);
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
                          {days} օր
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
                        {isExpanded ? 'Փակել' : 'Ինչ կփոխվի'}
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
              <Text style={styles.nextButtonText}>Ընտրել</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
