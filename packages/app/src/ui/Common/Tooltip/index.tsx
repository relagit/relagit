import { JSX, Show, createSignal } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';

import { FloatingElement } from '../../Layer';

import './index.scss';

export interface Tooltip extends FloatingElement {
	children: (p: {
		onMouseEnter: (e: MouseEvent) => void;
		onMouseLeave: () => void;
		onFocus: (e: FocusEvent) => void;
		onBlur: () => void;
		tabIndex: number;
		'aria-labelledby': string;
	}) => JSX.Element | JSX.Element[];
	text: JSX.Element | string;
	position?: 'top' | 'bottom' | 'auto';
	delay?: number;
	size?: 'small' | 'expanded';
	matchCursorPos?: 'x' | 'y' | 'both';
}

export default (props: Tooltip) => {
	const [open, setOpen] = createSignal(false);
	const [x, setX] = createSignal(0);
	const [y, setY] = createSignal(0);

	const [tooltip, setTooltip] = createSignal<HTMLDivElement>();
	const [wrapper, setWrapper] = createSignal<HTMLDivElement>();

	let timeout: NodeJS.Timeout;

	const hide = () => {
		if (timeout) clearTimeout(timeout);

		setOpen(false);
	};

	const show = (e: MouseEvent | FocusEvent, show?: boolean) => {
		e.stopPropagation();

		if (props.delay) {
			if (!show) return delay(e, props.delay);
		}

		setOpen(true);

		const rect = wrapper()?.getBoundingClientRect();

		if (!rect) return;

		setX(rect.left + rect.width / 2);
		setY(rect.top + rect.height / 2);

		if (props.matchCursorPos && e instanceof MouseEvent) {
			if (props.matchCursorPos === 'x') setX(e.clientX);
			if (props.matchCursorPos === 'y') setY(e.clientY);
			if (props.matchCursorPos === 'both') {
				setX(e.clientX);
				setY(e.clientY);
			}
		}
	};

	const delay = (e: FocusEvent | MouseEvent, ms = 300) => {
		timeout = setTimeout(() => {
			show(e, true);
		}, ms);
	};

	const id = Math.random().toString(36).substring(2, 9);

	return (
		<>
			<props.children
				tabIndex={0}
				onFocus={delay}
				onBlur={hide}
				onMouseEnter={show}
				onMouseLeave={hide}
				ref={setWrapper}
				aria-labelledby={open() ? id : ''}
			></props.children>
			<Portal mount={document.getElementById('app-container')!}>
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
					<Show when={open() && props.text}>
						<div
							id={id}
							aria-hidden={!open()}
							role="tooltip"
							classList={{
								tooltip: true,
								[props.size || 'small']: true,
								[props.position || 'top']: true
							}}
							ref={setTooltip}
							style={{
								'--h': `${tooltip()?.offsetHeight}px`,
								'--w': `${tooltip()?.offsetWidth}px`,
								'--x': `${x()}px`,
								'--y': `${y()}px`,
								'--w-h': `${wrapper()?.offsetHeight}px`,
								'--w-w': `${wrapper()?.offsetWidth}px`,
								'--layer-index': props.level ?? 1
							}}
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
