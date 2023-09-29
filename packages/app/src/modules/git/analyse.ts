import { Git } from './core';

export const Analyse = async (directory: string) => {
	await Git({
		directory,
		command: 'fetch',
		args: []
	});

	const branch = await Git({
		directory,
		command: 'rev-parse',
		args: ['--abbrev-ref', 'HEAD']
	});

	const commit = await Git({
		directory,
		command: 'rev-parse',
		args: ['HEAD']
	});

	const remote = await Git({
		directory,
		command: 'remote',
		args: ['get-url', 'origin']
	});

	const status = await Git({
		directory,
		command: 'status',
		args: ['-b', '--porcelain']
	});

	const ahead = status.match(/ahead (\d+)/);
	const behind = status.match(/behind (\d+)/);

	const dirname = directory.split('/').pop();

	return {
		branch,
		commit,
		dirname,
		remote,
		aheadOrBehind: (ahead ? Number(ahead[1]) : 0) - (behind ? Number(behind[1]) : 0)
	};
};
