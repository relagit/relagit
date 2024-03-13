import { Git } from './core';

export type GraphPoint = {
	hash: string;
	parents: string[];
	refs: string;
	indent: number;
};

export const Graph = async (repository: Repository): Promise<GraphPoint[]> => {
	if (!repository) return [];

	const res = await Git({
		directory: repository.path,
		command: 'log',
		args: ['--graph', '--pretty=format:%H||%P||%d']
	});

	const commits = res.split('\n').map((commit) => {
		const [indents, rest] = commit.split('*');

		if (!rest) return;

		const [hash, parents, refs] = rest.split('||');

		return {
			hash: hash.trim(),
			parents: parents?.split(' '),
			refs: refs.trim(),
			indent: indents.length
		};
	});

	return commits.filter(Boolean);
};
