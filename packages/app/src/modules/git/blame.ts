import { Git } from './core';

export const parseBlame = (
	rawBlame: string
): {
	hash?: string;
	author?: string;
	email?: string;
	date: Date;
	message?: string;
	line?: string;
	changes: string;
}[] => {
	const lines = rawBlame.split(/^(?=\S{40} \d)/gm).filter(Boolean);
	const blame = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		const parts = line.split('\n').filter((part) => part !== '');

		blame.push({
			hash: parts
				.find((part) => !part.startsWith('filename ') && !part.startsWith('\t'))
				?.split(' ')[0],
			author: parts
				.find((part) => part.startsWith('author '))
				?.split(' ')
				.slice(1)
				.join(' '),
			email: parts
				.find((part) => part.startsWith('author-mail '))
				?.split(' ')
				.slice(1)
				.join(' ')
				.replace('<', '')
				.replace('>', ''),
			date: new Date(
				Number(parts.find((part) => part.startsWith('author-time '))?.split(' ')[1]) * 1000
			),
			message: parts
				.find((part) => part.startsWith('summary '))
				?.split(' ')
				.slice(1)
				.join(' '),
			line: parts
				.find((part) => !part.startsWith('filename ') && !part.startsWith('\t'))
				?.split(' ')[1],
			changes: parts[parts.length - 1]
		});
	}

	return blame;
};

export const Blame = async (repo: string, file: string, commitish?: string) => {
	if (!repo || !file) return [];

	const result = await Git({
		directory: repo,
		command: 'blame',
		args:
			// we have to do this as just passing "" will be a bad revision
			commitish ?
				['-w', '-C', '--line-porcelain', '--date=iso', commitish, '--', file]
			:	['-w', '-C', '--line-porcelain', '--date=iso', '--', file]
	});

	return parseBlame(result);
};
