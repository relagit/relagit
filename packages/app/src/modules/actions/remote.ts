import RepositoryStore from '@stores/repository';
import { triggerWorkflow } from './workflows';
import RemoteStore from '@stores/remote';
import { error } from '@modules/logger';
import * as Git from '@modules/git';

import { showErrorModal } from '@app/ui/Modal';

export const remoteStatus = async (repository: string) => {
	let status: {
		name: string;
		url: string;
		type: string;
	}[];

	try {
		status = await Git.Remote(repository);
	} catch (e) {
		showErrorModal(e, 'error.remote');

		error(e);

		return;
	}

	const repo = RepositoryStore.getByPath(repository);

	triggerWorkflow('remote_fetch', repo, status);

	for (const remote of status) {
		const { name, url, type } = remote;

		RemoteStore.addRemote({
			url,
			name,
			type: type as 'fetch' | 'push',
			repository: repo
		});
	}
};

export const updateRemoteStatus = async (repository: string) => {
	const remote = RemoteStore.getByRepoPath(repository);

	if (!remote) return;

	let status: {
		name: string;
		url: string;
		type: string;
	}[];

	try {
		status = await Git.Remote(repository);
	} catch (e) {
		showErrorModal(e, 'error.remote');

		error(e);

		return;
	}

	for (const remote of status) {
		const { name, url, type } = remote;

		RemoteStore.updateRemote({
			url,
			name,
			type: type as 'fetch' | 'push',
			repository: RepositoryStore.getByPath(repository)
		});
	}
};
