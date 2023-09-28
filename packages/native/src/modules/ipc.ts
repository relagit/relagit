import { ipcMain, dialog, OpenDialogOptions, BrowserWindow, app } from 'electron';

import * as ipc from '~/common/ipc';

export default (win: Electron.BrowserWindow) => {
	ipcMain.handle(ipc.OPEN_FILE_DIALOG, async (_, options: OpenDialogOptions) => {
		return await dialog.showOpenDialog(win, options);
	});

	ipcMain.handle(ipc.RELOAD_CLIENT, () => {
		app.relaunch();
		app.exit();
	});
};

export const dispatch = (win: BrowserWindow, channel: string, ...args: unknown[]) => {
	return win.webContents.send(channel, ...args);
};
