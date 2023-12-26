import { Git } from './core';
import { GitStatus } from './diff';
import { GitDiff, parseDiff } from './parse-diff';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');

export interface PastCommit {
	hash: string;
	files: {
		filename: string;
		path: string;
		diff: GitDiff;
		status: GitStatus;
	}[];
}

export const ShowOrigin = async (
	repository: Repository | undefined,
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

export const Show = async (
	repository: string | undefined,
	hash: string
): Promise<PastCommit | undefined> => {
	if (!repository) return undefined;

	const res = await Git({
		directory: repository,
		command: 'show',
		args: hash ? [hash, '"--pretty=format:"'] : ['--pretty=format:']
	});

	const commit: PastCommit = {
		hash,
		files: []
	};

	const files = res.split(/^diff --git/gm); // adding the "^" should ensure we are never splitting in the middle of a file

	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		if (file.length === 0) continue;

		const [name, ...diff] = file.split('\n');

		const _diff = parseDiff('diff --git ' + name + '\n' + diff.join('\n') + '');

		const p = path.dirname(name.replace('a/', '').split(' b/').pop()!);

		let status: GitStatus | undefined = undefined;

		if (file.includes('files /dev/null')) {
			status = 'added';
		} else if (file.includes('files a/') && file.includes('and b/')) {
			status = 'modified';
		}

		if (_diff.files[0]?.type === 'AddedFile') status = 'added';
		if (_diff.files[0]?.type === 'ChangedFile') status = 'modified';
		if (_diff.files[0]?.type === 'DeletedFile') status = 'deleted';
		if (_diff.files[0]?.type === 'RenamedFile') status = 'renamed';

		commit.files.push({
			filename: path.basename(name.replace('a/', '').split(' b/').pop()!),
			path: p === '.' ? '' : p,
			diff: _diff,
			status: status ?? 'deleted'
		});
	}

	return commit;
};
