import { showErrorModal } from '@app/ui/Modal';
import * as Git from '@modules/git';
import { error } from '@modules/logger';
import RemoteStore from '@stores/remote';
import RepositoryStore from '@stores/repository';

import { triggerWorkflow } from './workflows';

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
			type: type,
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
			type,
			repository: RepositoryStore.getByPath(repository)
		});
	}
};
