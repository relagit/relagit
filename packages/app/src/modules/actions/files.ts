import * as Git from '@modules/git';
import * as logger from '@modules/logger';
import FileStore from '@stores/files';
import LocationStore from '@stores/location';
import RemoteStore from '@stores/remote';
import RepositoryStore, { IRepository } from '@stores/repository';
import SettingsStore from '@stores/settings';

import { showErrorModal } from '@ui/Modal';

import { warn } from '../logger';
import { remoteStatus } from './remote';

const promises = window.Native.DANGEROUS__NODE__REQUIRE('fs')
	.promises as typeof import('fs').promises;
const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

export const removeRepository = async (repository: IRepository) => {
	SettingsStore.setSetting(
		'repositories',
		SettingsStore.getSetting('repositories').filter((r: string) => r !== repository.path)
	);

	RepositoryStore.removeRepository(repository);

	if (LocationStore.selectedRepository?.name === repository.name) {
		LocationStore.setSelectedRepository(undefined);
	}

	window._triggerWorkflow('repository_remove', repository.path);
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
		await promises.opendir(file); // we are specifically NOT closing this, it will be picked up by the gc.

		return true;
	} catch (error) {
		return false;
	}
};

export const getFileStatus = async (directory: string, file?: string, stat?: string) => {
	if (file) {
		if (FileStore.getByPath(directory, file)) return;
	} else {
		if (FileStore.getByRepositoryPath(directory)?.length) {
			FileStore.removeFiles(directory);
		}
	}

	if (file && stat) {
		if (!fs.existsSync(path.join(directory, file))) return;

		if (FileStore.getByPath(directory, file)) {
			warn('File already exists, not adding again');

			return;
		}

		if (await isDirectory(path.join(directory, file))) {
			const subFiles = await promises.readdir(path.join(directory, file));

			for (const subFile of subFiles) {
				getFileStatus(directory, path.join(file, subFile), stat);
			}

			return;
		}

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

		if (FileStore.getByPath(directory, p)) {
			warn('File already exists, not adding again');

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

export const getRepositoryStatus = async (
	directory: string,
	refetchFiles?: boolean,
	refetchRemotes?: boolean
) => {
	try {
		if (!directory) return;

		let exists: IRepository = null;

		if (RepositoryStore.getByPath(directory)) {
			exists = RepositoryStore.getByPath(directory);
		}

		try {
			const info = await Git.Analyse(directory);

			if (exists) {
				RepositoryStore.updateRepository(exists.id, {
					...info,
					lastFetched: Date.now()
				});
			} else {
				RepositoryStore.addRepository({
					id: Math.random().toString(16).split('.')[1],
					path: directory,
					name: path.basename(directory),
					remote: info.remote,
					branch: info.branch,
					commit: info.commit,
					ahead: info.ahead,
					behind: info.behind,
					lastFetched: Date.now()
				});
			}
		} catch (error) {
			if (exists) {
				RepositoryStore.updateRepository(exists.id, {
					lastFetched: Date.now()
				});
			} else {
				RepositoryStore.addRepository({
					draft: true,
					id: Math.random().toString(16).split('.')[1],
					path: directory,
					name: path.basename(directory),
					remote: null,
					branch: null,
					commit: null,
					ahead: null,
					behind: null,
					lastFetched: Date.now()
				});
			}
		}

		if (refetchFiles) await getFileStatus(directory);
		if (refetchRemotes) await remoteStatus(directory);

		return RepositoryStore.getByPath(directory);
	} catch (error) {
		showErrorModal(error, 'error.fetching');

		logger.error(error);
	}
};

export const refetchRepository = async (repository: IRepository) => {
	if (!repository) return;

	const currentFile = LocationStore.selectedFile;

	FileStore.removeFiles(repository.path);
	RemoteStore.removeByRepoPath(repository.path);

	const repo = await getRepositoryStatus(repository.path, true, true);

	const equivalent = FileStore.getByRepositoryName(repo.name)?.find(
		(f) => f.path === currentFile?.path
	);

	if (equivalent) {
		LocationStore.setSelectedFile(equivalent);
	}
};

window._refetchRepository = refetchRepository;
