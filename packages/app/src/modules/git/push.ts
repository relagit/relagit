import { Repository } from '@stores/repository';

import { error } from '../logger';
import { Git } from './core';

export const Push = async (repository: Repository | undefined) => {
	if (!repository) {
		return '';
	}

	const res = await Git({
		directory: repository.path,
		command: 'push',
		args: ['origin', repository.branch]
	}).catch((e) => {
		error('Failed to push', e);
	});

	return res;
};
