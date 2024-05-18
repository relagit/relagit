import fs from 'node:fs';
import promises from 'node:fs/promises';
import path from 'node:path';

import type { RecursivePartial } from '~/app/src/shared';
import type { Settings } from '~/app/src/stores/settings';

import { ensureStorageLocation, migrateLegacyFiles } from './native';

migrateLegacyFiles();

export const __RELAGIT_PATH__ = ensureStorageLocation();
const __SETTINGS_PATH__ = path.join(__RELAGIT_PATH__, 'settings.json');

export const backgroundFromTheme = (theme: string, isDark: boolean) => {
	if (theme === 'system') {
		return isDark ? '#141515' : '#ffffff';
	}

	return theme === 'dark' ? '#141515' : '#ffffff';
};

export const editorName = (name?: Settings['externalEditor']) => {
	switch (name) {
		case 'code':
			return 'Visual Studio Code';
		case 'subl':
			return 'Sublime Text';
		case 'codium':
			return 'VSCodium';
		case 'atom':
			return 'Atom';
		case 'fleet':
			return 'Fleet';
		case 'zed':
			return 'Zed';
		case 'code-insiders':
			return 'Visual Studio Code Insiders';
		default:
			return 'Code Editor';
	}
};

let lastSettings: Settings | null = null;

export const getSettings = async (): Promise<RecursivePartial<Settings>> => {
	try {
		if (!fs.existsSync(__RELAGIT_PATH__)) {
			await promises.mkdir(__RELAGIT_PATH__);
		}

		if (!fs.existsSync(__SETTINGS_PATH__)) {
			await promises.writeFile(__SETTINGS_PATH__, '{}');
		}

		const res = JSON.parse(await promises.readFile(__SETTINGS_PATH__, 'utf8'));

		lastSettings = res;

		return res;
	} catch (e) {
		return lastSettings || {};
	}
};

export const updateSettings = async (settings: RecursivePartial<Settings>) => {
	const current = await getSettings();

	const newSettings = { ...current, ...settings };

	await promises.writeFile(__SETTINGS_PATH__, JSON.stringify(newSettings, null, 2));

	return true;
};
