import { GitFile } from '@app/stores/files';
import { Repository } from '@app/stores/repository';

import { Git } from './core';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

export const Discard = async (repository: Repository, file: GitFile) => {
	if (!repository || !file) {
		return;
	}

	if (file.status == 'added') {
		return fs.unlinkSync(path.join(repository.path, file.path, file.name));
	}

	const result = await Git({
		directory: repository.path,
		command: 'checkout',
		args: ['--', path.join(file.path, file.name)]
	});

	return result;
};
