import { GitStatus } from '@modules/git/diff';

import { GenericStore } from '.';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');

export interface IFile {
	id: string;
	name: string;
	staged: boolean;
	path: string;
	status: GitStatus;
}

const FileStore = new (class File extends GenericStore {
	#record: Map<string, IFile[]> = new Map();
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

	hasStagedFiles(path: string) {
		return this.getByRepositoryPath(path)?.some((f) => f.staged);
	}

	getStagedFilePaths(path: string) {
		return this.getByRepositoryPath(path)
			?.filter((f) => f.staged)
			.map((f) => nodepath.join(f.path, f.name));
	}

	getStatus(repository: string, file: string) {
		if (!file) return;

		file = file.replace(repository + '/', '');

		console.log({
			repository,
			file
		});

		return this.getByPath(repository, file)?.status;
	}

	toggleStaged(repoPath: string, file: IFile) {
		const files = this.getByRepositoryPath(repoPath);

		if (files) {
			this.#record.set(
				repoPath,
				files.map((f) => {
					if (f.id === file.id) {
						return {
							...file,
							staged: !file.staged
						};
					}
					return f;
				})
			);
		}

		this.emit();
	}

	getByRepositoryPath(path: string) {
		return this.files.get(path);
	}

	getByRepositoryName(name: string) {
		return Array.from(this.files.entries()).find(([key]) => key.split('/').pop() === name)?.[1];
	}

	getByPath(repository: string, path: string): IFile {
		return this.getByRepositoryPath(repository)?.find(
			(f) => nodepath.join(f.path, f.name) === path
		);
	}

	addFile(repositoryPath: string, file: IFile) {
		const files = this.getByRepositoryPath(repositoryPath);

		if (files) {
			files.push(file);
		} else {
			this.#record.set(repositoryPath, [file]);
		}

		this.emit();
	}

	removeFile(repositoryPath: string, file: IFile) {
		const files = this.getByRepositoryPath(repositoryPath);

		if (files) {
			this.#record.set(
				repositoryPath,
				files.filter((f) => f.id !== file.id)
			);
		}

		this.emit();
	}

	updateFile(repositoryPath: string, id: string, file: Partial<IFile>) {
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
