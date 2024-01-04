import { GenericStore } from '.';
import { JSX } from 'solid-js';

const ModalStore = new (class ModalStore extends GenericStore {
	#record: { component: JSX.Element; type: string }[] = [];
	#state: {
		active: { component: JSX.Element; type: string } | null;
		previous: { component: JSX.Element; type: string } | null;
	} = {
		active: null,
		previous: null
	};
	#visibilityListeners: { type: string | string[]; cb: () => void }[] = [];

	constructor() {
		super();
	}

	get record() {
		return this.#record;
	}

	get state() {
		return this.#state;
	}

	onModalVisible = (type: string | string[], cb: () => void) => {
		this.#visibilityListeners.push({ type, cb });
	};

	removeModalVisible = (type: string | string[]) => {
		this.#visibilityListeners = this.#visibilityListeners.filter(
			(listener) => listener.type !== type
		);
	};

	pushState(type: string, component: JSX.Element) {
		if (this.#state.active?.type === type) return;

		this.#record.push({ component, type });

		this.#state.previous = this.#state.active;
		this.#state.active = { component, type };

		for (const listener of this.#visibilityListeners) {
			if (Array.isArray(listener.type)) {
				if (listener.type.includes(type)) {
					listener.cb();
				}
			} else if (listener.type === type) {
				listener.cb();
			}
		}

		this.emit();
	}

	popState() {
		this.#record.pop();

		this.#state.active = this.#record[this.#record.length - 1] ?? null;
		this.#state.previous = this.#record[this.#record.length - 2] ?? null;

		this.#visibilityListeners
			.filter((listener) =>
				Array.isArray(listener.type)
					? listener.type.includes(this.#state.active?.type ?? '')
					: listener.type === this.#state.active?.type
			)
			.forEach((listener) => listener.cb());

		this.emit();
	}

	clear() {
		this.#record = [];
		this.emit();
	}
})();

export default ModalStore;
