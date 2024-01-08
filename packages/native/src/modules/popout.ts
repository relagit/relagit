import { BrowserWindow, ipcMain, screen } from 'electron';

import path from 'path';

import * as ipc from '~/common/ipc';

export let popout: BrowserWindow | null = null;

export default () => {
	try {
		if (popout && !popout.isDestroyed()) {
			popout.show();
			return;
		}
	} catch (e) {
		console.log(e);
	}

	popout = new BrowserWindow({
		titleBarStyle: 'hidden',
		title: 'RelaGit Popout',
		vibrancy: 'hud',
		backgroundMaterial: 'mica',
		transparent: true,
		visualEffectState: 'active',
		resizable: false,
		backgroundColor: '#00000000',
		height: 150,
		width: 430,
		minWidth: 200,
		minHeight: 100,
		alwaysOnTop: true,
		x: 994,
		y: 16,
		show: false,
		webPreferences: {
			devTools: __NODE_ENV__ === 'development' || process.env.DEBUG_PROD === 'true',
			preload: path.resolve(__dirname, 'preload.js'),
			scrollBounce: true,
			nodeIntegration: true,
			contextIsolation: true
		}
	});

	popout.setAlwaysOnTop(true, 'torn-off-menu');
	popout.setHiddenInMissionControl(true);
	popout.setVisibleOnAllWorkspaces(true);
	popout.setWindowButtonVisibility(false);

	popout.loadFile(path.join(__dirname, '..', 'public', 'popout.html'));

	popout.on('ready-to-show', () => {
		popout?.show();
	});

	ipcMain.once(ipc.POPOUT_CLOSE, () => {
		popout?.close();
	});
};

export const reposition = (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
	if (!popout) return;

	const { width, height } = screen.getPrimaryDisplay().workAreaSize;

	const { width: popoutWidth, height: popoutHeight } = popout.getBounds();

	const padding = 16;

	let x = 0;
	let y = 0;

	switch (position) {
		case 'top-left':
			x = padding;
			y = padding;
			break;
		case 'top-right':
			x = width - popoutWidth - padding;
			y = padding;
			break;
		case 'bottom-left':
			x = padding;
			y = height - popoutHeight - padding;
			break;
		case 'bottom-right':
			x = width - popoutWidth - padding;
			y = height - popoutHeight - padding;
			break;
	}

	popout.setPosition(x, y);
};

ipcMain.handle(
	ipc.POPOUT_REPOSITION,
	(_, position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
		reposition(position);
	}
);
