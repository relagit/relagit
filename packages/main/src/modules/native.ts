import fs from 'fs';
import os from 'os';
import path from 'path';

export const getStorageLocation = () => {
	if (process.platform === 'darwin') {
		return path.join(os.homedir(), '.relagit');
	}

	if (process.platform === 'win32') {
		return path.join(
			process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
			'relagit'
		);
	}

	return path.join(
		process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.local', 'share'),
		'relagit'
	);
};

export const ensureStorageLocation = () => {
	const storageLocation = getStorageLocation();

	if (!fs.existsSync(storageLocation)) {
		fs.mkdirSync(storageLocation);
	}

	return storageLocation;
};

export const migrateLegacyFiles = () => {
	const legacyPath = path.join(os.homedir(), '.relagit');

	if (!fs.existsSync(legacyPath)) {
		return;
	}

	const storageLocation = ensureStorageLocation();

	if (storageLocation === legacyPath) {
		return;
	}

	if (fs.readdirSync(storageLocation).length !== 0) {
		return; // do not migrate if the new location is not empty
	}

	fs.cpSync(legacyPath, storageLocation, { recursive: true });
};
