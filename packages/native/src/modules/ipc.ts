import { ipcMain, dialog, OpenDialogOptions, BrowserWindow, app, shell } from 'electron';

import child_process from 'child_process';

import * as ipc from '~/common/ipc';

const preloadPathEnv = () => {
	try {
		const path = child_process.execSync('echo $PATH').toString().trim();

		return Object.assign(process.env, { PATH: path });
	} catch (error) {
		return process.env;
	}
};

export default (win: Electron.BrowserWindow) => {
	win.webContents.on('will-navigate', (e, url) => {
		e.preventDefault();

		shell.openExternal(url);
	});

	ipcMain.handle(ipc.OPEN_FILE_DIALOG, async (_, options: OpenDialogOptions) => {
		return await dialog.showOpenDialog(win, options);
	});

	ipcMain.handle(ipc.SHOW_ITEM_IN_FOLDER, async (_, path: string) => {
		return shell.showItemInFolder(path);
	});

	ipcMain.handle(ipc.RELOAD_CLIENT, () => {
		app.relaunch();
		app.exit();
	});

	ipcMain.handle(ipc.SPAWN_ENV, (_, exec: string, path: string) => {
		child_process.spawn(exec, [path], {
			detached: true,
			env: preloadPathEnv()
		});
	});
};

export const dispatch = (win: BrowserWindow, channel: string, ...args: unknown[]) => {
	return win.webContents.send(channel, ...args);
};
