import { Git } from './core';

export const Status = async (directory: string) => {
	const result = await Git({
		directory,
		command: 'status',
		args: ['--porcelain']
	});

	return result;
};
