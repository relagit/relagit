import SettingsStore from '@app/stores/settings';
import StageStore from '@app/stores/stage';
import { Repository } from '@stores/repository';

import { Git } from './core';

export const Commit = async (
	repository: Repository,
	message: string | undefined,
	body?: string
) => {
	if (!repository || !message) {
		return;
	}

	const filePaths = StageStore.getStagedFilePaths(repository.path);
	const removed = StageStore.getRemovedFilePaths(repository.path);

	if (!filePaths?.length && !removed?.length) {
		return;
	}

	if (filePaths && filePaths.length) {
		await Git({
			directory: repository.path,
			command: 'add',
			args: ['--', ...filePaths]
		});
	}

	if (removed && removed.length) {
		await Git({
			directory: repository.path,
			command: 'rm',
			args: ['--cached', '--', ...removed]
		});
	}

	const signingOptions = [];

	try {
		const gpgSign = await Git({
			directory: repository.path,
			command: 'config',
			args: ['--get', 'commit.gpgSign']
		});

		if (gpgSign?.trim() === 'true') {
			const keyId = await Git({
				directory: repository.path,
				command: 'config',
				args: ['--get', 'user.signingKey']
			});

			if (keyId.trim()) {
				signingOptions.push(`--gpg-sign=${keyId.trim()}`);
			}
		}
	} catch (e) {
		// Ignore
	}

	const annotateCommit = SettingsStore.getSetting('commit.annotate');

	const res = await Git({
		directory: repository.path,
		command: 'commit',
		opts: {
			env:
				annotateCommit ?
					{
						GIT_COMMITTER_NAME: 'RelaGit',
						GIT_COMMITTER_EMAIL: 'commit@rela.dev'
					}
				:	{}
		},
		args: ['-m', message, '-m', body || '', ...signingOptions]
	});

	return res;
};
