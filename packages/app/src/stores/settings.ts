import { GenericStore } from '.';

import { CommitStyle } from '@app/modules/commits';
import { ObjectToDotProp, ResolvePropDeep, ValidLocale } from '@app/modules/i18n';
import { RecursivePartial } from '@app/shared';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');
const os = window.Native.DANGEROUS__NODE__REQUIRE('os');

const __REPOSITORIES_PATH__ = path.join(os.homedir(), '.relagit', 'repositories.json');
const __SETTINGS_PATH__ = path.join(os.homedir(), '.relagit', 'settings.json');

export type Settings = RecursivePartial<{
	commit: {
		styles: Record<string, CommitStyle>;
		enforceStyle: boolean;
		preferParens: boolean;
	};
	onboarding: {
		dismissed: boolean;
		step: number;
	};
	ui: {
		theme: 'light' | 'dark' | 'system';
		vibrancy: string | boolean;
		expandedSettings: boolean;
		fontFamily: string;
		accentColor: string;
		thinIcons: boolean;
		userThemes: string[];
	};
	locale: ValidLocale;
	externalEditor: 'code' | 'code-insiders' | 'atom' | 'subl';
	activeRepository: string;
	repositories: string[];
}>;

// we need to add commit.styles because `ObjectToDotProp` will only include `commit.styles.${string}`
export type SettingsKey =
	| ObjectToDotProp<Settings>
	| 'commit.styles'
	| 'commit'
	| 'ui'
	| 'onboarding';

const validatePath = () => {
	const settingsPath = path.join(os.homedir(), '.relagit');

	if (!fs.existsSync(settingsPath)) {
		fs.mkdirSync(settingsPath);
	}

	if (!fs.existsSync(__SETTINGS_PATH__)) {
		fs.writeFileSync(__SETTINGS_PATH__, '{}');
	}

	if (!fs.existsSync(__REPOSITORIES_PATH__)) {
		fs.writeFileSync(__REPOSITORIES_PATH__, '[]');
	}
};

const SettingsStore = new (class SettingsStore extends GenericStore {
	#record: Settings = {};

	constructor() {
		super();

		validatePath();

		this.load();
	}

	get settings() {
		return this.#record;
	}

	/*
	
export const t: <Trans extends LocaleKey>(
	trans: Trans,
	params?: Record<string, Stringifyable>,
	plural?: number
) => ResolvePropDeep<Locale, Trans> extends string
	? ResolvePropDeep<Locale, Trans>
	: ResolvePropDeep<Locale, Trans>[0] = useI18n();

	*/

	getSetting<T extends SettingsKey>(key: T): ResolvePropDeep<Settings, T> {
		const parts = key.split('.');

		let current: unknown = this.#record;

		for (const part of parts) {
			current = current[part];

			if (!current) break;
		}

		return current as ResolvePropDeep<Settings, T>;
	}

	setSetting<T extends SettingsKey>(key: T, value: ResolvePropDeep<Settings, T>) {
		const parts = key.split('.');

		let current = this.#record;

		for (const part of parts.slice(0, -1)) {
			if (!current[part]) {
				current[part] = {};
			}

			current = current[part] as Settings;
		}

		current[parts[parts.length - 1]] = value;

		this.save();
		this.emit();

		window._triggerWorkflow('settings_update');
	}

	save() {
		const settings = structuredClone(this.#record);
		delete settings.repositories;

		fs.writeFileSync(__SETTINGS_PATH__, JSON.stringify(settings, null, 4));

		const repositories = this.getSetting('repositories');

		fs.writeFileSync(__REPOSITORIES_PATH__, JSON.stringify(repositories, null, 4));
	}

	load() {
		if (fs.existsSync(__SETTINGS_PATH__)) {
			let settings: Settings = {};

			try {
				settings = JSON.parse(fs.readFileSync(__SETTINGS_PATH__, 'utf-8'));
			} catch (error) {
				window._showErrorModal(error, 'error.corruptSettings');
			}

			for (const [key, value] of Object.entries(settings)) {
				this.#record[key] = value;
			}

			if (!this.#record['theme']) {
				this.#record['theme'] = 'system';
			}
		}

		if (fs.existsSync(__REPOSITORIES_PATH__)) {
			let repositories: string[] = [];

			try {
				repositories = JSON.parse(fs.readFileSync(__REPOSITORIES_PATH__, 'utf-8'));
			} catch (error) {
				window._showErrorModal(error, 'error.corruptSettings');
			}

			this.#record['repositories'] = repositories;
		}
	}
})();

export default SettingsStore;
