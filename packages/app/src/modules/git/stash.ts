import { Repository } from '@stores/repository';

import { Git } from './core';

export const Stash = async (repository: Repository) => {
	if (!repository) return;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['save']
	});

	return res;
};

export const ListStash = async (repository: Repository): Promise<Record<number, string[]>> => {
	if (!repository) return;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['list', '--name-status']
	});

	if (!res) return [];

	const stashes = res.split('stash@').slice(1);

	const stashMap: Record<number, string[]> = {};

	for (let i = 0; i < stashes.length; i++) {
		const stash = stashes[i];

		const index = stash.match(/\{(\d+)\}/)[1];

		const lines = stash.split('\n');

		const files: string[] = [];

		for (let j = 0; j < lines.length; j++) {
			const line = lines[j];

			const [, file] = line.split('\t');

			if (file) files.push(file);
		}

		stashMap[index] = files;
	}

	return stashMap;
};

export const PopStash = async (repository: Repository, index: number) => {
	if (!repository) return;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['pop', `stash@{${index}}`]
	});

	return res;
};

export const RemoveStash = async (repository: Repository, index: number) => {
	if (!repository) return;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['drop', `stash@{${index}}`]
	});

	return res;
};
