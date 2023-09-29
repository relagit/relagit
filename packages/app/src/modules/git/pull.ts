import { IRepository } from '@stores/repository';

import { Git } from './core';

export const Pull = async (repository: IRepository) => {
	try {
		const res = await Git({
			directory: repository.path,
			command: 'pull',
			args: ['origin', repository.branch]
		});

		return res;
	} catch (error) {
		if ((error as string).startsWith?.('From ')) return;

		throw error;
	}
};
