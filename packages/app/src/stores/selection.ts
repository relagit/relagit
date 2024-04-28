import { GenericStore } from '.';

const SelectionStore = new (class SelectionStore extends GenericStore {
	#selected: Set<GitFile> = new Set();

	constructor() {
		super();
	}

	get sidebarSelection() {
		return this.#selected;
	}

	addToSidebarSelection(file: GitFile) {
		this.#selected.add(file);

		this.emit();
	}

	removeFromSidebarSelection(file: GitFile) {
		this.#selected.delete(file);

		this.emit();
	}

	clearSidebarSelection() {
		this.#selected.clear();

		this.emit();
	}
})();

export default SelectionStore;
