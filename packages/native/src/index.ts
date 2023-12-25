import { BrowserWindow, Menu, MenuItemConstructorOptions, app, nativeTheme } from 'electron';

import * as path from 'path';

import * as ipc from '~/common/ipc';

import pkj from '../../../package.json' assert { type: 'json' };
import initIPC, { dispatch } from './modules/ipc';
import { log } from './modules/logger';
import { backgroundFromTheme, getSettings, setSettings } from './modules/settings';
import { updateEnvironmentForProcess } from './modules/shell';

app.setAboutPanelOptions({
	applicationName: 'RelaGit',
	applicationVersion: pkj.version,
	version: __COMMIT_HASH__,
	copyright: 'Copyright © 2023 TheCommieAxolotl & RelaGit contributors',
	website: 'https://rela.dev'
});

const constructWindow = async () => {
	const settings = await getSettings();

	const isOnboarding = () => {
		const onboarding = settings.onboarding;

		if (!onboarding) return true;

		return onboarding.dismissed !== true && onboarding.step === 0;
	};

	let vibrancy:
		| 'sidebar'
		| 'fullscreen-ui'
		| 'selection'
		| 'menu'
		| 'popover'
		| 'sidebar-header'
		| 'titlebar'
		| 'header'
		| 'sheet'
		| 'window'
		| undefined = settings.ui?.vibrancy ? 'sidebar' : undefined;
	let backgroundMaterial: 'mica' | 'auto' | 'none' | 'acrylic' | 'tabbed' | undefined = settings
		.ui?.vibrancy
		? 'mica'
		: undefined;
	let transparent = settings.ui?.vibrancy && process.platform === 'win32' ? true : undefined;
	let backgroundColor = settings.ui?.vibrancy
		? '#00000000'
		: backgroundFromTheme(settings.ui?.theme, nativeTheme.shouldUseDarkColors);

	if (isOnboarding()) {
		vibrancy = 'sidebar';

		if (process.platform === 'win32') {
			backgroundMaterial = 'mica';
			transparent = true;
			backgroundColor = '#00000000';
		}
	}

	const win = new BrowserWindow({
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			height: 27,
			color: backgroundFromTheme(settings.ui?.theme, nativeTheme.shouldUseDarkColors),
			symbolColor: '#cacaca'
		},
		title: 'RelaGit',
		vibrancy,
		backgroundMaterial,
		transparent,
		backgroundColor,
		height: settings.window?.height || 600,
		width: settings.window?.width || 1000,
		minWidth: 500,
		minHeight: 500,
		x: settings.window?.x || undefined,
		y: settings.window?.y || undefined,
		show: false,
		webPreferences: {
			devTools: __NODE_ENV__ === 'development' || process.env.DEBUG_PROD === 'true',
			preload: path.resolve(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: true
		}
	});

	win.on('move', () => {
		settings.window ??= {};

		settings.window.x = win.getPosition()[0];
		settings.window.y = win.getPosition()[1];

		setSettings(settings);
	});

	win.on('resize', () => {
		settings.window ??= {};

		settings.window.width = win.getSize()[0];
		settings.window.height = win.getSize()[1];

		setSettings(settings);
	});

	win.on('focus', () => {
		dispatch(ipc.FOCUS, true);
	});

	win.on('blur', () => {
		dispatch(ipc.FOCUS, false);
	});

	log('Startup' + (__NODE_ENV__ === 'development' ? ' (development)' : ' (production)'));
	log('Version: ' + pkj.version);
	log('Running on: ' + process.platform + ' ' + process.arch);

	win.loadFile(path.join(__dirname, '..', 'public', 'index.html'));

	win.once('ready-to-show', () => {
		win.show();
	});

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
						dispatch(ipc.OPEN_SETTINGS);
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
					label: 'Sidebar',
					accelerator: 'CmdOrCtrl+B',
					click: () => {
						dispatch(ipc.OPEN_SIDEBAR);
					}
				},
				{
					label: 'Information Modal',
					accelerator: 'CmdOrCtrl+I',
					click: () => {
						dispatch(ipc.OPEN_INFORMATION);
					}
				},
				{
					label: 'Switcher',
					accelerator: 'CmdOrCtrl+K',
					click: () => {
						dispatch(ipc.OPEN_SWITCHER);
						dispatch(ipc.OPEN_SIDEBAR, true);
					}
				},
				{
					label: 'Commit History',
					accelerator: 'CmdOrCtrl+L',
					click: () => {
						dispatch(ipc.OPEN_HISTORY);
					}
				},
				{
					label: 'Branches',
					accelerator: 'CmdOrCtrl+M',
					click: () => {
						dispatch(ipc.OPEN_BRANCHES);
					}
				},
				{
					label: 'Blame View',
					accelerator: 'CmdOrCtrl+J',
					click: () => {
						dispatch(ipc.OPEN_BLAME);
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
					role: 'quit',
					label: 'Quit RelaGit'
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

	return win;
};

app.once('ready', async () => {
	const window = await constructWindow();

	initIPC(window);
	if (process.platform === 'darwin') updateEnvironmentForProcess();

	app.on('activate', async () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			const newWindow = await constructWindow();

			initIPC(newWindow);
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
