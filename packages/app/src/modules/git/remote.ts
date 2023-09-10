import { Git } from './core';

export const Remote = async (directory: string) => {
	const result = await Git({
		directory,
		command: 'remote',
		args: ['-v']
	});

	if (!result) return [];

	const remotes = result.split('\n').map((res) => {
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
