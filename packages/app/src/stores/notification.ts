import { GenericStore } from '.';

import { type NotificationProps } from '@app/ui/Notification';

let i = 0;

const NotificationStore = new (class NotificationStore extends GenericStore {
	#state: {
		id: number;
		props: NotificationProps;
		timestamp: number;
	}[] = [];
	#removeListeners: Record<number, () => void> = {};

	constructor() {
		super();
	}

	get state() {
		return this.#state;
	}

	onRemoved(type: number, callback: () => void) {
		this.#removeListeners[type] = callback;
	}

	add(props: NotificationProps): number {
		const id = i++;

		this.#state.unshift({
			id,
			props,
			timestamp: Date.now()
		});

		this.emit();

		return id;
	}

	has(id: number | string | NotificationProps) {
		if (typeof id === 'number' || typeof id === 'string') {
			return this.#state.find((notification) => notification.id === id);
		}

		return this.#state.find((notification) => notification.props === id);
	}

	remove(id: number) {
		const index = this.#state.findIndex((notification) => notification.id === id);
		this.#state.splice(index, 1);

		this.emit();
	}

	clear() {
		this.#state = [];

		for (const type in this.#removeListeners) {
			this.#removeListeners[type]();
		}

		this.emit();
	}
})();

export default NotificationStore;
