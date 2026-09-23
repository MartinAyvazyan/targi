import type { Language } from '../i18n';

const messages = {
  hy: [
    'Այսօրվա համար մի պարզ պլան ընտրիր ու մնա դրա հետ։',
    'Եթե դժվար պահ է, մի քիչ քայլիր, ջուր խմիր կամ զանգիր մեկին։',
    'Պետք չէ ամեն ինչ միանգամից փոխել։ Այս օրը բավական է։',
    'Քեզ ժամանակ տուր․ ցանկությունը կարող է գալ ու անցնել։',
    'Մի վատ պահը չի ջնջում այն օրերը, որոնք արդեն անցել ես։',
    'Հիշիր՝ ինչի համար սկսեցիր։ Այդ պատճառը դեռ կարևոր է։',
  ],
  en: [
    'Choose one simple plan for today and stick with it.',
    'If this is a hard moment, take a short walk, drink water, or call someone.',
    'You do not have to change everything at once. Today is enough.',
    'Give yourself time. An urge can arrive and pass.',
    'One hard moment does not erase the days you have already completed.',
    'Remember why you started. That reason still matters.',
  ],
};

export function getMotivationTexts(language: Language) {
  return messages[language];
}
