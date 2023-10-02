const child_process = window.Native.DANGEROUS__NODE__REQUIRE(
	'child_process'
) as typeof import('child_process');

import type { ExecException } from 'child_process';

import SettingsStore from '@app/stores/settings';

export const openInEditor = async (path: string) => {
	if (!path) return;

	let hasError: boolean | ExecException | string = false;

	const cmd = `${SettingsStore.getSetting('externalEditor') || 'code'} ${path}`;

	const result: string = await new Promise((resolve, reject) => {
		child_process.exec(cmd, (error, stdout, stderr) => {
			if (error) {
				hasError = error;
				reject(error);
			} else if (stderr) {
				hasError = stderr;

				reject(stderr);
			} else {
				resolve(stdout.trim());
			}
		});
	});

	if (hasError) {
		throw hasError;
	}

	return result;
};

window['openInVsCode'] = openInEditor;
