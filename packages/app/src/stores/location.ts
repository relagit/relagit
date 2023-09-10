import { GenericStore } from '.';
import { IFile } from './files';
import { IRepository } from './repository';
const LocationStore = new (class Location extends GenericStore {
	#selectedFile: IFile | undefined;
	#selectedRepository: IRepository | undefined;
	constructor() {
		super();
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
		this.#selectedFile = undefined;
		this.#selectedRepository = repository;
		this.emit();
	}

	clearSelectedRepository() {
		this.#selectedRepository = undefined;
		this.emit();
	}
})();

export default LocationStore;
