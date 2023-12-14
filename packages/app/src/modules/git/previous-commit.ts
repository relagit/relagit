import { Repository } from '@stores/repository';

import { Git } from './core';

export const PreviousCommit = async (repository: Repository, sha = 'HEAD'): Promise<string> => {
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
