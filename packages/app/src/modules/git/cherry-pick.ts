import { Repository } from '@app/stores/repository';

import { Git } from './core';
import { LogCommit } from './log';

export const CherryPick = (repository: Repository | undefined, commit: LogCommit | null) => {
	if (!repository || !commit) return;

	return Git({
		directory: repository.path,
		command: 'cherry-pick',
		args: [commit.hash]
	});
};
