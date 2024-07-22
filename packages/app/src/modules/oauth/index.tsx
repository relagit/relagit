import { JSX, Show, createRoot } from 'solid-js';

import AccountStore, { type Provider } from '@app/stores/account';
import ModalStore from '@app/stores/modal';
import Icon, { IconName } from '@app/ui/Common/Icon';
import Tooltip from '@app/ui/Common/Tooltip';
import Modal, { ModalBody, ModalCloseButton, ModalHeader } from '@app/ui/Modal';
import { showOAuthModal } from '@app/ui/Modal/OAuthModal';

import { initialiseGitHubFlow } from '../github';
import { t } from '../i18n';
import { CodebergIcon, initializeCodebergFlow } from './codeberg';
import { initialiseGitLabFlow } from './gitlab';
import { GitLabIcon } from './gitlab';

import './index.scss';

type ProviderButtonProps = {
	iconName?: IconName;
	icon: JSX.Element;
	label: string;
	name: Provider;
	onClick: () => void;
};

const ProviderButton = (props: ProviderButtonProps) => {
	return (
		<Tooltip text={props.label} level={2}>
			{(p) => (
				<button
					{...p}
					tabIndex={0}
					class="provider-modal__buttons__button"
					onClick={props.onClick}
				>
					<Show when={AccountStore.getAccountFor(props.name)}>
						<div class="provider-modal__buttons__button__verified">
							<Icon name="check" />
						</div>
					</Show>
					<Show when={props.icon}>{props.icon}</Show>
					<Show when={props.iconName}>
						<Icon name={props.iconName!} />
					</Show>
				</button>
			)}
		</Tooltip>
	);
};

export const showProviderModal = () => {
	ModalStore.pushState(
		'provider',
		createRoot(() => (
			<Modal size="small" dismissable id="provider">
				{(p) => (
					<>
						<ModalHeader title={t('modal.providers.title')}>
							<ModalCloseButton close={p.close} />
						</ModalHeader>
						<ModalBody>
							<div class="provider-modal__buttons">
								<ProviderButton
									name="github"
									icon={<Icon name="mark-github" size={16} />}
									label={t('modal.clone.providers.github')}
									onClick={() => {
										initialiseGitHubFlow().then(showOAuthModal);
									}}
								/>
								<ProviderButton
									name="gitlab"
									icon={<GitLabIcon size={16} />}
									label={t('modal.clone.providers.gitlab')}
									onClick={() => {
										initialiseGitLabFlow();
									}}
								/>
								<ProviderButton
									name="codeberg"
									icon={<CodebergIcon size={16} />}
									label={t('modal.clone.providers.codeberg')}
									onClick={() => {
										initializeCodebergFlow();
									}}
								/>
							</div>
							<div class="provider-modal__hint">{t('modal.providers.hint')}</div>
						</ModalBody>
					</>
				)}
			</Modal>
		))
	);
};

export const beginProviderFlow = (provider: Provider) => {
	switch (provider) {
		case 'github':
			initialiseGitHubFlow().then(showOAuthModal);
			break;
		case 'gitlab':
			initialiseGitLabFlow();
			break;
		case 'codeberg':
			initializeCodebergFlow();
			break;
	}
};

export const emailToIconURL = (email?: string): string | null => {
	if (!email || !email.includes('@')) return null;

	const provider = email.match(/(github)|(gitlab)|(codeberg)/)?.[0];

	if (!provider) {
		return null;
	}

	const id = email.match(/\d+/)?.[0];

	if (!id) return null;

	switch (provider) {
		case 'github':
			return `https://avatars.githubusercontent.com/u/${id}`;
		case 'gitlab':
			return `https://gitlab.com/uploads/-/system/user/avatar/${id}/avatar.png`;
		case 'codeberg':
			return `https://codeberg.org/avatars/${id}`;
		default:
			return null;
	}
};
