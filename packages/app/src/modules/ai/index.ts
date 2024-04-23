import NotificationStore from '@app/stores/notification';
import SettingsStore from '@app/stores/settings';

import { t } from '../i18n';

export * from './prompt';

const API_BASEURL = __AI_API_URL__;

const makeRes = (result: string): { body: string; message: string } => {
	const message = result.split('\n')[0].trim();
	const body = result.split('\n').slice(1).join('\n').trim();

	return { body, message };
};

export async function* sendAIRequest(prompt: string): AsyncGenerator<{
	body: string;
	message: string;
} | null> {
	if (!SettingsStore.settings.ai?.termsAccepted) {
		const id = NotificationStore.add({
			title: t('ai.terms.title'),
			description: t('ai.terms.message') + ' https://ai.google.dev/terms',
			level: 'info',
			icon: 'sparkle-fill',
			actions: [
				{
					label: t('ai.terms.accept'),
					children: t('ai.terms.accept'),
					type: 'positive',
					onClick: () => {
						SettingsStore.setSetting('ai.termsAccepted', true);

						NotificationStore.remove(id);
					}
				},
				{
					label: t('ai.terms.decline'),
					children: t('ai.terms.decline'),
					type: 'danger',
					onClick: () => {
						SettingsStore.setSetting('ai.termsAccepted', false);

						NotificationStore.remove(id);
					}
				}
			]
		});

		return null;
	}

	try {
		const res = await fetch(API_BASEURL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${__AI_API_PASSWORD__}`
			},
			body: JSON.stringify({ prompt })
		});

		const reader = res.body?.getReader();

		if (!reader) {
			return null;
		}

		let result = '';

		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				break;
			}

			result += new TextDecoder().decode(value);

			yield makeRes(result);
		}

		try {
			if ((JSON.parse(result) as Record<string, string>)['error']) {
				return null;
			}
		} catch {
			// ignore as most likely not an error
		}

		return makeRes(result);
	} catch (e) {
		console.error(e);
		return null;
	}
}
