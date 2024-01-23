import { For, createSignal, onMount } from 'solid-js';
import { Transition } from 'solid-transition-group';

import { createStoreListener } from '@stores/index';
import NotificationStore from '@stores/notification';

import Button, { ButtonProps } from '@ui/Common/Button';
import Icon, { IconName } from '@ui/Common/Icon';
import Layer from '@ui/Layer';

import './index.scss';

interface NotificationProps {
	id: string;
	icon: IconName;
	title: string;
	description: string;
	level: 'info' | 'warning' | 'error' | 'success';
	actions?: (ButtonProps & {
		dismiss?: boolean;
	})[];
}

export const Notification = (props: NotificationProps) => {
	const [ref, setRef] = createSignal<HTMLDivElement>();

	onMount(() => {
		const element: HTMLElement | null | undefined = ref()?.querySelector(
			'button,input,a,select,textarea,[tabindex]'
		);

		if (element) element.focus();
	});

	return (
		<div class="notification" aria-label={props.description} ref={setRef}>
			<div class="notification__content">
				<div classList={{ notification__icon: true, [props.level]: true }}>
					<Icon name={props.icon} variant={24} />
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
			<Transition onEnter={Layer.Transitions.Fade.enter} onExit={Layer.Transitions.Fade.exit}>
				<For each={notifications()}>{(n) => n}</For>
			</Transition>
		</Layer>
	);
};
