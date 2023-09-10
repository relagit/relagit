import RepositoryStore from '@stores/repository';
import { triggerWorkflow } from './workflows';
import RemoteStore from '@stores/remote';
import * as Git from '@modules/git';

export const remoteStatus = async (repository: string) => {
	const status = await Git.Remote(repository);

	triggerWorkflow('remote_fetch', status);

	for (const remote of status) {
		const { name, url, type } = remote;

		RemoteStore.addRemote({
			url,
			name,
			type: type as 'fetch' | 'push',
			repository: RepositoryStore.getByPath(repository)
		});
	}
};

export const updateRemoteStatus = async (repository: string) => {
	const remote = RemoteStore.getByRepoPath(repository);

	if (!remote) return;

	const status = await Git.Remote(repository);

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
