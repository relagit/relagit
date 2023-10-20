import type { IRepository } from './repository';

import { IPastCommit } from '@app/modules/git/show';
import { ILogCommit } from '@app/modules/git/log';
import SettingsStore from './settings';
import { GenericStore } from '.';
import { IFile } from './files';

const LocationStore = new (class Location extends GenericStore {
	#selectedFile: IFile | undefined;
	#selectedRepository: IRepository | undefined;
	#historyOpen = false;
	#blameOpen = false;
	#selectedCommit: ILogCommit | undefined;
	#selectedCommitFiles: IPastCommit | undefined;
	#selectedCommitFile: IPastCommit['files'][number] | undefined;

	constructor() {
		super();

		this.#blameOpen = false;
		this.#historyOpen = false;
		this.#selectedFile = undefined;
		this.#selectedCommit = undefined;
		this.#selectedRepository = undefined;
		this.#selectedCommitFiles = undefined;
		this.#selectedCommitFile = undefined;

		window.Native.listeners.HISTORY((_, value) => {
			this.#historyOpen = value ?? !this.#historyOpen;
			this.emit();
		});

		window.Native.listeners.BLAME((_, value) => {
			this.#blameOpen = value ?? !this.#blameOpen;
			this.emit();
		});
	}

	get selectedFile() {
		return this.#selectedFile;
	}

	get selectedRepository() {
		return this.#selectedRepository;
	}

	get selectedCommit() {
		return this.#selectedCommit;
	}

	get selectedCommitFiles() {
		return this.#selectedCommitFiles;
	}

	get selectedCommitFile() {
		return this.#selectedCommitFile;
	}

	get historyOpen() {
		return this.#historyOpen;
	}

	get blameOpen() {
		return this.#blameOpen;
	}

	setSelectedFile(file: IFile) {
		this.#selectedFile = file;
		this.emit();
	}

	clearSelectedFile() {
		this.#selectedFile = undefined;
		this.emit();
	}

	setHistoryOpen(open: boolean) {
		this.#historyOpen = open;
		this.emit();
	}

	setBlameOpen(open: boolean) {
		this.#blameOpen = open;
		this.emit();
	}

	setSelectedCommit(commit: ILogCommit) {
		this.#selectedCommit = commit;
		this.emit();
	}

	setSelectedCommitFiles(commit: IPastCommit) {
		this.#selectedCommitFiles = commit;
		this.emit();
	}

	setSelectedCommitFile(file: IPastCommit['files'][number]) {
		this.#selectedCommitFile = file;
		this.emit();
	}

	setSelectedRepository(repository: IRepository, set = true) {
		if (!repository) {
			return;
		}

		this.#selectedFile = undefined;
		this.#selectedCommit = undefined;
		this.#selectedCommitFiles = undefined;
		this.#selectedCommitFile = undefined;
		this.#selectedRepository = repository;
		this.emit();

		if (set) SettingsStore.setSetting('activeRepository', repository?.path);
	}

	clearSelectedRepository() {
		this.#selectedRepository = undefined;
		this.emit();
	}
})();

export default LocationStore;
