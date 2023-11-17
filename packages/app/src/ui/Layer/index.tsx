import { JSX, Show } from 'solid-js';
import { Transition } from 'solid-transition-group';

import { createStoreListener } from '@stores/index';
import LayerStore from '@stores/layer';

import './index.scss';

export interface ILayerProps {
	key: string;
	type?: 'rich' | 'bare';
	dismissable?: boolean;
	initialVisible?: boolean;
	children: JSX.Element | JSX.Element[];
	transitions?: {
		enter?: (el: HTMLElement, done: () => void) => void;
		exit?: (el: HTMLElement, done: () => void) => void;
	};
}

const Layer = (props: ILayerProps) => {
	LayerStore.addLayer({
		key: props.key,
		visible: props.initialVisible || false
	});

	const visible = createStoreListener([LayerStore], () => LayerStore.visible(props.key));

	let layerRef: HTMLDivElement;

	return (
		<div
			class={`layer layer-${props.type || 'bare'} ${visible() ? 'visible' : ''}`}
			ref={layerRef}
			data-key={props.key}
			onMouseDown={(e) => {
				if (props.dismissable && e.target === layerRef)
					LayerStore.setVisible(props.key, false);
			}}
		>
			<Transition onEnter={props.transitions?.enter} onExit={props.transitions?.exit}>
				<Show when={visible()}>{props.children}</Show>
			</Transition>
		</div>
	);
};

export default Layer;

Layer.Transitions = {
	None: {
		enter: (el, done) => {
			done();
		},
		exit: (el, done) => {
			done();
		}
	},
	Fade: {
		enter: (el, done) => {
			const a = el.animate(
				[
					{
						opacity: 0,
						transform: 'translateY(10px) scale(0.9)'
					},
					{
						opacity: 1,
						transform: 'translateY(0px) scale(1)'
					}
				],
				{
					duration: 200,
					easing: 'ease-out'
				}
			);

			a.finished.then(done);
		},
		exit: (el, done) => {
			const a = el.animate(
				[
					{
						opacity: 1,
						transform: 'translateY(0px) scale(1)'
					},
					{
						opacity: 0,
						transform: 'translateY(10px) scale(0.9)'
					}
				],
				{
					duration: 200,
					easing: 'ease-in'
				}
			);

			a.finished.then(done);
		}
	}
};
