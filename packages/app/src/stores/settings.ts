import { GenericStore } from '.';

import { ValidLocale } from '@app/modules/i18n';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');
const os = window.Native.DANGEROUS__NODE__REQUIRE('os') as typeof import('os');

const __REPOSITORIES_PATH__ = path.join(os.homedir(), '.relagit', 'repositories.json');
const __SETTINGS_PATH__ = path.join(os.homedir(), '.relagit', 'settings.json');

export interface ISettings {
	commitStyles: {
		[repo: string]: string;
	};
	onboarding: {
		dismissed: boolean;
		step: number;
	};
	enforceCommitMessageStyle: boolean;
	preferParens: boolean;
	theme: 'light' | 'dark' | 'system';
	vibrancy: string | boolean;
	expandedSettings: boolean;
	fontFamily: string;
	accentColor: string;
	repositories: string[];
	activeRepository: string;
	locale: ValidLocale;
	externalEditor: 'code' | 'code-insiders' | 'atom' | 'subl';
	enabledThemes: string[];
}

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

const SettingsStore = new (class Settings extends GenericStore {
	#record: Partial<ISettings> = {};
	constructor() {
		super();

		validatePath();

		this.load();
	}

	get settings() {
		return this.#record;
	}

	getSetting<T extends keyof ISettings>(key: T): ISettings[T] {
		return this.#record[key] as ISettings[T];
	}

	setSetting<T extends keyof ISettings>(key: T, value: ISettings[T]) {
		this.#record[key] = value;
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
			let settings: Partial<ISettings> = {};

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
