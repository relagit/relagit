import { createSignal } from 'solid-js';

import { createStoreListener } from '@app/stores';
import SettingsStore from '@app/stores/settings';

import en from './locales/en';

type Locale = typeof en;

const ALL_LOCALES: Record<string, Locale> = {
	en
};

type Stringifyable = string | number | boolean | null | undefined;

export const i18nFactory = (locale: (typeof ALL_LOCALES)[keyof typeof ALL_LOCALES]) => {
	return (key: string, args?: Record<string, Stringifyable>, plural?: number) => {
		const paths = key.split('.');

		let out = '';

		let current: string | object = locale;

		for (const path of paths) {
			current = current[path];

			if (!current) break;
		}

		if (!current) {
			out = key;
		} else {
			out = current as string;
		}

		if (!out) {
			console.warn(`Missing translation for ${key}`);

			return `{{${key}}}`;
		}

		if (Array.isArray(out)) {
			out = out[plural > 1 ? 1 : 0];
		}

		if (typeof out !== 'string') {
			console.warn(`Translation for ${key} is not a string`);

			return `{{${key}}}`;
		}

		for (const arg in args) {
			out = out.replace(`{{${arg}}}`, args[arg] as string);
		}

		return out;
	};
};

const [locale, setLocale] = createSignal(en);

createStoreListener([SettingsStore], () => {
	setLocale(
		ALL_LOCALES[(SettingsStore.settings.get('locale') as keyof typeof ALL_LOCALES) || 'en']
	);
});

export const useI18n = () => {
	return i18nFactory(locale());
};
