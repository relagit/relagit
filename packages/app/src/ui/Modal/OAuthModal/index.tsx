import Modal, { ModalBody, ModalCloseButton, ModalHeader } from '..';
import { For, Show, createRoot, createSignal, onMount } from 'solid-js';

import { OAuthInitResponse, SECONDS, pollForToken } from '@app/modules/github';
import { t } from '@app/modules/i18n';
import { openExternal } from '@app/modules/shell';
import { renderDate } from '@app/modules/time';
import ModalStore from '@app/stores/modal';
import Button from '@app/ui/Common/Button';
import Icon from '@app/ui/Common/Icon';

import './index.scss';

const OAuthModal = (props: { init: OAuthInitResponse }) => {
	const [hasVerified, setHasVerified] = createSignal<boolean>();
	const [hasErrored, setHasErrored] = createSignal<string>();
	const [hasExpired, setHasExpired] = createSignal<boolean>();
	const [hasCopied, setHasCopied] = createSignal<boolean>();

	const expiresMs = Date.now() + props.init.expires_in * SECONDS;

	onMount(async () => {
		const interval = setInterval(() => {
			if (Date.now() > expiresMs) {
				setHasExpired(true);

				clearInterval(interval);
			}
		}, props.init.interval * SECONDS);

		const res = await pollForToken(props.init);

		if (res.error) setHasErrored(res.error);

		if (res.access_token) {
			setHasVerified(true);
		}
	});

	return (
		<Modal
			size="medium"
			dismissable={!!hasVerified() || !!hasErrored() || !!hasExpired()}
			id={'oauth'}
		>
			{(p) => (
				<>
					<ModalHeader title={t('modal.auth.title')}>
						<Show when={!!hasVerified() || !!hasErrored() || !!hasExpired()}>
							<ModalCloseButton close={p.close} />
						</Show>
					</ModalHeader>
					<ModalBody>
						<div class="oauth-modal__code">
							<For each={props.init.user_code.split('')}>
								{(el) => {
									if (el === '-')
										return <div class="oauth-modal__code__dash">-</div>;

									return <div class="oauth-modal__code__char">{el}</div>;
								}}
							</For>
						</div>
						<div class="oauth-modal__footer">
							<div
								classList={{
									'oauth-modal__footer__text': true,
									error: !!hasErrored(),
									success: !!hasVerified()
								}}
							>
								<Show
									when={hasVerified()}
									fallback={
										<Show
											when={hasErrored()}
											fallback={
												<>
													{t(
														hasExpired()
															? 'modal.auth.expired'
															: 'modal.auth.willExpire',
														{
															time: renderDate(expiresMs, true)()
														}
													)}
												</>
											}
										>
											{t('modal.auth.error')}
										</Show>
									}
								>
									{t('modal.auth.success')}
								</Show>
							</div>
							<div class="oauth-modal__footer__buttons">
								<Button
									onClick={() => {
										navigator.clipboard.writeText(props.init.user_code);

										setHasCopied(true);

										setTimeout(() => setHasCopied(false), 2000);
									}}
									type={hasCopied() ? 'positive' : 'default'}
									label={t('modal.auth.copyCode')}
									disabled={hasExpired() || !!hasErrored() || !!hasVerified()}
								>
									<Icon name={hasCopied() ? 'check' : 'copy'} />
								</Button>
								<Button
									onClick={() => openExternal(props.init.verification_uri)}
									type="brand"
									label={t('modal.auth.openInBrowser')}
									disabled={hasExpired() || !!hasErrored() || !!hasVerified()}
								>
									{t('modal.auth.openInBrowser')}
								</Button>
							</div>
						</div>
					</ModalBody>
				</>
			)}
		</Modal>
	);
};

export default OAuthModal;

export const showOAuthModal = (init: OAuthInitResponse) => {
	ModalStore.pushState(
		'oauth',
		createRoot(() => <OAuthModal init={init} />)
	);
};
