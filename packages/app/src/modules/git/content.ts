import { ERROR_IDENTIFIERS } from './constants';
import { Git } from './core';

const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');

export const Content = async (file: string, repoPath: string, source?: string) => {
	if (!file || !repoPath) {
		return '';
	}

	if (!file.includes(repoPath)) {
		return '';
	}

	let result: string;

	if (!fs.existsSync(file)) {
		return await Git({
			directory: repoPath,
			command: 'show',
			args: [
				`${source || 'HEAD'}:` +
					`"${file
						.replace(repoPath, '')
						.replace(/^[\/\\]/, '')
						.replaceAll('"', '\\"')}"`
			]
		});
	}

	try {
		result = await Git({
			directory: repoPath,
			command: 'show',
			args: [`${source || ':0'}:` + file]
		});
	} catch (error) {
		if (typeof error !== 'string')
			if ((error as Error).message.includes(ERROR_IDENTIFIERS.DISK_NO_INDEX)) {
				if (source) return '';

				return fs.readFileSync(file, 'utf8');
			}

		throw error;
	}

	return result;
};
