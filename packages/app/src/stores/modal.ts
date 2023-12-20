import { GenericStore } from '.';
import { JSX } from 'solid-js';

const ModalStore = new (class ModalStore extends GenericStore {
	#record: {
		type: string;
		element: JSX.Element;
	}[] = [];

	constructor() {
		super();
	}

	get modals() {
		return this.#record;
	}

	isOpen(type: string) {
		return this.modals.some((f) => f.type === type);
	}

	addModal(modal: { type: string; element: JSX.Element }) {
		this.#record.push(modal);
		this.emit();
	}

	removeModal(
		type:
			| string
			| {
					type: string;
					element: JSX.Element;
			  }
	) {
		this.#record = this.modals.filter((f) => {
			if (typeof type === 'string') {
				return f.type !== type;
			} else {
				return f.type !== type?.type && f.element !== type?.element;
			}
		});
		this.emit();
	}

	clear() {
		this.#record = [];
		this.emit();
	}
})();

export default ModalStore;
