import { Git } from './core';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path');

export interface Submodule {
	relativePath: string;
	path: string;
	sha: string;
	origin: string;
	remote?: string;
}

export const SubmoduleStatus = async (directory: string): Promise<Submodule[]> => {
	const result = await Git({
		command: 'submodule',
		directory,
		args: ['status']
	});

	const status = result.trim();

	if (!status) return [];

	const lines = status.split('\n');

	const submodules: Submodule[] = [];

	for (const line of lines) {
		const match = line.match(
			/^[+-]?(?<sha>[0-9a-f]{40}) (?<relativePath>.+?)(?: \((?<origin>.+?)\))?$/
		);

		if (!match?.groups) continue;

		const { relativePath, origin, sha } = match.groups;

		const path = nodepath.join(directory, relativePath);

		const remotes = await Git({
			command: 'remote',
			directory: path,
			args: ['-v']
		}).catch(() => undefined);

		const remoteLine = remotes
			?.split('\n')
			.find((r) => r.startsWith(origin.split('/')[1]) || r.startsWith('origin'));

		const remote = remoteLine?.split('\t')[1].split(' ')[0];

		submodules.push({ relativePath, path, sha, origin, remote });
	}

	return submodules;
};
