import { showErrorModal } from '@app/ui/Modal';
import * as Git from '@modules/git';
import { error } from '@modules/logger';
import RemoteStore from '@stores/remote';
import RepositoryStore from '@stores/repository';

import { triggerWorkflow } from './workflows';

export const remoteStatus = async (directory: string) => {
	if (!directory) return;

	let status: {
		name: string;
		url: string;
		type: string;
	}[];

	try {
		status = await Git.Remote(directory);
	} catch (e) {
		showErrorModal(e, 'error.remote');

		error(e);

		return;
	}

	const repository = RepositoryStore.getByPath(directory);

	if (!repository) return;

	triggerWorkflow('remote_fetch', repository, status);

	for (const remote of status) {
		const { name, url, type } = remote;

		RemoteStore.addRemote({
			url,
			name,
			type,
			repository
		});
	}
};
