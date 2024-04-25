import { GenericStore } from '.';

import FileStore from './files';
import { Repository } from './repository';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path');

const StageStore = new (class StageStore extends GenericStore {
	#record: Map<string, boolean> = new Map();

	constructor() {
		super();
	}

	isStaged(filePath: string) {
		return this.#record.has(filePath) ? this.#record.get(filePath) : true;
	}

	hasStagedFiles(path: string | undefined) {
		return FileStore.getByRepositoryPath(path)?.some((f) =>
			this.isStaged(nodepath.join(f.path, f.name))
		);
	}

	getStagedFilePaths(path: string | undefined) {
		return FileStore.getByRepositoryPath(path)
			?.filter((f) => {
				if (!this.isStaged(nodepath.join(f.path, f.name))) return false;

				if (f.status === 'deleted') return false;

				return true;
			})
			.map((f) => nodepath.join(f.path, f.name));
	}

	invert(repository: Repository | undefined) {
		if (!repository) return;

		const files = FileStore.getByRepositoryPath(repository.path);

		for (const file of files || []) {
			this.#record.set(
				nodepath.join(file.path, file.name),
				!this.isStaged(nodepath.join(file.path, file.name))
			);
		}

		this.emit();
	}

	setStaged(filePath: string, staged: boolean) {
		this.#record.set(filePath, staged);

		this.emit();
	}

	toggleStaged(filePath: string) {
		this.setStaged(filePath, !this.isStaged(filePath));
	}
})();

export default StageStore;
