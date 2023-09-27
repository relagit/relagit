import { IRepository } from '@stores/repository';

import { Git } from './core';

export interface ILogCommit {
	hash: string;
	author: string;
	date: string;
	message: string;
}

export const Log = async (repository: IRepository): Promise<ILogCommit[]> => {
	if (!repository) return [];

	const res = await Git({
		directory: repository.path,
		command: 'log',
		args: ['--pretty=format:%H%n%an%n%ad%n%s%n']
	});

	const commits = res.split('\n\n').map((commit) => {
		const [hash, author, date, message] = commit.split('\n');

		return {
			hash,
			author,
			date,
			message
		};
	});

	return commits;
};
