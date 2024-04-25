import { BrowserWindow, ipcMain, screen, systemPreferences } from 'electron';
import * as ipc from '~/shared/ipc';

import path from 'path';

import { getSettings, updateSettings } from './settings';

export let popout: BrowserWindow | null = null;

export default async () => {
	try {
		if (popout && !popout.isDestroyed()) {
			popout.show();
			return;
		}
	} catch (e) {
		console.error(e);
	}

	const settings = await getSettings();

	popout = new BrowserWindow({
		titleBarStyle: 'hidden',
		title: 'RelaGit Popout',
		vibrancy: 'hud',
		backgroundMaterial: 'mica',
		transparent: process.platform === 'win32',
		visualEffectState: 'active',
		backgroundColor: '#00000000',
		height: settings?.popout?.height || 150,
		width: settings?.popout?.width || 430,
		minWidth: 350,
		minHeight: 100,
		maxWidth: 600,
		maxHeight: 500,
		alwaysOnTop: true,
		x: settings?.popout?.x || 16,
		y: settings?.popout?.y || 16,
		show: false,
		webPreferences: {
			devTools: __NODE_ENV__ === 'development' || process.env.DEBUG_PROD === 'true',
			preload: path.join(__dirname, '../preload/preload.mjs'),
			scrollBounce: true,
			nodeIntegration: true,
			contextIsolation: true
		}
	});

	popout.webContents.on('did-start-loading', () => {
		popout?.webContents.executeJavaScript(
			`document.documentElement.style.setProperty('--accent', ${JSON.stringify(
				'#' + systemPreferences.getAccentColor?.()
			)});`
		);
	});

	// why is this windows only
	systemPreferences.on('accent-color-changed', (_, color) => {
		popout?.webContents.executeJavaScript(
			`document.documentElement.style.setProperty('--accent', ${JSON.stringify(
				'#' + color
			)});`
		);
	});

	popout.setAlwaysOnTop(true, 'torn-off-menu');
	popout.setHiddenInMissionControl?.(true);
	popout.setVisibleOnAllWorkspaces?.(true);
	popout.setWindowButtonVisibility?.(false);

	if (__NODE_ENV__ === 'development' && process.env['ELECTRON_RENDERER_URL']) {
		popout.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/popout/index.html`);
	} else {
		popout.loadFile(path.join(__dirname, '../app/popout/index.html'));
	}

	popout.on('ready-to-show', () => {
		popout?.show();
	});

	popout.on('resize', () => {
		const [width, height] = popout?.getSize() || [0, 0];
		const [x, y] = popout?.getPosition() || [0, 0];

		updateSettings({
			popout: {
				...settings.popout,
				width,
				height,
				x,
				y
			}
		});
	});

	popout.on('move', () => {
		const [width, height] = popout?.getSize() || [0, 0];
		const [x, y] = popout?.getPosition() || [0, 0];

		updateSettings({
			popout: {
				...settings.popout,
				width,
				height,
				x,
				y
			}
		});
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
