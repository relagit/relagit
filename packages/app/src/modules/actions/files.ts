const promises = window.Native.DANGEROUS__NODE__REQUIRE('fs')
	.promises as typeof import('fs').promises;
const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

import RepositoryStore, { IRepository } from '@stores/repository';
import LocationStore from '@stores/location';
import SettingsStore from '@stores/settings';
import { remoteStatus } from './remote';
import FileStore from '@stores/files';
import * as Git from '@modules/git';
import RemoteStore from '@stores/remote';

export const removeRepository = async (repository: IRepository) => {
	SettingsStore.setSetting(
		'repositories',
		(SettingsStore.getSetting('repositories') as string[]).filter(
			(r: string) => r !== repository.path
		)
	);

	RepositoryStore.removeRepository(repository);

	if (LocationStore.selectedRepository?.name === repository.name) {
		LocationStore.setSelectedRepository(undefined);
	}
};

const fileSort = (
	a: {
		status: string;
		path: string;
	},
	b: {
		status: string;
		path: string;
	}
) => {
	if (a.path < b.path) {
		return -1;
	}
	if (a.path > b.path) {
		return 1;
	}
	return 0;
};

const isDirectory = async (file: string) => {
	try {
		const dir = await promises.opendir(file);

		dir.close();

		return true;
	} catch (error) {
		return false;
	}
};

export const getFileStatus = async (directory: string, file?: string, stat?: string) => {
	if (file && stat) {
		if (!fs.existsSync(path.join(directory, file))) return;

		return FileStore.addFile(directory, {
			staged: true,
			id: Math.random().toString(16).split('.')[1],
			name: path.basename(file),
			path: file.replace(path.basename(file), '').replace(/[\/\\]$/, ''),
			status: Git.statusFrom(stat)
		});
	}

	const status = await Git.Status(directory);

	if (!status.trim().length) return;

	const files = status
		.trim()
		.split('\n')
		.map((line) => {
			const [status, ...p] = line.trim().split(' ');

			return {
				status,
				path: p.join(' ')
			};
		});

	for (const file of files.sort(fileSort)) {
		const { status, path: p } = file;

		if (await isDirectory(path.join(directory, p))) {
			const subFiles = await promises.readdir(path.join(directory, p));

			for (const subFile of subFiles) {
				getFileStatus(directory, path.join(p, subFile), status);
			}

			continue;
		}

		FileStore.addFile(directory, {
			staged: true,
			id: Math.random().toString(16).split('.')[1],
			name: path.basename(p),
			path: p.replace(path.basename(p), '').replace(/[\/\\]$/, ''),
			status: Git.statusFrom(status)
		});
	}
};

export const getRepositoryStatus = async (directory: string, files?: boolean, remote?: boolean) => {
	try {
		const info = await Git.Analyse(directory);

		RepositoryStore.addRepository({
			id: Math.random().toString(16).split('.')[1],
			path: directory,
			name: path.basename(directory),
			remote: info.remote,
			branch: info.branch,
			commit: info.commit,
			aheadOrBehind: info.aheadOrBehind,
			lastFetched: Date.now()
		});
	} catch (error) {
		RepositoryStore.addRepository({
			draft: true,
			id: Math.random().toString(16).split('.')[1],
			path: directory,
			name: path.basename(directory),
			remote: null,
			branch: null,
			commit: null,
			aheadOrBehind: null,
			lastFetched: Date.now()
		});
	}

	if (files) getFileStatus(directory);
	if (remote) remoteStatus(directory);

	return RepositoryStore.getByPath(directory);
};

export const refetchRepository = async (repository: IRepository) => {
	FileStore.removeFiles(repository.path);
	RemoteStore.removeByRepoPath(repository.path);
	RepositoryStore.removeRepository(repository);

	const repo = await getRepositoryStatus(repository.path, true, true);

	LocationStore.setSelectedRepository(repo);
};
