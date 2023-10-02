const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');
const os = window.Native.DANGEROUS__NODE__REQUIRE('os') as typeof import('os');

const __REPOSITORIES_PATH__ = path.join(os.homedir(), '.relagit', 'repositories.json');
const __SETTINGS_PATH__ = path.join(os.homedir(), '.relagit', 'settings.json');

import { GenericStore } from '.';

export type ALL_LOCALES = 'en';

export interface ISettings {
	commitStyles: {
		[repo: string]: string;
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
	locale: string;
	externalEditor: string;
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
	#record: Map<keyof ISettings, ISettings[keyof ISettings]> | undefined = new Map();
	constructor() {
		super();

		validatePath();

		this.load();
	}

	get settings() {
		return this.#record;
	}

	getSetting<T extends keyof ISettings>(key: keyof ISettings): ISettings[T] {
		return this.#record.get(key) as ISettings[T];
	}

	setSetting(key: keyof ISettings, value: ISettings[keyof ISettings]) {
		this.#record.set(key, value);
		this.save();
		this.emit();
	}

	save() {
		const settings = Object.fromEntries(this.#record.entries());
		delete settings.repositories;

		fs.writeFileSync(__SETTINGS_PATH__, JSON.stringify(settings, null, 4));

		const repositories = this.getSetting('repositories');

		fs.writeFileSync(__REPOSITORIES_PATH__, JSON.stringify(repositories, null, 4));
	}

	load() {
		if (fs.existsSync(__SETTINGS_PATH__)) {
			const settings = JSON.parse(fs.readFileSync(__SETTINGS_PATH__, 'utf-8'));

			for (const [key, value] of Object.entries(settings)) {
				this.#record.set(key as keyof ISettings, value as ISettings[keyof ISettings]);
			}

			if (!this.#record.has('theme')) {
				this.#record.set('theme', 'system');
			}
		}

		if (fs.existsSync(__REPOSITORIES_PATH__)) {
			const repositories = JSON.parse(fs.readFileSync(__REPOSITORIES_PATH__, 'utf-8'));

			this.#record.set('repositories', repositories);
		}
	}
})();

export default SettingsStore;
