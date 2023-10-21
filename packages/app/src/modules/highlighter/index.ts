const StarryNight = window.Native.libraries.starryNight;

import { Grammar, Root } from '@wooorm/starry-night';
import { error, warn } from '@modules/logger';
import { toHtml } from 'hast-util-to-html';

let highlighter: {
	flagToScope: (flag: string) => string | undefined;
	highlight: (value: string, scope: string) => Root;
	missingScopes: () => Array<string>;
	register: (grammars: Array<Grammar>) => Promise<undefined>;
	scopes: () => Array<string>;
} | null = null;

StarryNight.createStarryNight(StarryNight.all).then((h) => (highlighter = h));

export default (code: string, language: string) => {
	if (!highlighter) {
		warn('Highlighter not loaded yet');

		return code
			.split('\n')
			.map((line) => `<span>${line}</span>`)
			.join('\n');
	}

	if (language === 'text') {
		return code
			.split('\n')
			.map((line) => `<span>${line}</span>`)
			.join('\n');
	}

	try {
		// @ts-expect-error - missing types
		return toHtml(highlighter.highlight(code, language));
	} catch (e) {
		error('Failed to highlight code', e);

		return code
			.split('\n')
			.map((line) => `<span>${line}</span>`)
			.join('\n');
	}
};

export const langFrom = (filename: string) => {
	if (!filename) return 'text';

	const ext = '.' + filename.split('.').pop();

	return (
		StarryNight.all.find((g) => g.extensions.includes(ext))?.scopeName ??
		StarryNight.all.find((g) => g.scopeName.includes(ext))?.scopeName ?? // some grammars do not have their main file extension in the extensions array (*cough* YAML *cough*)
		'text'
	);
};
