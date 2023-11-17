import { JSX, Show, createSignal } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';

import './index.scss';

export interface ITooltip {
	children: (p: {
		onMouseEnter: (e: MouseEvent) => void;
		onMouseLeave: () => void;
	}) => JSX.Element | JSX.Element[];
	text: string;
	position?: 'top' | 'bottom' | 'auto';
}

export default (props: ITooltip) => {
	const [open, setOpen] = createSignal(false);
	const [x, setX] = createSignal(0);
	const [y, setY] = createSignal(0);

	let tooltip: HTMLDivElement;
	let wrapper: HTMLDivElement;

	const hide = () => {
		setOpen(false);
	};

	const show = (e: MouseEvent) => {
		e.stopPropagation();

		setOpen(true);

		const rect = wrapper.getBoundingClientRect();

		setX(rect.left + rect.width / 2);
		setY(rect.top + rect.height / 2);
	};

	return (
		<>
			<props.children onMouseEnter={show} onMouseLeave={hide} ref={wrapper}></props.children>
			<Portal mount={document.getElementById('app-container')}>
				<Transition
					onEnter={(el, done) => {
						const a = el.animate(
							{
								opacity: [0, 1],
								translate: ['0 4px', '0 0px'],
								scale: [0.95, 1]
							},
							{
								duration: 200,
								easing: 'ease-out'
							}
						);

						a.finished.then(done);
					}}
					onExit={(el, done) => {
						const a = el.animate(
							{
								opacity: [1, 0],
								translate: ['0 0px', '0 4px'],
								scale: [1, 0.95]
							},
							{
								duration: 200,
								easing: 'ease-out'
							}
						);

						a.finished.then(done);
					}}
				>
					<Show when={open()}>
						<div
							class={`tooltip ${props.position ? props.position : 'top'}`}
							ref={tooltip}
							style={`--x: ${x()}px; --y: ${y()}px; --w-h: ${
								wrapper.offsetHeight
							}px; --w-w: ${wrapper.offsetWidth}px;`}
						>
							{props.text}
							<div class="tooltip__arrow"></div>
						</div>
					</Show>
				</Transition>
			</Portal>
		</>
	);
};
