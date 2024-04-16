import * as starryNight from '@wooorm/starry-night';
import { IpcRendererEvent, app, contextBridge, ipcRenderer } from 'electron';

import fs, { WatchListener } from 'node:fs';

import type { Workflow } from '~/app/src/modules/actions';
import * as ipc from '~/common/ipc';

import _eval from './modules/eval';
import { updateEnvironmentForProcess } from './modules/shell';
import type { RequireIdentifier, RequireResult } from './types';

if (process.platform === 'darwin') updateEnvironmentForProcess();

export const Native = {
	DANGEROUS__NODE__REQUIRE: <I extends RequireIdentifier>(id: I): RequireResult<I> => {
		if (id.startsWith('electron:')) {
			// https://www.electronjs.org/blog/electron-29-0#behavior-changed-ipcrenderer-can-no-longer-be-sent-over-the-contextbridge
			if (id === 'electron:ipcRenderer') {
				return {
					invoke: ipcRenderer.invoke,
					on: ipcRenderer.on,
					send: ipcRenderer.send
				} as ReturnType<typeof require>;
			}

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			return require('electron')[
				id.replace('electron:', '') as keyof typeof import('electron')
			] as ReturnType<typeof require>;
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
		OPEN_REMOTE: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_REMOTE, fn);
		},
		OAUTH: (fn: (e: IpcRendererEvent, url: string) => void) => {
			ipcRenderer.on(ipc.OAUTH_CAPTIVE, fn);
		},
		SHOW_IN_FOLDER: (fn: () => void) => {
			ipcRenderer.on(ipc.SHOW_IN_FOLDER, fn);
		},
		OPEN_EDITOR: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_EDITOR, fn);
		},
		FOCUS: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.FOCUS, fn);
		},
		CREATE: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_CREATE, fn);
		},
		ADD: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_ADD, fn);
		},
		CLONE: (fn: () => void) => {
			ipcRenderer.on(ipc.OPEN_CLONE, fn);
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
		PALETTE: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_PALETTE, fn);
		},
		HISTORY: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_HISTORY, fn);
		},
		BRANCHES: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_BRANCHES, fn);
		},
		INFORMATION: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_INFORMATION, fn);
		},
		LOG: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_LOG, fn);
		},
		BLAME: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_BLAME, fn);
		},
		LOAD_WORKFLOW: (fn: (e: IpcRendererEvent, wf: Workflow) => void) => {
			ipcRenderer.on(ipc.LOAD_WORKFLOW, fn);
		},
		LOAD_NATIVE_SCRIPT: async (code: string, filename: string) => {
			const res = await _eval(code, filename);

			const random = Math.random().toString(36).substring(7);

			contextBridge.exposeInMainWorld(random, res);

			return random;
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
