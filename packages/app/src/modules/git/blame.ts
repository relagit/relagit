import { Git } from './core';

export const parseBlame = (
	rawBlame: string
): {
	hash: string;
	author: string;
	date: Date;
	message: string;
	line: string;
}[] => {
	const lines = rawBlame.split('boundary');
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
			date: new Date(
				Number(parts.find((part) => part.startsWith('author-time '))?.split(' ')[1])
			),
			message: parts
				.find((part) => part.startsWith('summary '))
				?.split(' ')
				.slice(1)
				.join(' '),
			line: parts
				.find((part) => !part.startsWith('filename ') && !part.startsWith('\t'))
				?.split(' ')[1]
		});
	}

	return blame;
};

export const Blame = async (repo: string, file: string) => {
	const result = await Git({
		directory: repo,
		command: 'blame',
		args: ['-w', '--line-porcelain', file]
	});

	return parseBlame(result);
};
