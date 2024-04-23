import { RecursivePartial } from '@app/shared';
import SettingsStore from '@app/stores/settings';

import de from './locales/de';
import enUS from './locales/en-US';
import lat from './locales/lat';

// NOTE: I am sorry for the types in this file, they are very complex but somehow work :)

export type Locale = typeof import('./locales/en-US').default;
export type LocaleKey = ObjectToDotProp<Locale>;

// https://codeberg.org/Ven/vendicated.dev/src/branch/i18n/src/locales/index.ts#L24
export type ResolvePropDeep<T, P> =
	P extends '' ? T
	: P extends `${infer Pre}.${infer Suf}` ?
		Pre extends keyof T ?
			ResolvePropDeep<T[Pre], Suf>
		:	never
	: P extends keyof T ? T[P]
	: never;

export type ObjectToDotProp<T extends object> = ObjectToDotPropInternal<T>[keyof T];

export type ObjectToDotPropInternal<T extends object> = {
	[Key in keyof T]: Key extends string ?
		T[Key] extends Record<string, unknown> ?
			ObjectToDotProp<T[Key]> extends string ?
				// @ts-expect-error "Type instantiation is excessively deep and possibly infinite"
				`${Key}.${ObjectToDotProp<T[Key]>}`
			:	never
		:	Key
	:	never;
};

export type Unstrict<T> = {
	[K in keyof T]: T[K] extends Record<string, unknown> ? Unstrict<T[K]>
	: T[K] extends string ? string
	: readonly [string, string];
};

const ALL_LOCALES: Record<string, RecursivePartial<Unstrict<Locale>>> = {
	'en-US': enUS,
	lat: lat,
	de: de
};

export type ValidLocale = keyof typeof ALL_LOCALES;

type TResult<Trans extends LocaleKey, P extends PluralType<Trans>> =
	ResolvePropDeep<Locale, Trans> extends string ? ResolvePropDeep<Locale, Trans>
	:	ResolvePropDeep<Locale, Trans>[P];
type PluralType<Trans extends LocaleKey> =
	ResolvePropDeep<Locale, Trans> extends readonly [string, string] ? number : never;
type Stringifyable = string | number | boolean | null | undefined;

// i hate it here, but i also love it here
type TransParams<Trans extends LocaleKey, P extends PluralType<Trans>> =
	TResult<Trans, P> extends (
		`${string}{{${'lc:' | 'uc:'}${infer U}}}${string}{{${'lc:' | 'uc:'}${infer V}}}${string}`
	) ?
		{ [K in U | V]: Stringifyable }
	: TResult<Trans, P> extends `${string}{{${infer U}}}${string}{{${infer V}}}${string}` ?
		{ [K in U | V]: Stringifyable }
	: TResult<Trans, P> extends `${string}{{${'lc:' | 'uc:'}${infer U}}}${string}` ?
		{ [K in U]: Stringifyable }
	: TResult<Trans, P> extends `${string}{{${infer U}}}${string}` ? { [K in U]: Stringifyable }
	: never;

const findTranslation = <Trans extends LocaleKey, P extends PluralType<Trans>>(
	locale: RecursivePartial<Unstrict<Locale>>,
	key: LocaleKey,
	args?: TransParams<Trans, P>,
	plural?: P
): TResult<Trans, P> => {
	const paths = key.split('.');

	let out = '';

	let current: string | object = locale;

	for (const path of paths) {
		current = (current as Record<string, string>)[path];

		if (!current) break;
	}

	if (current) {
		out = current as string;
	}

	if (!out) {
		console.warn(`Missing translation for ${key}`);

		if (locale !== enUS) {
			return findTranslation(enUS, key, args, plural);
		}
	}

	if (Array.isArray(out)) {
		if (typeof plural === 'number') {
			out = out[plural! > 1 ? 1 : 0];
		}
	}

	if (typeof out !== 'string') {
		console.warn(`Translation for ${key} is not a string`);

		return `{{${key}}}` as TResult<Trans, P>;
	}

	for (const arg in args) {
		out = out.replace(`{{${arg}}}`, String(args[arg]));
		out = out.replace(`{{lc:${arg}}}`, String(args[arg]).toLowerCase());
		out = out.replace(`{{uc:${arg}}}`, String(args[arg]).toUpperCase());
	}

	return out as TResult<Trans, P>;
};

export const t = <Trans extends LocaleKey, P extends PluralType<Trans>>(
	trans: Trans,
	params?: TransParams<Trans, P>,
	plural?: P
): TResult<Trans, P> => {
	return findTranslation(
		ALL_LOCALES[SettingsStore.getSetting('locale') || 'en-US'] || enUS,
		trans,
		params,
		plural
	);
};
