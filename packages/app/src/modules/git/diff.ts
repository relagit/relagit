const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

import parseGitDiff from 'parse-git-diff';

import { DIFF_CODES } from './constants';
import { Git } from './core';

export const parseDiff = (rawDiff: string) => {
	return parseGitDiff(rawDiff);
};

export const Diff = async (file: string) => {
	if (!fs.existsSync(file)) {
		return DIFF_CODES.REMOVE_ALL;
	}

	const result = await Git({
		directory: path.dirname(file),
		command: 'diff',
		args: ['--no-color', `${file}`, `${file}`]
	});

	if (!result) {
		return DIFF_CODES.ADD_ALL;
	}

	return result;
};
