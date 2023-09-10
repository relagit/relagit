import { ipcMain, dialog, OpenDialogOptions, BrowserWindow } from 'electron';

import * as ipc from '~/common/ipc';

export default (win: Electron.BrowserWindow) => {
	ipcMain.handle(ipc.OPEN_FILE_DIALOG, async (event, options: OpenDialogOptions) => {
		return await dialog.showOpenDialog(win, options);
	});
};

export const dispatch = (win: BrowserWindow, channel: string, ...args: unknown[]) => {
	return win.webContents.send(channel, ...args);
};
