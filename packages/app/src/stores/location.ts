import RepositoryStore, { IRepository } from './repository';
import { IPastCommit } from '@app/modules/git/show';
import { ILogCommit } from '@app/modules/git/log';
import SettingsStore from './settings';
import { GenericStore } from '.';
import { IFile } from './files';

const LocationStore = new (class Location extends GenericStore {
	#selectedFile: IFile | undefined;
	#selectedRepository: IRepository | undefined;
	#historyOpen = false;
	#selectedCommit: ILogCommit | undefined;
	#selectedCommitFiles: IPastCommit | undefined;

	constructor() {
		super();

		this.#historyOpen = false;
		this.#selectedFile = undefined;
		this.#selectedCommit = undefined;
		this.#selectedRepository = undefined;
		this.#selectedCommitFiles = undefined;

		window.Native.listeners.HISTORY((_, value) => {
			this.#historyOpen = value ?? !this.#historyOpen;
			this.emit();
		});

		setTimeout(() => {
			if (SettingsStore.getSetting('activeRepository')) {
				const repo = RepositoryStore.getByPath(
					SettingsStore.getSetting('activeRepository') as string
				);

				if (repo) {
					this.#selectedRepository = repo;
					this.emit();
				}
			}
		}, 1000); // 1s timeout is GENERALLY enough for the repository to be loaded, if it's not, it's not a big deal
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

	get historyOpen() {
		return this.#historyOpen;
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

	setSelectedCommit(commit: ILogCommit) {
		this.#selectedCommit = commit;
		this.emit();
	}

	setSelectedCommitFiles(commit: IPastCommit) {
		this.#selectedCommitFiles = commit;
		this.emit();
	}

	setSelectedRepository(repository: IRepository) {
		if (!repository) {
			return;
		}

		this.#selectedFile = undefined;
		this.#selectedRepository = repository;
		this.emit();

		SettingsStore.setSetting('activeRepository', repository?.path);
	}

	clearSelectedRepository() {
		this.#selectedRepository = undefined;
		this.emit();
	}
})();

export default LocationStore;
