import { GenericStore } from '.';

const StageStore = new (class StageStore extends GenericStore {
	#record: Map<string, boolean> = new Map();

	constructor() {
		super();
	}

	isStaged(filePath: string) {
		return this.#record.has(filePath) ? this.#record.get(filePath) : true;
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
