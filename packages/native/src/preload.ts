import * as starryNight from '@wooorm/starry-night';
import { app, contextBridge, ipcRenderer } from 'electron';
import fs, { WatchListener } from 'node:fs';

import * as ipc from '~/common/ipc';

export const Native = {
	DANGEROUS__NODE__REQUIRE: (id: string) => {
		if (id.startsWith('electron:')) {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			return require('electron')[id.replace('electron:', '')];
		}

		return require(id);
	},
	alert: (message: string, type: 'none' | 'info' | 'error' | 'question' | 'warning') => {
		ipcRenderer.invoke(ipc.ALERT, message, type);
	},
	quit: () => {
		app.quit();
	},
	libraries: {
		starryNight
	},
	listeners: {
		FOCUS: (fn: () => void) => {
			ipcRenderer.on(ipc.FOCUS, fn);
		},
		SETTINGS: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_SETTINGS, fn);
		},
		SIDEBAR: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_SIDEBAR, fn);
		},
		SWITCHER: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_SWITCHER, fn);
		},
		HISTORY: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_HISTORY, fn);
		},
		BRANCHES: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_BRANCHES, fn);
		},
		BLAME: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_BLAME, fn);
		},
		LOAD_WORKFLOW: (fn: () => void) => {
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
