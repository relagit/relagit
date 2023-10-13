const sucrase = window.Native.DANGEROUS__NODE__REQUIRE('sucrase') as typeof import('sucrase');
const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

import { Theme, __RELAGIT_PATH__, makeConsole, require } from './workflows';
import { addCSS, updateCSS } from '../dom';
import { error } from '../logger';

const __THEMES_PATH__ = path.join(__RELAGIT_PATH__, 'themes');

export const loadThemes = async () => {
	if (!fs.existsSync(__THEMES_PATH__)) {
		fs.mkdirSync(__THEMES_PATH__);
	}

	const _themes = fs.readdirSync(__THEMES_PATH__);

	for (const themePath of _themes) {
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

			const theme = fn(require, {}, {}, makeConsole(path.basename(themePath)));

			themes.add({ ...theme, filename: themePath });
		} catch (e) {
			error('Failed to load theme', e);
		}
	}

	enableThemes();
};

const enableThemes = () => {
	for (const theme of themes) {
		addCSS(
			theme.name,
			path.join(__THEMES_PATH__, theme.filename, `./${theme.main || 'index.css'}`),
			true
		);

		window.Native.listeners.WATCHER.add(
			path.join(__THEMES_PATH__, theme.filename, `./${theme.main || 'index.css'}`),
			(_, changepath) => {
				if (changepath) {
					updateCSS(
						theme.name,
						path.join(
							__THEMES_PATH__,
							theme.filename,
							`./${theme.main || 'index.css'}`
						),
						true
					);
				}
			}
		);
	}
};

export const themes = new Set<
	Theme & {
		filename: string;
	}
>();
