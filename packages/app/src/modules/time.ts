import { createRenderEffect, from } from 'solid-js';

export const relative = (ms: number) => {
	const seconds = Math.floor((Date.now() - ms) / 1000);

	const timeIntervals = [
		{ interval: 31536000, label: 'year' },
		{ interval: 2592000, label: 'month' },
		{ interval: 86400, label: 'day' },
		{ interval: 3600, label: 'hour' },
		{ interval: 60, label: 'minute' }
	];

	for (let i = 0; i < timeIntervals.length; i++) {
		const { interval, label } = timeIntervals[i];
		const quotient = Math.floor(seconds / interval);

		if (quotient > 0) {
			return `${quotient} ${label}${quotient > 1 ? 's' : ''} ago`;
		}
	}

	return 'Just now';
};

export const renderDate = (ms: number): (() => string) => {
	return from((set) => {
		const defer = [];

		const listener = () => set(relative(ms));
		defer.push(listener);

		const interval = setInterval(listener, 1000);
		defer.push(() => clearInterval(interval));

		createRenderEffect(() => set(relative(ms)));

		return () => {
			for (const cleanup of defer) {
				cleanup();
			}
		};
	});
};
