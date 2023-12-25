import SettingsStore from '@app/stores/settings';
import * as ipc from '~/common/ipc';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');

export const openInEditor = (path: string) => {
	if (!path) return;

	const editorExec = SettingsStore.getSetting('externalEditor') || 'code';

	ipcRenderer.invoke(ipc.SPAWN_ENV, editorExec, path);
};
