import { createEffect, Accessor } from 'solid-js';

const tabbableSelectors = [
	'a[href]',
	'area[href]',
	'input',
	'select',
	'textarea',
	'button',
	'iframe',
	'object',
	'embed',
	'*[tabindex]',
	'*[contenteditable]'
].join(', ');

const clean = (elements: NodeListOf<HTMLElement>) => {
	return Array.from(elements).filter(
		(el) =>
			!!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && !el['disabled']
	);
};

export const createFocusTrap = (active: Accessor<boolean>, el: Accessor<HTMLElement | null>) => {
	let focusableElements: HTMLElement[] = [];

	let nextFocusableElement: HTMLElement | null = null;
	let previousFocusableElement: HTMLElement | null = null;

	createEffect(() => {
		if (!active()) return;

		const node = el();

		if (!node) return;

		focusableElements = Array.from(clean(node.querySelectorAll(tabbableSelectors)));

		nextFocusableElement = focusableElements[0];
		previousFocusableElement = focusableElements[focusableElements.length - 1];

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Tab') {
				e.preventDefault();

				focusableElements = Array.from(clean(node.querySelectorAll(tabbableSelectors)));

				if (focusableElements.indexOf(nextFocusableElement) === -1) {
					nextFocusableElement = focusableElements[0];
					previousFocusableElement = focusableElements[focusableElements.length - 1];
				}

				if (focusableElements.length === 0) return;

				if (e.shiftKey) {
					previousFocusableElement?.focus();

					nextFocusableElement = previousFocusableElement;
					previousFocusableElement =
						focusableElements[focusableElements.indexOf(previousFocusableElement) - 1];
				} else {
					nextFocusableElement?.focus();

					previousFocusableElement = nextFocusableElement;
					nextFocusableElement =
						focusableElements[focusableElements.indexOf(nextFocusableElement) + 1];
				}
			}
		};

		node.addEventListener('keydown', handleKeyDown);
	});
};
