import { Transition } from 'solid-transition-group';
import { createSignal, JSX, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

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
								transform: [
									'translateY(10px) translate(-50%, calc(-100% - 10px))',
									'translateY(0) translate(-50%, calc(-100% - 10px))'
								]
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
								transform: [
									'translateY(0) translate(-50%, calc(-100% - 2px))',
									'translateY(10px) translate(-50%, calc(-100% - 2px))'
								]
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
							class={`tooltip ${props.position ? props.position : 'auto'}`}
							ref={tooltip}
							style={`--x: ${x()}px; --y: ${y()}px; --w-h: ${
								wrapper.offsetHeight
							}px; --w-w: ${wrapper.offsetWidth}px;`}
						>
							{props.text}
						</div>
					</Show>
				</Transition>
			</Portal>
		</>
	);
};
