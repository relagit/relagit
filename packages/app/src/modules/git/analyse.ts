import { Git } from './core';

export const Analyse = async (directory: string) => {
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
		branch: branch.trim(),
		commit: commit.trim(),
		dirname,
		remote: remote.trim(),
		ahead: ahead ? parseInt(ahead[1]) : 0,
		behind: behind ? parseInt(behind[1]) : 0
	};
};
