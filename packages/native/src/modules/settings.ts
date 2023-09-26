import promises from 'node:fs/promises';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const __SETTINGS_PATH__ = path.join(os.homedir(), '.relagit', 'settings.json');

export const getSettings = async () => {
	const dir = path.join(os.homedir(), '.relagit');

	if (!fs.existsSync(dir)) {
		await promises.mkdir(dir);
	}

	if (!fs.existsSync(__SETTINGS_PATH__)) {
		await promises.writeFile(__SETTINGS_PATH__, '{}');
	}

	return new Map<string, unknown>(
		Object.entries(JSON.parse(await promises.readFile(__SETTINGS_PATH__, 'utf-8')))
	);
};

export const setSettings = async (settings: Map<string, unknown>) => {
	await promises.writeFile(
		__SETTINGS_PATH__,
		JSON.stringify(Object.fromEntries(settings), null, 2)
	);
};
