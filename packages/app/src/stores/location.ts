import { GenericStore } from '.';

import { LogCommit } from '@app/modules/git/log';
import { PastCommit } from '@app/modules/git/show';

import { GitFile } from './files';
import type { Repository } from './repository';
import SettingsStore from './settings';

const LocationStore = new (class LocationStore extends GenericStore {
	#selectedFile: GitFile | undefined;
	#selectedRepository: Repository | undefined;
	#historyOpen = false;
	#blameOpen = false;
	#selectedCommit: LogCommit | undefined;
	#selectedCommitFiles: PastCommit | undefined;
	#selectedCommitFile: PastCommit['files'][number] | undefined;

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

	setSelectedFile(file: GitFile) {
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

	setSelectedCommit(commit: LogCommit) {
		this.#selectedCommit = commit;
		this.emit();
	}

	setSelectedCommitFiles(commit: PastCommit) {
		this.#selectedCommitFiles = commit;
		this.emit();
	}

	setSelectedCommitFile(file: PastCommit['files'][number]) {
		this.#selectedCommitFile = file;
		this.emit();
	}

	setSelectedRepository(repository: Repository, set = true) {
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
