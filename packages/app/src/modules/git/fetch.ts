import { Repository } from '@app/stores/repository';

import { Git } from './core';

export const Fetch = (repository: Repository | string | null | undefined) => {
	if (!repository) return;

	Git({
		directory: typeof repository === 'string' ? repository : repository.path,
		command: 'fetch',
		args: []
	});
};
