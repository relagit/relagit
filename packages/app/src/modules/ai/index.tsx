import NotificationStore from '@app/stores/notification';
import SettingsStore from '@app/stores/settings';
import Notification from '@app/ui/Notification';

import { t } from '../i18n';

export * from './prompt';

const API_BASEURL = __AI_API_URL__;

export const sendAIRequest = async (
	prompt: string
): Promise<{
	body: string;
	message: string;
} | null> => {
	if (!SettingsStore.settings.ai?.termsAccepted) {
		NotificationStore.add(
			'ai-terms',
			<Notification
				id="ai-terms"
				title={t('ai.terms.title')}
				description={t('ai.terms.message') + ' https://ai.google.dev/terms'}
				level="info"
				icon="sparkle-fill"
				actions={[
					{
						label: t('ai.terms.accept'),
						children: t('ai.terms.accept'),
						type: 'positive',
						onClick: () => {
							SettingsStore.setSetting('ai.termsAccepted', true);

							NotificationStore.remove('ai-terms');
						}
					},
					{
						label: t('ai.terms.decline'),
						children: t('ai.terms.decline'),
						type: 'danger',
						onClick: () => {
							SettingsStore.setSetting('ai.termsAccepted', false);

							NotificationStore.remove('ai-terms');
						}
					}
				]}
			/>
		);

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

		const json = (await res.json()) as {
			message: string;
			body: string;
			error?: string;
		};

		if (res.status !== 200 || json.error) {
			return null;
		}

		if (!json['message']) {
			return null;
		}

		return json;
	} catch (e) {
		return null;
	}
};
