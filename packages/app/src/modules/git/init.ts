import { Git } from './core';

export const Init = async (directory: string) => {
	const result = await Git({
		directory,
		command: 'init',
		args: []
	});

	return result;
};
