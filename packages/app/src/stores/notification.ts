import { GenericStore } from '.';

import { type NotificationProps } from '@app/ui/Notification';

export const NOTIFICATION_REMOVE_DELAY = 500;

let i = 0;

const NotificationStore = new (class NotificationStore extends GenericStore {
	#state: {
		id: number;
		props: NotificationProps;
		timestamp: number;
	}[] = [];
	#removeListeners: Record<number, (() => void)[]> = {};

	constructor() {
		super();
	}

	get state() {
		return this.#state;
	}

	onRemoved(id: number, callback: () => void) {
		this.#removeListeners[id] ??= [];
		this.#removeListeners[id].push(() => {
			callback();

			this.#removeListeners[id] = this.#removeListeners[id].filter(
				(listener) => listener !== callback
			);
		});
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

		console.log('removing__', id, this.#removeListeners);
		if (this.#removeListeners[id]?.length) {
			for (const listener of this.#removeListeners[id]) {
				listener();
			}
		}

		setTimeout(() => {
			this.#state.splice(index, 1);

			this.emit();

			console.log('removed', id);
		}, NOTIFICATION_REMOVE_DELAY);
	}

	clear() {
		this.#state = [];

		for (const id in this.#removeListeners) {
			if (this.#removeListeners[id]?.length) {
				for (const listener of this.#removeListeners[id]) {
					listener();
				}
			}
		}

		this.emit();
	}
})();

export default NotificationStore;
