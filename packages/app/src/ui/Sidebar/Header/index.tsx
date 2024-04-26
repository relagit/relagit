import { For, Show, createSignal, onMount } from 'solid-js';

import { openInEditor } from '@app/modules/editor';
import { t } from '@app/modules/i18n';
import { openExternal, showItemInFolder } from '@app/modules/shell';
import OnboardingStore from '@app/stores/onboarding';
import SettingsStore from '@app/stores/settings';
import Popout from '@app/ui/Common/Popout';
import Menu from '@app/ui/Menu';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import RespositoryStore from '@stores/repository';
import { branchFormatsForProvider } from '~/app/src/modules/github';

import Icon from '@ui/Common/Icon';

import Drawer from './Drawer';

import './index.scss';

export default () => {
	const onboarding = createStoreListener([OnboardingStore], () => OnboardingStore.state);
	const onboardingStepState = createSignal(false);
	const [open, setOpen] = createSignal(false);
	const ref = createSignal<HTMLDivElement>();

	const toggle = (value: boolean) => {
		if (value) {
			setOpen(true);

			const el: HTMLElement | null | undefined = ref[0]()?.querySelector(
				'button,input,a,select,textarea,[tabindex]'
			);

			if (el) el.focus();
		} else {
			setOpen(false);
		}
	};

	window.Native.listeners.SWITCHER((_, value) => {
		toggle(value ?? !open());
	});

	const selected = createStoreListener([LocationStore, RespositoryStore], () =>
		RespositoryStore.getById(LocationStore.selectedRepository?.id)
	);

	onMount(() => {
		if (onboarding()!.step === 1 && onboarding()!.dismissed !== true) {
			onboardingStepState[1](true);
		}
	});

	return (
		<>
			<Drawer ref={ref} open={[open, toggle]} />
			<Menu
				interfaceId="sidebar-header"
				items={[
					{
						type: 'item',
						label: t('sidebar.contextMenu.viewIn', {
							name: window.Native.platform === 'darwin' ? 'Finder' : 'Explorer'
						}),
						accelerator: {
							meta: true,
							shift: true,
							key: 'f'
						},
						onClick: () => {
							showItemInFolder(selected()?.path || '');
						},
						disabled: !selected()
					},
					{
						label: t('sidebar.contextMenu.openRemote'),
						disabled: !selected(),
						accelerator: {
							meta: true,
							shift: true,
							key: 'g'
						},
						type: 'item',
						onClick: () => {
							const url = selected()?.remote.replace(/\.git$/, '');

							if (selected()?.branch && url)
								return openExternal(
									`${url}${branchFormatsForProvider(url, selected()!.branch!)}`
								);

							if (url) openExternal(url);
						}
					},
					{
						label: t('sidebar.contextMenu.openIn', {
							name: t(
								`settings.general.editor.${
									SettingsStore.getSetting('externalEditor') || 'code'
								}`
							)
						}),
						accelerator: {
							meta: true,
							shift: true,
							key: 'c'
						},
						onClick: () => {
							openInEditor(selected()?.path || '');
						},
						disabled: !selected(),
						type: 'item'
					}
				]}
			>
				<Popout
					position="bottom"
					open={onboardingStepState}
					body={() => (
						<div class="onboarding-tooltip">
							<div class="onboarding-tooltip__title">
								{t('onboarding.header.tooltip')}
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
						<div
							ref={p.ref}
							aria-role="button"
							aria-label={t('sidebar.openDrawer')}
							aria-expanded={open()}
							tabIndex={0}
							class="sidebar__header"
							onClick={() => {
								toggle(!open());

								if (onboardingStepState[0]()) {
									p.hide();

									OnboardingStore.setStep(2);
								}
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.stopPropagation();
									e.preventDefault();

									toggle(!open());

									if (onboardingStepState[0]()) {
										p.hide();

										OnboardingStore.setStep(2);
									}
								}
							}}
						>
							<div class="sidebar__header__info">
								<div class="sidebar__header__repository">
									{selected()?.name || t('sidebar.noRepo')}
								</div>
								<div class="sidebar__header__details">
									<Show
										when={selected()}
										fallback={<span>{t('sidebar.noRepoHint')}</span>}
									>
										<span class="sidebar__header__details__branch">
											{selected()?.branch || t('sidebar.noBranch')}
										</span>
									</Show>
								</div>
							</div>
							<div
								class="sidebar__header__chevron"
								style={{ transform: `rotate(${open() ? 90 : -90}deg)` }}
							>
								<Icon name="chevron-down" />
							</div>
						</div>
					)}
				</Popout>
			</Menu>
		</>
	);
};
