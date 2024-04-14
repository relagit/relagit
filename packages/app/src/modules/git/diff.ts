import { DIFF } from './constants';
import { Git } from './core';

const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');

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

export const statusToAlpha = (status: GitStatus) => {
	switch (status) {
		case 'modified':
			return 'M';
		case 'added':
			return 'A';
		case 'deleted':
			return 'D';
		case 'renamed':
			return 'R';
		case 'copied':
			return 'C';
		case 'unmerged':
			return 'U';
		case 'unknown':
			return '?';
		case 'untracked':
			return '!';
		case 'type-changed':
			return 'T';
		default:
			return '?';
	}
};

export const Diff = async (file: string, repoPath: string): Promise<string | boolean> => {
	if (!fs.existsSync(file)) {
		return DIFF.REMOVE_ALL;
	}

	const result = await Git({
		directory: repoPath,
		command: 'diff',
		args: ['--no-color', file, file]
	});

	if (!result) {
		return DIFF.ADD_ALL;
	}

	return result;
};
