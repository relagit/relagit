import { For, Show, createSignal } from 'solid-js';
import { Transition } from 'solid-transition-group';

import './index.scss';

type PanelButtonProps = {
	position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	icon: string;
	items?: { title?: string; icon: string; id: string }[];
	onClick?: () => void;
	onItemSelect?: (id: string) => void;
	margin?: boolean;
	title?: string;
};

export default (props: PanelButtonProps) => {
	const [itemsOpen, setItemsOpen] = createSignal(false);

	return (
		<button
			title={props.title}
			classList={{ panelbutton: true, active: props.items && itemsOpen() }}
			style={{
				'z-index': 9,
				position: 'absolute',

				top: props.position?.includes('top') ? 0 : 'unset',
				bottom: props.position?.includes('bottom') ? 0 : 'unset',
				left: props.position?.includes('left') ? 0 : 'unset',
				right: props.position?.includes('right') ? 0 : 'unset',
				margin: '8px',
				'margin-right': props.margin ? '40px' : '8px'
			}}
			onClick={() => {
				if (props.items) setItemsOpen(!itemsOpen());

				props.onClick?.();
			}}
		>
			<Show when={props.items}>
				<Transition
					onEnter={(el, done) => {
						el.animate(
							[
								{ scale: 0.8, opacity: '0' },
								{ scale: 1, opacity: '1' }
							],
							{
								duration: 100,
								easing: 'ease-out'
							}
						).onfinish = done;
					}}
					onExit={(el, done) => {
						el.animate(
							[
								{ scale: 1, opacity: '1' },
								{ scale: 0.8, opacity: '0' }
							],
							{
								duration: 100,
								easing: 'ease-out'
							}
						).onfinish = done;
					}}
				>
					<Show when={itemsOpen()}>
						<div class="panelbutton-items">
							<For each={props.items}>
								{(item) => (
									<button
										title={item.title}
										classList={{
											'panelbutton-item': true,
											active: item.icon === props.icon
										}}
										onClick={() => {
											props.onItemSelect?.(item.id);

											setItemsOpen(false);
										}}
									>
										{item.icon}
									</button>
								)}
							</For>
						</div>
					</Show>
				</Transition>
			</Show>
			<Show when={props.icon}>{props.icon}</Show>
		</button>
	);
};
