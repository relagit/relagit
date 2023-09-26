import RepositoryStore, { IRepository } from './repository';
import SettingsStore from './settings';
import { GenericStore } from '.';
import { IFile } from './files';

const LocationStore = new (class Location extends GenericStore {
	#selectedFile: IFile | undefined;
	#selectedRepository: IRepository | undefined;

	constructor() {
		super();

		this.#selectedFile = undefined;
		this.#selectedRepository = undefined;

		setTimeout(() => {
			if (SettingsStore.getSetting('activeRepository')) {
				const repo = RepositoryStore.getByPath(
					SettingsStore.getSetting('activeRepository') as string
				);

				console.log('repo', repo);

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

	setSelectedFile(file: IFile) {
		this.#selectedFile = file;
		this.emit();
	}

	clearSelectedFile() {
		this.#selectedFile = undefined;
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
