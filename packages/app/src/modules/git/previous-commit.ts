import { IRepository } from '@stores/repository';

import { Git } from './core';

export const PreviousCommit = async (repository: IRepository, sha: string) => {
	const res = await Git({
		directory: repository.path,
		command: 'rev-list',
		args: ['--parents', '-n', '1', sha]
	});

	return res.trim();
};
