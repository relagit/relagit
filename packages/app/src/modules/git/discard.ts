const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

import { IRepository } from '@app/stores/repository';
import { IFile } from '@app/stores/files';
import { Git } from './core';

export const Discard = async (repository: IRepository, file: IFile) => {
	if (!repository || !file) {
		return;
	}

	console.log(path.join(repository.path, file.path, file.name));

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
