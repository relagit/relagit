const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

import parseGitDiff from 'parse-git-diff';

import { DIFF_CODES } from './constants';
import { Git } from './core';

export type GitStatus =
	| 'added'
	| 'modified'
	| 'deleted'
	| 'untracked'
	| 'unknown'
	| 'unmerged'
	| 'copied'
	| 'renamed'
	| 'type-changed';

export const parseDiff = (rawDiff: string) => {
	return parseGitDiff(rawDiff);
};

export const Diff = async (file: string, repoPath: string) => {
	if (!fs.existsSync(file)) {
		return DIFF_CODES.REMOVE_ALL;
	}

	const result = await Git({
		directory: repoPath,
		command: 'diff',
		args: ['--no-color', `${file}`, `${file}`]
	});

	if (!result) {
		return DIFF_CODES.ADD_ALL;
	}

	return result;
};
