import { For, Show } from 'solid-js';

import { createStoreListener } from '@stores/index';
import SettingsStore from '@stores/settings';

import Button from '../Button';

import './index.scss';

export enum EMPTY_STATE_IMAGES {
	D_NOTHING_HERE = 'Cube_dark',
	L_NOTHING_HERE = 'Cube_light',
	D_POWER = 'Power_dark',
	L_POWER = 'Power_light',
	D_ERROR = 'Error_dark',
	L_ERROR = 'Error_light'
}

export interface IEmptyStateProps {
	image?: {
		light: EMPTY_STATE_IMAGES;
		dark: EMPTY_STATE_IMAGES;
	};
	detail?: string;
	hint?: string;
	opacity?: number;
	actions?: {
		label: string;
		type: 'default' | 'brand' | 'danger' | 'outline' | 'positive';
		onClick?: () => void;
	}[];
}

export default (props: IEmptyStateProps) => {
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);

	return (
		<div class="empty-state">
			<Show when={props.image}>
				<img
					src={`assets/empty_state/${
						settings()?.get('theme') === 'dark'
							? props.image.dark
							: settings()?.get('theme') === 'light'
							? props.image.light
							: matchMedia('(prefers-color-scheme: dark)').matches
							? props.image.dark
							: props.image.light
					}.svg`}
					alt="Nothing here"
					style={{ opacity: props.opacity || 1 }}
				/>
			</Show>
			<Show when={props.detail}>
				<div class="empty-state__text">{props.detail}</div>
			</Show>
			<Show when={props.hint}>
				<div class="empty-state__hint">{props.hint}</div>
			</Show>
			<Show when={props.actions?.length}>
				<div class="empty-state__actions">
					<For each={props.actions}>
						{(action) => (
							<Button onClick={action.onClick} type={action.type}>
								{action.label}
							</Button>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
};
