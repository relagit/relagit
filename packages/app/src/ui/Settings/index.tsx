import { Accessor, For, Show, createRoot, createSignal } from 'solid-js';

import { __WORKFLOWS_PATH__, workflows } from '@app/modules/actions';
import { themes, toggleTheme } from '@app/modules/actions/themes';
import { CommitStyle } from '@app/modules/commits';
import { getUser, initialiseOAuthFlow } from '@app/modules/github';
import { t } from '@app/modules/i18n';
import { showItemInFolder } from '@app/modules/shell';
import ModalStore from '@app/stores/modal';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import SettingsStore, { type Settings } from '@stores/settings';

import Icon from '@ui/Common/Icon';
import TextArea from '@ui/Common/TextArea';

import Button from '../Common/Button';
import TabView from '../Common/TabView';
import Tooltip from '../Common/Tooltip';
import Modal, { ModalBody, ModalCloseButton, ModalHeader } from '../Modal';
import { showOAuthModal } from '../Modal/OAuthModal';
import { showReloadNotification } from './shared';

import './index.scss';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path');

export interface RadioGroupProps {
	options: {
		element: string;
		value: string;
	}[];
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

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

const SettingsModal = () => {
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);

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
					value={
						settings()?.commit?.styles?.[
							LocationStore.selectedRepository?.path || ''
						] || 'none'
					}
					onChange={(value) => {
						SettingsStore.setSetting(
							`commit.styles.${LocationStore.selectedRepository?.path}`,
							value as CommitStyle
						);
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.general.enforceCommitStyle.label')}
					note={t('settings.general.enforceCommitStyle.description')}
					value={() => settings()?.commit?.enforceStyle || false}
					onChange={(value) => {
						SettingsStore.setSetting('commit.enforceStyle', value);
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.general.preferParens.label')}
					note={t('settings.general.preferParens.description')}
					value={() => settings()?.commit?.preferParens || false}
					onChange={(value) => {
						SettingsStore.setSetting('commit.preferParens', value);
					}}
				/>
			</div>
		</>
	);

	const Accounts = (
		<>
			<div class="settings-layer__setting account">
				<label class="settings-layer__setting__label" id="settings-github">
					{t('settings.accounts.github.label')}
					<div class="settings-layer__setting__label__note">
						{t('settings.accounts.github.note')}
					</div>
				</label>
				<div class="settings-layer__setting__account">
					<Show
						when={getUser() && localStorage.getItem('__x_github_token')}
						fallback={
							<Button
								type="brand"
								label={t('settings.accounts.github.signIn')}
								onClick={() => {
									initialiseOAuthFlow().then((i) => showOAuthModal(i));
								}}
							>
								{t('settings.accounts.github.signIn')}
							</Button>
						}
					>
						<img
							src={getUser()?.avatar_url}
							alt={getUser()?.login}
							class="settings-layer__setting__account__image"
						/>
						<div class="settings-layer__setting__account__text">
							<p class="settings-layer__setting__account__text__name">
								{getUser()?.name}
							</p>
							<p class="settings-layer__setting__account__text__login">
								@{getUser()?.login}
							</p>
						</div>
						<Button
							type="default"
							label={t('settings.accounts.github.signOut')}
							onClick={() => {
								localStorage.removeItem('__x_github_token');
								localStorage.removeItem('__x_github_user');
							}}
						>
							{t('settings.accounts.github.signOut')}
						</Button>
					</Show>
				</div>
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
					value={settings()?.locale || 'en-US'}
					onChange={(value) => {
						SettingsStore.setSetting('locale', value);

						showReloadNotification();
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
					value={settings()?.externalEditor || 'code'}
					onChange={(value) => {
						SettingsStore.setSetting(
							'externalEditor',
							value as Settings['externalEditor']
						);

						showReloadNotification();
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
										nodepath.join(__WORKFLOWS_PATH__, workflow.filename)
									);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										showItemInFolder(
											nodepath.join(__WORKFLOWS_PATH__, workflow.filename)
										);
									}
								}}
								tabIndex={0}
							>
								<div class="settings-layer__workflows__workflow__content">
									<div class="settings-layer__workflows__workflow__content__text">
										<h2 class="settings-layer__workflows__workflow__content__text__header">
											{workflow.name}
											<div class="settings-layer__workflows__workflow__content__text__header__filename">
												{workflow.filename}
											</div>
										</h2>
										<p class="settings-layer__workflows__workflow__content__text__description">
											{workflow.description}
										</p>
									</div>
								</div>
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
					value={() => !!settings()?.ui?.vibrancy}
					onChange={(value) => {
						SettingsStore.setSetting('ui.vibrancy', value);

						if (value) {
							showReloadNotification();
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
									aria-selected={settings()?.ui?.theme === theme}
									classList={{ active: settings()?.ui?.theme === theme }}
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											SettingsStore.setSetting(
												'ui.theme',
												theme as Settings['ui']['theme']
											);
										}
									}}
								>
									<input
										type="radio"
										value={theme}
										checked={settings()?.ui?.theme === theme}
										onChange={() => {
											SettingsStore.setSetting(
												'ui.theme',
												theme as Settings['ui']['theme']
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
					value={settings()?.ui?.fontFamily || ''}
					onChange={(value) => {
						SettingsStore.setSetting('ui.fontFamily', value);
					}}
					placeholder={t('settings.appearance.font.placeholder')}
				/>
			</div>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.appearance.thinIcons.label')}
					note={t('settings.appearance.thinIcons.description')}
					value={() => settings()?.ui?.thinIcons || false}
					onChange={(value) => {
						SettingsStore.setSetting('ui.thinIcons', value);
					}}
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
											settings()?.ui?.userThemes?.includes?.(theme.id) ||
											false
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
		<Modal size="x-large" dismissable id={'settings'}>
			{(p) => (
				<>
					<ModalHeader title={t('settings.title')}>
						<div class="settings-layer__title__buttons">
							<ModalCloseButton close={p.close} />
						</div>
					</ModalHeader>
					<ModalBody>
						<TabView
							views={[
								{
									label: t('settings.general.title'),
									value: 'general',
									element: General,
									icon: 'gear'
								},
								{
									label: t('settings.accounts.title'),
									value: 'accounts',
									element: Accounts,
									icon: 'people'
								},
								{
									label: t('settings.commits.title'),
									value: 'commits',
									element: Commits,
									icon: 'git-commit'
								},
								{
									label: t('settings.appearance.title'),
									value: 'appearance',
									element: Appearance,
									icon: 'eye'
								},
								{
									label: t('settings.workflows.title'),
									value: 'workflows',
									element: Workflows,
									icon: 'workflow'
								}
							]}
						/>
					</ModalBody>
				</>
			)}
		</Modal>
	);
};

export default SettingsModal;

export const showSettingsModal = () => {
	ModalStore.pushState('settings', createRoot(SettingsModal));
};
