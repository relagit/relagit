import { GenericStore } from '.';

import { Submodule } from '@app/modules/git/submodule';
import { GitStatus } from '@modules/git/diff';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path');

export interface GitFile {
	id: string;
	name: string;
	path: string;
	status: GitStatus;
	from?: string;
	fromPath?: string;
	submodule?: Submodule;
}

const FileStore = new (class FileStore extends GenericStore {
	#record: Map<string, GitFile[]> = new Map();

	constructor() {
		super();
	}

	get files() {
		return this.#record;
	}

	removeFiles(path: string) {
		this.#record.delete(path);
		this.emit();
	}

	getStatus(repository: string, file: string) {
		if (!file) return;

		file = file.replace(repository + '/', '');

		return this.getByPath(repository, file)?.status;
	}

	getByRepositoryPath(path: string | undefined) {
		if (!path) return;

		return this.files.get(path);
	}

	getByRepositoryName(name: string | undefined) {
		if (!name) return;

		return Array.from(this.files.entries()).find(([key]) => key.split('/').pop() === name)?.[1];
	}

	getByPath(repository: string, path: string): GitFile | undefined {
		return this.getByRepositoryPath(repository)?.find(
			(f) => nodepath.join(f.path, f.name) === path
		);
	}

	addFile(repositoryPath: string, file: GitFile) {
		const files = this.getByRepositoryPath(repositoryPath);

		if (files) {
			files.push(file);
		} else {
			this.#record.set(repositoryPath, [file]);
		}

		this.emit();
	}

	removeFile(repositoryPath: string, file: GitFile) {
		const files = this.getByRepositoryPath(repositoryPath);

		if (files) {
			this.#record.set(
				repositoryPath,
				files.filter((f) => f.id !== file.id)
			);
		}

		this.emit();
	}

	updateFile(repositoryPath: string, id: string, file: Partial<GitFile>) {
		const files = this.getByRepositoryPath(repositoryPath);

		if (files) {
			this.#record.set(
				repositoryPath,
				files.map((f) => {
					if (f.id === id) {
						return {
							...f,
							...file
						};
					}

					return f;
				})
			);
		}

		this.emit();
	}

	clearFiles() {
		this.#record = new Map();
		this.emit();
	}
})();

export default FileStore;
