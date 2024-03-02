import { For, Show, createSignal, onMount } from 'solid-js';
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
		id: string | number;
	}
) => {
	const [ref, setRef] = createSignal<HTMLDivElement>();

	let timeout: ReturnType<typeof setTimeout>;

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
	});

	return (
		<div class="notification" aria-label={props.description} ref={setRef}>
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
	const notifications = createStoreListener([NotificationStore], () => {
		return NotificationStore.state;
	});

	return (
		<Layer key="notification" transitions={Layer.Transitions.None} type="bare" initialVisible>
			<div class="notification__list">
				<For each={notifications()}>
					{(n) => {
						const [open, setOpen] = createSignal(false);

						// i hate it here
						setTimeout(() => {
							setOpen(true);
						}, 10);

						if (n.props.timeout)
							setTimeout(() => {
								setOpen(false);
							}, n.props.timeout! - 500);

						NotificationStore.onRemoved(n.id, () => {
							setOpen(false);
						});

						return (
							<Transition
								onEnter={Layer.Transitions.Fade.enter}
								onExit={Layer.Transitions.Fade.exit}
							>
								<Show when={open()}>
									<Notification {...n.props} id={n.id} />
								</Show>
							</Transition>
						);
					}}
				</For>
			</div>
		</Layer>
	);
};
