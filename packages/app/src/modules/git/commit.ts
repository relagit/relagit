import FileStore from '@stores/files';
import { Repository } from '@stores/repository';

import { Git } from './core';

const escape = (str: string) => str.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/`/g, '\\`');

export const Commit = async (
	repository: Repository,
	message: string | undefined,
	body?: string
) => {
	if (!repository || !message) {
		return;
	}

	const filePaths = FileStore.getStagedFilePaths(repository.path);

	if (!filePaths || !filePaths.length) {
		return;
	}

	await Git({
		directory: repository.path,
		command: 'add',
		args: filePaths
	});

	const res = await Git({
		directory: repository.path,
		command: 'commit',
		args: ['-m', `"${escape(message)}"`, '-m', `"${escape(body || '')}"`]
	});

	return res;
};
