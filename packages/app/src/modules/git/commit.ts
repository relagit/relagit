import { IRepository } from '@stores/repository';
import FileStore from '@stores/files';

import { Git } from './core';

const escape = (str: string) => str.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/`/g, '\\`');

export const Commit = async (repository: IRepository, message: string, body: string) => {
	const filePaths = FileStore.getStagedFilePaths(repository.path);

	await Git({
		directory: repository.path,
		command: 'add',
		args: filePaths
	});

	const res = await Git({
		directory: repository.path,
		command: 'commit',
		args: ['-m', `"${escape(message)}"`, '-m', `"${escape(body)}"`]
	});

	return res;
};
