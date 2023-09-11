import { contextBridge, ipcRenderer } from 'electron';

import * as starryNight from '@wooorm/starry-night';
import * as sucrase from 'sucrase';

import { Workflow } from '~/app/src/modules/actions';

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
		SETTINGS: (fn: () => void) => {
			ipcRenderer.on('open-settings', fn);
		},
		SWITCHER: (fn: () => void) => {
			ipcRenderer.on('open-switcher', fn);
		},
		LOAD_WORKFLOW: (fn: (e: Event, wf: Workflow) => void) => {
			ipcRenderer.on('load-workflow', fn);
		}
	},
	platform: process.platform
};

contextBridge.exposeInMainWorld('Native', Native);
