import { Repository } from '@app/stores/repository';

import { Git } from './core';

export const Remote = async (directory: string) => {
	const result = await Git({
		directory,
		command: 'remote',
		args: ['-v']
	});

	if (!result) return [];

	const remotes = result
		.split('\n')
		.filter((l) => l && l.length)
		.map((res) => {
			const [name, body] = res.split('\t');

			const [url, type] = body.split(' ');

			return {
				name,
				url,
				type: type.replace('(', '').replace(')', '')
			};
		});

	return remotes;
};

export const AddRemote = async (repository: Repository | undefined, name: string, url: string) => {
	if (!repository) return;

	await Git({
		directory: repository.path,
		command: 'remote',
		args: ['add', name, url]
	});
};
