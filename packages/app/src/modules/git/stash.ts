import { Repository } from '@stores/repository';

import { Git } from './core';
import { GitStatus } from './diff';
import { GitDiff, parseDiff } from './parse-diff';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');

export interface StashDiff {
	files: {
		filename: string;
		path: string;
		diff: GitDiff;
		status: GitStatus;
		from?: string;
		fromPath?: string;
	}[];
}

export interface StashEntry {
	index: number;
	message: string;
	branch: string;
	files: string[];
}

export const Stash = async (repository: Repository | undefined) => {
	if (!repository) return;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['save']
	});

	return res;
};

export const ListStash = async (
	repository: Repository | undefined
): Promise<StashEntry[]> => {
	if (!repository) return [];

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['list', '--name-status']
	});

	if (!res) return [];

	const stashes = res.split('stash@').slice(1);

	const stashEntries: StashEntry[] = [];

	for (let i = 0; i < stashes.length; i++) {
		const stash = stashes[i];

		const index = Number(stash.match(/\{(\d+)\}/)![1]);

		const lines = stash.split('\n');

		// First line contains: {index}: On <branch>: <message> or {index}: WIP on <branch>: <hash> <message>
		const headerLine = lines[0];
		let message = '';
		let branch = '';

		const headerMatch = headerLine.match(/\}:\s*(?:WIP\s+)?[Oo]n\s+([^:]+):\s*(.*)/);
		if (headerMatch) {
			branch = headerMatch[1].trim();
			message = headerMatch[2].trim();
		}

		const files: string[] = [];

		for (let j = 1; j < lines.length; j++) {
			const line = lines[j];

			const [, file] = line.split('\t');

			if (file) files.push(file);
		}

		stashEntries.push({ index, message, branch, files });
	}

	return stashEntries;
};

export const ShowStash = async (
	repository: Repository | undefined,
	index: number
): Promise<StashDiff | undefined> => {
	if (!repository) return undefined;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['show', '-p', `stash@{${index}}`]
	});

	if (!res) return undefined;

	const stashDiff: StashDiff = { files: [] };

	const files = res.split(/^diff --git/gm);

	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		const isRename = file.includes('rename from') && file.includes('rename to');

		if (file.length === 0) continue;

		if (!isRename) {
			const [name, ...diff] = file.split('\n');

			const _diff = parseDiff('diff --git ' + name + '\n' + diff.join('\n'));

			const p = path.dirname(name.replace('a/', '').split(' b/').pop()!);

			let status: GitStatus | undefined = undefined;

			if (_diff.files[0]?.type === 'AddedFile') status = 'added';
			if (_diff.files[0]?.type === 'ChangedFile') status = 'modified';
			if (_diff.files[0]?.type === 'DeletedFile') status = 'deleted';
			if (_diff.files[0]?.type === 'RenamedFile') status = 'renamed';

			stashDiff.files.push({
				filename: path.basename(name.replace('a/', '').split(' b/').pop()!),
				path: p === '.' ? '' : p,
				diff: _diff,
				status: status ?? 'modified'
			});
		} else {
			const [name, , from, to, ...diff] = file.split('\n');

			const _diff = parseDiff('diff --git ' + name + '\n' + diff.join('\n'));

			const toFile = to.match(/rename to (.*)/)?.[1];
			const fromFile = from.match(/rename from (.*)/)?.[1];

			stashDiff.files.push({
				filename: path.basename(toFile!),
				path: path.dirname(toFile!),
				diff: _diff,
				status: 'renamed',
				from: path.basename(fromFile!),
				fromPath: path.dirname(fromFile!)
			});
		}
	}

	return stashDiff;
};

export const PopStash = async (repository: Repository | undefined, index: number) => {
	if (!repository) return;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['pop', `stash@{${index}}`]
	});

	return res;
};

export const RemoveStash = async (repository: Repository | undefined, index: number) => {
	if (!repository) return;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['drop', `stash@{${index}}`]
	});

	return res;
};
