'use client';

import { useCallback, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shadcn/select';

export function LanguageSelector({
  onChange,
  className,
  ariaLabel = 'Select language',
}: {
  onChange?: (locale: string) => unknown;
  className?: string;
  ariaLabel?: string;
}) {
  const { i18n } = useTranslation();
  const { language: currentLanguage, options } = i18n;

  const locales = Array.from(
    new Set(options.supportedLngs as string[]),
  ).filter((locale) => locale.toLowerCase() !== 'cimode');

  const languageNames = useMemo(() => {
    return new Intl.DisplayNames([currentLanguage], {
      type: 'language',
    });
  }, [currentLanguage]);

  const [value, setValue] = useState(i18n.language);

  const languageChanged = useCallback(
    async (locale: string) => {
      setValue(locale);

      if (onChange) {
        onChange(locale);
      }

      await i18n.changeLanguage(locale);

      // refresh cached translations
      window.location.reload();
    },
    [i18n, onChange],
  );

  return (
    <Select value={value} onValueChange={languageChanged}>
      <SelectTrigger className={className} aria-label={ariaLabel}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 opacity-50" />
          <SelectValue />
        </div>
      </SelectTrigger>

      <SelectContent>
        {locales.map((locale) => {
          const label = capitalize(languageNames.of(locale) ?? locale);

          const option = {
            value: locale,
            label,
          };

          return (
            <SelectItem value={option.value} key={option.value}>
              {option.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function capitalize(lang: string) {
  return lang.slice(0, 1).toUpperCase() + lang.slice(1);
}
