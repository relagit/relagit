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

	getDraft(repository: Repository | string | undefined) {
		if (!repository) return nullish;

		return (
			this.drafts.get(typeof repository === 'string' ? repository : repository.id) ?? nullish
		);
	}

	setDraft(repository: Repository | string | undefined, draft: MesssageDraft | null) {
		if (!repository) return;

		this.drafts.set(typeof repository === 'string' ? repository : repository.id, draft);

		this.emit();
	}

	clearDraft(repository: Repository | string | undefined) {
		if (!repository) return;

		this.drafts.delete(typeof repository === 'string' ? repository : repository.id);

		this.emit();
	}
})();

export default DraftStore;
