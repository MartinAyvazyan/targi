export function formatMoney(amount: number) {
  return `${Math.round(amount).toLocaleString('hy-AM')} ֏`;
}

export function getMoneyComparison(amount: number) {
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
