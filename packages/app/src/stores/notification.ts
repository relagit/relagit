import { GenericStore } from '.';
import { JSX } from 'solid-js';

const NotificationStore = new (class NotificationStore extends GenericStore {
	#state: Record<string, JSX.Element> = {};

	constructor() {
		super();
	}

	get state() {
		return Object.values(this.#state);
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

		this.emit();
	}

	clear() {
		this.#state = {};

		this.emit();
	}
})();

export default NotificationStore;
