import type { AddictionType } from '../types';
import type { Language } from '../i18n';

export const addictionTypes: AddictionType[] = [
  {
    id: 'smoking',
    label: 'Ծխախոտ',
    iconName: 'cloud-outline',
    encouragement: 'Ամեն մաքուր շունչը փոքր հաղթանակ է:',
    customSubtypePlaceholder: 'Օրինակ՝ Սիգար',
    subtypes: ['Սիգարետ', 'Վեյփ', 'Նարգիլե', 'Նիկոտինային պարկուճ', 'Այլ'],
  },
  {
    id: 'alcohol',
    label: 'Ալկոհոլ',
    iconName: 'wine-outline',
    encouragement: 'Այսօր ընտրում ես պարզ միտք եւ հանգիստ մարմին:',
    customSubtypePlaceholder: 'Օրինակ՝ Կոնյակ',
    subtypes: ['Գարեջուր', 'Գինի', 'Օղի', 'Վիսկի', 'Կոկտեյլներ', 'Այլ'],
  },
  {
    id: 'drugs',
    label: 'Թմրամիջոցներ',
    iconName: 'medical-outline',
    encouragement: 'Մեկ օր էլ ազատության կողմում:',
    customSubtypePlaceholder: 'Օրինակ՝ հանգստացնող դեղեր',
    subtypes: ['Մարիխուանա', 'Կոկաին', 'Ամֆետամին', 'Դեղահաբեր', 'Սինթետիկ նյութեր', 'Այլ'],
  },
  {
    id: 'gambling',
    label: 'Խաղամոլություն',
    iconName: 'dice-outline',
    encouragement: 'Դու պահում ես վերահսկողությունը քո ձեռքերում:',
    customSubtypePlaceholder: 'Օրինակ՝ լոտո',
    subtypes: ['Սպորտային խաղադրույք', 'Կազինո', 'Օնլայն խաղեր', 'Քարտեր', 'Այլ'],
  },
  {
    id: 'social',
    label: 'Սոցցանցերի կախվածություն',
    iconName: 'phone-portrait-outline',
    encouragement: 'Ժամանակդ նորից քեզ է պատկանում:',
    customSubtypePlaceholder: 'Օրինակ՝ Reddit',
    subtypes: ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'Telegram', 'X / Twitter', 'Այլ'],
  },
  {
    id: 'custom',
    label: 'Այլ կախվածություն',
    iconName: 'sparkles-outline',
    encouragement: 'Քո ուղին կարող է լինել փոքր քայլերով, բայց իրական:',
    customSubtypePlaceholder: 'Օրինակ՝ Սուրճ',
    subtypes: ['Քաղցր', 'Պոռնոգրաֆիա', 'Գնումներ', 'Սուրճ կամ էներգետիկ', 'Խաղեր', 'Այլ'],
  },
];

export const addictionTypesEn: AddictionType[] = [
  { id: 'smoking', label: 'Nicotine', iconName: 'cloud-outline', encouragement: 'Every clear breath is progress.', customSubtypePlaceholder: 'Example: Cigar', subtypes: ['Cigarettes', 'Vape', 'Hookah', 'Nicotine pouches', 'Other'] },
  { id: 'alcohol', label: 'Alcohol', iconName: 'wine-outline', encouragement: 'Today you choose a clearer mind and calmer body.', customSubtypePlaceholder: 'Example: Brandy', subtypes: ['Beer', 'Wine', 'Vodka', 'Whiskey', 'Cocktails', 'Other'] },
  { id: 'drugs', label: 'Substances', iconName: 'medical-outline', encouragement: 'One more day on your side.', customSubtypePlaceholder: 'Example: Sedatives', subtypes: ['Cannabis', 'Cocaine', 'Amphetamines', 'Pills', 'Synthetic substances', 'Other'] },
  { id: 'gambling', label: 'Gambling', iconName: 'dice-outline', encouragement: 'You are taking back control.', customSubtypePlaceholder: 'Example: Lottery', subtypes: ['Sports betting', 'Casino', 'Online games', 'Cards', 'Other'] },
  { id: 'social', label: 'Social media', iconName: 'phone-portrait-outline', encouragement: 'Your time belongs to you again.', customSubtypePlaceholder: 'Example: Reddit', subtypes: ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'Telegram', 'X / Twitter', 'Other'] },
  { id: 'custom', label: 'Another habit', iconName: 'sparkles-outline', encouragement: 'Small changes can still be meaningful.', customSubtypePlaceholder: 'Example: Coffee', subtypes: ['Sugar', 'Pornography', 'Shopping', 'Coffee or energy drinks', 'Gaming', 'Other'] },
];

export function getAddictionTypes(language: Language) {
  return language === 'en' ? addictionTypesEn : addictionTypes;
}
