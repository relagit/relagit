import { Accessor, createRenderEffect, from } from 'solid-js';

import { LocaleKey, t } from './i18n';

export const relative = (ms: number, useSeconds = false) => {
	const seconds = Math.floor((Date.now() - ms) / 1000);

	const timeIntervals: {
		interval: number;
		label: LocaleKey;
	}[] = [
		{ interval: 31536000, label: 'time.year' },
		{ interval: 2592000, label: 'time.month' },
		{ interval: 86400, label: 'time.day' },
		{ interval: 3600, label: 'time.hour' },
		{ interval: 60, label: 'time.minute' }
	];

	for (let i = 0; i < timeIntervals.length; i++) {
		const { interval, label } = timeIntervals[i];
		const quotient = Math.floor(seconds / interval);
		const negativeQuotient = Math.floor(seconds / (-1 * interval));

		if (quotient > 0) {
			return t(label, { count: quotient }, quotient) + ' ' + t('time.ago');
		}

		if (negativeQuotient > 0) {
			return t('time.in') + ' ' + t(label, { count: Math.abs(quotient) }, Math.abs(quotient));
		}
	}

	return useSeconds
		? t('time.second', { count: Math.abs(seconds) }, Math.abs(seconds))
		: t('time.now');
};

export const renderDate = (ms: number, seconds = false): Accessor<string | undefined> => {
	return from((set) => {
		const defer: (() => unknown)[] = [];

		const listener = () => set(relative(ms, seconds));
		defer.push(listener);

		const interval = setInterval(listener, 1000);
		defer.push(() => clearInterval(interval));

		createRenderEffect(() => set(relative(ms, seconds)));

		return () => {
			for (const cleanup of defer) {
				cleanup();
			}
		};
	});
};
