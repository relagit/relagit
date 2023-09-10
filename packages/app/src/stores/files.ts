import { GenericStore } from '.';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path');

export interface IFile {
	id: number;
	name: string;
	staged: boolean;
	path: string;
	status:
		| 'added'
		| 'modified'
		| 'deleted'
		| 'untracked'
		| 'unknown'
		| 'unmerged'
		| 'copied'
		| 'renamed'
		| 'type-changed';
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
		return this.getFilesByRepositoryPath(path)?.some((f) => f.staged);
	}

	getStagedFilePaths(path: string) {
		return this.getFilesByRepositoryPath(path)
			?.filter((f) => f.staged)
			.map((f) => nodepath.join(f.path, f.name));
	}

	toggleStaged(repoPath: string, file: IFile) {
		const files = this.getFilesByRepositoryPath(repoPath);

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

	getFilesByRepositoryPath(path: string) {
		return this.files.get(path);
	}

	getFilesByRepositoryName(name: string) {
		return Array.from(this.files.entries()).find(([key]) => key.split('/').pop() === name)?.[1];
	}

	getByPath(...p: string[]): IFile {
		const pth = nodepath.join('/', ...p);

		return Array.from(this.files.values())
			.flat()
			.find((f) => f.path === pth);
	}

	addFile(repositoryPath: string, file: IFile) {
		const files = this.getFilesByRepositoryPath(repositoryPath);

		if (files) {
			files.push(file);
		} else {
			this.#record.set(repositoryPath, [file]);
		}

		this.emit();
	}

	removeFile(repositoryPath: string, file: IFile) {
		const files = this.getFilesByRepositoryPath(repositoryPath);

		if (files) {
			this.#record.set(
				repositoryPath,
				files.filter((f) => f.id !== file.id)
			);
		}

		this.emit();
	}

	updateFile(repositoryPath: string, file: IFile) {
		const files = this.getFilesByRepositoryPath(repositoryPath);

		if (files) {
			this.#record.set(
				repositoryPath,
				files.map((f) => {
					if (f.id === file.id) {
						return file;
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
