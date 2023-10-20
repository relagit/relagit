import { IRepository } from '@stores/repository';

import { Git } from './core';

export const PreviousCommit = async (repository: IRepository, sha = 'HEAD'): Promise<string> => {
	const res = await Git({
		directory: repository.path,
		command: 'rev-list',
		args: ['--parents', '-n', '1', sha]
	});

	console.log({ res });

	return res.trim().split(/\s/)[0].trim();
};
