import { contextBridge, ipcRenderer } from 'electron';

import * as starryNight from '@wooorm/starry-night';
import * as sucrase from 'sucrase';
import chokidar from 'chokidar';

import { Workflow } from '~/app/src/modules/actions';
import * as ipc from '~/common/ipc';

export const Native = {
	DANGEROUS__NODE__REQUIRE: (id: string) => {
		if (id.startsWith('electron:')) {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			return require('electron')[id.replace('electron:', '')];
		}

		return require(id);
	},
	libraries: {
		starryNight,
		sucrase
	},
	listeners: {
		FOCUS: (fn: (e: Event, value: boolean) => void) => {
			ipcRenderer.on(ipc.FOCUS, fn);
		},
		SETTINGS: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_SETTINGS, fn);
		},
		SIDEBAR: (fn: (e: Event, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_SIDEBAR, fn);
		},
		SWITCHER: (fn: (e: Event, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_SWITCHER, fn);
		},
		HISTORY: (fn: (e: Event, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_HISTORY, fn);
		},
		LOAD_WORKFLOW: (fn: (e: Event, wf: Workflow) => void) => {
			ipcRenderer.on(ipc.LOAD_WORKFLOW, fn);
		},
		CHOKIDAR: {
			add: (path: string, fn: (path: string) => void) => {
				chokidar.watch(path).on('change', fn);
			}
		}
	},
	platform: process.platform
};

contextBridge.exposeInMainWorld('Native', Native);
