import { GenericStore } from '.';
import { JSX } from 'solid-js';

const NotificationStore = new (class NotificationStore extends GenericStore {
	#state: Record<string, JSX.Element> = {};
	#removeListeners: Record<string, () => void> = {};

	constructor() {
		super();
	}

	get state() {
		return Object.values(this.#state);
	}

	onRemoved(type: string, callback: () => void) {
		this.#removeListeners[type] = callback;
	}

	add(type: string, component: JSX.Element) {
		this.#state[type] = component;

		this.emit();
	}

	has(type: string) {
		return !!this.#state[type];
	}

	remove(type: string) {
		delete this.#state[type];

		if (this.#removeListeners[type]) {
			this.#removeListeners[type]();
			delete this.#removeListeners[type];
		}

		this.emit();
	}

	clear() {
		this.#state = {};

		for (const type in this.#removeListeners) {
			this.#removeListeners[type]();
		}

		this.emit();
	}
})();

export default NotificationStore;
