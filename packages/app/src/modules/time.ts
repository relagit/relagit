import { createRenderEffect, from } from 'solid-js';

import { LocaleKey, useI18n } from './i18n';

export const relative = (ms: number) => {
	const t = useI18n();

	const seconds = Math.floor((Date.now() - ms) / 1000);

	const timeIntervals = [
		{ interval: 31536000, label: 'time.year' },
		{ interval: 2592000, label: 'time.month' },
		{ interval: 86400, label: 'time.day' },
		{ interval: 3600, label: 'time.hour' },
		{ interval: 60, label: 'time.minute' }
	];

	for (let i = 0; i < timeIntervals.length; i++) {
		const { interval, label } = timeIntervals[i];
		const quotient = Math.floor(seconds / interval);

		if (quotient > 0) {
			return t(label as LocaleKey, { count: quotient }, quotient) + ' ' + t('time.ago');
		}
	}

	return t('time.now');
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
