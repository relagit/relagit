import * as ipc from '~/shared/ipc';

import SettingsStore from '@stores/settings';

import { showErrorModal } from '@ui/Modal';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');

export const editors = ['code', 'code-insiders', 'atom', 'subl', 'codium', 'fleet', 'zed'] as const;

const editorsExist = await Promise.allSettled(
	editors.map((editor) => ipcRenderer.invoke(ipc.CHECK_IS_IN_PATH, editor))
);

export const getAvailableEditors = (): ((typeof editors)[number] | 'custom')[] => {
	const editorStatus = editorsExist;

	// @ts-expect-error - allSettled types?
	return editors.filter((_, i) => _ == 'code' || editorStatus[i].value);
};

export const openInEditor = (path: string) => {
	if (!path) return;

	const editor = SettingsStore.getSetting('externalEditor') || 'code';
	const exec = editor === 'custom' ? SettingsStore.getSetting('customEditor') : editor;

	ipcRenderer.invoke(ipc.CHECK_IS_IN_PATH, exec).then((isInPath: boolean): void => {
		if (!isInPath) {
			showErrorModal(
				new Error(
					`Could not find ${editor} in your PATH. Please make sure it is installed and try again.`
				),
				'error.missingExternalEditor'
			);

			return;
		}

		ipcRenderer.invoke(ipc.SPAWN_ENV, exec, path);
	});
};
