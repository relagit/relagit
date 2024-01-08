import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import SettingsStore from '~/app/src/stores/settings';
import * as ipc from '~/common/ipc';

import Main from './app';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');

function App() {
	console.log(
		`%cWARNING%c
%cDo not paste any code into this console.%c

This is DevTools, it is meant for developers only.

DO NOT paste any code into this console that you have not written yourself or that you do not understand. This could result in your device being compromised, or your appplication being broken.`,
		'font-size: 72px; font-weight: bold; font-family: SF Mono; color: #e13b3b;',
		'font-size: 12px; font-weight: 400;',
		'font-weight: 600; color: #fff;',
		'font-weight: 400;'
	);

	return (
		<Router>
			<Main />
		</Router>
	);
}

const indicies = (
	position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
): [number, number] => {
	switch (position) {
		case 'top-left':
			return [0, 0];
		case 'top-right':
			return [1, 0];
		case 'bottom-left':
			return [0, 1];
		case 'bottom-right':
			return [1, 1];
		default:
			return [1, 0];
	}
};

const position = indicies(SettingsStore.getSetting('popout.position') || 'top-right');

window.onkeydown = (e) => {
	if (!e.shiftKey) return;

	if (e.key === 'W' || e.key === 'ArrowUp') {
		position[1] = 0;
	}

	if (e.key === 'S' || e.key === 'ArrowDown') {
		position[1] = 1;
	}

	if (e.key === 'A' || e.key === 'ArrowLeft') {
		position[0] = 0;
	}

	if (e.key === 'D' || e.key === 'ArrowRight') {
		position[0] = 1;
	}

	SettingsStore.setSetting(
		'popout.position',
		['top-left', 'top-right', 'bottom-left', 'bottom-right'][
			position[0] + position[1] * 2
		] as 'top-left'
	);

	ipcRenderer.invoke(ipc.POPOUT_REPOSITION, SettingsStore.getSetting('popout.position'));
};

const root = document.getElementById('root')!;

render(() => <App />, root);
