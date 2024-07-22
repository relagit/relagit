import { AnthropicProvider, createAnthropic } from '@ai-sdk/anthropic';
import { GoogleGenerativeAIProvider, createGoogleGenerativeAI } from '@ai-sdk/google';
import { OpenAIProvider, createOpenAI } from '@ai-sdk/openai';
import * as ai from 'ai';

import NotificationStore from '@app/stores/notification';
import SettingsStore from '@app/stores/settings';

import { t } from '../i18n';
import { error } from '../logger';

export * from './prompt';

const makeRes = (result: string): { body: string; message: string } => {
	const message = result.split('\n')[0].trim();
	const body = result.split('\n').slice(1).join('\n').trim();

	return { body, message };
};

export async function* generate(prompt: string): AsyncGenerator<{
	body: string;
	message: string;
} | null> {
	if (!SettingsStore.settings.ai?.termsAccepted) {
		let url = '';

		if (SettingsStore.settings.ai?.provider?.startsWith('gpt')) {
			url = 'https://openai.com/terms';
		} else if (SettingsStore.settings.ai?.provider?.startsWith('gemini')) {
			url = 'https://ai.google.dev/terms';
		} else if (SettingsStore.settings.ai?.provider?.startsWith('claude')) {
			url = 'https://anthropic.com/terms';
		}

		const id = NotificationStore.add({
			title: t('ai.terms.title'),
			description: t('ai.terms.message') + ' ' + url,
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

	if (!SettingsStore.settings.ai?.api_key || !SettingsStore.settings.ai?.provider) {
		NotificationStore.add({
			title: t('ai.error.title'),
			description: t('ai.error.message'),
			level: 'error',
			icon: 'alert'
		});

		return null;
	}

	let model: ai.LanguageModel | undefined = undefined;

	try {
		let provider: OpenAIProvider | GoogleGenerativeAIProvider | AnthropicProvider | undefined =
			undefined;

		const options = {
			apiKey: SettingsStore.settings.ai.api_key
		};

		if (SettingsStore.settings.ai.provider.startsWith('gpt')) {
			provider = createOpenAI(options);
		} else if (SettingsStore.settings.ai.provider.startsWith('gemini')) {
			provider = createGoogleGenerativeAI(options);
		} else if (SettingsStore.settings.ai.provider.startsWith('claude')) {
			provider = createAnthropic(options);
		}

		if (!provider) {
			throw new Error('Invalid AI provider');
		}

		switch (SettingsStore.settings.ai.provider) {
			case 'gpt-3.5':
				model = (provider as OpenAIProvider)('gpt-3.5-turbo-0125');
				break;
			case 'gpt-4':
				model = (provider as OpenAIProvider)('gpt-4-turbo');
				break;
			case 'gpt-4o':
				model = (provider as OpenAIProvider)('gpt-4o');
				break;
			case 'gemini-pro':
				model = (provider as GoogleGenerativeAIProvider)('models/gemini-pro');
				break;
			case 'gemini-1.5-pro':
				model = (provider as GoogleGenerativeAIProvider)('models/gemini-1.5-pro-latest');
				break;
			case 'claude-haiku':
				model = (provider as AnthropicProvider)('claude-3-haiku-20240307');
				break;
			case 'claude-sonnet':
				model = (provider as AnthropicProvider)('claude-3-5-sonnet-20240620');
				break;
			case 'claude-opus':
				model = (provider as AnthropicProvider)('claude-3-opus-20240229');
				break;
		}

		if (!model) {
			throw new Error('Invalid AI provider');
		}

		const result = await ai.streamText({
			model,
			prompt
		});

		let joinedResult = '';

		for await (const res of result.textStream) {
			joinedResult += res;

			yield makeRes(joinedResult);
		}
	} catch (e) {
		error(e);

		NotificationStore.add({
			title: t('ai.error.title'),
			description: (e as Error).message,
			level: 'error',
			icon: 'alert'
		});

		throw e;
	}
}
