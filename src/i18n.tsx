import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'hy' | 'en';

const LANGUAGE_KEY = 'targi-language-v1';

const copy = {
  hy: {
    today: 'Այսօր', start: 'Սկսել', progress: 'Ընթացք', language: 'Լեզու', armenian: 'Հայերեն', english: 'English',
    homeTitle: 'Այսօր՝ ևս մեկ լավ օր', startNew: 'Նոր ընթացք ու նոր նպատակ', activeJourney: 'ակտիվ ընթացք', activeJourneys: 'ակտիվ ընթացք',
    timeToStart: 'Սկսելու ժամանակն է', longestRun: 'Ամենաերկար ընթացք', days: 'օր', bodyChange: 'Մարմնի փոփոխություն',
    usefulThought: 'Մի փոքր միտք', help: 'Օգնություն', helpText: 'Եթե քեզ վատ ես զգում կամ վտանգավոր ախտանիշներ կան, զանգիր 911/103 կամ դիմիր բժշկի։',
    recordLapse: 'Խախտել', lapseTitle: 'Մի օրով ամեն ինչ չի ավարտվում', lapseBody: 'Այսօրվանից հաշվարկը նորից է սկսվում, իսկ անցած օրերը մնում են քո պատմության մեջ։', continue: 'Շարունակել',
    deleted: 'Ընթացքը ջնջվեց', undo: 'Վերականգնել', restarted: 'Հաշվարկը սկսվեց նորից', milestoneSaved: 'Նպատակը պահված է', nextGoal: 'Հաջորդ նպատակը',
    onboarding1Title: 'Targi-ն օգնում է հետևել օրերին', onboarding1Body: 'Ընտրիր այն սովորությունը, որից ուզում ես հեռու մնալ, ու Targi-ն օրերը կհաշվի քեզ համար։',
    onboarding2Title: 'Օրերը հաշվվում են ինքնուրույն', onboarding2Body: 'Պետք չէ ամեն օր որևէ բան հաստատել կամ հիշեցում ստանալ։ Պարզապես բացիր հավելվածը, երբ ուզում ես տեսնել առաջընթացդ։',
    onboarding3Title: 'Եթե մի օր չստացվի', onboarding3Body: 'Սեղմիր «Խախտել», և նոր հաշվարկը կսկսվի այդ օրվանից։ Անցած առաջընթացդ չի կորչի։',
    back: 'Հետ', letsStart: 'Սկսենք', newStart: 'Նոր սկիզբ', cleanJourney: 'Սկսենք նոր ընթացք', step: 'Քայլ', chooseType: 'Ընտրիր հիմնական տեսակը',
    ready: 'Ամեն ինչ պատրաստ է․ կարող ես սկսել հիմա կամ փոխել մանրամասները։', readyToStart: 'Պատրաստ է սկսելու', todayWord: 'Այսօր', goal: 'նպատակ',
    startDate: 'Մեկնարկի ամսաթիվ', firstGoal: 'Առաջին նպատակը', name: 'Անուն', dailyCostOptional: 'Օրական ծախս (ոչ պարտադիր)',
    subtypesOptional: 'Տարբերակներ (ոչ պարտադիր)', subtypeHelp: 'Ընտրիր, եթե ուզում ես ընթացքին ավելի հստակ անուն տալ։', addOptions: 'Ավելացրու քո տարբերակները',
    medicalWarning: 'Եթե ուժեղ ֆիզիկական ախտանիշներ կամ վտանգավոր վիճակ կա, դիմիր բժշկի կամ զանգիր 911/103։', chooseContinue: 'Ընտրել և շարունակել', startNow: 'Սկսել հիմա',
    chooseDate: 'Ընտրիր ամսաթիվը', choose: 'Ընտրել', chooseGoal: 'Ընտրիր նպատակը', whatChanges: 'Ինչ կփոխվի', close: 'Փակել',
    invalidDate: 'Ստուգիր ամսաթիվը', invalidDateBody: 'Օգտագործիր YYYY-MM-DD ձևաչափը, օրինակ՝ 2026-05-03։', general: 'Ընդհանուր', without: 'Առանց', exampleCost: 'Օրինակ՝ 1500 ֏',
    progressEyebrow: 'Առաջընթաց', yourJourneys: 'Քո ընթացքները', progressIntro: 'Բացիր քարտը՝ նպատակներն ու փոփոխությունները տեսնելու համար։',
    noJourney: 'Դեռ ընթացք չկա', noJourneyBody: 'Սկսիր մեկ սովորությունից, որը ուզում ես փոխել։', currentRun: 'ընթացիկ ընթացք', remaining: 'մնաց',
    deleteJourney: 'Ջնջե՞լ ընթացքը', deleteBody: 'ընթացքը ամբողջությամբ կջնջվի։', cancel: 'Չեղարկել', delete: 'Ջնջել', totalDays: 'ընդհանուր օրեր', bestRun: 'ամենաերկար ընթացք',
    savedMoney: 'խնայած գումար', milestone: 'Նպատակ', target: 'Նպատակ', completed: 'Ավարտված', pickNext: 'Նպատակը պատրաստ է․ ընտրիր հաջորդը', changes: 'Ինչ կարող է փոխվել',
    next: 'Հաջորդը', yearTimelineComplete: 'Մեկ տարվա փուլերը բացված են', yearTimelineBody: 'Առաջընթացը շարունակվում է նաև մեկ տարուց հետո։ Գնահատիր քո իրական ինքնազգացողությունն ու աջակցությունը։', disclaimer: 'Սրանք ընդհանուր, մոտավոր փուլեր են, ոչ բժշկական խոստումներ։ Փոփոխությունները կախված են մարդուց, սովորությունից և բուժումից։', settings: 'Կարգավորումներ', save: 'Պահել', edit: 'Խմբագրել',
    journeyName: 'Ընթացքի անուն', dailyCost: 'Օրական ծախս', began: 'Սկիզբ', restart: 'Խախտել',
  },
  en: {
    today: 'Today', start: 'Start', progress: 'Progress', language: 'Language', armenian: 'Հայերեն', english: 'English',
    homeTitle: 'One more good day', startNew: 'A new journey and a new goal', activeJourney: 'active journey', activeJourneys: 'active journeys',
    timeToStart: 'A good time to start', longestRun: 'Longest run', days: 'days', bodyChange: 'Body changes',
    usefulThought: 'A useful thought', help: 'Help', helpText: 'If you feel unsafe or have severe physical symptoms, call emergency services or contact a doctor.',
    recordLapse: 'Record a lapse', lapseTitle: 'One day does not erase everything', lapseBody: 'Your count starts again today, while your previous progress stays in your history.', continue: 'Continue',
    deleted: 'Journey deleted', undo: 'Undo', restarted: 'The count started again', milestoneSaved: 'Goal saved', nextGoal: 'Next goal',
    onboarding1Title: 'Targi keeps track of your days', onboarding1Body: 'Choose a habit you want to leave behind, and Targi will count the days for you.',
    onboarding2Title: 'Your days update automatically', onboarding2Body: 'There is nothing to confirm every day and no reminder to interrupt you. Open the app whenever you want to see your progress.',
    onboarding3Title: 'If a day does not go as planned', onboarding3Body: 'Tap “Record a lapse” and a new count starts from that day. Your earlier progress remains saved.',
    back: 'Back', letsStart: "Let's start", newStart: 'New start', cleanJourney: 'Start a new journey', step: 'Step', chooseType: 'Choose the main type',
    ready: 'Everything is ready. Start now or adjust the details.', readyToStart: 'Ready to start', todayWord: 'Today', goal: 'goal',
    startDate: 'Start date', firstGoal: 'First goal', name: 'Name', dailyCostOptional: 'Daily cost (optional)',
    subtypesOptional: 'Options (optional)', subtypeHelp: 'Choose options if you want a more specific journey name.', addOptions: 'Add your own options',
    medicalWarning: 'If you have severe physical symptoms or feel unsafe, contact a doctor or emergency services.', chooseContinue: 'Choose and continue', startNow: 'Start now',
    chooseDate: 'Choose a date', choose: 'Choose', chooseGoal: 'Choose a goal', whatChanges: 'What changes', close: 'Close',
    invalidDate: 'Check the date', invalidDateBody: 'Use YYYY-MM-DD, for example 2026-05-03.', general: 'General', without: 'No', exampleCost: 'Example: 10',
    progressEyebrow: 'Progress', yourJourneys: 'Your journeys', progressIntro: 'Open a card to see goals and changes over time.',
    noJourney: 'No journey yet', noJourneyBody: 'Start with one habit you want to change.', currentRun: 'current run', remaining: 'remaining',
    deleteJourney: 'Delete this journey?', deleteBody: 'will be permanently deleted.', cancel: 'Cancel', delete: 'Delete', totalDays: 'total days', bestRun: 'longest run',
    savedMoney: 'money saved', milestone: 'Goal', target: 'Target', completed: 'Completed', pickNext: 'Goal reached. Choose the next one', changes: 'What may change',
    next: 'Next', yearTimelineComplete: 'The one-year timeline is unlocked', yearTimelineBody: 'Progress continues after one year. Review your actual wellbeing and the support that works for you.', disclaimer: 'These are general, approximate stages—not medical promises. Changes depend on the person, habit, and treatment.', settings: 'Settings', save: 'Save', edit: 'Edit',
    journeyName: 'Journey name', dailyCost: 'Daily cost', began: 'Started', restart: 'Record a lapse',
  },
} as const;

export type CopyKey = keyof typeof copy.hy;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: CopyKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('hy');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored === 'hy' || stored === 'en') setLanguageState(stored);
    });
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    AsyncStorage.setItem(LANGUAGE_KEY, next);
  };

  const value = useMemo(() => ({ language, setLanguage, t: (key: CopyKey) => copy[language][key] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}
