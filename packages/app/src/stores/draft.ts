import { GenericStore } from '.';

const nullish = {
	message: '',
	description: ''
};

export interface MesssageDraft {
	message: string;
	description: string;
}

const DraftStore = new (class DraftStore extends GenericStore {
	#record: Map<string, MesssageDraft | null> = new Map();

	constructor() {
		super();
	}

	get drafts() {
		return this.#record;
	}

	getDraft(repository: Repository | string) {
		if (!repository) return nullish;

		return this.drafts.get(repository['id'] ?? repository) ?? nullish;
	}

	setDraft(repository: Repository | string, draft: MesssageDraft | null) {
		if (!repository) return;

		this.drafts.set(repository['id'] ?? repository, draft);

		this.emit();
	}

	clearDraft(repository: Repository | string) {
		if (!repository) return;

		this.drafts.delete(repository['id'] ?? repository);

		this.emit();
	}
})();

export default DraftStore;
