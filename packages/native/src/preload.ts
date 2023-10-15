import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import fs, { WatchListener } from 'node:fs';

import * as starryNight from '@wooorm/starry-night';

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
		starryNight
	},
	listeners: {
		FOCUS: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.FOCUS, fn);
		},
		SETTINGS: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_SETTINGS, fn);
		},
		SIDEBAR: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_SIDEBAR, fn);
		},
		SWITCHER: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_SWITCHER, fn);
		},
		HISTORY: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_HISTORY, fn);
		},
		BLAME: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_BLAME, fn);
		},
		LOAD_WORKFLOW: (fn: (e: IpcRendererEvent, wf: Workflow) => void) => {
			ipcRenderer.on(ipc.LOAD_WORKFLOW, fn);
		},
		WATCHER: {
			add: (path: string, fn: WatchListener<string>, tryRecursive = true) => {
				fs.watch(
					path,
					{
						recursive:
							tryRecursive &&
							(process.platform === 'win32' || process.platform === 'darwin')
					},
					fn
				);
			}
		}
	},
	platform: process.platform
};

contextBridge.exposeInMainWorld('Native', Native);
