import { Repository } from '@app/stores/repository';

import { Git } from './core';

export const Reset = async (repository: Repository, ref?: string) => {
	if (!repository) {
		return;
	}

	const result = await Git({
		directory: repository.path,
		command: 'reset',
		args: [ref || 'HEAD']
	});

	return result;
};
