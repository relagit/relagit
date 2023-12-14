import { useFocusTrap } from '@solidjs-use/integrations/useFocusTrap';
import { Accessor, For, Show, createSignal, onCleanup, onMount } from 'solid-js';

import { iconFromAction, workflows } from '@app/modules/actions';
import { themes, toggleTheme } from '@app/modules/actions/themes';
import { t } from '@app/modules/i18n';
import ModalStore from '@app/stores/modal';
import { createStoreListener } from '@stores/index';
import LayerStore from '@stores/layer';
import LocationStore from '@stores/location';
import SettingsStore, { Settings } from '@stores/settings';
import * as ipc from '~/common/ipc';

import Icon from '@ui/Common/Icon';
import TextArea from '@ui/Common/TextArea';

import Button from '../Common/Button';
import TabView from '../Common/TabView';
import Tooltip from '../Common/Tooltip';
import Layer from '../Layer';
import Modal, { ModalBody, ModalCloseButton, ModalFooter, ModalHeader } from '../Modal';

import './index.scss';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE(
	'electron:ipcRenderer'
) as typeof import('electron').ipcRenderer;

export interface RadioGroupProps {
	options: {
		element: string;
		value: string;
	}[];
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

const showReloadModal = () => {
	ModalStore.addModal({
		type: 'error',
		element: (
			<Modal size="small" dismissable transitions={Layer.Transitions.Fade}>
				{(props) => {
					return (
						<>
							<ModalHeader title={t('modal.reload.title')}>
								<ModalCloseButton close={props.close} />
							</ModalHeader>
							<ModalBody>
								<p class="reload-modal__message">{t('modal.reload.message')}</p>
							</ModalBody>
							<ModalFooter>
								<div class="modal__footer__buttons">
									<Button
										type="default"
										label={t('modal.closeModal')}
										onClick={props.close}
									>
										{t('modal.close')}
									</Button>
									<Button
										type="danger"
										label={t('modal.error.reloadClient')}
										onClick={() => {
											ipcRenderer.invoke(ipc.RELOAD_CLIENT);
										}}
									>
										{t('modal.error.reload')}
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

export const RadioGroup = (props: RadioGroupProps) => {
	const [value, setValue] = createSignal(props.value);

	return (
		<div
			classList={{ 'settings-layer__setting__input radio': true, disabled: props.disabled }}
			role="radiogroup"
		>
			<For each={props.options}>
				{(option) => {
					return (
						<div
							aria-role="radio"
							role="radio"
							class="settings-layer__setting__input__radio"
							aria-disabled={props.disabled}
							aria-label={option.element}
							aria-checked={value() === option.value}
							classList={{ active: value() === option.value }}
							tabIndex={0}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();

								props.onChange(option.value);
								setValue(option.value);
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									props.onChange(option.value);
									setValue(option.value);
								}
							}}
						>
							<div class="check"></div>
							{option.element}
						</div>
					);
				}}
			</For>
		</div>
	);
};

export interface SwitchProps {
	value: Accessor<boolean>;
	label: string;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	note?: string;
}

export const Switch = (props: SwitchProps) => {
	return (
		<div
			classList={{ 'settings-layer__setting__input switch': true, disabled: props.disabled }}
		>
			<label
				aria-label={props.label}
				aria-selected={props.value()}
				aria-disabled={props.disabled}
				classList={{ active: props.value() }}
				onClick={(e) => {
					e.preventDefault();

					props.onChange(!props.value());
				}}
			>
				<div class="label">
					{props.label}
					<Show when={props.note}>
						<div class="note">{props.note}</div>
					</Show>
				</div>
				<div
					aria-label={props.label}
					aria-checked={props.value()}
					aria-role="checkbox"
					role="checkbox"
					classList={{
						check: true,
						active: props.value()
					}}
					tabIndex={0}
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();

						props.onChange(!props.value());
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							props.onChange(!props.value());
						}
					}}
				>
					<span class="slider"></span>
				</div>
			</label>
		</div>
	);
};

export default () => {
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);

	const [ref, setRef] = createSignal<HTMLElement>(null);

	const [open, setOpen] = createSignal(LayerStore.visible('settings'));

	const { activate, deactivate } = useFocusTrap(ref);

	createStoreListener([LayerStore], () => {
		setOpen(LayerStore.visible('settings'));

		if (LayerStore.visible('settings')) {
			activate();
		}
	});

	const close = () => {
		LayerStore.setVisible('settings', false);

		setOpen(false);

		deactivate();
	};

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			close();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', listener);
	});

	onCleanup(() => {
		window.removeEventListener('keydown', listener);
	});

	const Commits = (
		<>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-commit-style">
					{t('settings.general.commitStyle.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.general.commitStyle.description')}
				</p>
				<RadioGroup
					options={[
						{
							element: t('settings.general.commitStyle.conventional'),
							value: 'conventional'
						},
						{
							element: t('settings.general.commitStyle.relational'),
							value: 'relational'
						},
						{
							element: t('settings.general.commitStyle.none'),
							value: 'none'
						}
					]}
					disabled={!LocationStore.selectedRepository}
					value={settings()['commitStyles']?.[LocationStore.selectedRepository?.path]}
					onChange={(value) => {
						SettingsStore.setSetting('commitStyles', {
							...settings()['commitStyles'],
							[LocationStore.selectedRepository?.path]: value
						});
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.general.enforceCommitStyle.label')}
					note={t('settings.general.enforceCommitStyle.description')}
					value={() => settings()['enforceCommitMessageStyle']}
					onChange={(value) => {
						SettingsStore.setSetting('enforceCommitMessageStyle', value);
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.general.preferParens.label')}
					note={t('settings.general.preferParens.description')}
					value={() => settings()['preferParens']}
					onChange={(value) => {
						SettingsStore.setSetting('preferParens', value);
					}}
				/>
			</div>
		</>
	);

	const General = (
		<>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-locale">
					{t('settings.general.language.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.general.language.description')}
					<br />
					{t('settings.restart')}
				</p>
				<RadioGroup
					options={[
						{
							element: 'Deutsch',
							value: 'de'
						},
						{
							element: 'English US',
							value: 'en-US'
						},
						{
							element: 'Latin',
							value: 'lat'
						}
					]}
					value={settings()['locale']}
					onChange={(value) => {
						SettingsStore.setSetting('locale', value);

						showReloadModal();
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-editor">
					{t('settings.general.editor.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.general.editor.description')}
					<br />
					{t('settings.restart')}
				</p>
				<RadioGroup
					options={[
						{
							element: t('settings.general.editor.code'),
							value: 'code'
						},
						{
							element: t('settings.general.editor.code-insiders'),
							value: 'code-insiders'
						},
						{
							element: t('settings.general.editor.subl'),
							value: 'subl'
						}
					]}
					value={settings()['externalEditor'] || 'code'}
					onChange={(value) => {
						SettingsStore.setSetting(
							'externalEditor',
							value as Settings['externalEditor']
						);

						showReloadModal();
					}}
				/>
			</div>
		</>
	);

	const [openWorkflows, setOpenWorkflows] = createSignal(null);

	const Workflows = (
		<>
			<div class="settings-layer__workflows">
				<For each={Array.from(workflows)}>
					{(workflow) => {
						return (
							<div
								class="settings-layer__workflows__workflow"
								aria-label={workflow.name}
								aria-role="button"
								onClick={() => {
									setOpenWorkflows(workflow);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										setOpenWorkflows(workflow);
									}
								}}
								tabIndex={0}
							>
								<div class="settings-layer__workflows__workflow__content">
									<div class="settings-layer__workflows__workflow__content__text">
										<h2 class="settings-layer__workflows__workflow__content__text__header">
											{workflow.name}
										</h2>
										<p class="settings-layer__workflows__workflow__content__text__description">
											{workflow.description}
										</p>
									</div>
									<Icon name={iconFromAction(workflow.on)} />
								</div>
								<Show when={openWorkflows() === workflow}>
									<div class="settings-layer__workflows__workflow__steps">
										<For each={workflow.steps}>
											{(step) => {
												return (
													<div class="settings-layer__workflows__workflow__steps__step">
														{step.name}
													</div>
												);
											}}
										</For>
									</div>
								</Show>
							</div>
						);
					}}
				</For>
			</div>
		</>
	);

	const Appearance = (
		<>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.appearance.vibrancy.label')}
					note={
						t('settings.appearance.vibrancy.description') + '\n' + t('settings.restart')
					}
					disabled={
						window.Native.platform !== 'darwin' && window.Native.platform !== 'win32'
					}
					value={() => !!settings()['vibrancy']}
					onChange={(value) => {
						SettingsStore.setSetting('vibrancy', value);

						if (value) {
							showReloadModal();
						}
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-theme">
					{t('settings.appearance.theme.label')}
				</label>
				<div class="settings-layer__setting__themepicker" role="radiogroup">
					<For each={['light', 'dark', 'system']}>
						{(theme) => {
							return (
								<label
									aria-label={t('settings.appearance.theme.choose', {
										theme
									})}
									aria-selected={settings()['theme'] === theme}
									classList={{ active: settings()['theme'] === theme }}
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											SettingsStore.setSetting(
												'theme',
												theme as Settings['theme']
											);
										}
									}}
								>
									<input
										type="radio"
										value={theme}
										checked={settings()['theme'] === theme}
										onChange={() => {
											SettingsStore.setSetting(
												'theme',
												theme as Settings['theme']
											);
										}}
									/>
									<img src={`assets/themes/${theme}.png`} class="image" />

									<Show
										when={theme === 'system'}
										fallback={
											<p class="title">
												{t(
													`settings.appearance.theme.${
														theme as 'light' | 'dark'
													}`
												)}
											</p>
										}
									>
										<span class="title">
											{t('settings.appearance.theme.system')}
											<Tooltip
												text={t('settings.appearance.theme.systemNote')}
											>
												{(p) => (
													<div
														{...p}
														role="definition"
														class="definition"
													>
														<Icon name="question" />
													</div>
												)}
											</Tooltip>
										</span>
									</Show>
								</label>
							);
						}}
					</For>
				</div>
			</div>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-font">
					{t('settings.appearance.font.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.appearance.font.description')}
				</p>
				<TextArea
					label={t('settings.appearance.font.label')}
					className="settings-layer__setting__textarea"
					value={settings()['fontFamily'] || ''}
					onChange={(value) => {
						SettingsStore.setSetting('fontFamily', value);
					}}
					placeholder={t('settings.appearance.font.placeholder')}
				/>
			</div>

			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-client-themes">
					{t('settings.appearance.clientThemes.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.appearance.clientThemes.description')}
				</p>
				<div class="settings-layer__setting__client-themes">
					<For each={Array.from(themes)}>
						{(theme) => {
							return (
								<div class="settings-layer__setting__client-themes__theme">
									<Switch
										label={theme.name}
										note={`${theme.description || ''} (${theme.authors
											.map((a) => a.name)
											.join(', ')})`}
										value={() =>
											settings()['enabledThemes']?.['includes']?.(theme.id)
										}
										onChange={() => {
											toggleTheme(theme.id);
										}}
									/>
								</div>
							);
						}}
					</For>
				</div>
			</div>
		</>
	);

	return (
		<dialog open={open()} class="settings-layer" ref={setRef}>
			<div class="settings-layer__title">
				<h1>{t('settings.title')}</h1>
				<div class="settings-layer__title__buttons">
					<button
						aria-role="button"
						aria-label={t('settings.close')}
						class="settings-layer__title__buttons__close"
						onClick={close}
					>
						<Icon size={24} variant={24} name="x-circle" />
					</button>
				</div>
			</div>
			<TabView
				views={[
					{
						label: t('settings.general.title'),
						value: 'general',
						element: General
					},
					{
						label: t('settings.commits.title'),
						value: 'commits',
						element: Commits
					},
					{
						label: t('settings.appearance.title'),
						value: 'appearance',
						element: Appearance
					},
					{
						label: t('settings.workflows.title'),
						value: 'workflows',
						element: Workflows
					}
				]}
			/>
		</dialog>
	);
};
