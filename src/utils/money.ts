export function formatMoney(amount: number) {
  return `${Math.round(amount).toLocaleString('hy-AM')} ֏`;
}

import type { Language } from '../i18n';

export function getMoneyComparison(amount: number, language: Language = 'hy') {
  if (language === 'en') {
    if (amount <= 0) return 'Add a daily cost to see how much money stays with you.';
    if (amount < 5000) return 'A small but real amount has already stayed with you.';
    if (amount < 30000) return 'This could cover a meal, a book, a class, or another useful goal.';
    return 'This is meaningful financial breathing room.';
  }
  if (amount <= 0) {
    return 'Ավելացրու օրական ծախսը, եւ այստեղ կերեւա խնայված գումարը:';
  }

  if (amount < 5000) {
    return 'Սա արդեն փոքր, բայց իրական գումար է, որը մնաց քեզ մոտ:';
  }

  if (amount < 30000) {
    return 'Սա կարող է դառնալ ընթրիք, գիրք, մարզասրահ կամ մի կարեւոր փոքր նպատակ:';
  }

  return 'Սա արդեն մեծ քայլ է դեպի ֆինանսական շունչ եւ ավելի հանգիստ որոշումներ:';
}
