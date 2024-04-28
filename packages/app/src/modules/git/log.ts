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

export const getMonthCounts = (
	commits: LogCommit[]
): {
	index: number;
	sortindex: number;
	value: number;
}[] => {
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();

	const startMonth = (currentMonth + 1) % 12;
	const startYear = currentMonth !== 11 ? currentYear - 1 : currentYear;

	const monthCounts: {
		index: number;
		sortindex: number;
		value: number;
	}[] = [];

	const monthsYears: [number, number][] = commits.map((commit) => [
		new Date(commit.date).getMonth(),
		new Date(commit.date).getFullYear()
	]);

	for (const [month, year] of monthsYears) {
		if (year < startYear || (year === startYear && month < startMonth)) {
			continue;
		}

		const actualMonth = month;

		if (!monthCounts.find((m) => m.index === actualMonth)) {
			monthCounts.push({ index: actualMonth, value: 0, sortindex: 0 });
		}

		const index = monthCounts.findIndex((m) => m.index === actualMonth);

		// the startMonth should always be the first month in the array, then the next month, etc.
		monthCounts[index].sortindex =
			month >= startMonth ? month - startMonth : 12 - startMonth + month;

		monthCounts[index].value++;
	}

	for (let i = 0; i < 12; i++) {
		if (!monthCounts.find((m) => m.index === i)) {
			monthCounts.push({
				index: i,
				value: 0,
				sortindex: i >= startMonth ? i - startMonth : 12 - startMonth + i
			});
		}
	}

	return monthCounts.sort((a, b) => a.sortindex - b.sortindex);
};
