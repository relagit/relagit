import SettingsStore from '@app/stores/settings';

import enUS from './locales/en-US';
import lat from './locales/lat';
import de from './locales/de';

export type Locale = typeof enUS;
export type LocaleKey = ObjectToDotProp<Locale>;

// https://codeberg.org/Ven/vendicated.dev/src/branch/i18n/src/locales/index.ts#L24
type ObjectToDotProp<T extends object> = ObjectToDotPropInternal<T>[keyof T];

type ObjectToDotPropInternal<T extends object> = {
	[Key in keyof T]: Key extends string
		? T[Key] extends Record<string, unknown>
			? ObjectToDotProp<T[Key]> extends string
				? // @ts-expect-error "Type instantiation is excessively deep and possibly infinite"
				  `${Key}.${ObjectToDotProp<T[Key]>}`
				: never
			: Key
		: never;
};

const ALL_LOCALES: Record<string, Locale> = {
	'en-US': enUS,
	lat,
	de
};

type Stringifyable = string | number | boolean | null | undefined;

export const i18nFactory = (locale: (typeof ALL_LOCALES)[keyof typeof ALL_LOCALES]) => {
	return (key: LocaleKey, args?: Record<string, Stringifyable>, plural?: number) => {
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

export const useI18n = () => {
	return i18nFactory(ALL_LOCALES[SettingsStore.getSetting('locale') || 'en-US'] || enUS);
};

export const t = useI18n();
