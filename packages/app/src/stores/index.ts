import { createRenderEffect, from } from 'solid-js';

export class GenericStore {
	listeners: Set<() => void> = new Set();

	constructor() {
		if (__NODE_ENV__ === 'development') {
			window.Stores ??= {};
			window.Stores[this.constructor.name] = this;
		}
	}

	addListener(listener: () => void) {
		this.listeners.add(listener);
	}

	removeListener(listener: () => void) {
		this.listeners.delete(listener);
	}

	emit() {
		for (const listener of this.listeners) {
			listener();
		}
	}
}

export function createStoreListener<T>(stores: GenericStore[], factory: () => T): () => T {
	return from((set) => {
		const defer = [];

		for (const store of stores) {
			// @ts-expect-error - not doing gymnastics to make this work
			const listener = () => set(factory());

			store.addListener(listener);
			defer.push(() => store.removeListener(listener));
		}

		// @ts-expect-error - not doing gymnastics to make this work
		createRenderEffect(() => set(factory()));

		return () => {
			for (const cleanup of defer) {
				cleanup();
			}
		};
	});
}
