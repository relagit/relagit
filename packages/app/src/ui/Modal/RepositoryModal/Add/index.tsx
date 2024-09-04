import * as Sentry from '@sentry/electron/renderer';
import { For, Signal, createEffect, createSignal, onMount } from 'solid-js';

import { triggerWorkflow } from '@app/modules/actions';
import { t } from '@app/modules/i18n';
import { createStoreListener } from '@app/stores';
import LocationStore from '@app/stores/location';
import OnboardingStore from '@app/stores/onboarding';
import RepositoryStore from '@app/stores/repository';
import Popout from '@app/ui/Common/Popout';
import SettingsStore from '@stores/settings';

import Button from '@ui/Common/Button';
import FileSelect from '@ui/Common/FileSelect';
import SegmentedControl from '@ui/Common/SegmentedControl';
import { ModalBody, ModalFooter } from '@ui/Modal';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');

export interface AddRepositoryModalProps {
	pathSignal: Signal<string>;
	tabSignal: Signal<'add' | 'create'>;
	modalProps: {
		close: () => void;
	};
}

export default (props: AddRepositoryModalProps) => {
	const onboarding = createStoreListener([OnboardingStore], () => OnboardingStore.state);
	const onboardingStepState2 = createSignal(false);
	const onboardingStepState = createSignal(false);

	const [allowClose, setAllowClose] = createSignal(false);

	onMount(() => {
		if (onboarding()!.step === 2 && onboarding()!.dismissed !== true) {
			setTimeout(() => {
				onboardingStepState[1](true);
			}, 200);
		}
	});

	createEffect(() => {
		if (onboarding()!.step === 3 && onboarding()!.dismissed !== true) {
			onboardingStepState2[1](true);
		}
	});

	createEffect(() => {
		const hasPath = props.pathSignal[0]().length > 0;
		const valid = fileValidator(props.pathSignal[0]());

		setAllowClose(hasPath && valid === true);
	});

	const fileValidator = (p: string) => {
		if (p.length === 0) return null;

		const exists = fs.existsSync(p);

		if (!exists)
			return t('ui.filepicker.doesNotExist', {
				type: t('ui.filepicker.directory')
			});

		let isDirectory = false;

		try {
			fs.opendirSync(p);

			isDirectory = true;
		} catch (e) {
			isDirectory = false;
		}

		if (!isDirectory)
			return t('ui.filepicker.isNot', {
				type: t('ui.filepicker.file'),
				expected: t('ui.filepicker.directory')
			});

		const isGit = fs.existsSync(path.join(p, '.git', 'HEAD'));

		if (!isGit) return <>{t('modal.repository.notGit')}</>;

		const isAlreadyAdded = SettingsStore.getSetting('repositories').includes(p);

		if (isAlreadyAdded)
			return (
				<>
					{t('modal.repository.alreadyAdded', {
						name: RepositoryStore.getByPath(p)?.name || path.basename(p)
					})}
				</>
			);

		return true;
	};

	return (
		<>
			<ModalBody>
				<SegmentedControl
					items={[
						{
							label: t('modal.repository.add'),
							value: 'add'
						},
						{
							label: t('modal.repository.create'),
							value: 'create'
						}
					]}
					value={props.tabSignal[0]()}
					onChange={(v) => {
						props.tabSignal[1](v);
					}}
				/>
				<div class="repo__modal__body">
					<Popout
						level={2}
						position="top"
						open={onboardingStepState}
						body={() => (
							<div class="onboarding-tooltip">
								<div class="onboarding-tooltip__title">
									{t('onboarding.add.tooltip')}
								</div>
								<div class="onboarding-tooltip__steps">
									<For each={[1, 2, 3, 4, 5]}>
										{(i) => (
											<div
												classList={{
													'onboarding-tooltip__step': true,
													active: onboarding()!.step === i
												}}
											/>
										)}
									</For>
								</div>
							</div>
						)}
					>
						{(p) => (
							<FileSelect
								ref={p.ref}
								input
								initial={props.pathSignal[0]()}
								validate={fileValidator}
								properties={['openDirectory']}
								onSelect={(path) => {
									props.pathSignal[1](path);

									if (onboardingStepState[0]()) {
										p.hide();

										OnboardingStore.setStep(3);
									}
								}}
							/>
						)}
					</Popout>
				</div>
			</ModalBody>
			<ModalFooter>
				<div class="modal__footer__buttons">
					<Button
						label={t('modal.repository.cancel')}
						type="default"
						onClick={props.modalProps.close}
					>
						{t('modal.repository.cancel')}
					</Button>
					<Popout
						level={2}
						position="top"
						open={onboardingStepState2}
						body={() => (
							<div class="onboarding-tooltip">
								<div class="onboarding-tooltip__title">
									{t('onboarding.add.button')}
								</div>
								<div class="onboarding-tooltip__steps">
									<For each={[1, 2, 3, 4, 5]}>
										{(i) => (
											<div
												classList={{
													'onboarding-tooltip__step': true,
													active: onboarding()!.step === i
												}}
											/>
										)}
									</For>
								</div>
							</div>
						)}
					>
						{(p) => (
							<Button
								ref={p.ref}
								label={t('modal.repository.addRepo')}
								type="brand"
								onClick={() => {
									if (SettingsStore.getSetting('telemetry.metrics') !== false)
										if (__NODE_ENV__ === 'production')
											Sentry.metrics.increment('repository.added', 1);

									SettingsStore.setSetting('repositories', [
										...SettingsStore.getSetting('repositories'),
										props.pathSignal[0]()
									]);

									triggerWorkflow('repository_add', props.pathSignal[0]());

									props.modalProps.close();

									if (onboardingStepState2[0]()) {
										p.hide();

										OnboardingStore.setStep(4);
									}

									setTimeout(() => {
										LocationStore.setSelectedRepository(
											RepositoryStore.getByPath(props.pathSignal[0]())
										);
									}, 500);
								}}
								disabled={!allowClose()}
								dedupe
							>
								{t('modal.repository.add')}
							</Button>
						)}
					</Popout>
				</div>
			</ModalFooter>
		</>
	);
};
