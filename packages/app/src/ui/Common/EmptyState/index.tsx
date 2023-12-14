import { For, Show, createEffect, createSignal } from 'solid-js';

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

export interface EmptyStateProps {
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

export default (props: EmptyStateProps) => {
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);

	const [imageSrc, setImageSrc] = createSignal<EMPTY_STATE_IMAGES>();

	createEffect(() => {
		if (props.image) {
			let imageSrc: EMPTY_STATE_IMAGES;

			const theme = settings()['theme'];

			if (theme === 'dark') {
				imageSrc = props.image.dark;
			} else if (theme === 'light') {
				imageSrc = props.image.light;
			} else if (matchMedia('(prefers-color-scheme: dark)').matches) {
				imageSrc = props.image.dark;
			} else {
				imageSrc = props.image.light;
			}

			setImageSrc(imageSrc);
		}
	});

	return (
		<div class="empty-state">
			<Show when={props.image}>
				<img
					src={`assets/empty_state/${imageSrc()}.svg`}
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
							<Button
								label={action.label}
								onClick={action.onClick}
								type={action.type}
							>
								{action.label}
							</Button>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
};
