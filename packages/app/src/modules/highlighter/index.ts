import purify from 'dompurify';
import { toHtml } from 'hast-util-to-html';

import { error, warn } from '@modules/logger';

const StarryNight = window.Native.libraries.starryNight;

export let highlighter: Awaited<ReturnType<typeof StarryNight.createStarryNight>>;

StarryNight.createStarryNight(StarryNight.all, {}).then((h) => (highlighter = h));

export default (code: string, language: string) => {
	if (!highlighter) {
		warn('Highlighter not loaded yet');

		return code
			.split('\n')
			.map((line) => `<span>${purify.sanitize(line)}</span>`)
			.join('\n');
	}

	if (language === 'text') {
		return code
			.split('\n')
			.map((line) => `<span>${purify.sanitize(line)}</span>`)
			.join('\n');
	}

	try {
		return purify.sanitize(toHtml(highlighter.highlight(code, language)));
	} catch (e) {
		error('Failed to highlight code', e);

		return code
			.split('\n')
			.map((line) => `<span>${purify.sanitize(line)}</span>`)
			.join('\n');
	}
};

export const langFrom = (filename: string | undefined) => {
	if (!filename) return 'text';

	const ext = '.' + filename.split('.').pop();

	return highlighter.flagToScope(ext);
};
