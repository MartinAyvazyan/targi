import type { AddictionType } from '../types';

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
