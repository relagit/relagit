import { JSX, Show, createSignal } from 'solid-js';
import { Transition } from 'solid-transition-group';

import { createStoreListener } from '@stores/index';
import LayerStore from '@stores/layer';

import './index.scss';

export interface FloatingElement {
	level?: number;
}

export interface LayerProps {
	key: string;
	type?: 'rich' | 'bare';
	index?: number;
	dismissable?: boolean;
	initialVisible?: boolean;
	children: JSX.Element | JSX.Element[];
	transitions?: {
		enter?: (el: Element, done: () => void) => void;
		exit?: (el: Element, done: () => void) => void;
	};
}

const Layer = (props: LayerProps) => {
	LayerStore.addLayer({
		key: props.key,
		visible: props.initialVisible || false
	});

	const visible = createStoreListener([LayerStore], () => LayerStore.visible(props.key));

	const [ref, setRef] = createSignal<HTMLDivElement>();

	return (
		<div
			aria-live={props.key === 'notification' ? 'assertive' : 'off'}
			classList={{
				layer: true,
				[`layer-${props.type || 'bare'}`]: true,
				visible: visible()
			}}
			style={{
				'--layer-index': props.index
			}}
			ref={setRef}
			data-key={props.key}
			onMouseDown={(e) => {
				if (props.dismissable && e.target === ref())
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

const transitions = {
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
						// opacity: 1, // infer from current value
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
} satisfies Record<
	string,
	{
		enter: (el: Element, done: () => void) => void;
		exit: (el: Element, done: () => void) => void;
	}
>;

Layer.Transitions = transitions;
