import { IRepository } from '@stores/repository';

import { Git } from './core';

export const Pull = async (repository: IRepository) => {
	const res = await Git({
		directory: repository.path,
		command: 'pull',
		args: ['origin', repository.branch]
	});

	return res;
};
