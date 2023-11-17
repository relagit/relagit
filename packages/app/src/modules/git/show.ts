import parse, { GitDiff } from 'parse-git-diff';

import { Git } from './core';
import { GitStatus } from './diff';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');

export interface IPastCommit {
	hash: string;
	files: {
		filename: string;
		path: string;
		diff: GitDiff;
		status: GitStatus;
	}[];
}

export const ShowOrigin = async (
	repository: IRepository,
	file: string,
	treeish = 'HEAD',
	encoding: BufferEncoding = 'utf8'
): Promise<string | null> => {
	if (!repository || !file) return null;

	if (file.startsWith('/')) file = file.slice(1, file.length);

	const options = {
		encoding
	};

	const res = await Git({
		directory: repository.path,
		command: 'show',
		// make sure it only shows the raw file contents, no diff or anything
		args: [`${treeish}:"${file}"`, '--', '--no-patch', '--format=format:', '--'],
		opts: options
	});

	return res;
};

export const Show = async (repository: string, hash: string): Promise<IPastCommit | null> => {
	if (!repository) return null;

	const res = await Git({
		directory: repository,
		command: 'show',
		args: [hash, '"--pretty=format:"']
	});

	const commit: IPastCommit = {
		hash,
		files: []
	};

	const files = res.split(/^diff --git/gm); // adding the "^" should ensure we are never splitting in the middle of a file

	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		if (file.length === 0) continue;

		const [name, ...diff] = file.split('\n');

		const _diff = parse('diff --git ' + name + '\n' + diff.join('\n') + '');

		const p = path.dirname(name.replace('a/', '').split(' b/').pop());

		const binaryStatus = file.includes('files /dev/null')
			? 'added'
			: file.includes('files a/') && file.includes('and b/')
			  ? 'modified'
			  : 'deleted';

		commit.files.push({
			filename: path.basename(name.replace('a/', '').split(' b/').pop()),
			path: p === '.' ? '' : p,
			diff: _diff,
			status:
				_diff.files[0]?.type === 'ChangedFile'
					? 'modified'
					: _diff.files[0]?.type === 'AddedFile'
					  ? 'added'
					  : _diff.files[0]?.type === 'DeletedFile'
					    ? 'deleted'
					    : _diff.files[0]?.type === 'RenamedFile'
					      ? 'renamed'
					      : binaryStatus
		});
	}

	return commit;
};
