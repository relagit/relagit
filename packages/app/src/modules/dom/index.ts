export * from './elements';

import { head } from './elements';

export const addCSS = (id: string, cssOrPath: string, local = false) => {
	let el: HTMLLinkElement | HTMLStyleElement;

	if (local) {
		el = document.createElement('link');

		el['rel'] = 'stylesheet';
		el['href'] = cssOrPath;

		head.appendChild(el);
	} else {
		el = document.createElement('style');

		el.innerHTML = cssOrPath;
	}

	el.id = `theme-${id}`;

	head.appendChild(el);
};

export const updateCSS = (id: string, cssOrPath: string, local = false) => {
	const el = document.getElementById(`theme-${id}`);

	if (!el) return;

	switch (local) {
		case true:
			el['href'] = cssOrPath + '?';
			break;
		case false:
			el.innerHTML = cssOrPath;
			break;
	}
};
