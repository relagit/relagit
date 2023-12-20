import { Repository } from '@stores/repository';

import { Git } from './core';

export interface LogCommit {
	hash: string;
	tag?: string;
	refs: string;
	author: string;
	date: string;
	message: string;
	files: number;
	insertions: number;
	deletions: number;
}

export const Log = async (repository: Repository): Promise<LogCommit[]> => {
	if (!repository) return [];

	const res = await Git({
		directory: repository.path,
		command: 'log',
		args: ['--pretty=format:%H%n%an%n%ad%n%s%n%D%n', '--stat', '--no-color', '--stat-width=1']
	});

	const commits = res.split(/\n(?=[\w]{40})/g).map((commit) => {
		const [hash, author, date, message, refs] = commit.split('\n');

		let tag: string | undefined;

		if (refs.startsWith('tag: ')) {
			tag = refs.replace(/^tag: /, '');
		}

		const changesLine = commit.split('\n')[commit.split('\n').length - 2].split(',');

		if (!changesLine[0].includes('file')) {
			return {
				hash,
				author,
				tag,
				date,
				message,
				refs,
				files: 0,
				insertions: 0,
				deletions: 0
			};
		}

		const files = Number(changesLine[0]?.trim()?.split(' ')[0]);

		let insertions: number;
		let deletions: number;

		if (changesLine[1]?.includes('insert')) {
			insertions = Number(changesLine[1]?.trim()?.split(' ')[0]);
		} else {
			insertions = 0;
		}

		if (changesLine[1]?.includes('del')) {
			deletions = Number(changesLine[1]?.trim()?.split(' ')[0]);
		} else if (changesLine[2]?.includes('del')) {
			deletions = Number(changesLine[2]?.trim()?.split(' ')[0]);
		} else {
			deletions = 0;
		}

		return {
			hash,
			author,
			date,
			refs,
			tag,
			message,
			files,
			insertions,
			deletions
		};
	});

	return commits;
};
