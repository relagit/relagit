import { Repository } from '@stores/repository';

import { Git } from './core';

export interface LogCommit {
	hash: string;
	tag?: string;
	refs: string;
	from?: string;
	to?: string;
	branch?: string;
	author: string;
	date: string;
	message: string;
	files: number;
	insertions: number;
	deletions: number;
}

const getTreeDetails = (refs: string) => {
	if (refs.includes('->')) {
		const [from, to] = refs.split(', ')[0].split('->');

		return {
			from: from.trim(),
			to: to.trim()
		};
	}

	if (refs.startsWith('tag: ')) {
		return {
			tag: refs.replace(/^tag: /, '').trim()
		};
	}

	if (refs.includes(', ')) {
		const [_, branch] = refs.split(', ');

		return {
			branch: (branch || _).trim()
		};
	}
};

export const Log = async (repository: Repository): Promise<LogCommit[]> => {
	if (!repository) return [];

	const res = await Git({
		directory: repository.path,
		command: 'log',
		args: ['--pretty=format:%H%n%an%n%ad%n%s%n%D%n', '--stat', '--no-color', '--stat-width=1']
	});

	const commits = res.split(/\n(?=[\w]{40})/g).map((commit) => {
		const [hash, author, date, message, refs] = commit.split('\n');

		const treeDetails = getTreeDetails(refs);

		const changesLine = commit.split('\n')[commit.split('\n').length - 2].split(',');

		if (!changesLine[0].includes('file')) {
			return {
				...treeDetails,
				hash,
				author,
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
			...treeDetails,
			hash,
			author,
			date,
			refs,
			message,
			files,
			insertions,
			deletions
		};
	});

	return commits;
};
