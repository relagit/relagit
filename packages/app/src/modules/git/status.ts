import { Git } from './core';

export const Status = async (directory: string) => {
	const result = await Git({
		directory,
		command: 'status',
		args: ['--porcelain', '--untracked-files=all']
	});

	return result;
};
