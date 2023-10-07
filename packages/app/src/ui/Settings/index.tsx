const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE(
	'electron:ipcRenderer'
) as typeof import('electron').ipcRenderer;
const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');

import { Accessor, createSignal, For, JSX, onCleanup, onMount, Show } from 'solid-js';

import { __WORKFLOWS_PATH__, iconFromAction, workflows } from '@app/modules/actions';
import { showItemInFolder } from '@app/modules/shell';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import SettingsStore from '@stores/settings';
import ModalStore from '@app/stores/modal';
import LayerStore from '@stores/layer';
import { t } from '@app/modules/i18n';
import * as ipc from '~/common/ipc';

import Modal, { ModalCloseButton, ModalHeader, ModalBody, ModalFooter } from '../Modal';
import SegmentedView from '../Common/SegmentedView';
import TextArea from '@ui/Common/TextArea';
import Button from '../Common/Button';
import Icon from '@ui/Common/Icon';
import Layer from '../Layer';

import './index.scss';

export interface IRadioGroupProps {
	options: {
		element: JSX.Element;
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
			<Modal size="medium" dismissable transitions={Layer.Transitions.Fade}>
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

export const RadioGroup = (props: IRadioGroupProps) => {
	const [value, setValue] = createSignal(props.value);

	return (
		<div
			classList={{ 'settings-layer__setting__input radio': true, disabled: props.disabled }}
			role="radiogroup"
		>
			<For each={props.options}>
				{(option) => {
					return (
						<label
							aria-selected={value() === option.value}
							classList={{ active: value() === option.value }}
						>
							<input
								type="radio"
								value={option.value}
								checked={value() === option.value}
								onChange={(e) => {
									props.onChange((e.target as HTMLInputElement).value);
									setValue((e.target as HTMLInputElement).value);
								}}
							/>
							<div class="check"></div>
							{option.element}
						</label>
					);
				}}
			</For>
		</div>
	);
};

export interface ISwitchProps {
	value: Accessor<boolean>;
	label: string;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	note?: string;
}

export const Switch = (props: ISwitchProps) => {
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
					aria-selected={props.value()}
					classList={{
						check: true,
						active: props.value()
					}}
				>
					<input type="checkbox" checked={props.value()} />
					<span class="slider"></span>
				</div>
			</label>
		</div>
	);
};

export default () => {
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);

	const close = () => LayerStore.setVisible('settings', false);

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

	const General = (
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
							element: <>{t('settings.general.commitStyle.conventional')}</>,
							value: 'conventional'
						},
						{
							element: <>{t('settings.general.commitStyle.relational')}</>,
							value: 'relational'
						},
						{
							element: <>{t('settings.general.commitStyle.none')}</>,
							value: 'none'
						}
					]}
					disabled={!LocationStore.selectedRepository}
					value={
						settings()?.get('commitStyles')?.[LocationStore.selectedRepository?.path]
					}
					onChange={(value) => {
						SettingsStore.setSetting('commitStyles', {
							...(settings()?.get('commitStyles') as Record<string, string>),
							[LocationStore.selectedRepository?.path]: value
						});
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.general.enforceCommitStyle.label')}
					note={t('settings.general.enforceCommitStyle.description')}
					value={() => settings()?.get('enforceCommitMessageStyle') as boolean}
					onChange={(value) => {
						SettingsStore.setSetting('enforceCommitMessageStyle', value);
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.general.preferParens.label')}
					note={t('settings.general.preferParens.description')}
					value={() => settings()?.get('preferParens') as boolean}
					onChange={(value) => {
						SettingsStore.setSetting('preferParens', value);
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-locale">
					{t('settings.general.language.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.general.language.description')}
				</p>
				<RadioGroup
					options={[
						{
							element: <>English, US</>,
							value: 'en-US'
						},
						{
							element: <>Latin</>,
							value: 'lat'
						},
						{
							element: <>Deutsch</>,
							value: 'de'
						}
					]}
					value={settings()?.get('locale') as string}
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
				</p>
				<RadioGroup
					options={[
						{
							element: <>{t('settings.general.editor.code')}</>,
							value: 'code'
						},
						{
							element: <>{t('settings.general.editor.code-insiders')}</>,
							value: 'code-insiders'
						},
						{
							element: <>{t('settings.general.editor.subl')}</>,
							value: 'subl'
						}
					]}
					value={(settings()?.get('externalEditor') as string) || 'code'}
					onChange={(value) => {
						SettingsStore.setSetting('externalEditor', value);

						showReloadModal();
					}}
				/>
			</div>
		</>
	);

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
									showItemInFolder(
										path.join(__WORKFLOWS_PATH__, workflow.filename)
									);
								}}
							>
								<div class="settings-layer__workflows__workflow__text">
									<h2 class="settings-layer__workflows__workflow__text__header">
										{workflow.name}
									</h2>
									<p class="settings-layer__workflows__workflow__text__description">
										{workflow.description}
									</p>
								</div>
								<Icon name={iconFromAction(workflow.on)} />
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
					note={t('settings.appearance.vibrancy.description')}
					disabled={window.Native.platform !== 'darwin'}
					value={() => settings()?.get('vibrancy') as boolean}
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
				<RadioGroup
					options={[
						{
							element: <>{t('settings.appearance.theme.light')}</>,
							value: 'light'
						},
						{
							element: <>{t('settings.appearance.theme.dark')}</>,
							value: 'dark'
						},
						{
							element: <>{t('settings.appearance.theme.system')}</>,
							value: 'system'
						}
					]}
					value={settings()?.get('theme') as string}
					onChange={(value) => {
						SettingsStore.setSetting('theme', value);
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-font">
					{t('settings.appearance.font.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.appearance.font.description')}
				</p>
				<TextArea
					className="settings-layer__setting__textarea"
					value={(settings()?.get('fontFamily') as string) || ''}
					onChange={(value) => {
						SettingsStore.setSetting('fontFamily', value);
					}}
					placeholder={t('settings.appearance.font.placeholder')}
				/>
			</div>
		</>
	);

	return (
		<div class="settings-layer">
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
			<SegmentedView
				views={[
					{
						label: t('settings.general.title'),
						value: 'general',
						element: General
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
		</div>
	);
};
