import { For, JSX, Show, createRoot, createSignal } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { __WORKFLOWS_PATH__, workflows } from '@app/modules/actions';
import { Element, USER_PANES } from '@app/modules/actions/app';
import { themes, toggleTheme } from '@app/modules/actions/themes';
import { CommitStyle } from '@app/modules/commits';
import { LocaleKey, t } from '@app/modules/i18n';
import { beginProviderFlow } from '@app/modules/oauth';
import { openExternal, showItemInFolder } from '@app/modules/shell';
import AccountStore, { Provider } from '@app/stores/account';
import ModalStore from '@app/stores/modal';
import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import SettingsStore, { type Settings } from '@stores/settings';

import Icon from '@ui/Common/Icon';
import TextArea from '@ui/Common/TextArea';

import pkj from '../../../../../package.json';
import { getOptionsProxy } from '../../modules/actions/settings';
import { getAvailableEditors } from '../../modules/editor';
import LayerStore from '../../stores/layer';
import Button from '../Common/Button';
import Dropdown from '../Common/Dropdown';
import EmptyState from '../Common/EmptyState';
import TabView from '../Common/TabView';
import Tooltip from '../Common/Tooltip';
import Modal, { ModalBody, ModalCloseButton, ModalHeader } from '../Modal';
import { hideReloadNotification, showReloadNotification } from './shared';

import './index.scss';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path');
const clipboard = window.Native.DANGEROUS__NODE__REQUIRE('electron:clipboard');

const copyDebugInfo = () => {
	const debugInfo = JSON.stringify({
		platform: window.Native.platform,
		version: pkj.version,
		commit: __COMMIT_HASH__,
		location: {
			history: LocationStore.historyOpen,
			selected: LocationStore.selectedRepository ? '<Repository>' : '<None>',
			isRefetching: LocationStore.isRefetchingSelectedRepository,
			imageDisplay: LocationStore.imageDisplayMode,
			dragState: LocationStore.dragState,
			palette: LocationStore.showingPalette,
			commit: LocationStore.selectedCommit ? '<Commit>' : '<None>',
			commitFile: LocationStore.selectedCommitFile ? '<CommitFile>' : '<None>',
			file: LocationStore.selectedFile ? '<File>' : '<None>'
		},
		layers: LayerStore.getVisible()
			.map((layer) => layer.key)
			.join(', '),
		modals: `Active: ${ModalStore.state.active?.type}, Previous: ${ModalStore.state.previous?.type}`
	});

	clipboard.writeText(debugInfo);
};

const buildElements = (
	children?:
		| ((DElement | string)[] | string | DElement)
		| (() => (DElement | string)[] | string | DElement)
): JSX.Element => {
	if (!children) return null;

	if (typeof children === 'function') {
		return buildElements(children());
	}

	if (typeof children === 'string') {
		return children;
	}

	if (!Array.isArray(children)) {
		return (
			<Dynamic component={children.tagName} {...children.attributes}>
				{buildElements(children.children)}
			</Dynamic>
		);
	}

	const childrenArray = children as Element[];

	if (!childrenArray?.length) return null;

	if (childrenArray.length === 1 && childrenArray[0].tagName === 'text') {
		return childrenArray[0].children as string;
	}

	return (
		<>
			<For each={childrenArray}>
				{(child) => {
					return (
						<Dynamic component={child.tagName} {...child.attributes}>
							{buildElements(child.children)}
						</Dynamic>
					);
				}}
			</For>
		</>
	);
};

export interface RadioGroupProps {
	options: (
		| {
				type?: 'item';
				element: string;
				value: string;
				hint?: string;
				image?: string | URL;
		  }
		| {
				type: 'divider';
				name: string;
		  }
	)[];
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	hints?: boolean;
	monoHints?: boolean;
}

export const RadioGroup = (props: RadioGroupProps) => {
	const [value, setValue] = createSignal(props.value);

	return (
		<div
			classList={{ 'settings-layer__setting__input radio': true, disabled: props.disabled }}
			role="radiogroup"
		>
			<For each={props.options}>
				{(option, i) => {
					if (option.type === 'divider') {
						return (
							<div class="settings-layer__setting__input__divider">{option.name}</div>
						);
					}

					return (
						<div
							role="radio"
							classList={{
								'settings-layer__setting__input__radio': true,
								active: value() === option.value,
								'before-divider': props.options[i() + 1]?.type === 'divider'
							}}
							aria-disabled={props.disabled}
							aria-label={option.element}
							aria-checked={value() === option.value}
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
							<Show when={option.image}>
								{(image) => {
									return (
										<Show
											when={typeof image() !== 'string'}
											fallback={<div class="image">{image() as string}</div>}
										>
											<img
												class="image"
												src={image().toString()}
												alt={option.value}
											/>
										</Show>
									);
								}}
							</Show>
							{option.element}
							<Show when={props.hints || option.hint}>
								<div classList={{ hint: true, mono: props.monoHints }}>
									{option.hint ?? option.value}
								</div>
							</Show>
						</div>
					);
				}}
			</For>
		</div>
	);
};

