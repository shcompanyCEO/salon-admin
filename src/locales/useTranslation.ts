import { useUIStore } from '@/store/uiStore';
import { ko } from './ko';
import { en } from './en';
import { th } from './th';

const translations = {
  ko,
  en,
  th,
};

export const useTranslation = () => {
  const { locale } = useUIStore();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, locale };
};
