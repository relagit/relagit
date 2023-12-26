import { Repository } from '@stores/repository';

import { Git } from './core';

export const PreviousCommit = async (
	repository: Repository | undefined,
	sha = 'HEAD'
): Promise<string> => {
	if (!repository) return '';

	const res = await Git({
		directory: repository.path,
		command: 'rev-list',
		args: ['--parents', '-n', '1', sha]
	});

	return (
		res
			.trim()
			.split(/\s/)
			.find((h) => h !== sha) || ''
	).trim();
};
