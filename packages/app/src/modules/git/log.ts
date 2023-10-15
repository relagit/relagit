import { IRepository } from '@stores/repository';

import { Git } from './core';

export interface ILogCommit {
	hash: string;
	author: string;
	date: string;
	message: string;
	files: number;
	insertions: number;
	deletions: number;
}

export const Log = async (repository: IRepository): Promise<ILogCommit[]> => {
	if (!repository) return [];

	const res = await Git({
		directory: repository.path,
		command: 'log',
		args: ['--pretty=format:%H%n%an%n%ad%n%s%n', '--stat', '--no-color', '--stat-width=1']
	});

	console.log(res);

	const commits = res.split(/\n(?=[\w]{40})/g).map((commit) => {
		const [hash, author, date, message] = commit.split('\n');

		const changesLine = commit.split('\n').pop().split(', ');

		if (!changesLine.includes('file')) {
			return {
				hash,
				author,
				date,
				message,
				files: 0,
				insertions: 0,
				deletions: 0
			};
		}

		const files = Number(changesLine[0]?.split(' '));
		const insertions = changesLine[1]?.includes('insert')
			? Number(changesLine[1]?.split(' ')[0])
			: 0;
		const deletions = changesLine[1]?.includes('del')
			? Number(changesLine[1]?.split(' ')[0])
			: changesLine[2]?.includes('del')
			? Number(changesLine[2]?.split(' ')[0])
			: 0;

		return {
			hash,
			author,
			date,
			message,
			files,
			insertions,
			deletions
		};
	});

	return commits;
};
