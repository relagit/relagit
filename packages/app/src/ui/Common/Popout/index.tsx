import {
	Accessor,
	JSX,
	Setter,
	Show,
	Signal,
	createEffect,
	createSignal,
	onCleanup,
	onMount
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';

import './index.scss';

export interface Popout {
	children: (p: {
		show: (e?: MouseEvent | KeyboardEvent) => void;
		toggle: (e?: MouseEvent | KeyboardEvent) => void;
		hide: () => void;
		open: Accessor<boolean>;
		ref: Setter<HTMLElement>;
		getRef: Accessor<HTMLElement>;
	}) => JSX.Element | JSX.Element[];
	body: (p: {
		show: (e?: MouseEvent | KeyboardEvent) => void;
		toggle: (e?: MouseEvent | KeyboardEvent) => void;
		open: Accessor<boolean>;
		hide: () => void;
	}) => JSX.Element | JSX.Element[];
	position?: 'top' | 'bottom' | 'auto';
	align?: 'start' | 'end' | 'center';
	open?: Signal<boolean>;
}

export default (props: Popout) => {
	const [open, setOpen] = props.open ?? createSignal(false);
	const [x, setX] = createSignal(0);
	const [y, setY] = createSignal(0);

	const [wrapper, setWrapper] = createSignal<HTMLElement>();
	const [popout, setPopout] = createSignal<HTMLElement>();

	const listener = () => {
		const rect = wrapper()?.getBoundingClientRect();

		setX(rect.left + rect.width / 2);
		setY(rect.top + rect.height / 2);
	};

	onMount(() => {
		window.addEventListener('resize', listener);
	});

	onCleanup(() => {
		window.removeEventListener('resize', listener);
	});

	const hide = () => {
		setOpen(false);
	};

	createEffect(() => {
		if (open()) {
			listener();
		}
	});

	const show = (e?: MouseEvent | KeyboardEvent) => {
		e?.stopPropagation();
		e?.preventDefault();

		setOpen(true);

		listener();

		popout()?.querySelector('button,input,a,select,textarea,[tabindex]')?.['focus']();
	};

	const toggle = (e?: MouseEvent | KeyboardEvent) => {
		e?.stopPropagation();

		if (open()) {
			hide();
		} else {
			show(e);
		}
	};

	return (
		<>
			<props.children
				hide={hide}
				toggle={toggle}
				open={open}
				show={show}
				ref={setWrapper}
				getRef={wrapper}
			></props.children>
			<Portal mount={document.getElementById('app-container')}>
				<Transition
					onEnter={(el, done) => {
						const a = el.animate(
							{
								opacity: [0, 1],
								translate: ['0 -4px', '0 0px'],
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
								translate: ['0 0px', '0 -4px'],
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
							role="menu"
							aria-role="menu"
							aria-expanded="true"
							aria-haspopup="true"
							class={`popout ${props.position ? props.position : 'top'} ${
								props.align ? props.align : 'center'
							}`}
							ref={setPopout}
							style={`--h: ${popout()?.offsetHeight}px; --w: ${popout()
								?.offsetWidth}px; --x: ${x()}px; --y: ${y()}px; --w-h: ${wrapper()
								?.offsetHeight}px; --w-w: ${wrapper()?.offsetWidth}px;`}
						>
							<props.body open={open} hide={hide} toggle={toggle} show={show} />
							<div class="popout__arrow"></div>
						</div>
					</Show>
				</Transition>
			</Portal>
		</>
	);
};
