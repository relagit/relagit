import { IRepository } from '@stores/repository';

import { Git } from './core';

export const Push = async (repository: IRepository) => {
	const res = await Git({
		directory: repository.path,
		command: 'push',
		args: ['origin', repository.branch]
	});

	return res;
};
