import * as starryNight from '@wooorm/starry-night';
import { IpcRendererEvent, app, contextBridge, ipcRenderer } from 'electron';

import fs, { WatchListener } from 'node:fs';

import type { Workflow } from '~/app/src/modules/actions';
import * as ipc from '~/common/ipc';

import { updateEnvironmentForProcess } from './modules/shell';

if (process.platform === 'darwin') updateEnvironmentForProcess();

export const Native = {
	DANGEROUS__NODE__REQUIRE: <I extends string>(
		id: I
	): I extends 'fs'
		? typeof import('fs')
		: I extends 'fs/promises'
		  ? typeof import('fs/promises')
		  : I extends 'electron'
		    ? typeof import('electron')
		    : I extends 'path'
		      ? typeof import('path')
		      : I extends 'os'
		        ? typeof import('os')
		        : I extends 'child_process'
		          ? typeof import('child_process')
		          : I extends 'electron:ipcRenderer'
		            ? (typeof import('electron'))['ipcRenderer']
		            : I extends 'electron:shell'
		              ? (typeof import('electron'))['shell']
		              : I extends 'electron:clipboard'
		                ? (typeof import('electron'))['clipboard']
		                : I extends 'sucrase'
		                  ? typeof import('sucrase')
		                  : I extends '@wooorm/starry-night'
		                    ? typeof import('@wooorm/starry-night')
		                    : unknown => {
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
		BRANCHES: (fn: (e: IpcRendererEvent, value: boolean) => void) => {
			ipcRenderer.on(ipc.OPEN_BRANCHES, fn);
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
