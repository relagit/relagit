import SettingsStore from '@app/stores/settings';
import { showErrorModal } from '@app/ui/Modal';
import * as ipc from '~/common/ipc';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');

export const openInEditor = (path: string) => {
	if (!path) return;

	const editorExec = SettingsStore.getSetting('externalEditor') || 'code';

	ipcRenderer.invoke(ipc.CHECK_IS_IN_PATH, editorExec).then((isInPath: boolean) => {
		if (!isInPath) {
			showErrorModal(
				new Error(
					`Could not find ${editorExec} in your PATH. Please make sure it is installed and try again.`
				),
				'error.missingExternalEditor'
			);

			return;
		}

		ipcRenderer.invoke(ipc.SPAWN_ENV, editorExec, path);
	});
};
