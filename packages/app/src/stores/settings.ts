import { GenericStore } from '.';

import { CommitStyle } from '@app/modules/commits';
import { ObjectToDotProp, ResolvePropDeep, ValidLocale } from '@app/modules/i18n';
import { RecursivePartial } from '@app/shared';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');
const os = window.Native.DANGEROUS__NODE__REQUIRE('os');

const __REPOSITORIES_PATH__ = path.join(os.homedir(), '.relagit', 'repositories.json');
const __SETTINGS_PATH__ = path.join(os.homedir(), '.relagit', 'settings.json');

export type Settings = {
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
	window: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	locale: ValidLocale;
	externalEditor: 'code' | 'code-insiders' | 'atom' | 'subl';
	activeRepository: string | null;
	repositories: string[];
};

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
	#record: RecursivePartial<Settings> = {};

	constructor() {
		super();

		validatePath();

		this.load();
	}

	get settings() {
		return this.#record;
	}

	getSetting<T extends SettingsKey>(key: T): ResolvePropDeep<Settings, T> {
		const parts = key.split('.');

		let current: string | object = this.#record;

		for (const path of parts) {
			current = (current as Record<string, string>)[path];

			if (!current) break;
		}

		return current as ResolvePropDeep<Settings, T>;
	}

	setSetting<T extends SettingsKey>(key: T, value: ResolvePropDeep<Settings, T>) {
		const parts = key.split('.');

		let current: string | object = this.#record;

		for (const part of parts.slice(0, -1)) {
			if (!(current as Record<string, object>)[part]) {
				(current as Record<string, object>)[part] = {};
			}

			current = (current as Record<string, object>)[part];
		}

		(current as Record<string, unknown>)[parts[parts.length - 1]] = value;

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
			let settings: RecursivePartial<Settings> = {};

			try {
				settings = JSON.parse(fs.readFileSync(__SETTINGS_PATH__, 'utf-8')) as Settings;
			} catch (error) {
				window._showErrorModal(error, 'error.corruptSettings');
			}

			for (const [key, value] of Object.entries(settings)) {
				(this.#record as Record<string, unknown>)[key] = value;
			}

			if (!(this.#record as Record<string, unknown>)['theme']) {
				(this.#record as Record<string, unknown>)['theme'] = 'system';
			}
		}

		if (fs.existsSync(__REPOSITORIES_PATH__)) {
			let repositories: string[] = [];

			try {
				repositories = JSON.parse(
					fs.readFileSync(__REPOSITORIES_PATH__, 'utf-8')
				) as string[];
			} catch (error) {
				window._showErrorModal(error, 'error.corruptSettings');
			}

			this.#record['repositories'] = repositories;
		}
	}
})();

export default SettingsStore;
