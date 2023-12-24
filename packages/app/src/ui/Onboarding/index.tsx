import { For, Show } from 'solid-js';

import { t } from '@app/modules/i18n';
import ModalStore from '@app/stores/modal';
import OnboardingStore from '@stores/onboarding';

import Button from '@ui/Common/Button';
import Icon from '@ui/Common/Icon';
import Tooltip from '@ui/Common/Tooltip';
import Layer from '@ui/Layer';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@ui/Modal';

import pkj from '../../../../../package.json' assert { type: 'json' };

import './index.scss';

export const finishTour = () => {
	OnboardingStore.setDismissed(true);

	ModalStore.addModal({
		type: 'tour',
		element: (
			<Modal size="small" dismissable transitions={Layer.Transitions.Fade} confetti>
				{(props) => {
					return (
						<>
							<ModalHeader title={t('onboarding.modal.title')}>{}</ModalHeader>
							<ModalBody>
								<div class="onboarding-modal__buttons">
									<Tooltip text={t('onboarding.modal.themes')}>
										{(p) => (
											<a
												{...p}
												tabIndex={0}
												class="onboarding-modal__buttons__button"
												href="https://git.rela.dev/styles"
											>
												<Icon name="paintbrush" />
											</a>
										)}
									</Tooltip>
									<Tooltip text={t('onboarding.modal.workflows')}>
										{(p) => (
											<a
												{...p}
												tabIndex={0}
												class="onboarding-modal__buttons__button"
												href="https://git.rela.dev/workflows"
											>
												<Icon name="project-roadmap" />
											</a>
										)}
									</Tooltip>
									<Tooltip text={t('onboarding.modal.github')}>
										{(p) => (
											<a
												{...p}
												tabIndex={0}
												class="onboarding-modal__buttons__button"
												href="https://git.rela.dev/redirect/github"
											>
												<Icon name="mark-github" />
											</a>
										)}
									</Tooltip>
								</div>
								<div class="onboarding-modal__bugs">
									<span>{t('onboarding.modal.somethingWrong')}</span>
									<a href="https://github.com/relagit/relagit/issues/">
										{t('onboarding.modal.issue')}
									</a>
								</div>
								<div class="onboarding-tooltip__steps">
									<For each={[1, 2, 3, 4, 5]}>
										{(i) => (
											<div
												classList={{
													'onboarding-tooltip__step': true,
													active: 5 === i
												}}
											/>
										)}
									</For>
								</div>
							</ModalBody>
							<ModalFooter>
								<div class="modal__footer__buttons">
									<Button
										type="brand"
										label={t('modal.closeModal')}
										onClick={props.close}
									>
										{t('modal.close')}
									</Button>
								</div>
							</ModalFooter>
						</>
					);
				}}
			</Modal>
		)
	});
};

export default () => {
	return (
		<div class="onboarding">
			<div class="onboarding__text">
				<div class="onboarding__text__logo">
					<svg
						width="39"
						height="46"
						viewBox="0 0 39 46"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g clip-path="url(#clip0_777_1077)">
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M0.411133 0H7.1588V23.3132C10.4502 21.2262 14.7348 20.1714 19.7663 20.1714C24.6035 20.1714 27.3803 18.9745 28.9904 17.2973C30.6114 15.6088 31.6635 12.7962 31.6635 8.17757V0H38.4111V8.17757C38.4111 13.7355 37.1548 18.6462 33.8038 22.1368C30.442 25.6387 25.5833 27.0769 19.7663 27.0769C14.9316 27.0769 11.7614 28.2552 9.87444 29.784C8.06942 31.2464 7.1588 33.2437 7.1588 35.7087V46H0.411133V0Z"
								fill="currentColor"
							/>
							<mask
								id="mask0_777_1077"
								style="mask-type:alpha"
								maskUnits="userSpaceOnUse"
								x="8"
								y="23"
								width="31"
								height="23"
							>
								<path
									d="M34.7711 23.1542C30.9487 27.0236 25.6236 28.515 19.5889 28.515C14.9754 28.515 12.1739 29.6408 10.6339 30.8885C9.2121 32.0405 8.49072 33.5802 8.49072 35.6022V46H38.3225V23.1165L34.7711 23.1542Z"
									fill="black"
								/>
							</mask>
							<g mask="url(#mask0_777_1077)">
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M20.6773 35.1429C19.0611 33.7088 17.2762 31.1118 17.1914 28.0763L23.9391 27.9855C23.9431 28.1302 24.0005 28.9519 25.0978 29.9256C25.9788 30.7074 27.0668 31.4289 28.4322 32.3344C28.8243 32.5944 29.2392 32.8695 29.6787 33.1656C33.1051 35.4743 38.3222 39.2202 38.3222 46H31.5746C31.5746 43.3301 29.689 41.4404 25.9681 38.9333C25.6595 38.7254 25.3322 38.509 24.9936 38.2851C23.5728 37.3458 21.9528 36.2747 20.6773 35.1429Z"
									fill="currentColor"
									fill-opacity="0.6"
								/>
							</g>
						</g>
						<defs>
							<clipPath id="clip0_777_1077">
								<rect
									width="38"
									height="46"
									fill="currentColor"
									transform="translate(0.5)"
								/>
							</clipPath>
						</defs>
					</svg>
					RelaGit
				</div>
				<div class="onboarding__text__version">
					{t('onboarding.version', {
						version: pkj.version
					})}
					<Show when={__NODE_ENV__ === 'development'}> (Development)</Show>
				</div>
			</div>
			<div class="onboarding__actions">
				<Button
					label={t('onboarding.takeTour')}
					onClick={() => {
						OnboardingStore.setStep(1);
					}}
					type="brand"
				>
					{t('onboarding.takeTour')}
					<Icon name="arrow-right" />
				</Button>
				<button
					class="onboarding__actions__anchor"
					onClick={() => {
						OnboardingStore.setDismissed(true);
					}}
				>
					{t('onboarding.dismiss')}
				</button>
			</div>
		</div>
	);
};
