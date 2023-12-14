import { Repository } from '@stores/repository';

import { Git } from './core';

export const Stash = async (repository: Repository) => {
	if (!repository) return;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: []
	});

	return res;
};

export const ListStash = async (repository: Repository): Promise<string[]> => {
	if (!repository) return;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['list', '--name-status']
	});

	if (!res) return [];

	const lines = res.split('stash@')[1].split('\n');

	const files: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_, file] = line.split('\t');

		if (file) files.push(file);
	}

	return files;
};

export const PopStash = async (repository: Repository) => {
	if (!repository) return;

	const res = await Git({
		directory: repository.path,
		command: 'stash',
		args: ['pop']
	});

	return res;
};
