import { Repository } from '@stores/repository';

import { Git } from './core';

export const Pull = async (repository: Repository | undefined) => {
	if (!repository) return;

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
