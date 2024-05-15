import * as ipc from '~/shared/ipc';

import SettingsStore from '@stores/settings';

import { showErrorModal } from '@ui/Modal';

import { checkIsInPath } from './shell';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');
export const editors = [
	{ exec: 'code', bundle: 'com.microsoft.VSCode', image: '' },
	{ exec: 'code-insiders', bundle: 'com.microsoft.VSCodeInsiders', image: '' },
	{ exec: 'atom', bundle: 'com.github.atom', image: '' },
	{
		exec: 'subl',
		bundle: ['com.sublimetext.3', 'com.sublimetext.2', 'com.sublimetext.4'],
		image: ''
	},
	{ exec: 'codium', bundle: 'com.vscodium.codium', image: '' },
	{ exec: 'fleet', bundle: 'Fleet.app', image: '' },
	{ exec: 'zed', bundle: ['dev.zed.Zed', 'dev.zed.Zed-Preview'], image: '' }
] as const;

const existing: string[] = [];

for (const editor of editors) {
	ipcRenderer.invoke(ipc.GET_THUMBNAIL, editor.bundle).then((image: string) => {
		// @ts-expect-error - guh
		editor.image = image;
	});

	// sometimes the path does not exist immediately on startup
	setTimeout(() => {
		checkIsInPath(editor.exec).then((isInPath) => {
			if (isInPath) existing.push(editor.exec);
		});
	}, 100);
}

export const getAvailableEditors = (): (
	| (typeof editors)[number]
	| { exec: 'custom'; bundle: []; image?: string }
)[] => {
	return editors.filter((editor) => {
		const isCode = editor.exec === 'code';

		if (isCode) return true;

		return (
			existing.includes(editor.exec) ||
			(Array.isArray(editor.bundle) &&
				editor.bundle.some((b) => existing.includes(b as string)))
		);
	});
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
