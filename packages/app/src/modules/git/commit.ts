import StageStore from '@app/stores/stage';
import { Repository } from '@stores/repository';

import { Git } from './core';

export const Commit = async (
	repository: Repository,
	message: string | undefined,
	body?: string
) => {
	if (!repository || !message) {
		return;
	}

	const filePaths = StageStore.getStagedFilePaths(repository.path);

	if (!filePaths || !filePaths.length) {
		return;
	}

	await Git({
		directory: repository.path,
		command: 'add',
		args: ['--', ...filePaths]
	});

	const res = await Git({
		directory: repository.path,
		command: 'commit',
		args: ['-m', message, '-m', body || '']
	});

	return res;
};
