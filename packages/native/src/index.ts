import { BrowserWindow, Menu, MenuItemConstructorOptions, app } from 'electron';
import * as path from 'path';

import * as ipc from '~/common/ipc';

import pkj from '../../../package.json' assert { type: 'json' };
import initIPC, { dispatch } from './modules/ipc';
import { log } from './modules/logger';
import { getSettings, setSettings } from './modules/settings';

app.setAboutPanelOptions({
	applicationName: 'RelaGit',
	applicationVersion: pkj.version,
	version: __COMMIT_HASH__,
	copyright: 'Copyright © 2023 TheCommieAxolotl & RelaGit contributors',
	website: 'https://rela.dev'
});

app.once('ready', async () => {
	const settings = await getSettings();

	const win = new BrowserWindow({
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			height: 28,
			color: '#141515',
			symbolColor: '#cacaca'
		},
		title: 'RelaGit',
		vibrancy: settings.get('vibrancy') ? 'sidebar' : undefined,
		backgroundMaterial: settings.get('vibrancy') ? 'mica' : undefined,
		transparent: settings.get('vibrancy') && process.platform === 'win32' ? true : undefined,
		backgroundColor:
			settings.get('vibrancy') && process.platform === 'win32' ? '#00000000' : undefined,
		height: (settings.get('window.height') as number) || 850,
		width: (settings.get('window.width') as number) || 1200,
		minWidth: 500,
		minHeight: 500,
		x: (settings.get('window.x') as number) || 0,
		y: (settings.get('window.y') as number) || 0,
		show: false,
		webPreferences: {
			devTools: __NODE_ENV__ === 'development' || process.env.DEBUG_PROD === 'true',
			preload: path.resolve(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: true
		}
	});

	win.on('move', () => {
		settings.set('window.x', win.getPosition()[0]);
		settings.set('window.y', win.getPosition()[1]);

		setSettings(settings);
	});

	win.on('resize', () => {
		settings.set('window.width', win.getSize()[0]);
		settings.set('window.height', win.getSize()[1]);

		setSettings(settings);
	});

	win.once('ready-to-show', () => {
		win.show();
	});

	win.on('focus', () => {
		win.webContents.send(ipc.FOCUS, true);
	});

	win.on('blur', () => {
		win.webContents.send(ipc.FOCUS, false);
	});

	log('Startup' + (__NODE_ENV__ === 'development' ? ' (development)' : ' (production)'));
	log('Version: ' + pkj.version);
	log('Running on: ' + process.platform + ' ' + process.arch);

	win.loadFile(path.join(__dirname, '..', 'public', 'index.html'));

	win.once('ready-to-show', () => {
		win.show();
	});

	initIPC(win);

	const menu = Menu.buildFromTemplate([
		{
			role: 'appMenu',
			label: 'RelaGit',
			submenu: [
				{
					role: 'about',
					label: 'About RelaGit'
				},
				{
					type: 'separator'
				},
				{
					role: 'services'
				},
				{
					type: 'separator'
				},
				{
					label: 'Preferences',
					accelerator: 'CmdOrCtrl+,',
					click: () => {
						dispatch(win, ipc.OPEN_SETTINGS);
					}
				},
				{
					type: 'separator'
				},
				{
					role: 'hide',
					label: 'Hide RelaGit'
				},
				{
					role: 'hideOthers'
				},
				{
					role: 'unhide'
				},
				{
					type: 'separator'
				},
				{
					role: 'quit',
					label: 'Quit RelaGit'
				}
			]
		},
		{
			role: 'editMenu'
		},
		{
			label: 'View',
			submenu: [
				{
					label: 'Toggle Sidebar',
					accelerator: 'CmdOrCtrl+1',
					click: () => {
						win.webContents.send(ipc.OPEN_SIDEBAR);
					}
				},
				{
					label: 'Toggle Switcher',
					accelerator: 'CmdOrCtrl+2',
					click: () => {
						win.webContents.send(ipc.OPEN_SWITCHER);
						win.webContents.send(ipc.OPEN_SIDEBAR, true);
					}
				},
				{
					label: 'Toggle Commit History View',
					accelerator: 'CmdOrCtrl+3',
					click: () => {
						win.webContents.send(ipc.OPEN_HISTORY);
					}
				},
				{
					label: 'Toggle Blame View',
					accelerator: 'CmdOrCtrl+4',
					click: () => {
						win.webContents.send(ipc.OPEN_BLAME);
					}
				}
			]
		},
		{
			label: 'Window',
			submenu: [
				{
					role: 'minimize'
				},
				{
					role: 'zoom'
				},
				{
					type: 'separator'
				},
				{
					role: 'front'
				},
				{
					type: 'separator'
				},
				{
					role: 'close'
				},
				{
					role: 'quit'
				},
				{
					role: 'reload'
				},
				{
					role: 'togglefullscreen'
				},
				(__NODE_ENV__ === 'development' || process.env.DEBUG_PROD === 'true') && {
					type: 'separator'
				},
				(__NODE_ENV__ === 'development' || process.env.DEBUG_PROD === 'true') && {
					role: 'toggleDevTools'
				}
			].filter(Boolean) as MenuItemConstructorOptions[]
		}
	]);

	Menu.setApplicationMenu(menu);
});
