const path = window.Native.DANGEROUS__NODE__REQUIRE('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');
const os = window.Native.DANGEROUS__NODE__REQUIRE('os');

const __SETTINGS_PATH__ = path.join(os.homedir(), '.relagit', 'settings.json');
const __REPOSITORIES_PATH__ = path.join(os.homedir(), '.relagit', 'repositories.json');

import { GenericStore } from '.';

export interface ISettings {
	commitStyles: {
		[repo: string]: string;
	};
	enforceCommitMessageStyle: boolean;
	theme: 'light' | 'dark' | 'system';
	vibrancy: string | boolean;
	expandedSettings: boolean;
	fontFamily: string;
	accentColor: string;
	repositories: string[];
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
	#record: Map<keyof ISettings, ISettings[keyof ISettings]> = new Map();
	constructor() {
		super();

		validatePath();

		this.load();
	}

	get settings() {
		return this.#record;
	}

	getSetting(key: keyof ISettings): ISettings[keyof ISettings] {
		return this.#record.get(key);
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
		}

		if (fs.existsSync(__REPOSITORIES_PATH__)) {
			const repositories = JSON.parse(fs.readFileSync(__REPOSITORIES_PATH__, 'utf-8'));

			this.#record.set('repositories', repositories);
		}
	}
})();

export default SettingsStore;
