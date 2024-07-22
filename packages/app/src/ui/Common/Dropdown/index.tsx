import { useFocusTrap } from '@solidjs-use/integrations/useFocusTrap';
import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { Portal } from 'solid-js/web';

import type { FloatingElement } from '@ui/Layer';

import Button from '../Button';
import Icon, { IconName } from '../Icon';

import './index.scss';

export interface DropdownProps<T> extends FloatingElement {
	options: {
		value: T;
		label: string;
		image?: string | URL;
		hint?: string;
	}[];
	label: string;
	value: T;
	hints?: boolean;
	monoHints?: boolean;
	icon?: IconName;
	iconPosition?: 'left' | 'right';
	onChange: (value: T) => void;
}

export const Dropdown = <T,>(props: DropdownProps<T>) => {
	const [active, setActive] = createSignal<DropdownProps<T>['options'][number]>(
		props.options.find((option) => option.value === props.value) || props.options[0]
	);
	const [open, setOpen] = createSignal(false);
	const [menu, setMenu] = createSignal<HTMLDivElement | null>(null);
	const [container, setContainer] = createSignal<HTMLElement | undefined>(undefined);
	const [x, setX] = createSignal(0);
	const [y, setY] = createSignal(0);

	const updatePosition = () => {
		const containerRect = container()?.getBoundingClientRect();

		if (!containerRect) return;

		setX(containerRect.x);
		setY(containerRect.y + containerRect.height);

		if (containerRect.y + containerRect.height > window.innerHeight) {
			setY(containerRect.y - menu()!.clientHeight);
		}

		if (containerRect.x + (menu()?.clientWidth || 0) > window.innerWidth) {
			setX(containerRect.x - (menu()?.clientWidth || 0) + containerRect.width);
		}
	};

	onMount(() => {
		updatePosition();
		window.addEventListener('resize', updatePosition);
	});

	onCleanup(() => {
		window.removeEventListener('resize', updatePosition);
	});

	const { activate, deactivate } = useFocusTrap(menu, {
		onDeactivate: () => {
			setOpen(false);
		},
		initialFocus: false,
		allowOutsideClick: true,
		clickOutsideDeactivates: true
	});

	return (
		<div class="dropdown">
			<Button
				ref={setContainer}
				className="dropdown__button"
				onClick={() => {
					updatePosition();

					setOpen(!open());

					if (open()) {
						activate();
					} else {
						deactivate();
					}
				}}
				label={active().label ? `${props.label} (${active().label})` : props.label}
				type="default"
			>
				<Show when={props.iconPosition === 'left' && !active().image}>
					<div class="dropdown__button__icon__arrow left">
						<Icon name={props.icon || 'chevron-down'} />
					</div>
				</Show>
				<Show when={active().image}>
					{(image) => {
						return (
							<Show
								when={typeof image() !== 'string'}
								fallback={
									<div class="dropdown__button__icon">{image() as string}</div>
								}
							>
								<img
									class="dropdown__button__icon"
									src={image().toString()}
									alt={active().label}
								/>
							</Show>
						);
					}}
				</Show>
				{active().label || props.label}
				<Show when={props.iconPosition === 'right'}>
					<div class="dropdown__button__icon__arrow right">
						<Icon name={props.icon || 'chevron-down'} />
					</div>
				</Show>
			</Button>
			<Show when={open()}>
				<Portal mount={document.getElementById('app-container')!}>
					<div
						role="menu"
						aria-expanded="true"
						aria-haspopup="true"
						class="dropdown__options"
						ref={setMenu}
						onKeyDown={(e) => {
							if (e.key === 'Escape') {
								e.preventDefault();
								e.stopPropagation();

								setOpen(false);
								deactivate();
							}
						}}
						style={{
							'--x': `${x()}px`,
							'--y': `${y()}px`,
							'--layer-index': props.level ?? 1
						}}
					>
						<For
							each={props.options}
							fallback={<div class="dropdown__options__option">No options</div>}
						>
							{(option) => (
								<button
									classList={{
										dropdown__options__option: true,
										active: option.value === active().value
									}}
									onClick={() => {
										setActive(option);

										props.onChange(option.value);

										setOpen(false);

										deactivate();
									}}
								>
									<Show when={option.image}>
										{(image) => {
											return (
												<Show
													when={typeof image() !== 'string'}
													fallback={
														<div class="dropdown__options__option__icon">
															{image() as string}
														</div>
													}
												>
													<img
														class="dropdown__options__option__icon"
														src={image().toString()}
														alt={option.label}
													/>
												</Show>
											);
										}}
									</Show>
									{option.label}
									<Show when={props.hints || option.hint}>
										<div classList={{ hint: true, mono: props.monoHints }}>
											{option.hint ?? String(option.value)}
										</div>
									</Show>
								</button>
							)}
						</For>
					</div>
				</Portal>
			</Show>
		</div>
	);
};

export default Dropdown;
