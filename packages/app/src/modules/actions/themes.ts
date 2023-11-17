import SettingsStore from '@app/stores/settings';

import { addCSS, removeCSS, updateCSS } from '../dom';
import { error } from '../logger';
import { Theme, __RELAGIT_PATH__, makeConsole, require } from './workflows';

const sucrase = window.Native.DANGEROUS__NODE__REQUIRE('sucrase') as typeof import('sucrase');
const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

const __THEMES_PATH__ = path.join(__RELAGIT_PATH__, 'themes');

export const loadThemes = async () => {
	if (!fs.existsSync(__THEMES_PATH__)) {
		fs.mkdirSync(__THEMES_PATH__);
	}

	const _themes = fs.readdirSync(__THEMES_PATH__);

	for (const themePath of _themes) {
		let theme: Theme & {
			filename: string;
			id: string;
		};

		try {
			const possiblePaths = [
				path.join(__THEMES_PATH__, themePath, 'index.ts'),
				path.join(__THEMES_PATH__, themePath, 'index.js')
			];

			const data = await fs.promises.readFile(
				possiblePaths.find((p) => fs.existsSync(p)),
				'utf8'
			);

			const fn = new Function(
				'require',
				'exports',
				'module',
				'console',
				sucrase.transform(data, {
					transforms: ['typescript', 'imports']
				}).code + '\n\nreturn module.exports || exports.default || exports || null;'
			);

			const th = fn(require, {}, {}, makeConsole(path.basename(themePath)));

			themes.add({ ...th, filename: themePath, id: themePath.replace(/[^\w]/g, '-') });

			theme = { ...th, filename: themePath, id: themePath.replace(/[^\w]/g, '-') };
		} catch (e) {
			error('Failed to load theme', e);
		}

		window.Native.listeners.WATCHER.add(
			path.join(__THEMES_PATH__, theme.filename, theme.main),
			() => {
				updateCSS(theme.id, path.join(__THEMES_PATH__, theme.filename, theme.main), true); // update will not add/remove so we can call it every time
			}
		);
	}

	enableThemes();
};

export const toggleTheme = (id: string) => {
	SettingsStore.setSetting(
		'enabledThemes',
		SettingsStore.getSetting('enabledThemes')?.includes(id)
			? SettingsStore.getSetting('enabledThemes')?.filter((t) => t !== id)
			: [...(SettingsStore.getSetting('enabledThemes') || []), id]
	);

	enableThemes();
};

const ENABLED = new Set<string>();

const enableThemes = () => {
	for (const theme of themes) {
		if (!SettingsStore.getSetting('enabledThemes')?.includes(theme.id)) {
			removeCSS(theme.id);

			ENABLED.delete(theme.id);

			continue;
		}

		if (ENABLED.has(theme.id)) continue;

		addCSS(
			theme.id,
			path.join(__THEMES_PATH__, theme.filename, `./${theme.main || 'index.css'}`),
			true
		);

		ENABLED.add(theme.id);
	}
};

export const themes = new Set<
	Theme & {
		filename: string;
		id: string;
	}
>();
