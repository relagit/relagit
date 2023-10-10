const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE(
	'electron:ipcRenderer'
) as typeof import('electron').ipcRenderer;

import SettingsStore from '@app/stores/settings';
import * as ipc from '~/common/ipc';

export const openInEditor = async (path: string) => {
	if (!path) return;

	const editorExec = (SettingsStore.getSetting('externalEditor') as string) || 'code';

	ipcRenderer.invoke(ipc.SPAWN_ENV, editorExec, path);
};
