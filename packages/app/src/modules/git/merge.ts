import { Repository } from '@stores/repository';

import { Git } from './core';

export const Merge = async (repository: Repository | undefined, branch: string | undefined) => {
	if (!repository || !branch) return;

	try {
		const res = await Git({
			directory: repository.path,
			command: 'merge',
			args: [branch]
		});

		return res;
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.toLowerCase().lastIndexOf('error:') == -1) {
				// this, as far as I can tell, only happens when conflicts are detected
				return;
			}
		}

		throw error;
	}
};
