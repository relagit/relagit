import { JSX, Show, createSignal } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';

import './index.scss';

export interface ITooltip {
	children: (p: {
		onMouseEnter: (e: MouseEvent) => void;
		onMouseLeave: () => void;
		onFocus: (e: FocusEvent) => void;
		onBlur: () => void;
		tabIndex: number;
		title: string;
		'aria-labeledby': string;
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

	let hasRecentlyHidden = false;

	const hide = () => {
		setOpen(false);

		hasRecentlyHidden = true;

		setTimeout(() => {
			hasRecentlyHidden = false;
		}, 300);
	};

	const show = (e: MouseEvent | FocusEvent) => {
		e.stopPropagation();

		setOpen(true);

		const rect = wrapper.getBoundingClientRect();

		setX(rect.left + rect.width / 2);
		setY(rect.top + rect.height / 2);
	};

	const delay = (e: FocusEvent) => {
		setTimeout(() => {
			if (!hasRecentlyHidden) show(e);
		}, 200);
	};

	const id = Math.random().toString(36).substring(2, 9);

	return (
		<>
			<props.children
				title={props.text}
				tabIndex={0}
				onFocus={delay}
				onBlur={hide}
				onMouseEnter={show}
				onMouseLeave={hide}
				ref={wrapper}
				aria-labeledby={open() ? id : undefined}
			></props.children>
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
							id={id}
							aria-hidden={!open()}
							aria-role="tooltip"
							role="tooltip"
							class={`tooltip ${props.position ? props.position : 'top'}`}
							ref={tooltip}
							style={`--h: ${tooltip?.offsetHeight}px; --w: ${tooltip?.offsetWidth}px; --x: ${x()}px; --y: ${y()}px; --w-h: ${wrapper?.offsetHeight}px; --w-w: ${wrapper?.offsetWidth}px;`}
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
