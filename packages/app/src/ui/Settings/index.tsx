import { Accessor, createEffect, createSignal, For, JSX, onCleanup, onMount, Show } from 'solid-js';

import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';
import SettingsStore from '@stores/settings';

import SegmentedView from '../Common/SegmentedView';
import TextArea from '@ui/Common/TextArea';
import LayerStore from '@stores/layer';
import Icon from '@ui/Common/Icon';

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
							classList={{ selected: value() === option.value }}
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
				classList={{ selected: props.value() }}
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
						selected: props.value()
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

	createEffect(() => {
		console.log(settings(), settings()?.get('vibrancy'));
	});

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
					Commit Message Style
				</label>
				<p class="settings-layer__setting__description">
					This only effects the currently selected repository.
				</p>
				<RadioGroup
					options={[
						{
							element: <>Conventional</>,
							value: 'conventional'
						},
						{
							element: <>Relational</>,
							value: 'relational'
						},
						{
							element: <>None</>,
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
					label="Enforce Commit Message Style"
					note="This will prevent you from committing if your commit message does not match the style selected for a repository."
					value={() => settings()?.get('enforceCommitMessageStyle') as boolean}
					onChange={(value) => {
						SettingsStore.setSetting('enforceCommitMessageStyle', value);
					}}
				/>
			</div>
		</>
	);

	const Appearance = (
		<>
			<div class="settings-layer__setting">
				<Switch
					label="Vibrancy (MacOS)"
					note="Enable Under-Window Vibrancy. This may impact performance. Requires Restart."
					disabled={window.Native.platform !== 'darwin'}
					value={() => settings()?.get('vibrancy') as boolean}
					onChange={(value) => {
						SettingsStore.setSetting('vibrancy', value);
					}}
				/>
			</div>
			<div class="settings-layer__setting">
				<label class="settings-layer__setting__label" id="settings-theme">
					Theme
				</label>
				<RadioGroup
					options={[
						{
							element: <>Light</>,
							value: 'light'
						},
						{
							element: <>Dark</>,
							value: 'dark'
						},
						{
							element: <>System</>,
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
					Custom Font
				</label>
				<p class="settings-layer__setting__description">
					This will override the default code font. You can use any font that is installed
					on your system.
				</p>
				<TextArea
					className="settings-layer__setting__textarea"
					value={(settings()?.get('fontFamily') as string) || ''}
					onChange={(value) => {
						SettingsStore.setSetting('fontFamily', value);
					}}
					placeholder="e.g. 'JetBrains Mono', monospace"
				/>
			</div>
		</>
	);

	return (
		<div class="settings-layer">
			<div class="settings-layer__title">
				<h1>Settings</h1>
				<div class="settings-layer__title__buttons">
					<button
						aria-role="button"
						aria-label="Close Settings"
						class="settings-layer__title__buttons__close"
						onClick={close}
					>
						<Icon size={24} variant={24} name="x-circle" />
					</button>
				</div>
			</div>
			<div class="scroller hide-bar">
				<SegmentedView
					views={[
						{
							label: 'General',
							value: 'general',
							element: General
						},
						{
							label: 'Appearance',
							value: 'appearance',
							element: Appearance
						}
					]}
				/>
			</div>
		</div>
	);
};