export interface SwitchProps {
	value: boolean;
	label?: string;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	note?: string;
}

export const Switch = (props: SwitchProps) => {
	const [value, setValue] = createSignal(props.value);

	return (
		<div
			classList={{ 'settings-layer__setting__input switch': true, disabled: props.disabled }}
		>
			<label
				aria-label={props.label}
				aria-selected={value()}
				aria-disabled={props.disabled}
				classList={{ active: value() }}
				onClick={(e) => {
					e.preventDefault();

					props.onChange(!value());

					setValue(!value()); // optimistically update the value
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
					aria-checked={value()}
					role="checkbox"
					classList={{
						check: true,
						active: value()
					}}
					tabIndex={0}
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();

						props.onChange(!value());

						setValue(!value());
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							props.onChange(!value());

							setValue(!value());
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

	const initialUponOpen = structuredClone(SettingsStore.settings);

	const Git = (
		<>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.general.annotateCommit.label')}
					note={t('settings.general.annotateCommit.description')}
					value={settings()?.commit?.annotate || false}
					onChange={(value) => {
						SettingsStore.setSetting('commit.annotate', value);
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-clone-method">
					{t('settings.general.cloneMethod.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.general.cloneMethod.description')}
				</p>
				<RadioGroup
					hints
					options={[
						{
							element: t('settings.general.cloneMethod.http'),
							hint: t('settings.general.cloneMethod.httpHint'),
							value: 'http'
						},
						{
							element: t('settings.general.cloneMethod.ssh'),
							hint: t('settings.general.cloneMethod.sshHint'),
							value: 'ssh'
						}
					]}
					value={settings()?.commit?.cloneMethod || 'http'}
					onChange={(value) => {
						SettingsStore.setSetting('commit.cloneMethod', value as 'http' | 'ssh');
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-commit-style">
					{t('settings.general.commitStyle.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.general.commitStyle.description')}
				</p>
				<RadioGroup
					hints
					monoHints
					options={[
						{
							element: t('settings.general.commitStyle.conventional'),
							hint: 'type(scope): description',
							value: 'conventional'
						},
						{
							element: t('settings.general.commitStyle.relational'),
							hint: '!(scope) type: description',
							value: 'relational'
						},
						{
							element: t('settings.general.commitStyle.none'),
							hint: '',
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
					value={settings()?.commit?.enforceStyle || false}
					onChange={(value) => {
						SettingsStore.setSetting('commit.enforceStyle', value);
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.general.preferParens.label')}
					note={t('settings.general.preferParens.description')}
					value={settings()?.commit?.preferParens || false}
					onChange={(value) => {
						SettingsStore.setSetting('commit.preferParens', value);
					}}
				/>
			</div>
		</>
	);

	const Accounts = (
		<>
			<For each={['github', 'gitlab', 'codeberg'] as Provider[]}>
				{(provider) => (
					<div class="settings-layer__setting account">
						<label class="settings-layer__setting__label" id={`settings-${provider}`}>
							{t(`settings.accounts.${provider}`)}
							<div class="settings-layer__setting__label__note">
								<Show
									when={AccountStore.keysFor(provider).length}
									fallback={t('settings.accounts.keys.none')}
								>
									<For each={AccountStore.keysFor(provider)}>
										{(key, i) => (
											<span>
												{t(`settings.accounts.keys.${key}`)}
												{i() !== AccountStore.keysFor(provider).length - 1 ?
													', '
												:	''}
											</span>
										)}
									</For>
								</Show>
							</div>
						</label>
						<div class="settings-layer__setting__account">
							<Show
								when={AccountStore.hasKey(`${provider}_access`)}
								fallback={
									<Button
										type="brand"
										label={t('settings.accounts.signIn')}
										onClick={() => {
											beginProviderFlow(provider);
										}}
									>
										{t('settings.accounts.signIn')}
									</Button>
								}
							>
								<img
									src={AccountStore.getNormalisedAccount(provider)?.avatar}
									alt={AccountStore.getNormalisedAccount(provider)?.username}
									class="settings-layer__setting__account__image"
								/>
								<div class="settings-layer__setting__account__text">
									<p class="settings-layer__setting__account__text__name">
										{AccountStore.getNormalisedAccount(provider)?.displayName}
									</p>
									<p class="settings-layer__setting__account__text__login">
										@{AccountStore.getNormalisedAccount(provider)?.username}
									</p>
								</div>
								<Button
									type="default"
									label={t('settings.accounts.signOut')}
									onClick={() => {
										AccountStore.removeAccount(provider);
									}}
								>
									{t('settings.accounts.signOut')}
								</Button>
							</Show>
						</div>
					</div>
				)}
			</For>
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
				<Dropdown
					level={2}
					label={t('settings.general.language.label')}
					hints
					monoHints
					icon="globe"
					iconPosition="right"
					options={[
						{
							label: 'Deutsch',
							image: '🇩🇪',
							value: 'de'
						},
						{
							label: 'English US',
							image: '🇺🇸',
							value: 'en-US'
						},
						{
							label: 'Español',
							image: '🇪🇸',
							value: 'es'
						},
						{
							label: 'Français',
							image: '🇫🇷',
							value: 'fr'
						},
						{
							label: 'Latin',
							image: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
							value: 'lat'
						},
						{
							label: '中文',
							image: '🇨🇳',
							value: 'zh'
						}
					]}
					value={settings()?.locale || 'en-US'}
					onChange={(value) => {
						SettingsStore.setSetting('locale', value);

						if (value !== initialUponOpen.locale) {
							showReloadNotification();
						} else {
							hideReloadNotification();
						}
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
					hints
					monoHints
					options={getAvailableEditors()
						.map((editor) => ({
							element: t(`settings.general.editor.${editor.exec}`),
							value: editor.exec,
							hint: editor.exec as string,
							image: editor.image ? new URL(editor.image) : undefined
						}))
						.concat([
							{
								element: t('settings.general.editor.custom'),
								value: 'custom',
								hint: '',
								image: undefined
							}
						])}
					value={settings()?.externalEditor || 'code'}
					onChange={(value) => {
						SettingsStore.setSetting(
							'externalEditor',
							value as Settings['externalEditor']
						);

						if (value !== initialUponOpen.externalEditor) {
							showReloadNotification();
						} else {
							hideReloadNotification();
						}
					}}
				/>
			</div>
			<Show when={settings()?.externalEditor === 'custom'}>
				<div class="settings-layer__setting">
					<TextArea
						label={t('settings.general.editor.custom')}
						value={settings()?.customEditor || ''}
						onChange={(value) => {
							SettingsStore.setSetting('customEditor', value);
						}}
						placeholder={t('settings.general.editor.customPlaceholder')}
					/>
				</div>
			</Show>
			<div class="settings-layer__setting">
				<Switch
					label={t('settings.general.autoFetch.label')}
					note={t('settings.general.autoFetch.description')}
					value={settings()?.autoFetch || false}
					onChange={(value) => {
						SettingsStore.setSetting('autoFetch', value);
					}}
				/>
			</div>
			<div class="settings-layer__debug">
				<Button
					type="brand"
					label={t('settings.general.debug.copy')}
					onClick={copyDebugInfo}
				>
					{t('settings.general.debug.copy')}
				</Button>
			</div>
		</>
	);

	const Ai = (
		<>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-ai-provider">
					{t('settings.ai.model.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.ai.model.description')}
				</p>
				<RadioGroup
					options={[
						{
							element: t('settings.ai.model.none'),
							value: 'none',
							hint: t('settings.ai.model.noneHint')
						},
						{
							type: 'divider',
							name: t('settings.ai.model.openai')
						},
						{
							element: t('settings.ai.model.gpt-3-5'),
							value: 'gpt-3.5'
						},
						{
							element: t('settings.ai.model.gpt-4'),
							value: 'gpt-4'
						},
						{
							element: t('settings.ai.model.gpt-4o'),
							value: 'gpt-4o'
						},
						{
							type: 'divider',
							name: t('settings.ai.model.gemini')
						},
						{
							element: t('settings.ai.model.gemini-pro'),
							value: 'gemini-pro'
						},
						{
							element: t('settings.ai.model.gemini-1-5-pro'),
							value: 'gemini-1.5-pro'
						},
						{
							type: 'divider',
							name: t('settings.ai.model.anthropic')
						},
						{
							element: t('settings.ai.model.claude-haiku'),
							value: 'claude-haiku'
						},
						{
							element: t('settings.ai.model.claude-sonnet'),
							value: 'claude-sonnet'
						},
						{
							element: t('settings.ai.model.claude-opus'),
							value: 'claude-opus'
						}
					]}
					value={settings()?.ai?.provider || 'none'}
					onChange={(value) => {
						SettingsStore.setSetting(
							'ai.provider',
							value as Settings['ai']['provider']
						);
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-ai-key">
					{t('settings.ai.apiKey.label')}
				</label>
				<p class="settings-layer__setting__description">
					{t('settings.ai.apiKey.description', {
						provider: t(
							settings()?.ai?.provider === 'none' ?
								'settings.ai.apiKey.selected'
							:	(`settings.ai.model.${settings()?.ai?.provider?.replace('.', '-') || 'none'}` as LocaleKey)
						)
					})}
				</p>
				<TextArea
					label={t('settings.ai.apiKey.label')}
					value={settings()?.ai?.api_key || ''}
					onChange={(value) => {
						SettingsStore.setSetting('ai.api_key', value);
					}}
					type="password"
					placeholder={t('settings.ai.apiKey.placeholder')}
				/>
			</div>
		</>
	);

	const Workflows = (
		<>
			<div class="settings-layer__workflows">
				<Show
					when={workflows.size}
					fallback={
						<EmptyState
							detail={t('settings.workflows.empty.title')}
							hint={t('settings.workflows.empty.description')}
							icon="workflow"
							actions={[
								{
									label: t('sidebar.contextMenu.viewIn', {
										name:
											window.Native.platform === 'darwin' ?
												'Finder'
											:	'Explorer'
									}),
									type: 'brand',
									onClick: () => {
										showItemInFolder(__WORKFLOWS_PATH__);
									}
								},
								{
									label: t('settings.workflows.empty.hint'),
									type: 'default',
									onClick: () => {
										openExternal(
											'https://rela.dev/docs/workflows/what-is-a-workflow'
										);
									}
								}
							]}
						/>
					}
				>
					<For each={Array.from(workflows)}>
						{(workflow) => {
							return (
								<div
									class="settings-layer__workflows__workflow"
									aria-label={workflow.name}
									role="button"
									onClick={() => {
										showItemInFolder(
											nodepath.resolve(__WORKFLOWS_PATH__, workflow.filename)
										);
									}}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											showItemInFolder(
												nodepath.resolve(
													__WORKFLOWS_PATH__,
													workflow.filename
												)
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
									<Show when={workflow.options}>
										<div
											class="settings-layer__workflows__workflow__options"
											onClick={(e) => {
												e.stopPropagation();
											}}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.stopPropagation();
												}
											}}
										>
											<For each={Object.entries(workflow.options || {})}>
												{([key, option]) => {
													const values = getOptionsProxy(
														workflow.filename
													);

													switch (option.type) {
														case 'boolean':
															return (
																<Switch
																	note={option.description}
																	value={values[key] as boolean}
																	onChange={(value) => {
																		values[key] = value;
																	}}
																/>
															);
														case 'string':
														case 'number':
															return (
																<div class="settings-layer__workflows__workflow__options__option">
																	<div class="settings-layer__workflows__workflow__options__option__label">
																		{option.description}
																	</div>
																	<TextArea
																		label={option.description}
																		value={
																			values[key] as string
																		}
																		placeholder={
																			option.placeholder
																		}
																		onChange={(value) => {
																			values[key] =
																				(
																					option.type ===
																					'number'
																				) ?
																					Number(value)
																				:	value;
																		}}
																	/>
																</div>
															);
														case 'enum':
															return (
																<div class="settings-layer__workflows__workflow__options__option">
																	<div class="settings-layer__workflows__workflow__options__option__label">
																		{option.description}
																	</div>
																	<Dropdown
																		options={
																			option.values?.map(
																				(value) => ({
																					label: value,
																					value
																				})
																			) || []
																		}
																		label={option.description}
																		value={
																			values[key] as string
																		}
																		onChange={(value) => {
																			values[key] = value;
																		}}
																	/>
																</div>
															);

														default:
															return null;
													}
												}}
											</For>
										</div>
									</Show>
								</div>
							);
						}}
					</For>
				</Show>
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
					value={!!settings()?.ui?.vibrancy}
					onChange={(value) => {
						SettingsStore.setSetting('ui.vibrancy', value);

						if (value !== initialUponOpen.ui?.vibrancy) {
							showReloadNotification();
						} else {
							hideReloadNotification();
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
												level={2}
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
					value={settings()?.ui?.thinIcons || false}
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
										value={
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
									value: 'git',
									element: Git,
									icon: 'git-pull-request'
								},
								{
									label: t('settings.appearance.title'),
									value: 'appearance',
									element: Appearance,
									icon: 'eye'
								},

								{
									label: t('settings.ai.title'),
									value: 'ai',
									element: Ai,
									icon: 'sparkle-fill'
								},
								{
									label: t('settings.workflows.title'),
									value: 'workflows',
									element: Workflows,
									icon: 'workflow'
								},
								...Object.entries(USER_PANES).map(([id, pane]) => ({
									label: pane.name,
									value: id,
									element: buildElements(pane.children),
									icon: pane.icon
								}))
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
