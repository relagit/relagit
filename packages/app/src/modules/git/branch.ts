import { Git } from './core';

export const Branch = async (directory: string) => {
	const result = await Git({
		directory,
		command: 'rev-parse',
		args: ['--abbrev-ref', 'HEAD']
	});

	return result;
};
