import { createEffect, Accessor } from 'solid-js';
import * as ft from 'focus-trap';

export const createFocusTrap = (active: Accessor<boolean>, el: Accessor<HTMLElement | null>) => {
	let trap: ft.FocusTrap | null = null;

	createEffect(() => {
		trap?.deactivate();

		if (!active()) return;

		const node = el();

		if (!node) return;

		trap = ft.createFocusTrap(node, {
			clickOutsideDeactivates: false,
			escapeDeactivates: false,
			returnFocusOnDeactivate: false
		});

		trap.activate();
	});
};
