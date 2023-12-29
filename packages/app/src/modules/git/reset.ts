import { Repository } from '@app/stores/repository';

import { Git } from './core';

export const Reset = async (repository: Repository | undefined, ref?: string) => {
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
