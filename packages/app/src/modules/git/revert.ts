import { Repository } from '@stores/repository';

import { Git } from './core';

export const Revert = async (repository?: Repository, sha?: string) => {
	if (!repository || !sha) {
		return;
	}

	const res = await Git({
		directory: repository.path,
		command: 'revert',
		args: [sha, '--no-edit']
	});

	return res;
};
