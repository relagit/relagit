import { GenericStore } from '.';

const nullish = {
	message: '',
	description: ''
};

export interface IMesssageDraft {
	message: string;
	description: string;
}

const DraftStore = new (class Draft extends GenericStore {
	#record: Map<string, IMesssageDraft | null> = new Map();

	constructor() {
		super();
	}

	get drafts() {
		return this.#record;
	}

	getDraft(repository: IRepository | string) {
		if (!repository) return nullish;

		return this.drafts.get(repository['id'] ?? repository) ?? nullish;
	}

	setDraft(repository: IRepository | string, draft: IMesssageDraft | null) {
		if (!repository) return;

		this.drafts.set(repository['id'] ?? repository, draft);

		this.emit();
	}

	clearDraft(repository: IRepository | string) {
		if (!repository) return;

		this.drafts.delete(repository['id'] ?? repository);

		this.emit();
	}
})();

export default DraftStore;
