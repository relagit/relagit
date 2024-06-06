// with massive inspiration from https://github.com/emilkowalski/sonner/blob/main/src/index.tsx
import {
	Accessor,
	For,
	Setter,
	Show,
	createEffect,
	createMemo,
	createSignal,
	onMount
} from 'solid-js';
import { Transition } from 'solid-transition-group';

import { createStoreListener } from '@stores/index';
import NotificationStore from '@stores/notification';

import Button, { ButtonProps } from '@ui/Common/Button';
import Icon, { IconName } from '@ui/Common/Icon';
import Layer from '@ui/Layer';

import './index.scss';

export interface NotificationProps {
	icon?: IconName;
	iconUrl?: string;
	title: string;
	description: string;
	level: 'info' | 'warning' | 'error' | 'success';
	actions?: (ButtonProps & {
		dismiss?: boolean;
	})[];
	timeout?: number;
}

export const Notification = (
	props: NotificationProps & {
		id: number;
		heights: Accessor<{ value: number; id: number }[]>;
		setHeights: Setter<{ value: number; id: number }[]>;
	}
) => {
	const [ref, setRef] = createSignal<HTMLDivElement>();
	const [initialHeight, setInitialHeight] = createSignal(NaN);

	const heightIndex = createMemo(() => {
		const index = props.heights().findIndex((height) => height.id === props.id);

		return index === -1 ? 0 : index;
	});
	const heightsBefore = createMemo(() => {
		const next = props.heights().reduce((prev, current, index) => {
			if (index >= heightIndex()) return prev;

			return prev + current.value;
		}, 0);

		return next;
	});

	let timeout: ReturnType<typeof setTimeout>;

	createEffect(() => {
		const toastNode = ref();

		if (!toastNode) return;
		const originalHeight = toastNode.style.height;
		toastNode.style.height = 'auto';
		const newHeight = toastNode.getBoundingClientRect().height;
		toastNode.style.height = originalHeight;

		setInitialHeight(newHeight);

		props.setHeights((heights) => {
			const alreadyExists = heights.find((height) => height.id === props.id);
			if (!alreadyExists) {
				return [{ id: props.id, value: newHeight }, ...heights];
			} else {
				return heights.map((height) =>
					height.id === props.id ? { ...height, value: newHeight } : height
				);
			}
		});
	});

	onMount(() => {
		const element: HTMLElement | null | undefined = ref()?.querySelector(
			'button,input,a,select,textarea,[tabindex]'
		);

		if (element) element.focus();

		if (props.timeout) {
			timeout = setTimeout(() => {
				NotificationStore.remove(props.id);
			}, props.timeout);
		}
	});

	NotificationStore.onRemoved(props.id, () => {
		clearTimeout(timeout);

		props.setHeights((h) => h.filter((height) => height.id !== props.id));
	});

	return (
		<div
			class="notification"
			style={{
				'--initial-height': `${initialHeight()}px`,
				'--heights-before': `${heightsBefore()}px`,
				'--first-height': `${props.heights()[0]?.value}px`
			}}
			aria-label={props.description}
			data-id={props.id}
			ref={setRef}
			onContextMenu={(e) => {
				e.preventDefault();

				NotificationStore.remove(props.id);
			}}
		>
			<div class="notification__content">
				<div classList={{ notification__icon: true, [props.level]: true }}>
					<Show
						when={props.iconUrl}
						fallback={
							<Show when={props.icon} fallback={<Icon name={'alert'} size={24} />}>
								<Icon name={props.icon!} size={24} />
							</Show>
						}
					>
						<img src={props.iconUrl} />
					</Show>
				</div>
				<div class="notification__text">
					<div class="notification__text__header">{props.title}</div>
					<div class="notification__text__desc">{props.description}</div>
				</div>
			</div>
			<div class="notification__buttons">
				<For each={props.actions}>
					{(action) => (
						<Button
							{...action}
							onClick={() => {
								action.onClick?.();

								if (action.dismiss ?? true) NotificationStore.remove(props.id);
							}}
						/>
					)}
				</For>
			</div>
			<Show when={props.timeout}>
				<div class="notification__timeout">
					<div
						classList={{
							notification__timeout__bar: true,
							[props.level]: true
						}}
						style={`animation-duration: ${props.timeout}ms`}
					/>
				</div>
			</Show>
		</div>
	);
};

export default Notification;

Notification.Layer = () => {
	const [heights, setHeights] = createSignal<
		{
			value: number;
			id: number;
		}[]
	>([]);

	const notifications = createStoreListener([NotificationStore], () => {
		return NotificationStore.state;
	});

	return (
		<Layer
			index={9}
			key="notification"
			transitions={Layer.Transitions.None}
			type="bare"
			initialVisible
		>
			<div
				class="notification__list"
				style={{
					'--sum-heights': `${heights().reduce((prev, current, i) => {
						if (i > 2) return prev;

						return prev + current.value;
					}, 0)}px`,
					'--num-gaps': `${heights().slice(0, 2).length - 1}`
				}}
			>
				<For each={notifications()}>
					{(n) => {
						const [open, setOpen] = createSignal(false);

						// i hate it here
						setTimeout(() => {
							setOpen(true);
						}, 10);

						NotificationStore.onRemoved(n.id, () => {
							setOpen(false);
						});

						return (
							<Transition
								onEnter={(el, done) => {
									const a = el.animate(
										[
											{
												opacity: 0,
												transform: 'translateY(32px)'
											},
											{
												opacity: (notifications()?.length || 0) > 3 ? 0 : 1,
												transform: 'translateY(0px)'
											}
										],
										{
											duration: 400,
											easing: 'ease'
										}
									);

									a.finished.then(() => {
										done();
									});
								}}
								onExit={Layer.Transitions.Fade.exit}
							>
								<Show when={open()}>
									<Notification
										{...n.props}
										id={n.id}
										heights={heights}
										setHeights={setHeights}
									/>
								</Show>
							</Transition>
						);
					}}
				</For>
			</div>
		</Layer>
	);
};
