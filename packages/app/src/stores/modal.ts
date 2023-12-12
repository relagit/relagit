import { GenericStore } from '.';
import { JSX } from 'solid-js';

const ModalStore = new (class Modal extends GenericStore {
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

	addModal(modal: { type: string; element: JSX.Element }) {
		this.#record.push(modal);
		this.emit();
	}

	removeModal(modal: { type: string; element: JSX.Element }) {
		this.#record = this.modals.filter((f) => f !== modal);
		this.emit();
	}

	clear() {
		this.#record = [];
		this.emit();
	}
})();

export default ModalStore;
