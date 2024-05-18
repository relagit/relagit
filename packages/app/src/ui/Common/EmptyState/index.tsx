import { For, Show, createEffect, createSignal } from 'solid-js';

import { createStoreListener } from '@stores/index';
import SettingsStore from '@stores/settings';

import Button from '../Button';
import Icon, { IconName } from '../Icon';

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
	icon?: IconName;
	actions?: {
		label: string;
		type: 'default' | 'brand' | 'danger' | 'outline' | 'positive';
		onClick?: () => void;
	}[];
	spinner?: boolean;
}

const EmptyState = (props: EmptyStateProps) => {
	const settings = createStoreListener([SettingsStore], () => SettingsStore.settings);

	const [imageSrc, setImageSrc] = createSignal<EMPTY_STATE_IMAGES>();

	const update = () => {
		if (props.image) {
			let imageSrc: EMPTY_STATE_IMAGES;

			const theme = settings()?.ui?.theme;

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
	};

	createEffect(update);
	window.Native.listeners.NATIVE_THEME_UPDATED(update);

	return (
		<div class="empty-state">
			<Show when={props.icon}>
				<Icon name={props.icon!} variant={24} />
			</Show>
			<Show when={props.spinner}>
				<div class="empty-state__spinner">
					<svg
						viewBox="0 0 38 38"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						role="img"
						stroke="currentColor"
						width={42}
						height={42}
						class="empty-state__spinner__svg"
					>
						<g fill="none" fill-rule="evenodd">
							<g transform="translate(1 1)" stroke-width="2">
								<circle stroke-opacity=".5" cx="18" cy="18" r="18" />
								<path d="M36 18c0-9.94-8.06-18-18-18">
									<animateTransform
										attributeName="transform"
										type="rotate"
										from="0 18 18"
										to="360 18 18"
										dur="1s"
										repeatCount="indefinite"
									/>
								</path>
							</g>
						</g>
					</svg>
				</div>
			</Show>
			<Show when={props.image}>
				<img
					src={`assets/empty_state/${imageSrc() || 'Cube_dark'}.svg`}
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

EmptyState.Images = {
	Error: {
		dark: EMPTY_STATE_IMAGES.D_ERROR,
		light: EMPTY_STATE_IMAGES.L_ERROR
	},
	NothingHere: {
		dark: EMPTY_STATE_IMAGES.D_NOTHING_HERE,
		light: EMPTY_STATE_IMAGES.L_NOTHING_HERE
	},
	Power: {
		dark: EMPTY_STATE_IMAGES.D_POWER,
		light: EMPTY_STATE_IMAGES.L_POWER
	}
};

export default EmptyState;
