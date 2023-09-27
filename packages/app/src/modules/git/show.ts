const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');

import parse, { GitDiff } from 'parse-git-diff';

import { IRepository } from '@stores/repository';

import { Git } from './core';

export interface IPastCommit {
	hash: string;
	files: {
		filename: string;
		path: string;
		diff: GitDiff;
	}[];
}

export const Show = async (repository: string, hash: string): Promise<IPastCommit | null> => {
	if (!repository) return null;

	const res = await Git({
		directory: repository,
		command: 'show',
		args: [hash, '--pretty=format:']
	});

	const commit = {
		hash,
		files: []
	};

	const files = res.split('diff --git ');

	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		if (file.length === 0) continue;

		const [filename, ...diff] = file.split('\n');

		commit.files.push({
			filename: path.basename(filename.replace('a/', '').split(' b/').pop()),
			path: path.dirname(filename.replace('a/', '').split(' b/').pop()),
			diff: parse('diff --git ' + filename + '\n' + diff.join('\n'))
		});
	}

	return commit;
};
