import * as ipc from '~/common/ipc';

import { GithubUser } from './types';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');

export const getToken = async () => {
	const decrypted = await ipcRenderer.invoke(
		ipc.GET_DECRYPTED,
		localStorage.getItem('__x_github_token') || ''
	);

	return decrypted;
};

export const getUser = (): GithubUser | undefined => {
	return JSON.parse(localStorage.getItem('__x_github_user') || 'null') as GithubUser;
};
